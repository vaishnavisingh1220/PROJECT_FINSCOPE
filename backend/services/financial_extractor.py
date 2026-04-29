import re

# -------------------------
# CLEAN NUMBER
# -------------------------
def clean_number(num_str):
    num_str = num_str.replace(",", "")
    try:
        return float(num_str)
    except:
        return None


# -------------------------
# FILTER BAD VALUES
# -------------------------
def is_valid_financial(value):
    if value is None:
        return False

    # ❌ remove years
    if 1900 < value < 2100:
        return False

    # ❌ remove tiny numbers
    if value < 1000:
        return False

    return True


# -------------------------
# EXTRACT BEST VALUE
# -------------------------
def extract_best_value(text, keyword):
    pattern = rf"{keyword}(.{{0,100}})"
    matches = re.findall(pattern, text, re.IGNORECASE)

    candidates = []

    for match in matches:
        numbers = re.findall(r"[\d,]+", match)

        for num in numbers:
            val = clean_number(num)
            if is_valid_financial(val):
                candidates.append(val)

    if not candidates:
        return None

    # ✅ pick largest (most likely actual financial)
    return max(candidates)


# -------------------------
# MAIN FUNCTION
# -------------------------
def extract_financials(text):
    return {
        "revenue": extract_best_value(text, "revenue"),
        "profit": extract_best_value(text, "profit"),
        "eps": extract_best_value(text, "earnings per share|eps"),
        "cash_flow": extract_best_value(text, "cash flow"),
        "ebitda": extract_best_value(text, "ebitda"),
        "ebit": extract_best_value(text, "ebit"),
        "pbt": extract_best_value(text, "profit before tax"),
        "gross_profit": extract_best_value(text, "gross profit"),
    }