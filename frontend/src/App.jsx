import { useState, useEffect, Suspense, lazy } from "react"
import "./App.css"
import API_URL from "./config"

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("detector")
  const [theme, setTheme] = useState("light")
  const [timeline, setTimeline] = useState("7d")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light")

  const tabs = [
    { id: "detector", label: "Detector" },
    { id: "ai_detector", label: "AI Detector" },
    { id: "bulk", label: "Bulk CSV" },
    { id: "history", label: "History" },
    { id: "stats", label: "Stats" },
  ]

  const getTimelineStats = () => {
    switch (timeline) {
      case "1d":
        return {
          audited: "84.2K+",
          accuracy: "93.8%",
          growth: "+2.1%",
          descAudited: "Total reviews scanned today.",
          descAccuracy: "Active pattern detection precision.",
          descGrowth: "Change in spam volume today."
        }
      case "30d":
        return {
          audited: "2.4M+",
          accuracy: "94.5%",
          growth: "-4.8%",
          descAudited: "Total reviews scanned past month.",
          descAccuracy: "Linguistic match precision.",
          descGrowth: "Total change in spam volume."
        }
      case "7d":
      default:
        return {
          audited: "568K+",
          accuracy: "94.2%",
          growth: "+12.4%",
          descAudited: "Total reviews scanned this week.",
          descAccuracy: "Verified model confidence index.",
          descGrowth: "Weekly shift in AI-generated spam."
        }
    }
  }

  const currentStats = getTimelineStats()

  const tabImports = {
    detector: lazy(() => import("./components/ReviewForm")),
    ai_detector: lazy(() => import("./components/AiDetector")),
    bulk: lazy(() => import("./components/ReviewForm")), // Reuse or create BulkUpload
    history: lazy(() => import("./components/History")),
    stats: lazy(() => import("./components/Stats")),
  }

  const TabContent = ({ tabId }) => {
    const Loader = () => <div className="skeleton-loader" />
    return (
      <Suspense fallback={<Loader />}>
        {tabId === "detector" && <ReviewForm setResult={setResult} setLoading={setLoading} />}
        {tabId === "ai_detector" && <AiDetector />}
        {tabId === "bulk" && <CsvUpload />}
        {tabId === "history" && <History />}
        {tabId === "stats" && <Stats />}
      </Suspense>
    )
  }

<Suspense fallback={<div className="skeleton-loader" />}>
  {activeTab === "detector" && (
    <ReviewForm setResult={setResult} setLoading={setLoading} />
  )}
  {activeTab === "ai_detector" && <AiDetector />}
  {activeTab === "bulk" && (
    <div style={{ maxWidth: "680px", margin: "0 auto", paddingTop: "2rem" }}>
      <div className="page-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>Bulk CSV Analyzer</h2>
        <p>Upload a file containing multiple reviews to analyze them all in one go and download a detailed CSV report.</p>
      </div>
      <CsvUpload />
    </div>
  )}
  {activeTab === "history" && (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "2rem" }}>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h2>Analysis History</h2>
        <p>Review the history of all texts analyzed by the system in this session.</p>
      </div>
      <History />
    </div>
  )}
  {activeTab === "stats" && (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "2rem" }}>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h2>Analytics & Performance</h2>
        <p>Real-time statistics of predictions, model correctness, and prediction distributions.</p>
      </div>
      <Stats />
    </div>
  )}
</Suspense>

function CsvUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setDone(false) }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setDone(false) }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true); setDone(false)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${API_URL}/predict/bulk`, {
        method: "POST",
        body: formData
      })

      const blob = await res.blob()
      const text = await blob.text()
      const lines = text.trim().split("\n").length - 1
      setCount(lines)

      // Auto download
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "review_results.csv"
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch {
      alert("Error occurred. Is the backend server running?")
    }
    setLoading(false)
  }

  return (
    <div className="card bulk-upload-card">
      <div
        className="csv-drop"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {!file ? (
          <>
            <div className="csv-drop-icon">
              <i className="ti ti-cloud-upload" />
            </div>
            <div className="csv-drop-title">Bulk CSV Upload</div>
            <div className="csv-drop-sub">
              Drag and drop your spreadsheet to analyze thousands of reviews at once.
            </div>
            <label className="csv-btn-wrapper">
              <span className="csv-btn">Browse Files</span>
              <input type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </>
        ) : (
          <>
            <div className="csv-drop-icon success">
              <i className="ti ti-file-check" />
            </div>
            <div className="csv-drop-title">{file.name}</div>
            <div className="csv-drop-sub">
              {(file.size / 1024).toFixed(1)} KB · Ready to analyze
            </div>
            {done ? (
              <div className="csv-complete-section">
                <div className="csv-status-msg">
                  <i className="ti ti-circle-check" /> {count} reviews analyzed!
                </div>
                <div className="csv-download-info">
                  results.csv has been downloaded to your device.
                </div>
                <button className="csv-btn reset" onClick={() => { setFile(null); setDone(false) }}>
                  Upload Another File
                </button>
              </div>
            ) : (
              <div className="csv-actions-section">
                <button className="csv-btn-primary" onClick={handleAnalyze} disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze All Reviews →"}
                </button>
                <button className="csv-btn-secondary" onClick={() => setFile(null)}>
                  Remove File
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="csv-info-footer">
        <div className="csv-info-title">Required CSV Format</div>
        <div className="csv-info-code">
          <code>
            review_text, score<br />
            "Good product...", 4<br />
            "AMAZING!!!", 5
          </code>
        </div>
      </div>
    </div>
  )
}

function RecentHistory({ setActiveTab }) {
  const [items, setItems] = useState([])
  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then(r => r.json()).then(d => setItems(d.slice(0, 3)))
      .catch(() => { })
  }, [])

  const defaultItems = [
    {
      id: "seed-1",
      text: "The product exceeded expectations. Build quality is premium and battery life lasts all day.",
      label: "Genuine",
      confidence: 92,
      source: "Amazon",
      time: "2 minutes ago"
    },
    {
      id: "seed-2",
      text: "Best item ever buy now click link http://scam.site/promo for discount fast shipping code...",
      label: "Fake",
      confidence: 88,
      source: "Yelp",
      time: "15 minutes ago"
    },
    {
      id: "seed-3",
      text: "Shipping was a bit slow but the quality is top-notch. Satisfied with my purchase overall.",
      label: "Genuine",
      confidence: 95,
      source: "Google",
      time: "1 hour ago"
    }
  ]

  const itemsToRender = items.length > 0 ? items.map((item, idx) => ({
    ...item,
    source: idx % 3 === 0 ? "Amazon" : idx % 3 === 1 ? "Yelp" : "Google",
    time: idx === 0 ? "Just now" : idx === 1 ? "10 minutes ago" : "2 hours ago"
  })) : defaultItems

  return (
    <div className="card recent-history-card">
      <div className="history-card-header">
        <h2>Recent History</h2>
        <button className="view-all-link" onClick={() => setActiveTab("history")}>View All</button>
      </div>
      <div className="history-list">
        {itemsToRender.map(item => {
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
                <p className="history-item-text">"{item.text.length > 55 ? item.text.substring(0, 55) + '...' : item.text}"</p>
                <span className="history-item-subtext">{item.source} • {item.time}</span>
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
    </div>
  )
}