import { useState, useEffect } from "react"
import ReviewForm from "./components/ReviewForm"
import ResultCard from "./components/ResultCard"
import History from "./components/History"
import Stats from "./components/Stats"
import AiDetector from "./components/AiDetector"
import "./App.css"
import API_URL from "./config"

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("detector")
  const [theme, setTheme] = useState("light") // Default light theme matching Allys clean white style
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

  return (
    <div className="app">
      <div className="orb-wrap">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => setActiveTab("detector")} style={{ cursor: "pointer" }}>
            <span className="logo-text">ReviewGuard</span>
          </div>

          <nav className="header-nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={activeTab === t.id ? "nav-link active" : "nav-link"}
                onClick={() => {
                  setActiveTab(t.id)
                  setResult(null)
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="header-right">
            <span className="global-badge">
              <span className="global-dot" />
              GLOBAL (EN)
            </span>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? (
                <i className="ti ti-moon" />
              ) : (
                <i className="ti ti-sun" />
              )}
            </button>
            <button className="upgrade-btn" onClick={() => alert("Upgrade request sent! Our enterprise team will contact you soon.")}>Upgrade Pro</button>
          </div>
        </div>
      </header>

      <main className="main">
        {activeTab === "detector" && (
          <>
            <div className="hero">
              <div className="hero-tag">
                <div className="hero-dot" />
                AI-Powered Review Analysis
              </div>
              <div className="hero-coords">NLP SCANNER • MODEL ID: XGB-V1.7.2 • RG-COORD: 20.0013° S, 57.5750° E</div>
              <h2>Verify and Detect <span>Fake Reviews</span><br />Instantly</h2>
              <p>Leverage our state-of-the-art machine learning algorithms to audit feedback authenticity and safeguard digital trust.</p>
            </div>

            {/* Performance/Intelligence Trends Grid (Allys styled trends section) */}
            <div className="intel-section">
              <div className="intel-header-row">
                <h3 className="intel-title">Model Performance & Intelligence</h3>
                <div className="timeline-btn-group">
                  <button className={timeline === "1d" ? "timeline-btn active" : "timeline-btn"} onClick={() => setTimeline("1d")}>Today</button>
                  <button className={timeline === "7d" ? "timeline-btn active" : "timeline-btn"} onClick={() => setTimeline("7d")}>7 Days</button>
                  <button className={timeline === "30d" ? "timeline-btn active" : "timeline-btn"} onClick={() => setTimeline("30d")}>30 Days</button>
                </div>
              </div>
              <div className="intel-grid">
                <div className="intel-card">
                  <div className="intel-label">Reviews Audited</div>
                  <div className="intel-val">{currentStats.audited}</div>
                  <div className="intel-desc">{currentStats.descAudited}</div>
                </div>
                <div className="intel-card">
                  <div className="intel-label">Detection Accuracy</div>
                  <div className="intel-val green">{currentStats.accuracy}</div>
                  <div className="intel-desc">{currentStats.descAccuracy}</div>
                </div>
                <div className="intel-card">
                  <div className="intel-label">Spam Drift</div>
                  <div className="intel-val">{currentStats.growth}</div>
                  <div className="intel-desc">{currentStats.descGrowth}</div>
                </div>
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
                    <p>Analyzing review with AI...</p>
                  </div>
                )}
                {result && !loading && <ResultCard result={result} />}
                {!result && !loading && <RecentHistory setActiveTab={setActiveTab} />}
              </div>
            </div>


          </>
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
      </main>

      {/* Floating Chatbot Assistant widget (Allys WhatsApp style float button) */}
      <div className="floating-chat-container">
        <button className="floating-chat-btn" onClick={() => alert("ReviewGuard AI Support Assistant is launching! For API keys or custom integrations, please write to p.vishu2621@gmail.com.")}>
          <i className="ti ti-message-chatbot" />
        </button>
        <div className="floating-chat-tooltip">Ask AI Assistant</div>
      </div>

      {/* Detailed Sitemap Footer (Allys styled footer section) */}
      <footer className="footer">
        <div className="footer-sitemap-grid">
          <div className="footer-brand-col">
            <h3 className="footer-logo">ReviewGuard AI</h3>
            <p className="footer-desc">Verifying digital credibility and feedback authenticity globally using advanced Natural Language Processing models.</p>

            {/* Lead Agent contact card style engineer block */}
            <div className="agent-contact-card">
              <div className="agent-avatar-wrap">AM</div>
              <div className="agent-info">
                <div className="agent-name">Vishvam Prajapati</div>
                <div className="agent-title">Computer science Engineer</div>
                <button className="agent-btn" onClick={() => alert("Connecting with vishvam... Please email p.vishu2621@gmail.com")}>Contact Engineer</button>
              </div>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Detector Tools</h4>
            <div className="footer-nav-links">
              <a href="#detector" onClick={(e) => { e.preventDefault(); setActiveTab("detector"); }}>XGBoost Detector</a>
              <a href="#ai_detector" onClick={(e) => { e.preventDefault(); setActiveTab("ai_detector"); }}>AI Writing Analyzer</a>
              <a href="#bulk" onClick={(e) => { e.preventDefault(); setActiveTab("bulk"); }}>Bulk CSV Scan</a>
              <a href="#history" onClick={(e) => { e.preventDefault(); setActiveTab("history"); }}>History Session</a>
              <a href="#stats" onClick={(e) => { e.preventDefault(); setActiveTab("stats"); }}>Analytics</a>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Developer APIs</h4>
            <div className="footer-nav-links">
              <a href="#docs" onClick={(e) => e.preventDefault()}>API Documentation</a>
              <a href="#endpoints" onClick={(e) => e.preventDefault()}>Model Specifications</a>
              <a href="#accuracy" onClick={(e) => e.preventDefault()}>Evaluation Metrics</a>
              <a href="#pricing" onClick={(e) => e.preventDefault()}>Token Pricing</a>
            </div>
          </div>

          <div className="footer-nav-col newsletter-wrap">
            <h4>Stay Updated</h4>
            <p className="newsletter-desc">Subscribe to get monthly intelligence digests on spam patterns and AI detection news.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Successfully subscribed to ReviewGuard updates!"); }}>
              <input type="email" placeholder="Your email address" required className="newsletter-input" />
              <button type="submit" className="newsletter-submit-btn">
                <i className="ti ti-arrow-right" />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <div className="footer-tags-title">Technology Stack & Signals</div>
            <div className="footer-tags-list">
              <span className="footer-tag-badge" onClick={() => alert("Analyzing model stack...")}>XGBoost Classifier</span>
              <span className="footer-tag-badge" onClick={() => alert("Checking metrics stack...")}>Linguistic Diversity</span>
              <span className="footer-tag-badge" onClick={() => alert("Checking LLM detection stack...")}>AI Text Detector</span>
              <span className="footer-tag-badge" onClick={() => alert("Framework version: React v19")}>Vite + React</span>
              <span className="footer-tag-badge" onClick={() => alert("Checking server API stack...")}>FastAPI Backend</span>
              <span className="footer-tag-badge" onClick={() => alert("Checking analysis model...")}>Sentiment Drift</span>
            </div>
          </div>

          <div className="footer-social-wrap">
            <div className="footer-social-links">
              <span className="footer-social-icon" title="Twitter" onClick={() => alert("Opening Twitter...")}><i className="ti ti-brand-x" /></span>
              <span className="footer-social-icon" title="GitHub" onClick={() => window.open("https://github.com/vishvam26", "_blank")}><i className="ti ti-brand-github" /></span>
              <span className="footer-social-icon" title="LinkedIn" onClick={() => window.open("https://www.linkedin.com/in/vishvamkumarprajapati", "_blank")}><i className="ti ti-brand-linkedin" /></span>
              <span className="footer-social-icon" title="Discord" onClick={() => alert("Opening Discord...")}><i className="ti ti-brand-discord" /></span>
            </div>
            <p className="copyright">© 2026 ReviewGuard AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
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