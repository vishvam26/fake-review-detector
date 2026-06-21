import os
from sqlalchemy import create_engine, Column, Integer, String, Float, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# PostgreSQL ya SQLite — env variable thi decide thashe
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./reviews.db"
)

# Render PostgreSQL URL fix — "postgres://" → "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    review_text = Column(String)
    score = Column(Integer)
    label = Column(String)
    confidence = Column(Float)
    created_at = Column(String)

# Table banavo
Base.metadata.create_all(bind=engine)

def save_prediction(text, score, label, confidence):
    db = SessionLocal()
    try:
        pred = Prediction(
            review_text=text,
            score=score,
            label=label,
            confidence=confidence,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(pred)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"DB Error: {e}")
    finally:
        db.close()

def get_history(limit=20):
    db = SessionLocal()
    try:
        preds = db.query(Prediction).order_by(
            Prediction.id.desc()
        ).limit(limit).all()
        return [
            {
                "id": p.id,
                "text": p.review_text[:100] + "..." if len(p.review_text) > 100 else p.review_text,
                "score": p.score,
                "label": p.label,
                "confidence": p.confidence,
                "created_at": p.created_at
            }
            for p in preds
        ]
    except Exception as e:
        print(f"History Error: {e}")
        return []
    finally:
        db.close()

def get_stats():
    db = SessionLocal()
    try:
        total = db.query(Prediction).count()
        fake = db.query(Prediction).filter(Prediction.label == "Fake").count()
        genuine = total - fake

        from sqlalchemy import func
        avg = db.query(func.avg(Prediction.confidence)).scalar() or 0

        return {
            "total_analyzed": total,
            "fake_detected": fake,
            "genuine_detected": genuine,
            "avg_confidence": round(float(avg), 2),
            "fake_percentage": round((fake / total * 100) if total > 0 else 0, 2)
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {
            "total_analyzed": 0,
            "fake_detected": 0,
            "genuine_detected": 0,
            "avg_confidence": 0,
            "fake_percentage": 0
        }
    finally:
        db.close()