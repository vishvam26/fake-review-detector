/**
 * Nexum Hero — dark cinematic AI-ops landing hero
 * Full-screen video background, glassmorphism, bottom-anchored content,
 * mobile hamburger menu with slide-in drawer, animations.
 * 
 * Stack: React + Tailwind + lucide-react
 * No routing. One section only.
 * 
 * Fonts: Geist (body), Silkscreen (stat "42,500+")
 * Google Fonts: loaded in <head> via frontend/index.html
 */

import { useState, useEffect } from "react"
import { ChevronDown, Menu, X } from "lucide-react"

export default function NexumHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Mobile menu transition states
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const [drawerTranslate, setDrawerTranslate] = useState("translate-x-full")
  const [bottomCTAOpacity, setBottomCTAOpacity] = useState(1)
  const [bottomCTATranslate, setBottomCTATranslate] = useState(0)

  useEffect(() => {
    if (mobileMenuOpen) {
      setOverlayOpacity(1)
      setDrawerTranslate("translate-x-0")
      setBottomCTAOpacity(0)
      setBottomCTATranslate(16)
      document.body.style.overflow = "hidden"
    } else {
      setOverlayOpacity(0)
      setDrawerTranslate("translate-x-full")
      setBottomCTAOpacity(1)
      setBottomCTATranslate(0)
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Staggered entrance for mobile links when opening
  useEffect(() => {
    if (!mobileMenuOpen) return
    const links = document.querySelectorAll(".mobile-nav-link")
    links.forEach((link, idx) => {
      setTimeout(() => {
        link.style.opacity = "1"
        link.style.transform = "translateX(0)"
      }, 300 + (idx + 1) * 60)
    })
  }, [mobileMenuOpen])

  // Animate bottom CTA when menu opens/closes
  useEffect(() => {
    if (!mobileMenuOpen) {
      setBottomCTAOpacity(1)
      setBottomCTATranslate(0)
    } else {
      setBottomCTAOpacity(0)
      setBottomCTATranslate(16)
    }
  }, [mobileMenuOpen])

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-black text-gray-900 antialiased"
      style={{
        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ============ BACKGROUND VIDEO ============ */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"
      />

      {/* ============ MOBILE HAMBURGER BUTTON ============ */}
      <button
        className="fixed top-6 left-6 z-50 h-10 w-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X
            className="w-6 h-6 text-gray-900 lg:text-white transform transition-all duration-300 rotate-90 scale-0 opacity-0"
          />
        ) : (
          <Menu
            className="w-6 h-6 text-gray-900 lg:text-white transition-all duration-300"
          />
        )}
      </button>

      {/* ============ DESKTOP NAVIGATION (hidden md:flex) ============ */}
      <nav className="hidden md:flex md:items-center md:justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <div className="flex items-center gap-2">
          {/* Logo: SVG + "nexum" wordmark -->
           Font: Geist, weight 400 (Regular) for wordmark */}
          <svg
            className="w-6 h-6 text-gray-900 fill-current"
            viewBox="0 0 256 256"
            data-testid="nexum-logo"
          >
            <path
              d="M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z"
            />
          </svg>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-gray-900 lg:text-white">
              nexum
            </span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#"
             className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors">
            Modules
          </a>
          <a href="#"
             className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors">
            Clientele
          </a>
          <a href="#"
             className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors">
            Solutions
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </a>
          <a href="#"
             className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors">
            Billing
          </a>
        </div>

        {/* "Get started" pill on desktop */}
        <button
          className="rounded-full px-5 text-sm font-medium text-white"
          style={{
            background: "linear-gradient(to bottom, #2B2B2B, #101010)",
          }}
          onMouseOver={e => {
            e.target.style.opacity = "0.9"
            e.target.style.transition = "opacity 0.2s"
          }}
          onMouseOut={e => {
            e.target.style.opacity = "1"
            e.target.style.transition = "opacity 0.2s"
          }}
        >
          Get started
        </button>
      </nav>

      {/* ============ MOBILE OVERLAY ============ */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md ${overlayOpacity === 1 ? "opacity-100" : "opacity-0"} transition-opacity duration-300 pointer-events-${mobileMenuOpen ? "auto" : "none"}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ============ MOBILE DRAWER PANEL ============ */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-72 bg-black/90 backdrop-blur-xl ${drawerTranslate} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      >
        <ul className="px-6 pt-24 gap-2">
          <li>
            <a href="#"
               className="rounded-xl px-4 py-3.5 text-base font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Modules
            </a>
          </li>
          <li>
            <a href="#"
               className="rounded-xl px-4 py-3.5 text-base font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Clientele
            </a>
          </li>
          <li>
            <a href="#"
               className="rounded-xl px-4 py-3.5 text-base font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Solutions
              <ChevronDown className="w-4 h-4 ml-2" />
            </a>
          </li>
          <li>
            <a href="#"
               className="rounded-xl px-4 py-3.5 text-base font-medium text-gray-800/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Billing
            </a>
          </li>
        </ul>
      </div>

      {/* ============ MAIN CONTENT (bottom-anchored) ============ */}
      <div className="relative z-10 flex-col h-full pt-20">

        {/* Desktop nav on md+ */}
        <nav className="md:block md:pt-4 md:pb-2">
          <div className="px-5 sm:px-8 sm:py-6 lg:px-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-gray-900 fill-current"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z"
                  />
                </svg>
                <span className="text-lg font-semibold tracking-tight">
                  <span className="text-gray-900 lg:text-white">nexum</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* "Get started" pill - desktop */}
                <button
                  className="rounded-full px-5 text-sm font-medium text-white"
                  style={{
                    background: "linear-gradient(to bottom, #2B2B2B, #101010)",
                  }}
                  onMouseOver={e => {
                    e.target.style.opacity = "0.9"
                    e.target.style.transition = "opacity 0.2s"
                  }}
                  onMouseOut={e => {
                    e.target.style.opacity = "1"
                    e.target.style.transition = "opacity 0.2s"
                  }}
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* ============ HERO CONTENT ============ */}
        <div className="relative max-w-xl mx-auto mt-auto" style={{ fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif" }}>

          {/* Headline + Email CTA row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:items-center sm:gap-6 mb-6 sm:mb-8">

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight">
              <span className="text-gray-900 lg:text-white">
                Ship AI workers that grind while you rest
              </span>
            </h1>

            {/* Email CTA */}
            <div className="relative">
              {/* White pill container on sm+ */}
              <div
                className={`inline-flex flex-col sm:flex-row items-center rounded-full bg-white p-1.5 sm:w-64 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-2`}
                style={{ transition: 'all 0.3s ease' }}
              >
                {/* Email input */}
                <input
                  type="email"
                  placeholder="Type your email"
                  className={`w-full bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-full focus:outline-none transition-colors sm:pr-8 sm:text-sm`}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* "Get started" button - gradient pill */}
                <button
                  className="rounded-full px-6 py-3 sm:py-2.5 text-sm font-medium text-white"
                  style={{
                    background: "linear-gradient(to bottom, #2B2B2B, #101010)",
                  }}
                  onMouseOver={e => {
                    e.target.style.opacity = "0.9"
                    e.target.style.transition = "opacity 0.2s"
                  }}
                  onMouseOut={e => {
                    e.target.style.opacity = "1"
                    e.target.style.transition = "opacity 0.2s"
                  }}
                >
                  Get started
                </button>
              </div>
            </div>
          </div>

          {/* Glass cards row - two cards side by side */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-4">

            {/* Stats card (sm:w-64) */}
            <div
              className={`sm:w-64 flex-col justify-between rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6`}
            >
{/* Big number in Silkscreen */}
              <p className="text-3xl sm:text-4xl font-normal tracking-tight text-gray-900 lg:text-white" style={{ fontFamily: "'Silkscreen', cursive" }}>
                42,500+
              </p>
              {/* Body text */}
              <p className="text-sm leading-relaxed mt-3 sm:mt-4 text-gray-800/70 lg:text-white/70">
                Teams run Nexum to handle recurring ops daily.
              </p>
            </div>

            {/* Testimonial card (sm:w-64) */}
            <div className="sm:w-64 rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 flex flex-col gap-4">
              {/* Header row: 6x6 black rounded square with bold white "S" + "Stratify" */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                {/* 6x6 black rounded square */}
                <div
                  className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 lg:text-white">
                  Stratify
                </span>
              </div>

              /* Quote */
              <p className="text-sm leading-relaxed text-gray-800/80 lg:text-white/80">
                "With Nexum we went from managing tedious operational work to having AI agents that handle everything."
              </p>

              /* Footer: avatar + name */
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/72?img=12"
                  alt="Sara Klein"
                  className="w-9 h-9 rounded-full object-cover bg-white/20"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 lg:text-white">Sara Klein</span>
                  <span className="text-xs text-gray-800/60 lg:text-white/60">
                    Dir of Operations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ MAIN CONTENT BLOCK PADDING ============ */}
        <div className="px-5 pb-8 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16">
          {/* Inner vertical gap already applied via gap-6 sm:gap-8 in card layout */}
        </div>
      </div>
    </section>
  )
}