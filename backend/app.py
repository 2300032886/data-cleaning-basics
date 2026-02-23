import os
import uuid
import json
import sqlite3
import io
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import cleaning as cl
import visualization as viz

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = Path(__file__).parent / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)
DB_PATH = UPLOAD_FOLDER / "metadata.db"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


# ──────────────────────────── Database helpers ─────────────────────────────
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            original_filename TEXT,
            upload_time TEXT,
            original_path TEXT,
            cleaned_path TEXT
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


# ──────────────────────────── Utility helpers ──────────────────────────────
def load_df(path: str) -> pd.DataFrame:
    if path.endswith(".xlsx") or path.endswith(".xls"):
        return pd.read_excel(path)
    # Try common encodings in order; many real-world CSVs are not pure UTF-8
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252", "iso-8859-1"]
    for enc in encodings:
        try:
            return pd.read_csv(path, encoding=enc)
        except (UnicodeDecodeError, Exception):
            continue
    # Last resort: ignore undecodable bytes
    return pd.read_csv(path, encoding="latin-1", on_bad_lines="skip")


def save_df(df: pd.DataFrame, path: str):
    if path.endswith(".xlsx"):
        df.to_excel(path, index=False)
    else:
        df.to_csv(path, index=False)


def get_session(session_id: str) -> dict | None:
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM sessions WHERE session_id=?", (session_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_current_df(session_id: str) -> pd.DataFrame:
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")
    cleaned = session["cleaned_path"]
    if cleaned and os.path.exists(cleaned):
        return load_df(cleaned)
    return load_df(session["original_path"])


def save_cleaned(df: pd.DataFrame, session_id: str, ext: str = ".csv"):
    path = str(UPLOAD_FOLDER / f"{session_id}_cleaned{ext}")
    save_df(df, path)
    conn = get_db()
    conn.execute(
        "UPDATE sessions SET cleaned_path=? WHERE session_id=?",
        (path, session_id),
    )
    conn.commit()
    conn.close()
    return path


def df_to_json_safe(df: pd.DataFrame) -> list:
    """Convert dataframe to JSON-serialisable list of dicts."""
    return json.loads(df.head(200).to_json(orient="records", default_handler=str))


# ──────────────────────────── Endpoints ───────────────────────────────────


@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    ext = Path(file.filename).suffix.lower()
    if ext not in (".csv", ".xlsx", ".xls"):
        return jsonify({"error": "Only CSV and XLSX files are supported"}), 400

    content = file.read()
    if len(content) > MAX_FILE_SIZE:
        return jsonify({"error": "File size exceeds 50 MB limit"}), 400

    session_id = str(uuid.uuid4())
    save_path = str(UPLOAD_FOLDER / f"{session_id}_original{ext}")

    with open(save_path, "wb") as f:
        f.write(content)

    try:
        df = load_df(save_path)
    except Exception as e:
        return jsonify({"error": f"Could not parse file: {str(e)}"}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO sessions VALUES (?,?,?,?,?)",
        (session_id, file.filename, datetime.utcnow().isoformat(), save_path, None),
    )
    conn.commit()
    conn.close()

    return jsonify(
        {
            "session_id": session_id,
            "filename": file.filename,
            "rows": df.shape[0],
            "columns": df.shape[1],
            "column_names": df.columns.tolist(),
        }
    )


@app.route("/api/preview", methods=["GET"])
def preview():
    session_id = request.args.get("session_id")
    n = int(request.args.get("n", 50))
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    return jsonify(
        {
            "rows": df_to_json_safe(df.head(n)),
            "columns": df.columns.tolist(),
            "total_rows": len(df),
            "total_columns": df.shape[1],
        }
    )


@app.route("/api/summary", methods=["GET"])
def summary():
    session_id = request.args.get("session_id")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    missing = cl.detect_missing(df)
    duplicates = cl.detect_duplicates(df)
    outliers = cl.detect_outliers(df)
    quality = cl.compute_quality_score(df)
    insights = cl.generate_insights(df, quality)
    suggestions = cl.get_suggested_actions(df)
    dtypes = cl.get_data_types_summary(df)

    describe_raw = df.describe(include="all").to_dict()
    # Make describe JSON-safe
    describe_safe = {}
    for col, val_dict in describe_raw.items():
        describe_safe[col] = {
            k: (None if (isinstance(v, float) and np.isnan(v)) else v)
            for k, v in val_dict.items()
        }

    return jsonify(
        {
            "missing": missing,
            "duplicates": duplicates,
            "outliers": outliers,
            "quality": quality,
            "insights": insights,
            "suggestions": suggestions,
            "data_types": dtypes,
            "describe": describe_safe,
            "rows": df.shape[0],
            "columns": df.shape[1],
        }
    )


@app.route("/api/clean/missing", methods=["POST"])
def clean_missing():
    session_id = request.args.get("session_id")
    data = request.get_json(silent=True) or {}
    strategy = data.get("strategy", "mean")  # mean | median | mode | drop
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    before_missing = int(df.isnull().sum().sum())
    before_rows = len(df)

    if strategy == "drop":
        cleaned = cl.drop_missing(df)
    else:
        cleaned = cl.fill_missing(df, strategy)

    save_cleaned(cleaned, session_id)
    after_missing = int(cleaned.isnull().sum().sum())

    return jsonify(
        {
            "message": f"Missing values handled using '{strategy}' strategy.",
            "before": {"missing": before_missing, "rows": before_rows},
            "after": {"missing": after_missing, "rows": len(cleaned)},
        }
    )


