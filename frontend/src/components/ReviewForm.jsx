import { useState } from "react"
import axios from "axios"

export default function ReviewForm({ setResult, setLoading }) {
  const [text, setText] = useState("")
  const [score, setScore] = useState(5)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await axios.post("http://localhost:8000/predict", { text, score: parseInt(score) })
      setResult(res.data)
    } catch { alert("Backend running chhe?") }
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="card-label">Analyze a review</div>
      <div className="form-group">
        <label>Review text</label>
        <textarea
          placeholder="Paste any Amazon, Flipkart, or product review here..."
          value={text} onChange={e => setText(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Star rating</label>
        <div className="star-row">
          <span className="star-display">{"⭐".repeat(score)}</span>
          <input type="range" min={1} max={5} step={1} value={score}
            onChange={e => setScore(e.target.value)}/>
        </div>
        <div className="star-labels"><span>1★</span><span>2★</span><span>3★</span><span>4★</span><span>5★</span></div>
      </div>
      <button className="analyze-btn" onClick={handleSubmit} disabled={!text.trim()}>
        Analyze Review →
      </button>
    </div>
  )
}