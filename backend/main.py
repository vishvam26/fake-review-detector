from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import scipy.sparse as sp
import re
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from database import save_prediction, get_history

# NLTK downloads
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

app = FastAPI(title="Fake Review Detector API")

# CORS — React frontend sathe connect thavase
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models load karo
model = joblib.load("fake_review_model.pkl")
tfidf = joblib.load("tfidf_vectorizer.pkl")
scaler = joblib.load("scaler.pkl")

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Request body
class ReviewRequest(BaseModel):
    text: str
    score: int = 5  # default 5 star

# Text cleaning (same as training)
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words]
    return ' '.join(tokens)

# Feature extraction
def extract_features(text, score):
    clean = clean_text(text)
    tfidf_vec = tfidf.transform([clean])
    
    sentiment = TextBlob(text).sentiment.polarity
    text_length = len(text)
    word_count = len(text.split())
    exclamation_count = text.count('!')
    caps_ratio = sum(1 for c in text if c.isupper()) / (len(text) + 1)
    helpfulness_ratio = 0.0  # new review mate default
    
    extra = np.array([[sentiment, text_length, word_count,
                       exclamation_count, caps_ratio, helpfulness_ratio]])
    extra_scaled = scaler.transform(sp.csr_matrix(extra))
    
    return sp.hstack([tfidf_vec, extra_scaled])

@app.get("/")
def root():
    return {"message": "Fake Review Detector API running ✅"}

@app.post("/predict")
def predict(req: ReviewRequest):
    features = extract_features(req.text, req.score)
    prediction = int(model.predict(features)[0])
    confidence = round(float(model.predict_proba(features)[0][prediction]) * 100, 2)
    label = "Fake" if prediction == 1 else "Genuine"
    
    # Database ma save karo
    save_prediction(req.text, req.score, label, confidence)
    
    return {
        "label": label,
        "confidence": confidence,
        "prediction": prediction
    }

@app.get("/history")
def history():
    return get_history()

@app.get("/stats")
def stats():
    from database import get_stats
    return get_stats()

# Existing imports ni niche aa add karo
import csv
import io
from fastapi.responses import StreamingResponse
from fastapi import UploadFile, File

@app.post("/predict/bulk")
async def predict_bulk(file: UploadFile = File(...)):
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    results = []
    for row in reader:
        text = row.get("review_text") or row.get("text") or row.get("review") or ""
        score = int(row.get("score", 5) or 5)
        
        if not text.strip():
            continue
            
        features = extract_features(text, score)
        prediction = int(model.predict(features)[0])
        confidence = round(float(model.predict_proba(features)[0][prediction]) * 100, 2)
        label = "Fake" if prediction == 1 else "Genuine"
        
        save_prediction(text, score, label, confidence)
        
        results.append({
            "review_text": text[:100],
            "score": score,
            "label": label,
            "confidence": confidence
        })
    
    # CSV response banavo
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["review_text","score","label","confidence"])
    writer.writeheader()
    writer.writerows(results)
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=results.csv"}
    )