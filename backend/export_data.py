# backend/export_data.py
import sqlite3
import pandas as pd

conn = sqlite3.connect('reviews.db')

# All predictions export
df = pd.read_sql_query("""
    SELECT 
        id,
        review_text,
        score,
        label,
        confidence,
        created_at,
        LENGTH(review_text) as text_length,
        (LENGTH(review_text) - LENGTH(REPLACE(review_text, '!', ''))) as exclamation_count
    FROM predictions
    ORDER BY id DESC
""", conn)

conn.close()

df.to_csv('dashboard_data.csv', index=False)
print(f"Exported {len(df)} records to dashboard_data.csv ✅")
print(df.head())