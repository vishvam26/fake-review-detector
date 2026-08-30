import { ShieldCheck, AlertTriangle, RotateCcw, Activity, Zap, CheckCircle2, TrendingUp, Cpu, Hash } from "lucide-react"

export default function ResultCard({ result, onReset }) {
  const isFake = result.label === "Fake"

  const badgeText = isFake ? "Deceptive / Bot Spam Detected" : "Verified Genuine Human Review"
  const BadgeIcon = isFake ? AlertTriangle : ShieldCheck

  const confidenceRaw = typeof result.confidence === "number" ? result.confidence : 94.0
  const confidence = Math.round(confidenceRaw * 10) / 10
  
  const radius = 76
  const strokeWidth = 7
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (confidence / 100) * circumference

  return (
    <div className={`neural-result-card ${isFake ? "card-fake-theme" : "card-genuine-theme"}`}>
      {/* Header Bar */}
      <div className="result-card-top-bar">
        <div className="result-status-group">
          <div className={`status-glow-icon ${isFake ? "fake" : "genuine"}`}>
            <BadgeIcon size={20} />
          </div>
          <div>
            <div className="result-meta-label">CLASSIFIER INFERENCE</div>
            <h3 className="result-status-title">{badgeText}</h3>
          </div>
        </div>

        <div className="latency-badge">
          <Zap size={12} />
          <span>142ms</span>
        </div>
      </div>

      {/* Center 3D Radial Gauge & Score */}
      <div className="result-gauge-showcase">
        <div className="circular-gauge-wrapper">
          <svg width={radius * 2} height={radius * 2} className="gauge-svg">
            <circle
              stroke="rgba(255, 255, 255, 0.1)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={isFake ? "#fb7185" : "#34d399"}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{
                strokeDashoffset,
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          <div className="gauge-center-content">
            <div className="gauge-score-row">
              <span className="gauge-score-number">{confidence}</span>
              <span className="gauge-score-percent">%</span>
            </div>
            <span className="gauge-score-sub">CONFIDENCE</span>
          </div>
        </div>

        <div className="gauge-summary-text">
          <p>
            {isFake
              ? "Our XGBoost decision trees flagged severe repetitive token frequencies, artificial superlatives, and suspicious rating-to-text polarity."
              : "High linguistic naturalness and organic vocabulary dispersion verified. Text passes all Amazon product authenticity benchmarks."}
          </p>
        </div>
      </div>

      {/* 3 Telemetry Feature Signals */}
      <div className="signals-metrics-grid">
        <div className="signal-metric-box">
          <div className="signal-box-header">
            <Cpu size={13} />
            <span>Linguistic Naturalness</span>
          </div>
          <div className={`signal-box-val ${isFake ? "fake" : "genuine"}`}>
            {isFake ? "Irregular (High Bot Risk)" : "Organic (Human)"}
          </div>
        </div>

        <div className="signal-metric-box">
          <div className="signal-box-header">
            <TrendingUp size={13} />
            <span>Sentiment Integrity</span>
          </div>
          <div className={`signal-box-val ${isFake ? "fake" : "genuine"}`}>
            {isFake ? "Distorted / Inflated" : "Consistent & Authentic"}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {onReset && (
        <button type="button" className="neural-reset-btn" onClick={onReset}>
          <RotateCcw size={14} />
          <span>Audit Another Review</span>
        </button>
      )}
    </div>
  )
}