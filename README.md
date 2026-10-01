# CO Attainment Management System

An automated web application that replaces an Excel-based CO/PO/PSO calculation workflow with a professional, real-time calculation system for academic assessment.

## Features

- 📊 **Excel-like Live Sheet** — Interactive spreadsheet where entering a student's name, register number, and grade auto-calculates everything
- ⚡ **Fast Grade Entry** — Teacher types a student name, selects a grade, clicks Save — all CO metrics calculate automatically
- 📈 **Dashboard** — Live KPI cards, CO attainment charts, grade distribution, and PO/PSO attainment visualization
- 🎯 **CO Analysis** — Class-level CO1–CO5 attainment with NBA/NAAC level classification
- 🔧 **Assessment Tools** — Configurable Board/University Exam and Survey tool values with live Final CO calculation
- 🔗 **PO/PSO Mapping Matrix** — Editable correlation matrix (0–3 scale) with automatic attainment recalculation
- 🧭 **Overall CO Module** — Separate 8-CO (ESL120.1–ESL120.8) laboratory module mapping
- ⚙️ **Settings** — Grade conversion rubric, attainment thresholds, and CE denominator configuration
- 📤 **Excel Export** — Multi-sheet professional workbook export
- 📥 **Excel Import** — Detect and import student records from Excel files
- 📝 **Audit Trail** — Timestamped grade change history

## Calculation Engine

All formulas replicate the exact source Excel workbook:

| Formula | Equation |
|---|---|
| Student CO1–CO3 | `((InternalMark + UniversityMark) / 150) × 100` |
| CO4, CO5 | `= CO3` (same value, mathematically equivalent) |
| Continuous Evaluation | `(InternalMark / 30) × 100` |
| CO Attainment Count | `COUNTIFS(CO ≥ 55, CO ≤ 100)` |
| CO Attainment % | `ROUND(Attained / Total × 100, 0)` |
| Attainment Level | `>75 → 3`, `>65 → 2`, `>55 → 1`, else → No Attainment |
| Final CO | `(Board + Survey) / 2` |
| PO/PSO Attained Value | `(FinalCO × MappingValue) / 3` |
| Original Attainment | `SUM(>0) / COUNTIF(>0)` |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 + Recharts |
| Backend | Node.js + Express |
| Database | JSON flat-file (no install needed, persists to `data/database.json`) |
| Excel | SheetJS / xlsx |
| Build | Vite 8 |

## Setup & Running

### Prerequisites
- Node.js 18+

### Install Dependencies
```bash
# Install root (backend) dependencies
npm install

# Install client (frontend) dependencies
npm --prefix client install
```

### Run Development
```bash
# Run both frontend and backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### First-Time Data Seeding
The backend automatically seeds the 58 student records from the source Excel workbook (`Copy of MAT101 2019-20CSxlsx.xlsx`) on first startup, including all assessment tools and PO/PSO mappings.

### Run Tests
```bash
npm test
```

All 10 specification test cases pass:
- Grade-to-university-mark conversion
- CO formula verification
- Class attainment percentage and levels
- PO/PSO mapping and attainment
- Continuous evaluation logic

## API Reference

| Endpoint | Description |
|---|---|
| `GET /api/students` | All students with current assessments |
| `POST /api/students/:id/grade` | Update grade → auto-recalculates all CO metrics |
| `GET /api/analysis` | Class CO attainment, grade distribution |
| `GET /api/mapping` | CO-PO-PSO correlation matrix + attainment |
| `PUT /api/mapping` | Update mapping → auto-recalculates |
| `GET /api/assessment-tools` | Board, Survey, Final CO tools |
| `GET /api/overall` | ESL120 8-CO module |
| `GET /api/export/excel` | Download Excel workbook export |
| `POST /api/import/excel` | Upload Excel to import/update students |
| `GET /api/audit` | Grade change audit log |
| `GET /api/settings` | System configuration |

## License

ISC
