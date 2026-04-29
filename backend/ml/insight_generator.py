import pandas as pd

def generate_insights(file_path):
    try:
        df = pd.read_csv(file_path)

        insights = []

        # Basic insights
        insights.append(f"Dataset has {df.shape[0]} rows and {df.shape[1]} columns")

        # Numeric columns
        numeric_cols = df.select_dtypes(include=['number']).columns

        for col in numeric_cols:
            insights.append(f"{col} average: {round(df[col].mean(), 2)}")
            insights.append(f"{col} max: {df[col].max()}")
            insights.append(f"{col} min: {df[col].min()}")

        return insights

    except Exception as e:
        return [f"Error generating insights: {str(e)}"]