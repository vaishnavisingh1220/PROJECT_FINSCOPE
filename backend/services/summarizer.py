from transformers import pipeline

# Use text-generation instead
generator = pipeline("text-generation", model="gpt2")

def generate_summary(text):
    text = text[:1000]  # keep input small

    prompt = f"Summarize this financial report:\n{text}\nSummary:"

    result = generator(
        prompt,
        max_length=200,
        num_return_sequences=1,
        truncation=True
    )

    output = result[0]['generated_text']

    # Extract only summary part
    summary = output.split("Summary:")[-1].strip()

    return summary