@app.route("/api/clean/duplicates", methods=["POST"])
def clean_duplicates():
    session_id = request.args.get("session_id")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    before = int(df.duplicated().sum())
    cleaned = cl.remove_duplicates(df)
    save_cleaned(cleaned, session_id)

    return jsonify(
        {
            "message": "Duplicate rows removed.",
            "before": {"duplicates": before, "rows": len(df)},
            "after": {"duplicates": 0, "rows": len(cleaned)},
        }
    )


@app.route("/api/clean/outliers", methods=["POST"])
def clean_outliers():
    session_id = request.args.get("session_id")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    oi = cl.detect_outliers(df)
    before = oi["total_outliers"]
    cleaned = cl.remove_outliers(df)
    save_cleaned(cleaned, session_id)

    return jsonify(
        {
            "message": "Outliers removed using IQR method.",
            "before": {"outliers": before, "rows": len(df)},
            "after": {"outliers": 0, "rows": len(cleaned)},
        }
    )


@app.route("/api/clean/normalize", methods=["POST"])
def clean_normalize():
    session_id = request.args.get("session_id")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    cleaned = cl.normalize_data(df)
    save_cleaned(cleaned, session_id)

    return jsonify(
        {
            "message": "Numeric columns normalized (Min-Max scaling).",
            "rows": len(cleaned),
            "columns": cleaned.shape[1],
        }
    )


@app.route("/api/clean/standardize", methods=["POST"])
def clean_standardize():
    session_id = request.args.get("session_id")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    cleaned = cl.standardize_columns(df)
    save_cleaned(cleaned, session_id)

    return jsonify(
        {
            "message": "Numeric columns standardized (Z-score scaling).",
            "rows": len(cleaned),
            "columns": cleaned.shape[1],
        }
    )


@app.route("/api/visualize", methods=["GET"])
def visualize():
    session_id = request.args.get("session_id")
    try:
        # Always compare original vs current cleaned
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404

        original_df = load_df(session["original_path"])
        current_df = get_current_df(session_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(
        {
            "bar_charts": viz.bar_chart_data(current_df),
            "histograms": viz.histogram_data(current_df),
            "boxplots": viz.boxplot_data(current_df),
            "correlation": viz.correlation_matrix(current_df),
            "missing_heatmap": viz.missing_heatmap(original_df),
            "before_after": viz.before_after_comparison(original_df, current_df),
        }
    )


@app.route("/api/download", methods=["GET"])
def download():
    session_id = request.args.get("session_id")
    fmt = request.args.get("format", "csv")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    buf = io.BytesIO()
    if fmt == "xlsx":
        df.to_excel(buf, index=False)
        buf.seek(0)
        return send_file(
            buf,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name=f"cleaned_data_{session_id[:8]}.xlsx",
        )
    else:
        buf.write(df.to_csv(index=False).encode())
        buf.seek(0)
        return send_file(
            buf,
            mimetype="text/csv",
            as_attachment=True,
            download_name=f"cleaned_data_{session_id[:8]}.csv",
        )


@app.route("/api/report", methods=["GET"])
def report():
    """Download a simple text quality report."""
    session_id = request.args.get("session_id")
    try:
        df = get_current_df(session_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    quality = cl.compute_quality_score(df)
    insights = cl.generate_insights(df, quality)
    missing = cl.detect_missing(df)
    dup = cl.detect_duplicates(df)
    outlier = cl.detect_outliers(df)

    lines = [
        "DATA CLEANING BASICS — QUALITY REPORT",
        f"Generated: {datetime.utcnow().isoformat()} UTC",
        "=" * 60,
        f"Quality Score: {quality['score']} / 100  (Grade: {quality['grade']})",
        "",
        "SUMMARY",
        "-" * 40,
        f"  Rows        : {df.shape[0]}",
        f"  Columns     : {df.shape[1]}",
        f"  Missing vals: {missing['total_missing']}",
        f"  Duplicates  : {dup['duplicate_rows']}",
        f"  Outliers    : {outlier['total_outliers']}",
        "",
        "INSIGHTS",
        "-" * 40,
    ]
    for ins in insights:
        lines.append(f"  {ins}")

    lines += [
        "",
        "MISSING VALUES PER COLUMN",
        "-" * 40,
    ]
    for col, info in missing["missing_per_column"].items():
        lines.append(f"  {col}: {info['count']} ({info['pct']}%)")

    report_text = "\n".join(lines)
    buf = io.BytesIO(report_text.encode())
    buf.seek(0)
    return send_file(
        buf,
        mimetype="text/plain",
        as_attachment=True,
        download_name=f"quality_report_{session_id[:8]}.txt",
    )


@app.route("/api/reset", methods=["POST"])
def reset():
    """Reset cleaned file back to original."""
    session_id = request.args.get("session_id")
    conn = get_db()
    conn.execute(
        "UPDATE sessions SET cleaned_path=NULL WHERE session_id=?", (session_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Dataset reset to original."})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
