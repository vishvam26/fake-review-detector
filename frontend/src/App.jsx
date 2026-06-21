import { useState, useEffect } from "react"
import ReviewForm from "./components/ReviewForm"
import ResultCard from "./components/ResultCard"
import History from "./components/History"
import Stats from "./components/Stats"
import "./App.css"
import API_URL from "../config"


export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("detector")
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light")

  const tabs = [
    { id: "detector", icon: "ti-shield-search", label: "Detector" },
    { id: "bulk", icon: "ti-file-upload", label: "Bulk CSV" },
    { id: "history", icon: "ti-history", label: "History" },
    { id: "stats", icon: "ti-chart-bar", label: "Stats" },
  ]

  return (
    <div className="app">
      <div className="orb-wrap">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <i className="ti ti-shield-check" aria-hidden="true" />
            </div>
            <div>
              <h1>ReviewGuard</h1>
              <p>AI-powered authenticity detection</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-badge">ML POWERED</div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light"
                ? <span style={{ fontSize: "18px" }}>🌙</span>
                : <span style={{ fontSize: "18px" }}>☀️</span>
              }
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-tabs-wrap">
          {tabs.map(t => (
            <button key={t.id}
              className={activeTab === t.id ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveTab(t.id)}>
              <i className={`ti ${t.icon}`} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main">
        {activeTab === "detector" && (
          <>
            <div className="hero">
              <div className="hero-tag">
                <div className="hero-dot" />
                AI-powered review analysis
              </div>
              <h2>Detect <span>Fake Reviews</span><br />Instantly</h2>
              <p>Paste any product review or upload a CSV to instantly know if it's genuine or suspicious.</p>
              <div className="hero-stats">
                <div className="stat-pill"><span className="stat-pill-num">568K+</span><span className="stat-pill-label">Reviews trained</span></div>
                <div className="stat-pill"><span className="stat-pill-num">85%</span><span className="stat-pill-label">Accuracy</span></div>
                <div className="stat-pill"><span className="stat-pill-num">XGBoost</span><span className="stat-pill-label">ML model</span></div>
              </div>
            </div>

            <div className="detector-grid">
              <div className="left-col">
                <ReviewForm setResult={setResult} setLoading={setLoading} />
                <CsvUpload />
              </div>
              <div className="right-col">
                {loading && (
                  <div className="card loading-wrap">
                    <div className="spinner" />
                    <p>Analyzing with AI...</p>
                  </div>
                )}
                {result && !loading && <ResultCard result={result} />}
                {!result && !loading && <RecentHistory />}
              </div>
            </div>
          </>
        )}
        {activeTab === "bulk" && (
          <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "1rem" }}>
            <div className="page-header">
              <h2>Bulk CSV Analyzer</h2>
              <p>100+ reviews ek saath analyze karo — results CSV ma download karo</p>
            </div>
            <CsvUpload />
          </div>
        )}
        {activeTab === "history" && <History />}
        {activeTab === "stats" && <Stats />}
      </main>
    </div>
  )
}

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
      alert("Backend running chhe?")
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="card-label">Bulk analyzer</div>

      <div
        className="csv-drop"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {!file ? (
          <>
            <div className="csv-drop-icon">
              <i className="ti ti-file-upload" aria-hidden="true" />
            </div>
            <div className="csv-drop-title">Drop your CSV file here</div>
            <div className="csv-drop-sub">
              CSV ma <strong>review_text</strong> ane <strong>score</strong> columns joie
            </div>
            <label className="csv-btn" style={{ cursor: "pointer" }}>
              Browse file
              <input type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </>
        ) : (
          <>
            <div className="csv-drop-icon" style={{ color: "var(--accent)" }}>
              <i className="ti ti-file-check" aria-hidden="true" />
            </div>
            <div className="csv-drop-title">{file.name}</div>
            <div className="csv-drop-sub">
              {(file.size / 1024).toFixed(1)} KB · Ready to analyze
            </div>
            {done ? (
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "0.85rem", color: "#059669", fontWeight: "700" }}>
                  ✅ {count} reviews analyzed!
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-label)" }}>
                  results.csv download thayu
                </div>
                <button className="csv-btn" onClick={() => { setFile(null); setDone(false) }}>
                  New file upload karo
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button className="csv-btn" onClick={handleAnalyze} disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze all reviews →"}
                </button>
                <button className="csv-btn" onClick={() => setFile(null)}
                  style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", borderColor: "rgba(239,68,68,0.2)" }}>
                  Remove
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: "12px", padding: "10px 12px", background: "var(--csv-bg)", borderRadius: "10px", border: "0.5px solid var(--csv-border)" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
          CSV format
        </div>
        <code style={{ fontSize: "0.78rem", color: "var(--accent)", fontFamily: "monospace" }}>
          review_text, score<br />
          "Good product...", 4<br />
          "AMAZING!!!", 5
        </code>
      </div>
    </div>
  )
}

function RecentHistory() {
  const [items, setItems] = useState([])
  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then(r => r.json()).then(d => setItems(d.slice(0, 4)))
      .catch(() => { })
  }, [])
  if (!items.length) return null
  return (
    <div className="card">
      <div className="card-label">Recent analyses</div>
      <div className="history-list">
        {items.map(item => (
          <div key={item.id} className={`history-item ${item.label === "Fake" ? "fake-item" : "genuine-item"}`}>
            <div className="history-top">
              <span className={`badge ${item.label === "Fake" ? "badge-fake" : "badge-genuine"}`}>{item.label}</span>
              <span className="history-conf">{item.confidence}%</span>
              <span className="history-date">{item.created_at}</span>
            </div>
            <div className="history-text">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}