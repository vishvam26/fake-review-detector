from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import joblib
import numpy as np
import scipy.sparse as sp
import re
import csv
import io
import os
import requests
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from database import save_prediction, get_history
from dotenv import load_dotenv
from nltk.corpus import wordnet


load_dotenv()

nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("omw-1.4", quiet=True)

app = FastAPI(title="Fake Review Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("fake_review_model.pkl")
tfidf = joblib.load("tfidf_vectorizer.pkl")
scaler = joblib.load("scaler.pkl")

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

AI_SIGNATURE_WORDS = [
    "testament", "moreover", "delighted", "furthermore", "in summary",
    "overall", "not only", "but also", "seamless", "sleek", "stunning",
    "highly recommend", "perfect balance", "efficient", "nestled", "tapestry",
    "delve", "meticulously", "user-friendly", "versatile", "designed with",
    "elevate", "cutting-edge", "game-changer", "impressive", "outstanding"
]


class ReviewRequest(BaseModel):
    text: str
    score: int = 5


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words]
    return " ".join(tokens)


def extract_features(text, score):
    clean = clean_text(text)
    tfidf_vec = tfidf.transform([clean])
    sentiment = TextBlob(text).sentiment.polarity
    text_length = len(text)
    word_count = len(text.split())
    exclamation_count = text.count("!")
    caps_ratio = sum(1 for c in text if c.isupper()) / (len(text) + 1)
    helpfulness_ratio = 0.0
    extra = np.array(
        [
            [
                sentiment,
                text_length,
                word_count,
                exclamation_count,
                caps_ratio,
                helpfulness_ratio,
            ]
        ]
    )
    extra_scaled = scaler.transform(sp.csr_matrix(extra))
    return sp.hstack([tfidf_vec, extra_scaled])


# Scraping functions removed.


@app.get("/")
def root():
    return {"message": "Fake Review Detector API running"}


@app.post("/predict")
def predict(req: ReviewRequest):
    features = extract_features(req.text, req.score)
    prediction = int(model.predict(features)[0])
    confidence = round(float(model.predict_proba(features)[0][prediction]) * 100, 2)
    label = "Fake" if prediction == 1 else "Genuine"
    save_prediction(req.text, req.score, label, confidence)
    return {"label": label, "confidence": confidence, "prediction": prediction}


@app.get("/history")
def history():
    try:
        return get_history()
    except:
        return []


@app.get("/stats")
def stats():
    try:
        from database import get_stats

        return get_stats()
    except:
        return {
            "total_analyzed": 0,
            "fake_detected": 0,
            "genuine_detected": 0,
            "avg_confidence": 0,
            "fake_percentage": 0,
        }


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
        results.append(
            {
                "review_text": text[:100],
                "score": score,
                "label": label,
                "confidence": confidence,
            }
        )
    output = io.StringIO()
    writer = csv.DictWriter(
        output, fieldnames=["review_text", "score", "label", "confidence"]
    )
    writer.writeheader()
    writer.writerows(results)
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=results.csv"},
    )


