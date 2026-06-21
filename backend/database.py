import sqlite3
from datetime import datetime

DB_PATH = "reviews.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_text TEXT,
            score INTEGER,
            label TEXT,
            confidence REAL,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_prediction(text, score, label, confidence):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO predictions (review_text, score, label, confidence, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (text, score, label, confidence, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()

def get_history(limit=20):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, review_text, score, label, confidence, created_at
        FROM predictions ORDER BY id DESC LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r[0],
            "text": r[1][:100] + "..." if len(r[1]) > 100 else r[1],
            "score": r[2],
            "label": r[3],
            "confidence": r[4],
            "created_at": r[5]
        }
        for r in rows
    ]

def get_stats():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM predictions")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE label='Fake'")
    fake_count = cursor.fetchone()[0]
    cursor.execute("SELECT AVG(confidence) FROM predictions")
    avg_conf = cursor.fetchone()[0]
    conn.close()
    return {
        "total_analyzed": total,
        "fake_detected": fake_count,
        "genuine_detected": total - fake_count,
        "avg_confidence": round(avg_conf or 0, 2),
        "fake_percentage": round((fake_count / total * 100) if total > 0 else 0, 2)
    }