import pandas as pd
import numpy as np


def safe_float(val):
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return None
    return float(val)


def bar_chart_data(df: pd.DataFrame) -> list:
    result = []
    cat_cols = df.select_dtypes(include=["object", "category"]).columns
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in list(cat_cols)[:3]:
        counts = df[col].value_counts().head(10)
        result.append({"type": "bar", "title": f"Value Counts – {col}", "data": [{"label": str(k), "value": int(v)} for k, v in counts.items()], "xKey": "label", "yKey": "value"})
    if len(num_cols) >= 2:
        means = df[num_cols].mean().dropna()
        result.append({"type": "bar", "title": "Column Means (Numeric)", "data": [{"label": col, "value": round(float(v), 4)} for col, v in means.items()], "xKey": "label", "yKey": "value"})
    return result


def histogram_data(df: pd.DataFrame, bins: int = 15) -> list:
    result = []
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in list(num_cols)[:4]:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        counts, bin_edges = np.histogram(series, bins=bins)
        data = [{"bin": f"{round(float(bin_edges[i]), 2)}–{round(float(bin_edges[i+1]), 2)}", "count": int(counts[i])} for i in range(len(counts))]
        result.append({"type": "histogram", "title": f"Distribution – {col}", "column": col, "data": data, "xKey": "bin", "yKey": "count"})
    return result


def boxplot_data(df: pd.DataFrame) -> list:
    result = []
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in list(num_cols)[:5]:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower_fence = Q1 - 1.5 * IQR
        upper_fence = Q3 + 1.5 * IQR
        outliers = series[(series < lower_fence) | (series > upper_fence)].tolist()
        result.append({"type": "boxplot", "title": f"Box Plot – {col}", "column": col, "min": safe_float(series.min()), "Q1": safe_float(Q1), "median": safe_float(series.median()), "Q3": safe_float(Q3), "max": safe_float(series.max()), "whisker_low": safe_float(float(series[series >= lower_fence].min())), "whisker_high": safe_float(float(series[series <= upper_fence].max())), "outliers": [safe_float(o) for o in outliers[:50]]})
    return result


def correlation_matrix(df: pd.DataFrame) -> dict:
    num_cols = df.select_dtypes(include=[np.number]).columns
    if len(num_cols) < 2:
        return {"columns": [], "matrix": []}
    corr = df[num_cols].corr()
    columns = list(corr.columns)
    matrix = [{"column": row_col, "values": {col: (None if pd.isna(corr.loc[row_col, col]) else round(float(corr.loc[row_col, col]), 4)) for col in columns}} for row_col in columns]
    return {"columns": columns, "matrix": matrix}


def missing_heatmap(df: pd.DataFrame) -> dict:
    cols = df.columns.tolist()
    rows = []
    for idx, row in df.head(100).iterrows():
        row_data = {col: (1 if pd.isna(row[col]) else 0) for col in cols}
        rows.append({"row": int(idx), **row_data})
    return {"columns": cols, "rows": rows}


def before_after_comparison(before_df: pd.DataFrame, after_df: pd.DataFrame) -> list:
    return [
        {"type": "bar", "title": "Row Count: Before vs After", "data": [{"label": "Before", "value": len(before_df)}, {"label": "After", "value": len(after_df)}], "xKey": "label", "yKey": "value"},
        {"type": "bar", "title": "Missing Values: Before vs After", "data": [{"label": "Before", "value": int(before_df.isnull().sum().sum())}, {"label": "After", "value": int(after_df.isnull().sum().sum())}], "xKey": "label", "yKey": "value"},
        {"type": "bar", "title": "Duplicate Rows: Before vs After", "data": [{"label": "Before", "value": int(before_df.duplicated().sum())}, {"label": "After", "value": int(after_df.duplicated().sum())}], "xKey": "label", "yKey": "value"},
    ]
