const isLocalhost = Boolean(
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]")
)

const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:8000" : "https://fake-review-detector-0m6b.onrender.com")

export default API_URL