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
import nltk
from nltk.corpus import stopwords
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.stem import WordNetLemmatizer
nltk.download("vader_lexicon", quiet=True)
from database import save_prediction, save_ai_detection, save_batch_job, get_history
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
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("fake_review_model.pkl")
tfidf = joblib.load("tfidf_vectorizer.pkl")
scaler = joblib.load("scaler.pkl")

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))
sid = SentimentIntensityAnalyzer()

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
    text = re.sub(r"http\S+|[^a-z\s]|\s+", lambda m: " " if m.group().isspace() else ("" if m.group().startswith("http") else m.group()), text).strip()
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words]
    return " ".join(tokens)


def extract_features(text, score):
    clean = clean_text(text)
    tfidf_vec = tfidf.transform([clean])
    sentiment = sid.polarity_scores(clean)["compound"]
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
    if not req.text.strip():
        return {"error": "Review text cannot be empty"}
    if len(req.text) > 5000:
        return {"error": "Review text exceeds maximum length of 5000 characters"}
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
    try:
        decoded = content.decode("utf-8")
    except UnicodeDecodeError:
        decoded = content.decode("latin-1")

    reader = list(csv.DictReader(io.StringIO(decoded)))
    if not reader:
        return {"error": "Uploaded CSV file is empty"}

    # Find the best column for review text
    fieldnames = reader[0].keys()
    text_col = None
    rating_col = None

    # Priority column candidates
    possible_text_cols = ["review_text", "review", "text", "content", "comment", "feedback", "description", "message", "body"]
    for candidate in possible_text_cols:
        for f in fieldnames:
            if f and f.strip().lower() == candidate:
                text_col = f
                break
        if text_col:
            break

    # If not found by exact name, look for partial match
    if not text_col:
        for f in fieldnames:
            if f and any(cand in f.lower() for cand in ["review", "text", "comment", "desc"]):
                text_col = f
                break

    # If still not found, fallback to the first string column
    if not text_col and fieldnames:
        text_col = list(fieldnames)[0]

    # Find rating / score column
    possible_score_cols = ["score", "rating", "stars", "star_rating"]
    for candidate in possible_score_cols:
        for f in fieldnames:
            if f and f.strip().lower() == candidate:
                rating_col = f
                break
        if rating_col:
            break

    results = []
    fake_count = 0
    genuine_count = 0

    for row in reader:
        text = str(row.get(text_col) or "").strip()
        if not text:
            continue

        raw_score = row.get(rating_col, 5) if rating_col else 5
        try:
            score = int(float(raw_score))
            score = max(1, min(5, score))
        except (ValueError, TypeError):
            score = 5

        features = extract_features(text, score)
        prediction = int(model.predict(features)[0])
        confidence = round(float(model.predict_proba(features)[0][prediction]) * 100, 2)
        label = "Fake" if prediction == 1 else "Genuine"
        if label == "Fake":
            fake_count += 1
        else:
            genuine_count += 1

        save_prediction(text, score, label, confidence)
        results.append(
            {
                "review_text": text[:120],
                "score": score,
                "label": label,
                "confidence": confidence,
            }
        )
    save_batch_job(file.filename or "bulk_upload.csv", len(results), fake_count, genuine_count)
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
    polarities = [sid.polarity_scores(s)["compound"] for s in sentences]
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
    save_ai_detection(
        req.text,
        result["score"],
        result["label"],
        result["metrics"].get("vocabulary_diversity")
    )
    return result
