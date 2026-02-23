"""
Data cleaning utilities — pure NumPy/Pandas, no scipy or scikit-learn.
Normalization and standardization are implemented manually so this module
works in Vercel's Python serverless environment without heavy binary deps.
"""
import pandas as pd
import numpy as np


def detect_missing(df: pd.DataFrame) -> dict:
    total = df.shape[0]
    missing = df.isnull().sum()
    pct = (missing / total * 100).round(2)
    return {
        "total_rows": total,
        "total_columns": df.shape[1],
        "missing_per_column": {
            col: {"count": int(missing[col]), "pct": float(pct[col])}
            for col in df.columns
        },
        "total_missing": int(missing.sum()),
    }


def fill_missing(df: pd.DataFrame, strategy: str = "mean") -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        if df[col].isnull().sum() == 0:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            if strategy == "mean":
                df[col] = df[col].fillna(df[col].mean())
            elif strategy == "median":
                df[col] = df[col].fillna(df[col].median())
            else:
                mode_val = df[col].mode()
                df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else 0)
        else:
            mode_val = df[col].mode()
            df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else "Unknown")
    return df


def drop_missing(df: pd.DataFrame) -> pd.DataFrame:
    return df.dropna()


def detect_duplicates(df: pd.DataFrame) -> dict:
    return {"duplicate_rows": int(df.duplicated().sum())}


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates()


def detect_outliers(df: pd.DataFrame) -> dict:
    result = {}
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        series = df[col].dropna()
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outlier_count = int(((series < lower) | (series > upper)).sum())
        result[col] = {
            "count": outlier_count,
            "lower_bound": round(float(lower), 4),
            "upper_bound": round(float(upper), 4),
        }
    total_outliers = sum(v["count"] for v in result.values())
    return {"outliers_per_column": result, "total_outliers": total_outliers}


def remove_outliers(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        df = df[(df[col].isna()) | ((df[col] >= lower) & (df[col] <= upper))]
    return df


def normalize_data(df: pd.DataFrame) -> pd.DataFrame:
    """Min-Max normalization using pure NumPy (no scikit-learn)."""
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        col_min = df[col].min()
        col_max = df[col].max()
        if col_max - col_min != 0:
            df[col] = (df[col] - col_min) / (col_max - col_min)
        else:
            df[col] = 0.0
    return df


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Z-score standardization using pure NumPy (no scikit-learn)."""
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        mean = df[col].mean()
        std = df[col].std()
        if std != 0:
            df[col] = (df[col] - mean) / std
        else:
            df[col] = 0.0
    return df


def compute_quality_score(df: pd.DataFrame) -> dict:
    total_cells = df.shape[0] * df.shape[1]
    if total_cells == 0:
        return {"score": 0, "grade": "F"}
    missing_ratio = df.isnull().sum().sum() / total_cells
    dup_ratio = df.duplicated().sum() / max(df.shape[0], 1)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    outlier_counts = 0
    numeric_cells = 0
    for col in numeric_cols:
        series = df[col].dropna()
        numeric_cells += len(series)
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outlier_counts += int(((series < lower) | (series > upper)).sum())
    outlier_ratio = outlier_counts / max(numeric_cells, 1)
    score = round(max(0.0, min(100.0, 100 - (missing_ratio * 40 + dup_ratio * 30 + outlier_ratio * 30))), 1)
    if score >= 90: grade = "A"
    elif score >= 75: grade = "B"
    elif score >= 60: grade = "C"
    elif score >= 40: grade = "D"
    else: grade = "F"
    return {"score": score, "grade": grade}


def generate_insights(df: pd.DataFrame, quality: dict) -> list:
    insights = []
    score = quality["score"]
    missing_info = detect_missing(df)
    total_missing = missing_info["total_missing"]
    dup_info = detect_duplicates(df)
    outlier_info = detect_outliers(df)
    if score >= 90:
        insights.append("✅ Your dataset is in excellent shape with minimal issues detected.")
    elif score >= 75:
        insights.append("🟡 Your dataset is good but has some areas that can be improved.")
    else:
        insights.append("🔴 Your dataset has significant quality issues that should be addressed.")
    if total_missing > 0:
        worst_col = max(missing_info["missing_per_column"].items(), key=lambda x: x[1]["count"])
        insights.append(f"📉 {total_missing} missing values detected. '{worst_col[0]}' has the most gaps ({worst_col[1]['count']} missing).")
    if dup_info["duplicate_rows"] > 0:
        insights.append(f"🔁 {dup_info['duplicate_rows']} duplicate rows found — removing them will improve model accuracy.")
    if outlier_info["total_outliers"] > 0:
        worst_outlier = max(outlier_info["outliers_per_column"].items(), key=lambda x: x[1]["count"])
        insights.append(f"📊 {outlier_info['total_outliers']} outliers detected. '{worst_outlier[0]}' has the most extreme values.")
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if numeric_cols:
        insights.append(f"🔢 {len(numeric_cols)} numeric column(s) found: {', '.join(numeric_cols[:5])}{'...' if len(numeric_cols) > 5 else ''}. Consider normalizing for ML pipelines.")
    return insights


def get_suggested_actions(df: pd.DataFrame) -> list:
    suggestions = []
    missing_info = detect_missing(df)
    dup_info = detect_duplicates(df)
    outlier_info = detect_outliers(df)
    if missing_info["total_missing"] > 0:
        suggestions.append({"action": "fill_missing", "label": "Fill Missing Values", "reason": f"{missing_info['total_missing']} missing values detected"})
    if dup_info["duplicate_rows"] > 0:
        suggestions.append({"action": "remove_duplicates", "label": "Remove Duplicates", "reason": f"{dup_info['duplicate_rows']} duplicate rows found"})
    if outlier_info["total_outliers"] > 0:
        suggestions.append({"action": "remove_outliers", "label": "Remove Outliers", "reason": f"{outlier_info['total_outliers']} outliers detected"})
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        suggestions.append({"action": "normalize", "label": "Normalize Data", "reason": "Numeric columns benefit from normalization for ML"})
    return suggestions


def get_data_types_summary(df: pd.DataFrame) -> dict:
    result = {}
    for col in df.columns:
        dtype = str(df[col].dtype)
        if "int" in dtype or "float" in dtype: kind = "numeric"
        elif "datetime" in dtype: kind = "datetime"
        elif "bool" in dtype: kind = "boolean"
        else: kind = "categorical"
        result[col] = {"dtype": dtype, "kind": kind, "unique": int(df[col].nunique())}
    return result
