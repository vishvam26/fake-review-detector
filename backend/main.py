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
import serpapi
import requests
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from database import save_prediction, get_history
from dotenv import load_dotenv

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

SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")


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


def extract_asin(url):
    asin = ""
    if "/dp/" in url:
        asin = url.split("/dp/")[1].split("/")[0].split("?")[0]
    elif "/product/" in url:
        asin = url.split("/product/")[1].split("/")[0].split("?")[0]
    elif "amzn.in" in url or "amzn.to" in url or "/d/" in url:
        try:
            expanded = requests.get(url, allow_redirects=True, timeout=10).url
            print(f"Expanded URL: {expanded}")
            if "/dp/" in expanded:
                asin = expanded.split("/dp/")[1].split("/")[0].split("?")[0]
            elif "/product/" in expanded:
                asin = expanded.split("/product/")[1].split("/")[0].split("?")[0]
        except Exception as ex:
            print(f"Expand failed: {str(ex)}")
    return asin


@app.get("/")
def root():
    return {"message": "Fake Review Detector API running ✅"}


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


@app.post("/analyze/url")
async def analyze_url(data: dict):
    url = data.get("url", "")
    if not url:
        return {"error": "URL required"}
    try:
        asin = extract_asin(url)
        if not asin:
            return {"error": f"ASIN extract failed. URL: {url}"}

        product_name = ""
        try:
            import requests as req2
            exp = req2.get(url, allow_redirects=True, timeout=10).url
            if "/dp/" in exp:
                before_dp = exp.split("/dp/")[0]
                parts = [p for p in before_dp.split("/") if p and "amazon" not in p.lower() and len(p) > 5]
                if parts:
                    product_name = parts[-1].replace("-", " ")
        except:
            pass
        query = product_name + " amazon reviews" if product_name else asin + " amazon product reviews"
        print("Product:", product_name)
        print("Query:", query)
        results = serpapi.search(
            {
                "engine": "google",
                "q": f"{asin} amazon reviews site:amazon.com",
                "api_key": SERPAPI_KEY,
                "num": 10,
            }
        )

        reviews_data = []
        for r in results.get("organic_results", []):
            snippet = r.get("snippet", "")
            if snippet and len(snippet) > 30:
                reviews_data.append(
                    {
                        "body": snippet,
                        "rating": 4,
                        "profile": {"name": "Amazon Customer"},
                    }
                )
        for q in results.get("related_questions", []):
            snippet = q.get("snippet", "")
            if snippet and len(snippet) > 30:
                reviews_data.append(
                    {
                        "body": snippet,
                        "rating": 4,
                        "profile": {"name": "Amazon Customer"},
                    }
                )

        if not reviews_data:
            return {"error": "No reviews found"}

        analyzed = []
        fake_count = 0
        total_confidence = 0

        for r in reviews_data[:10]:
            review_text = r.get("body", "") or r.get("title", "")
            rating = r.get("rating", 5)
            if not review_text or len(review_text) < 10:
                continue
            features = extract_features(review_text, rating)
            prediction = int(model.predict(features)[0])
            confidence = round(
                float(model.predict_proba(features)[0][prediction]) * 100, 2
            )
            label = "Fake" if prediction == 1 else "Genuine"
            if label == "Fake":
                fake_count += 1
            total_confidence += confidence
            analyzed.append(
                {
                    "text": review_text[:150],
                    "label": label,
                    "confidence": confidence,
                    "rating": rating,
                    "reviewer": r.get("profile", {}).get("name", "Anonymous"),
                }
            )
            save_prediction(review_text, rating, label, confidence)

        if not analyzed:
            return {"error": "No valid reviews found"}

        total = len(analyzed)
        genuine_count = total - fake_count
        fake_percentage = round((fake_count / total) * 100, 1)
        trust_score = round(100 - fake_percentage, 1)
        avg_confidence = round(total_confidence / total, 2)

        if trust_score >= 80:
            recommendation = "✅ Worth Buying"
            rec_color = "green"
        elif trust_score >= 60:
            recommendation = "⚠️ Buy with Caution"
            rec_color = "yellow"
        else:
            recommendation = "❌ Avoid — Too Many Fake Reviews"
            rec_color = "red"

        return {
            "asin": asin,
            "url": url,
            "total_reviews": total,
            "fake_count": fake_count,
            "genuine_count": genuine_count,
            "fake_percentage": fake_percentage,
            "trust_score": trust_score,
            "avg_confidence": avg_confidence,
            "recommendation": recommendation,
            "rec_color": rec_color,
            "reviews": analyzed,
        }

    except Exception as e:
        return {"error": f"Scraping failed: {str(e)}"}
