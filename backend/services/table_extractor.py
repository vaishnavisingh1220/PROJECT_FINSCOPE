import pdfplumber
import re

def extract_from_tables(pdf_path):
    results = {}

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()

            for table in tables:
                for row in table:
                    row_text = " ".join([str(c) for c in row if c])

                    if not row_text:
                        continue

                    text = row_text.lower()

                    nums = re.findall(r"\d+\.?\d*", row_text)

                    if not nums:
                        continue

                    value = float(nums[-1])  # usually last is correct

                    if "revenue" in text:
                        results["revenue"] = value

                    elif "profit before tax" in text or "pbt" in text:
                        results["pbt"] = value

                    elif "expense" in text:
                        results["total_expense"] = value

                    elif "cash flow" in text:
                        results["cash_flow"] = value

    return results