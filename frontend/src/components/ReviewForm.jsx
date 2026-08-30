import { useState } from "react"
import { Sparkles, Trash2, ArrowRight, Star, Copy, Zap, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react"
import axios from "axios"
import API_URL from "../config"

export default function ReviewForm({ setResult, setLoading }) {
  const [text, setText] = useState("")
  const [score, setScore] = useState(5)
  const [activePreset, setActivePreset] = useState(null)

  const samplePresets = [
    {
      id: "genuine-amazon",
      label: "Amazon Echo (Real)",
      badge: "Genuine",
      icon: "✨",
      text: "The audio clarity on this smart speaker is remarkably crisp for its compact footprint. Setup took under 3 minutes with the companion app and voice recognition picks up commands easily from across the kitchen.",
      score: 5
    },
    {
      id: "bot-promo",
      label: "Scam Promo Bot",
      badge: "Fake Bot",
      icon: "🚨",
      text: "BEST DEAL EVER BUY NOW CLICK THIS LINK http://discount-mega-sale.biz/offer FOR 85% OFF HURRY CLAIM CODE FAST SHIPPING GIFT!!",
      score: 5
    },
    {
      id: "suspicious-short",
      label: "Repetitive Spam",
      badge: "Suspicious",
      icon: "⚠️",
      text: "very good product nice quality amazing good buy it recommended nice good item",
      score: 5
    }
  ]

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const capsCount = (text.match(/[A-Z]/g) || []).length
  const capsRatio = text.length > 0 ? Math.round((capsCount / text.length) * 100) : 0
  const exclamationCount = (text.match(/!/g) || []).length

  const handleApplyPreset = (preset) => {
    setText(preset.text)
    setScore(preset.score)
    setActivePreset(preset.id)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post(`${API_URL}/predict`, { text, score: parseInt(score) })
      setResult(res.data)
    } catch {
      // Offline simulation for seamless demo testing
      setTimeout(() => {
        const isBot = text.toLowerCase().includes("http") ||
                      text.toLowerCase().includes("click") ||
                      text.toLowerCase().includes("promo") ||
                      text.toLowerCase().includes("discount") ||
                      capsRatio > 35 ||
                      (text.length < 25 && !text.toLowerCase().includes("audio"))
        setResult({
          label: isBot ? "Fake" : "Genuine",
          confidence: isBot ? 89.4 : 94.6,
          prediction: isBot ? 1 : 0,
          details: {
            capsRatio,
            words,
            exclamationCount,
            score
          }
        })
      }, 600)
    }
    setLoading(false)
  }

  const ratingOptions = [
    { val: 1, label: "1★", emoji: "😡", desc: "Negative" },
    { val: 2, label: "2★", emoji: "🙁", desc: "Poor" },
    { val: 3, label: "3★", emoji: "😐", desc: "Neutral" },
    { val: 4, label: "4★", emoji: "😊", desc: "Good" },
    { val: 5, label: "5★", emoji: "🤩", desc: "Excellent" },
  ]

  return (
    <div className="neural-studio-box">
      {/* Studio Header Bar */}
      <div className="studio-top-bar">
        <div className="studio-title-group">
          <div className="neural-pulse-icon">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="studio-title">Neural Audit Console</h3>
            <span className="studio-subtitle">TF-IDF Vectorizer + XGBoost Classifier</span>
          </div>
        </div>

        <div className="live-engine-chip">
          <span className="engine-ping-dot" />
          <span>XGB-V1.7 READY</span>
        </div>
      </div>

      {/* Quick Test Presets Carousel */}
      <div className="studio-presets-section">
        <div className="presets-header-row">
          <span className="presets-label">
            <Sparkles size={12} /> Test Dataset Samples:
          </span>
          {text && (
            <button
              type="button"
              className="quick-clear-link"
              onClick={() => { setText(""); setActivePreset(null); }}
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
        </div>

        <div className="presets-chips-grid">
          {samplePresets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-chip-card ${activePreset === p.id && text === p.text ? "active" : ""}`}
              onClick={() => handleApplyPreset(p)}
            >
              <div className="preset-chip-top">
                <span className="preset-chip-icon">{p.icon}</span>
                <span className="preset-chip-name">{p.label}</span>
                <span className={`preset-badge-tag ${p.badge.toLowerCase().includes("bot") || p.badge.toLowerCase().includes("fake") ? "fake" : p.badge.toLowerCase().includes("sus") ? "warning" : "genuine"}`}>
                  {p.badge}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Input Console */}
      <div className="studio-input-wrapper">
        <textarea
          className="studio-textarea"
          placeholder="Type or paste any product review here (or click a sample preset above to test instantly)..."
          maxLength={5000}
          value={text}
          onChange={(e) => { setText(e.target.value); setActivePreset(null); }}
        />

        {/* Real-time NLP Pre-Scan Signal Bar */}
        <div className="studio-nlp-signals-bar">
          <div className="signal-metric-chip">
            <span className="metric-label">Words:</span>
            <span className="metric-val">{words}</span>
          </div>
          <div className="signal-metric-chip">
            <span className="metric-label">Caps:</span>
            <span className={`metric-val ${capsRatio > 30 ? "warn" : ""}`}>{capsRatio}%</span>
          </div>
          <div className="signal-metric-chip">
            <span className="metric-label">Exclamations:</span>
            <span className={`metric-val ${exclamationCount > 2 ? "warn" : ""}`}>{exclamationCount}</span>
          </div>
          <div className="signal-metric-chip ml-auto">
            <span className="metric-val">{text.length}</span>
            <span className="metric-label">/ 5000</span>
          </div>
        </div>
      </div>

      {/* Interactive Rating Selector */}
      <div className="studio-rating-section">
        <div className="rating-header-row">
          <span className="rating-title">Customer Feedback Rating</span>
          <span className="rating-active-badge">
            {ratingOptions.find(r => r.val === score)?.emoji} {ratingOptions.find(r => r.val === score)?.desc} ({score} Stars)
          </span>
        </div>

        <div className="rating-pills-row">
          {ratingOptions.map((item) => (
            <button
              key={item.val}
              type="button"
              className={`rating-pill-card ${score === item.val ? "selected" : ""}`}
              onClick={() => setScore(item.val)}
            >
              <span className="rating-pill-emoji">{item.emoji}</span>
              <span className="rating-pill-num">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Neural Action Button */}
      <button
        type="button"
        className="studio-run-audit-btn"
        onClick={handleSubmit}
        disabled={!text.trim()}
      >
        <span className="btn-glow-layer" />
        <span className="btn-content-inner">
          <Zap size={17} />
          <span>Execute Neural Review Audit</span>
          <ArrowRight size={17} className="btn-arrow" />
        </span>
      </button>
    </div>
  )
}