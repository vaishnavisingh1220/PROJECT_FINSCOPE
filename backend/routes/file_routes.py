# backend/routes/file_routes.py
import os
import re
import pdfplumber
import camelot
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from database import db
from models import KPIRecord, KPITrace

file_bp = Blueprint("files", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ======================================================
# FINANCIAL KEYWORDS
# ======================================================
FIN_KEYWORDS = {
    "revenue": ["revenue", "sales", "turnover", "total income"],
    "profit": ["net profit", "profit after tax", "pat", "net income"],
    "eps": ["eps", "earnings per share"],
    "cash_flow": ["cash flow", "net cash"],

    "ebitda": ["ebitda"],
    "ebit": ["ebit", "operating profit", "operating income"],
    "pbt": ["pbt", "profit before tax"],
    "total_expense": ["total expense", "total expenses"],
    "gross_profit": ["gross profit"],

    "total_assets": ["total assets"],
    "total_liabilities": ["total liabilities"],
    "shareholders_equity": ["shareholders equity", "equity", "net worth"],
    "total_debt": ["total debt", "borrowings"],
    "current_assets": ["current assets"],
    "current_liabilities": ["current liabilities"],
    "inventory": ["inventory", "stock"],
    "cogs": ["cost of goods sold", "cogs"],
}

# ======================================================
# HELPERS
# ======================================================
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def clean_text(txt):
    return (
        txt.lower()
        .replace(",", "")
        .replace("₹", "")
        .replace("$", "")
        if txt else ""
    )


def extract_number(text):
    if not text:
        return None
    text = re.sub(r"\((\d+\.?\d*)\)", r"-\1", text)
    match = re.search(r"-?\d+\.?\d*", text)
    return float(match.group()) if match else None


def safe_div(a, b):
    try:
        return round(a / b, 6) if a is not None and b not in (0, None) else None
    except:
        return None


# ======================================================
# FILE UPLOAD
# ======================================================
@file_bp.route("/upload", methods=["POST"])
def upload_file():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No file provided"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF allowed"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    return jsonify({"file_path": path}), 200


# ======================================================
# KPI EXTRACTION + TRACEABILITY
# ======================================================
@file_bp.route("/extract_kpi", methods=["POST"])
def extract_kpi():
    data = request.get_json()
    file_path = data.get("file_path")
    user_id = 1  # replace later with auth

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    extracted = {}
    traces = []

    # -------- TEXT EXTRACTION --------
    with pdfplumber.open(file_path) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if not text:
                continue

            for line in text.split("\n"):
                clean = clean_text(line)
                for kpi, keys in FIN_KEYWORDS.items():
                    if kpi not in extracted and any(k in clean for k in keys):
                        val = extract_number(clean)
                        if val is not None:
                            extracted[kpi] = val
                            traces.append(KPITrace(
                                kpi_name=kpi,
                                value=val,
                                source_type="text",
                                page_number=page_no,
                                matched_text=line.strip(),
                                confidence=0.85
                            ))

    # -------- TABLE EXTRACTION --------
    try:
        tables = camelot.read_pdf(file_path, pages="1-end", flavor="stream")
        for table in tables:
            for _, row in table.df.iterrows():
                row_text = " ".join(row.astype(str))
                clean = clean_text(row_text)
                for kpi, keys in FIN_KEYWORDS.items():
                    if kpi not in extracted and any(k in clean for k in keys):
                        val = extract_number(clean)
                        if val is not None:
                            extracted[kpi] = val
                            traces.append(KPITrace(
                                kpi_name=kpi,
                                value=val,
                                source_type="table",
                                page_number=None,
                                matched_text=row_text,
                                confidence=0.75
                            ))
    except Exception as e:
        current_app.logger.warning(f"Camelot failed: {e}")

    # -------- DERIVED KPIs --------
    if extracted.get("revenue") and extracted.get("cogs"):
        extracted["gross_profit"] = extracted["revenue"] - extracted["cogs"]

    ratios = {
        "gross_margin": safe_div(extracted.get("gross_profit"), extracted.get("revenue")),
        "net_profit_margin": safe_div(extracted.get("profit"), extracted.get("revenue")),
        "ebitda_margin": safe_div(extracted.get("ebitda"), extracted.get("revenue")),
        "debt_to_equity": safe_div(extracted.get("total_debt"), extracted.get("shareholders_equity")),
        "current_ratio": safe_div(extracted.get("current_assets"), extracted.get("current_liabilities")),
        "quick_ratio": safe_div(
            (extracted.get("current_assets") or 0) - (extracted.get("inventory") or 0),
            extracted.get("current_liabilities")
        ),
        "roa": safe_div(extracted.get("profit"), extracted.get("total_assets")),
        "roe": safe_div(extracted.get("profit"), extracted.get("shareholders_equity")),
    }

    record = KPIRecord(
        user_id=user_id,
        file_name=os.path.basename(file_path),
        upload_date=datetime.utcnow(),
        **{k: extracted.get(k) for k in FIN_KEYWORDS},
        **ratios
    )

    db.session.add(record)
    db.session.flush()

    for t in traces:
        t.record_id = record.id
        db.session.add(t)

    db.session.commit()

    return jsonify({
        "kpis": record.serialize(),
        "traceability": [t.serialize() for t in record.traces]
    }), 200


# ======================================================
# HISTORY (FOR DASHBOARD + SUMMARY CHART)
# ======================================================
@file_bp.route("/history/<int:user_id>")
def history(user_id):
    records = (
        KPIRecord.query
        .filter_by(user_id=user_id)
        .order_by(KPIRecord.upload_date.asc())
        .all()
    )
    return jsonify({"history": [r.serialize() for r in records]}), 200


# ======================================================
# SUMMARY + TRACEABILITY
# ======================================================
@file_bp.route("/summary/<int:user_id>")
def summary(user_id):
    records = (
        KPIRecord.query
        .filter_by(user_id=user_id)
        .order_by(KPIRecord.upload_date.desc())
        .limit(2)
        .all()
    )

    if not records:
        return jsonify({
            "summary": "No financial data available.",
            "bullets": [],
            "tips": [],
            "traceability": []
        })

    latest = records[0]
    prev = records[1] if len(records) > 1 else None

    bullets = []
    tips = []

    if prev and latest.revenue and prev.revenue:
        growth = round(((latest.revenue - prev.revenue) / prev.revenue) * 100, 2)
        bullets.append(f"Revenue changed by {growth}% compared to previous report.")

    if latest.net_profit_margin:
        bullets.append(f"Net profit margin is {round(latest.net_profit_margin * 100, 2)}%.")

    if latest.current_ratio:
        bullets.append(f"Current ratio stands at {round(latest.current_ratio, 2)}.")

    tips.append("Maintain healthy liquidity to support operations.")
    tips.append("Monitor debt levels to avoid financial stress.")

    summary_text = (
        f"The latest report shows revenue of {latest.revenue} "
        f"and profit of {latest.profit}. Overall financial health "
        f"appears stable based on key ratios."
    )

    trace_data = [t.serialize() for t in latest.traces]

    return jsonify({
        "summary": summary_text,
        "bullets": bullets,
        "tips": tips,
        "traceability": trace_data
    }), 200
