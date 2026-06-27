import { useEffect, useState } from "react"
import axios from "axios"
import API_URL from "../config"

function Stats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    axios.get(`${API_URL}/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
  }, [])

  if (!stats) return (
    <div className="card">
      <p style={{color:'var(--text-secondary)'}}>Loading stats...</p>
    </div>
  )

  return (
    <div className="card">
      <div className="form-card-header">
        <i className="ti ti-chart-bar" />
        <h2>Analytics Dashboard</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-box total-stat">
          <div className="stat-number">{stats.total_analyzed}</div>
          <div className="stat-label">Total Analyzed</div>
        </div>
        <div className="stat-box fake-stat">
          <div className="stat-number">{stats.fake_detected}</div>
          <div className="stat-label">Fake Detected</div>
        </div>
        <div className="stat-box genuine-stat">
          <div className="stat-number">{stats.genuine_detected}</div>
          <div className="stat-label">Genuine Reviews</div>
        </div>
        <div className="stat-box conf-stat">
          <div className="stat-number">{stats.fake_percentage}%</div>
          <div className="stat-label">Fake Percentage</div>
        </div>
      </div>
      <div className="avg-conf">
        Average Model Confidence: <strong>{stats.avg_confidence}%</strong>
      </div>
    </div>
  )
}

export default Stats