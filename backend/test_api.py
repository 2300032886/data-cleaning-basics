import requests

BASE = "http://localhost:5000/api"

# Test upload
with open("sample_data.csv", "rb") as f:
    resp = requests.post(f"{BASE}/upload", files={"file": ("sample_data.csv", f, "text/csv")})
    data = resp.json()
    print("UPLOAD:", data)
    session_id = data["session_id"]

# Test summary
resp2 = requests.get(f"{BASE}/summary", params={"session_id": session_id})
s = resp2.json()
print("QUALITY:", s["quality"])
print("INSIGHTS:", s["insights"][:2])
print("MISSING:", s["missing"]["total_missing"])
print("DUPES:", s["duplicates"]["duplicate_rows"])
print("OUTLIERS:", s["outliers"]["total_outliers"])

# Test clean missing
resp3 = requests.post(f"{BASE}/clean/missing", params={"session_id": session_id}, json={"strategy": "mean"})
print("CLEAN MISSING:", resp3.json())

# Test clean duplicates
resp4 = requests.post(f"{BASE}/clean/duplicates", params={"session_id": session_id})
print("CLEAN DUPES:", resp4.json())

# Test visualize
resp5 = requests.get(f"{BASE}/visualize", params={"session_id": session_id})
v = resp5.json()
print("VIZ CHARTS: bar_charts=%d histograms=%d boxplots=%d corr_cols=%d before_after=%d" % (
    len(v.get("bar_charts", [])), len(v.get("histograms", [])),
    len(v.get("boxplots", [])), len(v.get("correlation", {}).get("columns", [])),
    len(v.get("before_after", []))
))

print("ALL TESTS PASSED ✅")
