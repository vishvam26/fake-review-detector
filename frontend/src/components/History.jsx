import { useEffect, useState } from "react"
import axios from "axios"

function History() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    axios.get("http://localhost:8000/history").then(res => setHistory(res.data))
  }, [])

  return (
    <div className="card">
      <h2>Recent Analyses</h2>
      {history.length === 0 && <p className="empty">No history yet — analyze a review first!</p>}
      <div className="history-list">
        {history.map(item => (
          <div key={item.id} className={`history-item ${item.label === "Fake" ? "fake-item" : "genuine-item"}`}>
            <div className="history-top">
              <span className={`badge ${item.label === "Fake" ? "badge-fake" : "badge-genuine"}`}>
                {item.label}
              </span>
              <span className="history-conf">{item.confidence}% confidence</span>
              <span className="history-date">{item.created_at}</span>
            </div>
            <p className="history-text">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default History