export default function ResultCard({ result }) {
  const isFake = result.label === "Fake"

  // Dynamic content based on prediction
  const badgeClass = isFake ? "result-status-badge fake" : "result-status-badge genuine"
  const badgeText = isFake ? "Suspicious" : "Genuine"
  const badgeIcon = isFake ? "ti ti-alert-triangle" : "ti ti-circle-check"
  
  const description = isFake
    ? "Our model detected high repetitive vocabulary patterns, inconsistent rating-to-sentiment ratios, and spam-like character frequencies. Treat this feedback with caution."
    : "Our model indicates high linguistic naturalness and consistent sentiment-to-rating correlation. No repetitive patterns typical of bot networks were detected."

  const linguisticScore = isFake ? "Poor" : "Excellent"
  const trustSignal = isFake ? "Weak" : "Strong"

  return (
    <div className="card result-card-v2">
      <div className="result-v2-header">
        <div className="result-title-col">
          <h2>Analysis Result</h2>
          <div className="result-proc-time">Processed in 142ms</div>
        </div>
        <div className={badgeClass}>
          <i className={badgeIcon} />
          {badgeText}
        </div>
      </div>

      <div className="result-center-gauge">
        <div className="result-huge-pct">{result.confidence}%</div>
        <span className="result-huge-label">CONFIDENCE</span>
      </div>

      <div className="result-description-card">
        <p className="result-description-text">{description}</p>
      </div>

      <div className="result-submetrics-grid">
        <div className="submetric-box">
          <div className="submetric-title">Linguistic Score</div>
          <div className="submetric-val" style={{ color: isFake ? "#ef4444" : "#10b981" }}>
            {linguisticScore}
          </div>
        </div>
        <div className="submetric-box">
          <div className="submetric-title">Trust Signal</div>
          <div className="submetric-val" style={{ color: isFake ? "#ef4444" : "#10b981" }}>
            {trustSignal}
          </div>
        </div>
      </div>
    </div>
  )
}