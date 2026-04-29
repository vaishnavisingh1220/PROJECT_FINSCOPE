import re

def clean_text(text):
    # Remove PIN codes (6 digit)
    text = re.sub(r"\b\d{6}\b", "", text)

    # Remove clause numbers like 3(ii)
    text = re.sub(r"\b\d+\([a-zA-Z]+\)\b", "", text)

    # Remove standalone numbering (17.)
    text = re.sub(r"\b\d+\.\b", "", text)

    return text