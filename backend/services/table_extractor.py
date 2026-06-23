import re
from utils.text_cleaner import clean_text

KPI_MAP = {
    "revenue": ["revenue", "total revenue"],
    "profit": ["profit", "net profit", "pbt"],
    "total_expense": ["expense", "total expense"],
}

def extract_value_near_keyword(text, keyword):
    words = text.split()

    for i, word in enumerate(words):
        if keyword in word.lower():
            window = words[i:i+6]

            for w in window:
                match = re.search(r"\d+\.?\d*", w)
                if match:
                    return float(match.group())

    return None


def extract_from_text(text):
    text = clean_text(text)
    results = {}

    for kpi, keywords in KPI_MAP.items():
        for keyword in keywords:
            val = extract_value_near_keyword(text, keyword)
            if val:
                results[kpi] = val
                break

    return resultss