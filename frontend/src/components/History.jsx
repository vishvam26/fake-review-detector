import { useEffect, useState } from "react"
import axios from "axios"
import API_URL from "../config"

function History() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/history`)
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="card">
      <div className="url-reviews-header">
        <h2>Past Analysis Results</h2>
      </div>
      {history.length === 0 ? (
        <p className="empty">No analysis history yet. Go to the Detector tab to evaluate a review.</p>
      ) : (
        <div className="history-list">
          {history.map(item => {
            const isFake = item.label === "Fake"
            return (
              <div key={item.id} className={`history-item-row ${isFake ? "fake" : "genuine"}`}>
                <div className="history-item-icon-col">
                  {isFake ? (
                    <span className="history-icon-wrapper bot">
                      <i className="ti ti-alert-triangle" />
                    </span>
                  ) : (
                    <span className="history-icon-wrapper real">
                      <i className="ti ti-circle-check" />
                    </span>
                  )}
                </div>
                <div className="history-item-content-col">
                  <p className="history-item-text">"{item.text}"</p>
                  <span className="history-item-subtext">
                    Rating: {item.score}★ · Analyzed on {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="history-item-score-col">
                  <span className={`history-score-val ${isFake ? "bot" : "real"}`}>
                    {item.confidence}% {isFake ? "Bot" : "Real"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default History