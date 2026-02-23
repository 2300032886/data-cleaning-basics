# Data Cleaning Basics 🧹📊

A professional full-stack web application for uploading, cleaning, and visualizing datasets — built with **Flask + Pandas** (backend) and **React + Vite + Tailwind CSS** (frontend).

---

## 📁 Project Structure

```
galactic-hubble/
├── backend/
│   ├── app.py              # Flask API (all endpoints)
│   ├── cleaning.py         # Pandas/NumPy cleaning utilities
│   ├── visualization.py    # Chart data generators
│   ├── requirements.txt    # Python dependencies
│   ├── sample_data.csv     # Dirty sample dataset for testing
│   └── uploads/            # Uploaded files + SQLite DB
│
└── frontend/
    ├── src/
    │   ├── pages/          # Home, Upload, CleanDashboard, Visualize, Export
    │   ├── components/     # Navbar, StatCard, DataTable, Loader, QualityScore
    │   ├── context/        # AppContext (global state + theme)
    │   └── services/api.js # Axios API service layer
    ├── index.html
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at → `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install        # if not already installed
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| POST   | `/api/upload`        | Upload CSV/XLSX file               |
| GET    | `/api/preview`       | First N rows of dataset            |
| GET    | `/api/summary`       | Stats, quality score, insights     |
| POST   | `/api/clean/missing` | Handle missing values              |
| POST   | `/api/clean/duplicates` | Remove duplicate rows           |
| POST   | `/api/clean/outliers`| Remove IQR-based outliers          |
| POST   | `/api/clean/normalize` | Min-Max normalization            |
| POST   | `/api/clean/standardize` | Z-score standardization        |
| GET    | `/api/visualize`     | JSON chart data for all charts     |
| GET    | `/api/download`      | Download cleaned CSV or XLSX       |
| GET    | `/api/report`        | Download text quality report       |
| POST   | `/api/reset`         | Reset to original uploaded data    |

---

## ✨ Features

- **Drag & Drop Upload** — CSV / XLSX files up to 50 MB
- **Dataset Preview** — First 50 rows with column type badges
- **Data Quality Score** — Composite 0–100 score with letter grade (A–F)
- **AI-Style Insights** — Automatic issue detection with explanations
- **6 Cleaning Operations** — Fill nulls, drop nulls, remove duplicates, remove outliers, normalize, standardize
- **5 Chart Types** — Bar charts, histograms, box plots, correlation heatmap, before/after comparison
- **Dark / Light Mode** — System-aware toggle, persisted in localStorage
- **Export** — Download cleaned CSV, XLSX, or a text quality report
- **Cleaning Log** — History of all cleaning operations with timestamps

---

## 🧪 Test with Sample Data

Use `backend/sample_data.csv` — it contains intentional missing values, duplicate rows, and outliers across 9 columns (Name, Age, Salary, Department, Experience, Rating, City, Gender).
