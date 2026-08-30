import { useEffect, useState } from "react"
import { ShieldCheck, AlertTriangle, History as HistoryIcon, Clock, ArrowUpRight } from "lucide-react"
import axios from "axios"
import API_URL from "../config"

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/history`)
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="history-tab-content">
      <div className="neural-radar-card" style={{ padding: "2rem" }}>
        <div className="radar-card-header">
          <div className="radar-status-group">
            <div className="live-radar-ping">
              <span className="ping-wave" />
              <span className="ping-center" />
            </div>
            <div>
              <div className="radar-tag">DATABASE LOGS</div>
              <h3>Stored Audit Records ({history.length})</h3>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "rgba(255,255,255,0.6)" }}>
            <div className="loading-spinner-circle" style={{ margin: "0 auto 1rem" }} />
            <p>Fetching session audit logs...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "rgba(255,255,255,0.6)" }}>
            <HistoryIcon size={32} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p>No analysis history yet. Go to the Detector tab to evaluate your first review.</p>
          </div>
        ) : (
          <div className="history-list-feed" style={{ gap: "0.85rem" }}>
            {history.map((item) => {
              const isFake = item.label === "Fake"
              return (
                <div key={item.id} className={`radar-item-row ${isFake ? "fake" : "genuine"}`} style={{ padding: "1rem 1.25rem" }}>
                  <div className="radar-item-icon-col">
                    {isFake ? (
                      <span className="radar-icon fake">
                        <AlertTriangle size={18} />
                      </span>
                    ) : (
                      <span className="radar-icon genuine">
                        <ShieldCheck size={18} />
                      </span>
                    )}
                  </div>

                  <div className="radar-item-content">
                    <p className="radar-item-text" style={{ fontSize: "0.92rem", marginBottom: "0.35rem" }}>"{item.text}"</p>
                    <div className="radar-item-meta" style={{ gap: "0.75rem" }}>
                      <span className="platform-tag">Rating: {item.score}★</span>
                      <span>•</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={11} /> {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="radar-item-badge">
                    <span className={`confidence-chip ${isFake ? "fake" : "genuine"}`} style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}>
                      {item.confidence}% {isFake ? "Deceptive" : "Genuine"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}