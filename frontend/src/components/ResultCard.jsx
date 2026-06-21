export default function ResultCard({ result }) {
  const isFake = result.label === "Fake"
  const r = 56
  const circ = 2 * Math.PI * r
  const offset = circ - (result.confidence / 100) * circ

  return (
    <div className={`card result-card ${isFake ? "fake" : "genuine"}`}>
      <span className="result-icon">{isFake ? "🚨" : "✅"}</span>
      <div className="result-label">{result.label} Review</div>
      <div className="result-sublabel">{isFake ? "Suspicious content detected" : "Authentic review"}</div>
      <div className="gauge-wrap">
        <svg className="gauge-svg" viewBox="0 0 130 130">
          <defs>
            <linearGradient id="fakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171"/>
              <stop offset="100%" stopColor="#fb923c"/>
            </linearGradient>
            <linearGradient id="genuineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399"/>
              <stop offset="100%" stopColor="#60a5fa"/>
            </linearGradient>
          </defs>
          <circle className="gauge-bg" cx="65" cy="65" r={r}/>
          <circle className="gauge-fill" cx="65" cy="65" r={r}
            strokeDasharray={circ} strokeDashoffset={offset}/>
          <text className="gauge-num" x="65" y="61">{result.confidence}%</text>
          <text className="gauge-sub-text" x="65" y="77">CONFIDENCE</text>
        </svg>
      </div>
      <p className="result-desc">
        {isFake
          ? "Our AI detected patterns commonly found in fake or incentivized reviews. Treat with caution."
          : "Authentic language patterns detected. This appears to be a genuine customer experience."}
      </p>
    </div>
  )
}