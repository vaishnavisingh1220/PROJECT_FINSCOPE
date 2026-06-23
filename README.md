# FinScope AI – Financial Report Analyzer

## Overview

FinScope AI is an AI-powered financial report analysis platform that automates the extraction, processing, and visualization of Key Performance Indicators (KPIs) from annual reports and financial statements.

The system allows users to upload PDF financial reports, automatically extract financial metrics, analyze trends, generate summaries, and visualize KPIs through an interactive dashboard with traceability support.

---

## Features

### User Authentication
- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- User Profile Management

### PDF Processing
- Upload Financial Reports
- PDF Text Extraction
- Table Extraction
- Multi-page Document Support

### KPI Analysis
- Revenue Detection
- Profit Detection
- EPS Extraction
- Cash Flow Analysis
- EBITDA Calculation
- Financial Ratio Computation

### Dashboard & Visualization
- Interactive KPI Dashboard
- Revenue Trend Analysis
- Profit Trend Analysis
- Financial Ratio Visualization
- Historical Report Comparison

### Traceability Engine
- KPI Source Tracking
- Page-Level References
- Confidence Scores
- Extracted Text Evidence

### AI-Powered Insights
- Financial Summary Generation
- Trend Analysis
- Business Performance Insights
- Automated Reporting

---

## System Architecture

### Presentation Layer
- Web Interface / User Interface (React.js)

### Application Layer
- User Authentication
- File Handling
- KPI Processing Logic
- Traceability Engine
- Dashboard & Reporting Logic

### Service Layer
- PDF Parsing (pdfplumber)
- Table Extraction (Camelot)
- KPI Detection
- Data Normalization
- Analytics & Reporting

### Data Layer
- SQLite Database
- Uploaded PDF Storage
- KPI Records
- Metadata Storage

---

## Technology Stack

### Frontend
- React.js
- React Router
- Axios
- Plotly.js
- Framer Motion
- CSS3

### Backend
- Flask
- Flask SQLAlchemy
- Flask CORS
- JWT Authentication

### PDF Processing
- pdfplumber
- Camelot

### Database
- SQLite

### Visualization
- Plotly.js

---

## Project Structure

```bash
FinScope-AI/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   │
│   └── public/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── uploads/
│   ├── database.py
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/finscope-ai.git
cd finscope-ai
```

### Backend Setup

Create Virtual Environment

```bash
python -m venv venv
```

Activate Environment

Windows:

```bash
venv\Scripts\activate
```

Linux/Mac:

```bash
source venv/bin/activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Backend

```bash
python app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

### Frontend Setup

Navigate to Frontend

```bash
cd frontend
```

Install Packages

```bash
npm install
```

Run Frontend

```bash
npm start
```

or

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## Database Schema

### Users

| Field | Type |
|---------|---------|
| id | Integer |
| username | String |
| email | String |
| password | String |
| role | String |

### Uploaded Reports

| Field | Type |
|---------|---------|
| id | Integer |
| user_id | Integer |
| file_name | String |
| upload_date | DateTime |

### KPI Records

| Field | Type |
|---------|---------|
| id | Integer |
| report_id | Integer |
| revenue | Float |
| profit | Float |
| eps | Float |
| cash_flow | Float |

---

## Workflow

1. User registers or logs in.
2. User uploads a financial report PDF.
3. PDF text and tables are extracted.
4. KPI detection engine processes financial metrics.
5. Data is normalized and stored in SQLite.
6. Dashboard visualizes KPIs and trends.
7. Traceability engine links KPIs to source pages.
8. AI-generated summaries and insights are displayed.

---

## Security Features

- Password Hashing
- JWT Authentication
- Protected API Endpoints
- Secure User Sessions
- Route Protection

---

## Future Enhancements

- AI Chat Assistant
- Financial Risk Prediction
- Industry Benchmark Comparison
- Multi-Document Analysis
- Cloud Deployment
- Export Reports to PDF
- Advanced Financial Forecasting

---

## Author

**Vaishnavi Singh N**

MCA – PES University

Data Analytics | AI | Full Stack Development

Email: vaishnavisinghn12@gmail.com

---

## License

This project is developed for academic and educational purposes. Feel free to use and modify it for learning and research.
