from services.pdf_extractor import extract_text_from_pdf
from services.text_cleaner import clean_text
from services.summarizer import generate_summary
from services.table_extractor import extract_from_tables
from services.financial_extractor import extract_financials

def process_report(file_path):
    raw_text = extract_text_from_pdf(file_path)
    clean = clean_text(raw_text)

    summary = generate_summary(clean)

    # 🔥 NEW: TABLE DATA
    table_data = extract_from_tables(file_path)

    # 🔥 FALLBACK: REGEX
    text_data = extract_financials(clean)

    # 🔥 MERGE (TABLE > TEXT)
    final_financials = {**text_data, **table_data}

    return {
        "summary": summary,
        "financials": final_financials
    }