import pdfplumber
import re


# ================= CLEAN TEXT =================
def clean_text(text):
    # remove pin codes like 800020
    text = re.sub(r"\b\d{6}\b", "", text)

    # remove clause numbers like 3(ii)
    text = re.sub(r"\b\d+\([a-zA-Z]+\)\b", "", text)

    return text


# ================= FIND NUMBER NEAR KEYWORD =================
def extract_value_near_keyword(text, keyword):
    words = text.split()

    for i, word in enumerate(words):
        if keyword in word.lower():

            # check next 5 words
            for w in words[i:i+6]:
                match = re.search(r"\d+\.?\d*", w)
                if match:
                    return float(match.group())

    return None


# ================= KPI MAP =================
KPI_MAP = {
    "revenue": ["revenue"],
    "profit": ["profit", "pbt", "profit before tax"],
    "total_expense": ["expense", "total expense"],
    "cash_flow": ["cash flow"],
}


# ================= MAIN FUNCTION =================
def extract_full_pipeline(pdf_path):
    results = {}

    # read full text
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() or ""

    text = clean_text(full_text)

    # extract values
    for kpi, keywords in KPI_MAP.items():
        for kw in keywords:
            val = extract_value_near_keyword(text, kw)
            if val:
                results[kpi] = val
                break

    return results