def analyze_ai_text(text: str):
    # Pre-clean / tokenize
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    num_sentences = len(sentences)
    
    # Word tokenization for statistics
    words = [w.lower() for w in re.sub(r'[^a-zA-Z\s]', '', text).split() if w]
    total_words = len(words)
    
    # 1. Vocabulary Diversity (TTR)
    unique_words = len(set(words))
    ttr = (unique_words / total_words) if total_words > 0 else 0.0
    
    # 2. Sentence Uniformity (Burstiness)
    sentence_lengths = [len(s.split()) for s in sentences]
    avg_sentence_len = np.mean(sentence_lengths) if sentence_lengths else 0.0
    sentence_len_std = float(np.std(sentence_lengths)) if len(sentence_lengths) > 1 else 0.0
    
    # 3. Spelling Error Ratio (using NLTK wordnet synsets)
    candidate_words = [w for w in words if w not in stop_words and len(w) > 3]
    misspelled_count = 0
    for w in candidate_words:
        try:
            if not wordnet.synsets(w):
                misspelled_count += 1
        except Exception:
            pass
    spelling_error_ratio = (misspelled_count / len(candidate_words)) if candidate_words else 0.0
    
    # 4. Sentiment Consistency (variance of sentence polarity)
    polarities = [TextBlob(s).sentiment.polarity for s in sentences]
    sentiment_std = float(np.std(polarities)) if len(polarities) > 1 else 0.0
    avg_sentiment = float(np.mean(polarities)) if polarities else 0.0
    
    # 5. Caps and Exclamations Ratio
    char_count = len(text)
    caps_ratio = sum(1 for c in text if c.isupper()) / (char_count + 1)
    exclamation_count = text.count("!")
    exclamation_ratio = exclamation_count / (char_count + 1)
    
    # 6. AI Signature Buzzwords count
    text_lower = text.lower()
    buzzwords_found = []
    for w in AI_SIGNATURE_WORDS:
        if w in text_lower:
            buzzwords_found.append(w)
    buzzword_score = len(buzzwords_found)
    
    # Heuristic AI Probability calculation (0-100)
    ai_score = 50.0
    explanations = []
    
    # A. Spelling error effect
    if spelling_error_ratio > 0.08:
        ai_score -= 25
        explanations.append("Contains noticeable spelling errors or slang, typical of human writing.")
    elif spelling_error_ratio < 0.02 and len(candidate_words) >= 5:
        ai_score += 10
        explanations.append("Grammar and spelling are exceptionally clean.")
        
    # B. Sentence Uniformity
    if num_sentences >= 3:
        if sentence_len_std < 3.5:
            ai_score += 15
            explanations.append("Sentences are highly uniform in length, showing a robotic, structured flow.")
        elif sentence_len_std > 7.5:
            ai_score -= 15
            explanations.append("Sentence lengths vary significantly, showing a natural, human-like dynamic flow.")
    else:
        if total_words < 10:
            ai_score -= 15
            explanations.append("Review is extremely short, which is common for brief human feedback.")
            
    # C. Sentiment Consistency
    if num_sentences >= 3:
        if sentiment_std < 0.08:
            ai_score += 10
            explanations.append("Sentiment is highly uniform throughout the review.")
        elif sentiment_std > 0.25:
            ai_score -= 15
            explanations.append("Sentiment shifts dynamically between sentences, showing natural emotional changes.")
            
    # D. Exclamations / Caps Ratio
    if exclamation_ratio > 0.02:
        ai_score -= 15
        explanations.append("Uses multiple exclamation marks, suggesting emotional human input.")
    if caps_ratio > 0.15:
        ai_score -= 15
        explanations.append("Has a high ratio of capital letters, indicating human emphasis or excitement.")
    elif caps_ratio == 0.0 and total_words > 5:
        ai_score -= 10
        explanations.append("Contains zero capitalization, indicating informal human messaging.")
        
    # E. AI Buzzwords
    if buzzword_score > 0:
        boost = min(buzzword_score * 8, 25)
        ai_score += boost
        words_str = ", ".join([f"'{w}'" for w in buzzwords_found[:3]])
        explanations.append(f"Contains signature AI transition words or adjectives: {words_str}.")
        
    # Clamp AI score
    ai_score = max(2.0, min(98.0, ai_score))
    
    if not explanations:
        if ai_score > 50:
            explanations.append("The review structure matches patterns typical of machine-generated text.")
        else:
            explanations.append("The review exhibits natural variety and vocabulary typical of human writing.")
            
    label = "AI-Generated" if ai_score >= 50 else "Human-Written"
    
    return {
        "score": round(ai_score, 1),
        "label": label,
        "metrics": {
            "vocabulary_diversity": round(ttr * 100, 1),
            "sentence_uniformity": round(sentence_len_std, 2),
            "spelling_quality": round((1.0 - spelling_error_ratio) * 100, 1),
            "sentiment_consistency": round(sentiment_std, 3),
            "caps_ratio": round(caps_ratio * 100, 1),
            "exclamation_count": exclamation_count,
            "word_count": total_words,
            "sentence_count": num_sentences
        },
        "explanations": explanations
    }

class AIDetectRequest(BaseModel):
    text: str

@app.post("/detect/ai")
def detect_ai(req: AIDetectRequest):
    if not req.text.strip():
        return {"error": "Text is empty"}
    result = analyze_ai_text(req.text)
    save_prediction(req.text[:200], 5, result["label"], result["score"])
    return result
