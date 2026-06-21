<div align="center">

# 🛡️ ReviewGuard — AI-Powered Fake Review Detector

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://fake-review-detector-ochre.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fake-review-detector-0m6b.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-vishvam26-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vishvam26/fake-review-detector)
[![Notebook](https://img.shields.io/badge/Notebook-Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)](./notebooks/fake_review_detector_EDA.ipynb)
[![Dashboard](https://img.shields.io/badge/Dashboard-Power%20BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)](./dashboard/Fake_Review_Dashboard.pbix)

**End-to-end ML system that detects fake product reviews using NLP + XGBoost — deployed with FastAPI backend and React frontend.**

*Built by [Vishvam Prajapati](https://github.com/vishvam26) — B.Tech CSE @ JECRC University*

</div>

---

## 🎯 What This Project Does

E-commerce platforms lose billions due to fake reviews that mislead buyers. ReviewGuard solves this by:

- **Analyzing** any product review text using a trained ML model
- **Detecting** whether a review is genuine or fake/suspicious with confidence score
- **Bulk processing** — upload a CSV of 100+ reviews, get labeled results instantly
- **Tracking** all analyses with persistent PostgreSQL storage
- **Visualizing** stats via an analytics dashboard + Power BI

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend (Vercel) | https://fake-review-detector-ochre.vercel.app |
| ⚡ Backend API (Render) | https://fake-review-detector-0m6b.onrender.com |
| 📖 API Docs (Swagger) | https://fake-review-detector-0m6b.onrender.com/docs |
| 📓 EDA Notebook | [notebooks/fake_review_detector_EDA.ipynb](./notebooks/fake_review_detector_EDA.ipynb) |
| 📊 Power BI Dashboard | [dashboard/Fake_Review_Dashboard.pbix](./dashboard/Fake_Review_Dashboard.pbix) |

> ⚠️ Note: Backend is on Render free tier — first load may take 30–60 seconds to wake up.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 Single Review Analyzer | Paste any review — instant Fake/Genuine with animated confidence gauge |
| 📋 Bulk CSV Analyzer | Upload CSV of reviews → download labeled results CSV |
| 🌙 Dark / Light Theme | Toggle between themes — sun/moon icon in header |
| 📊 Analytics Dashboard | Live stats — total analyzed, fake %, avg confidence |
| 🕐 History Tracking | All analyses stored in PostgreSQL — persistent across sessions |
| 📈 Power BI Dashboard | Visual charts — score distribution, fake trends, KPI cards |

---

## 🛠️ Tech Stack

### Machine Learning Pipeline
```
Raw Data (568K Amazon Reviews)
        ↓
Data Cleaning & EDA (Pandas, Seaborn, Plotly)
        ↓
Feature Engineering
  ├── TF-IDF Vectorization (5,000 features)
  ├── Sentiment Score (TextBlob/VADER)
  ├── Text Length & Word Count
  ├── Exclamation Count
  ├── Caps Ratio
  └── Helpfulness Ratio
        ↓
Model Comparison
  ├── Logistic Regression
  ├── Random Forest
  └── XGBoost ✅ Best (~85% F1-Score)
        ↓
Serialized (.pkl) → Served via FastAPI
```

### Full Stack
| Layer | Technology |
|-------|-----------|
| ML Model | XGBoost, Scikit-learn |
| NLP | TF-IDF, NLTK, TextBlob |
| Backend | FastAPI, Python |
| Database | PostgreSQL (Render) + SQLite (local) |
| Frontend | React.js 18, Vite |
| Styling | CSS Variables (Dark/Light theme) |
| Deployment | Vercel (frontend) + Render (backend) |
| Analytics | Power BI |

---

## 📊 Model Performance

| Model | F1-Score | ROC-AUC |
|-------|----------|---------|
| Logistic Regression | ~0.78 | ~0.82 |
| Random Forest | ~0.81 | ~0.85 |
| **XGBoost** ✅ | **~0.85** | **~0.88** |

**Dataset:** Amazon Fine Food Reviews — 568,454 reviews  
**Training Sample:** 50,000 balanced reviews (25K genuine + 25K fake)  
**Feature Matrix:** 5,006 dimensions (5,000 TF-IDF + 6 engineered features)  
**Training Environment:** Google Colab (free GPU)

---

## 📓 EDA & ML Notebook

Full exploratory data analysis, feature engineering, and model training:

👉 **[fake_review_detector_EDA.ipynb](./notebooks/fake_review_detector_EDA.ipynb)**

**Notebook includes:**
- Data loading & cleaning (568K reviews)
- Label creation logic (helpfulness ratio + score + text patterns)
- EDA visualizations — score distribution, review length, WordClouds
- NLP pipeline — text cleaning, lemmatization, stopword removal
- TF-IDF vectorization + extra feature engineering
- 3 model comparison — Logistic Regression, Random Forest, XGBoost
- Confusion matrix, ROC curve, F1 score evaluation
- Model serialization (.pkl files)

---

## 📊 Power BI Dashboard

Interactive analytics dashboard built on prediction data exported from PostgreSQL/SQLite.

👉 **[Download Fake_Review_Dashboard.pbix](./dashboard/Fake Review Dashboard.pbix)**

**To open:** Download the `.pbix` file and open in Power BI Desktop.

**Visuals included:**
- Fake vs Genuine pie chart (35% fake detected)
- Average confidence by label (bar chart)
- Score distribution by label (column chart)
- KPI cards — Total analyzed, Avg confidence 82%, Fake %

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Single review prediction |
| `POST` | `/predict/bulk` | Bulk CSV prediction (returns CSV) |
| `GET` | `/history` | Recent 20 predictions |
| `GET` | `/stats` | Aggregate analytics |

### Example — Single Prediction

**Request:**
```json
POST /predict
{
  "text": "This product is absolutely AMAZING!!! BUY NOW!!!!",
  "score": 5
}
```

**Response:**
```json
{
  "label": "Fake",
  "confidence": 84.55,
  "prediction": 1
}
```

### Bulk CSV Format
```csv
review_text,score
"Good product although delivery took longer than expected.",4
"AMAZING!!!! BUY NOW!!!! BEST EVER!!!!",5
"Decent quality but packaging was damaged on arrival.",3
```
Upload → Get results CSV with `label` + `confidence` columns added.

---

## 📁 Project Structure

```
fake-review-detector/
├── backend/
│   ├── main.py                       # FastAPI app — 5 endpoints
│   ├── database.py                   # PostgreSQL/SQLite ORM (SQLAlchemy)
│   ├── fake_review_model.pkl         # Trained XGBoost model
│   ├── tfidf_vectorizer.pkl          # Fitted TF-IDF vectorizer
│   ├── scaler.pkl                    # Feature scaler
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Main app — theme toggle, routing
│   │   ├── config.js                 # API URL config (env variable)
│   │   ├── App.css                   # Full CSS — dark/light variables
│   │   ├── index.css                 # CSS custom properties
│   │   └── components/
│   │       ├── ReviewForm.jsx        # Review input + star rating
│   │       ├── ResultCard.jsx        # Animated SVG gauge + result
│   │       ├── History.jsx           # Analysis history list
│   │       └── Stats.jsx             # Analytics dashboard
│   └── package.json
├── notebooks/
│   └── fake_review_detector_EDA.ipynb  # Full EDA + ML training notebook
├── dashboard/
│   └── Fake_Review_Dashboard.pbix      # Power BI analytics dashboard
└── README.md
```

---

## 🏃 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend
```bash
git clone https://github.com/vishvam26/fake-review-detector.git
cd fake-review-detector

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## 💡 Key Design Decisions

**Why XGBoost over deep learning?**
XGBoost gave 85% F1-score with fast inference (<100ms per prediction) — ideal for a real-time API. Deep learning would require GPU at inference time, increasing hosting cost significantly.

**Why TF-IDF + engineered features?**
Fake reviews have patterns beyond words — excessive exclamations, all-caps words, very short text. Adding 6 numeric features improved F1 by ~4% over TF-IDF alone.

**Why PostgreSQL instead of SQLite in production?**
Render's free tier uses ephemeral storage — SQLite data is lost on every redeploy. PostgreSQL free tier persists data permanently across deployments.

**Why Google Colab for training?**
568K reviews would crash a local laptop CPU. Colab's free GPU trained the model in minutes. The serialized .pkl files are then used locally and in production — no GPU needed at inference time.

---

## 🎯 Resume Bullets

```
ReviewGuard — AI-Powered Fake Review Detector                              May 2026 – Present
Tech: Python, XGBoost, TF-IDF, FastAPI, React.js, PostgreSQL, Power BI

• Trained XGBoost classifier on 568K+ Amazon reviews with custom NLP pipeline —
  TF-IDF + sentiment score + caps ratio + exclamation count — achieving 85% F1-score.
• Built FastAPI backend with 5 endpoints: single prediction, bulk CSV analyzer
  (downloadable results), persistent history, and live stats dashboard.
• Compared 3 ML models (Logistic Regression, Random Forest, XGBoost) with full EDA —
  feature distribution plots, WordClouds, confusion matrix, ROC curve in Jupyter Notebook.
• Developed React + Vite frontend with dark/light mode toggle and animated SVG
  confidence gauge; deployed on Vercel (frontend) + Render (backend) + PostgreSQL.
• Built Power BI dashboard with 5 visuals — fake/genuine distribution, confidence
  trends, score analysis, and KPI cards.
```

---

## 👨‍💻 Author

**Vishvam Prajapati**
B.Tech CSE @ JECRC University, Jaipur (2023–2027)
📧 p.vishu2685@gmail.com
🔗 [LinkedIn](https://linkedin.com/in/vishvam) | [GitHub](https://github.com/vishvam26)

---

## 📄 License

MIT License — free to use for learning and reference.

---

<div align="center">

**⭐ If this project helped you, please star the repo!**

Made with ❤️ by Vishvam Prajapati

</div>
