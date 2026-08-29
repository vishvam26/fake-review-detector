import { useState, useEffect } from "react"
import { ChevronDown, Menu, X } from "lucide-react"

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"

const LOGO_PATH =
  "M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z"

const NAV_LINKS = [
  { id: "modules", label: "Modules" },
  { id: "clientele", label: "Clientele" },
  { id: "solutions", label: "Solutions", hasChevron: true },
  { id: "billing", label: "Billing" },
]

const CTA_GRADIENT = { background: "linear-gradient(to bottom, #2B2B2B, #101010)" }

export default function NexumHero() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-black antialiased"
      style={{ fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ============ BACKGROUND VIDEO ============ */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_URL}
      />

      {/* ============ MOBILE HAMBURGER ============ */}
      <button
        type="button"
        onClick={() => setMenuOpen(v => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className="md:hidden fixed top-5 left-5 z-50 h-10 w-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center"
      >
        {menuOpen ? (
          <X
            className="h-6 w-6 text-[#010101] lg:text-white transition-all duration-300 -rotate-90 scale-0 opacity-0"
          />
        ) : (
          <Menu
            className="h-6 w-6 text-[#010101] lg:text-white transition-all duration-300"
          />
        )}
      </button>

      {/* ============ MOBILE OVERLAY (backdrop) ============ */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ============ MOBILE DRAWER PANEL ============ */}
      <div
        className={`md:hidden fixed right-0 top-0 z-40 h-full w-72 bg-black/90 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-2 px-6 pt-24">
          {NAV_LINKS.map((link, idx) => (
            <li
              key={link.id}
              className="opacity-0 translate-x-6"
              style={{
                transition: "opacity 400ms ease, transform 400ms ease",
                transitionDelay: menuOpen ? `${(idx + 1) * 60 + 300}ms` : "0ms",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateX(0)" : "translateX(24px)",
              }}
            >
              <a
                href={`#${link.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>{link.label}</span>
                {link.hasChevron && <ChevronDown className="h-4 w-4" />}
              </a>
            </li>
          ))}
        </ul>

        {/* Bottom CTA inside drawer */}
        <div className="mt-auto px-6 pb-10">
          <button
            type="button"
            style={{
              ...CTA_GRADIENT,
              transition: "opacity 400ms ease, transform 400ms ease",
              transitionDelay: menuOpen ? "300ms" : "0ms",
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateY(0)" : "translateY(16px)",
            }}
            onClick={() => setMenuOpen(false)}
            className="w-full rounded-full px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Get started
          </button>
        </div>
      </div>

      {/* ============ DESKTOP NAVIGATION (md+) ============ */}
      <nav
        className="hidden md:flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12"
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30 }}
      >
        {/* Left: Logo + "nexum" wordmark */}
        <div className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-[#010101] fill-current lg:text-white"
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="nexum logo"
          >
            <path d={LOGO_PATH} />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-[#010101] lg:text-white">
            nexum
          </span>
        </div>

        {/* Center: Glass pill nav cluster */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>{link.label}</span>
                    {link.hasChevron && <ChevronDown className="h-3.5 w-3.5 ml-2" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: separate "Get started" pill with dark gradient */}
          <button
            type="button"
            style={CTA_GRADIENT}
            className="self-stretch rounded-full px-5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ============ MAIN CONTENT (bottom-anchored) ============ */}
      <div className="relative z-10 flex flex-col h-full">
        <main
          className="mt-auto flex flex-col gap-6 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-12 lg:pb-16"
          style={{ fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif" }}
        >
          {/* Left column: headline + email CTA */}
          <div className="flex flex-col max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-[#010101] lg:text-white">
              Ship AI workers that grind while you rest
            </h1>

            {/* Email CTA */}
            <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:inline-flex sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-1.5">
              <input
                type="email"
                placeholder="Type your email"
                className="w-full rounded-full bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none sm:w-64 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-2"
              />
              <button
                type="button"
                style={CTA_GRADIENT}
                className="w-full rounded-full px-6 py-3 text-sm font-medium text-white hover:opacity-90 sm:w-auto sm:py-2.5"
              >
                Get started
              </button>
            </div>
          </div>

          {/* Right column: two glass cards */}
          <div className="flex flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
            {/* Stats card */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 sm:w-64">
              <p
                className="text-3xl sm:text-4xl font-normal tracking-tight text-[#010101] lg:text-white"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                42,500+
              </p>
              <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-[#010101]/70 lg:text-white/70">
                Teams run Nexum to handle recurring ops daily.
              </p>
            </div>

            {/* Testimonial card */}
            <div className="flex flex-col rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 sm:w-64">
              {/* Header row */}
              <div className="mb-3 sm:mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-black">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <span className="text-sm font-semibold text-[#010101] lg:text-white">
                  Stratify
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-[#010101]/80 lg:text-white/80">
                "With Nexum we went from managing tedious operational work to
                having AI agents that handle everything."
              </p>

              {/* Footer: avatar + name */}
              <div className="mt-4 sm:mt-5 flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/72?img=12"
                  alt="Sara Klein"
                  className="h-9 w-9 rounded-full object-cover bg-white/20"
                />
                <div>
                  <p className="text-sm font-semibold text-[#010101] lg:text-white">
                    Sara Klein
                  </p>
                  <p className="text-xs text-[#010101]/60 lg:text-white/60">
                    Dir of Operations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}
