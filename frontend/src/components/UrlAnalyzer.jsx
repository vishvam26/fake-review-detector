import { useState } from "react"
import axios from "axios"
import API_URL from "../config"


export default function UrlAnalyzer() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setLoading(true); setResult(null); setError("")
    try {
      const res = await axios.post(`${API_URL}/analyze/url`, { url })
      if (res.data.error) {
        setError(res.data.error)
      } else {
        setResult(res.data)
      }
    } catch {
      setError("Backend running chhe? API call failed.")
    }
    setLoading(false)
  }

  const getTrustColor = (score) => {
    if (score >= 80) return "#10b981"
    if (score >= 60) return "#f59e0b"
    return "#ef4444"
  }

  const getTrustEmoji = (score) => {
    if (score >= 80) return "✅"
    if (score >= 60) return "⚠️"
    return "❌"
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingTop: "2rem" }}>
      <div className="page-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>Analyze Amazon Reviews in Real-Time</h2>
        <p>Paste any Amazon product URL to automatically retrieve and verify customer review authenticity.</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="url-input-container">
          <input
            type="text"
            className="url-input"
            placeholder="https://www.amazon.in/dp/B08N5WRWNW or https://amzn.in/d/xxxxx"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAnalyze()}
          />
          <button
            className="url-analyze-btn"
            onClick={handleAnalyze}
            disabled={!url.trim() || loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        <div className="url-helper-badge">
          <i className="ti ti-info-circle" />
          <span>Supports amazon.com, amazon.in — full URLs and short amzn.in links.</span>
        </div>
      </div>

      {loading && (
        <div className="card loading-wrap">
          <div className="spinner" />
          <p>Scraping reviews and analyzing with XGBoost ML model...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.15)",
          color: "#f87171",
          textAlign: "center",
          padding: "1.5rem",
          borderRadius: "16px"
        }}>
          <i className="ti ti-alert-circle" style={{ marginRight: "6px" }} />
          {error}
        </div>
      )}

      {result && !loading && (
        <>
          {/* Product Info */}
          {result.product_name && (
            <div style={{
              textAlign: "center",
              marginBottom: "1rem",
              color: "var(--text-secondary)",
              fontSize: "0.9rem"
            }}>
              📦 Analyzing: <strong style={{ color: "var(--text-primary)" }}>{result.product_name}</strong>
              <span style={{ marginLeft: "8px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                (ASIN: {result.asin})
              </span>
            </div>
          )}

          {/* Trust Score Dashboard */}
          <div className="url-dashboard-grid">
            {/* Trust Score Card */}
            <div className="card trust-score-circle-card">
              <span className="trust-score-label">Trust Score</span>
              <div className="trust-score-number" style={{ color: getTrustColor(result.trust_score) }}>
                {result.trust_score}
              </div>
              <div className="trust-recommendation" style={{ color: getTrustColor(result.trust_score) }}>
                {getTrustEmoji(result.trust_score)} {result.recommendation}
              </div>
            </div>

            {/* Stats Card */}
            <div className="url-stats-block-grid">
              <div className="url-stat-box">
                <div className="url-stat-val" style={{ color: "var(--accent-light)" }}>
                  {result.total_reviews}
                </div>
                <div className="url-stat-label">Reviews Analyzed</div>
              </div>
              <div className="url-stat-box">
                <div className="url-stat-val" style={{ color: "#ef4444" }}>
                  {result.fake_count}
                </div>
                <div className="url-stat-label">Fake Reviews</div>
              </div>
              <div className="url-stat-box">
                <div className="url-stat-val" style={{ color: "#10b981" }}>
                  {result.genuine_count}
                </div>
                <div className="url-stat-label">Genuine Reviews</div>
              </div>
              <div className="url-stat-box">
                <div className="url-stat-val" style={{ color: "var(--accent2)" }}>
                  {result.avg_confidence}%
                </div>
                <div className="url-stat-label">Avg Confidence</div>
              </div>

              {/* Progress Bar */}
              <div className="url-fake-ratio-container" style={{ gridColumn: "1 / -1" }}>
                <div className="url-fake-ratio-header">
                  <span className="url-ratio-label">Genuine vs Fake Distribution</span>
                  <span className="url-ratio-val" style={{ color: getTrustColor(result.trust_score) }}>
                    {(100 - result.fake_percentage).toFixed(1)}% Genuine
                  </span>
                </div>
                <div className="url-ratio-track">
                  <div
                    className="url-ratio-fill"
                    style={{
                      width: `${100 - result.fake_percentage}%`,
                      background: `linear-gradient(90deg, #ef4444, ${getTrustColor(result.trust_score)})`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="card url-reviews-list-card">
            <div className="url-reviews-header">
              <h2>Analyzed Reviews ({result.reviews.length})</h2>
            </div>
            <div className="history-list">
              {result.reviews.map((r, i) => {
                const isFake = r.label === "Fake"
                return (
                  <div key={i} className={`history-item-row ${isFake ? "fake" : "genuine"}`}>
                    <div className="history-item-icon-col">
                      <span className={`history-icon-wrapper ${isFake ? "bot" : "real"}`}>
                        <i className={`ti ${isFake ? "ti-alert-triangle" : "ti-circle-check"}`} />
                      </span>
                    </div>
                    <div className="history-item-content-col">
                      <p className="history-item-text">"{r.text}"</p>
                      <span className="history-item-subtext">
                        {r.reviewer} • {"⭐".repeat(Math.min(r.rating, 5))}
                      </span>
                    </div>
                    <div className="history-item-score-col">
                      <span className={`history-score-val ${isFake ? "bot" : "real"}`}>
                        {r.confidence}% {isFake ? "Bot" : "Real"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}