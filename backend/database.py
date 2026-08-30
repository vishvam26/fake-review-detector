import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# PostgreSQL / Supabase ya SQLite fallback
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./reviews.db"
)

# Render / Supabase PostgreSQL URL fix — "postgres://" → "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLAlchemy engine config
engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_pre_ping"] = True
    engine_args["pool_recycle"] = 300

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    review_text = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    label = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class AiDetection(Base):
    __tablename__ = "ai_detections"
    id = Column(Integer, primary_key=True, index=True)
    input_text = Column(String, nullable=False)
    ai_score = Column(Float, nullable=False)
    label = Column(String(50), nullable=False)
    vocabulary_diversity = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class BatchJob(Base):
    __tablename__ = "batch_jobs"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    total_reviews = Column(Integer, nullable=False)
    fake_count = Column(Integer, nullable=False)
    genuine_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

# Ensure all tables exist
Base.metadata.create_all(bind=engine)

def save_prediction(text, score, label, confidence):
    db = SessionLocal()
    try:
        pred = Prediction(
            review_text=text,
            score=score,
            label=label,
            confidence=confidence,
            created_at=datetime.utcnow()
        )
        db.add(pred)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"DB Prediction Insert Error: {e}")
    finally:
        db.close()

def save_ai_detection(text, ai_score, label, vocab_div=None):
    db = SessionLocal()
    try:
        item = AiDetection(
            input_text=text,
            ai_score=ai_score,
            label=label,
            vocabulary_diversity=vocab_div,
            created_at=datetime.utcnow()
        )
        db.add(item)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"DB AI Detection Insert Error: {e}")
    finally:
        db.close()

def save_batch_job(file_name, total, fake, genuine):
    db = SessionLocal()
    try:
        job = BatchJob(
            file_name=file_name,
            total_reviews=total,
            fake_count=fake,
            genuine_count=genuine,
            created_at=datetime.utcnow()
        )
        db.add(job)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"DB Batch Job Insert Error: {e}")
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
                "created_at": p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else ""
            }
            for p in preds
        ]
    except Exception as e:
        print(f"History Query Error: {e}")
        return []
    finally:
        db.close()

def get_stats():
    db = SessionLocal()
    try:
        total = db.query(Prediction).count()
        fake = db.query(Prediction).filter(Prediction.label == "Fake").count()
        genuine = total - fake

        avg = db.query(func.avg(Prediction.confidence)).scalar() or 0

        return {
            "total_analyzed": total,
            "fake_detected": fake,
            "genuine_detected": genuine,
            "avg_confidence": round(float(avg), 2),
            "fake_percentage": round((fake / total * 100) if total > 0 else 0, 2)
        }
    except Exception as e:
        print(f"Stats Query Error: {e}")
        return {
            "total_analyzed": 0,
            "fake_detected": 0,
            "genuine_detected": 0,
            "avg_confidence": 0,
            "fake_percentage": 0
        }
    finally:
        db.close()