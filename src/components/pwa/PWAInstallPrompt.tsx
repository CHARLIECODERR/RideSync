import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'ridesync_pwa_dismissed'
const DISMISSED_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isIOSBannerVisible, setIsIOSBannerVisible] = useState(false)

  useEffect(() => {
    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISSED_TTL_MS) return

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = navigator.userAgent
    const iosDevice = /iphone|ipad|ipod/i.test(ua)
    const safari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)

    if (iosDevice && safari) {
      setIsIOS(true)
      // Delay the banner slightly so it doesn't flash immediately on load
      const t = setTimeout(() => setIsIOSBannerVisible(true), 2000)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Auto-show the prompt after a short delay
      setTimeout(() => setVisible(true), 2500)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setVisible(false)
    } else {
      setInstalling(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
    setIsIOSBannerVisible(false)
  }

  // iOS Safari install guide banner
  if (isIOS) {
    return (
      <AnimatePresence>
        {isIOSBannerVisible && (
          <motion.div
            key="ios-prompt"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm"
          >
            <div className="bg-[#0F1729] border border-[#FF6B00]/30 rounded-2xl shadow-2xl shadow-black/60 p-4 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <img src="/logo-badge.png" alt="RideSync" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight">Install RideSync</p>
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">
                    Tap <span className="inline-flex items-center gap-0.5 text-[#FF6B00] font-semibold">Share <ShareIcon /></span> then{' '}
                    <span className="text-[#FF6B00] font-semibold">"Add to Home Screen"</span>
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  <XIcon />
                </button>
              </div>
              {/* Arrow pointing down to share button */}
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                  <span>↓</span>
                  <span>Find Share button at the bottom of Safari</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Standard install prompt (Chrome, Edge, Android, etc.)
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-prompt"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm"
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
            style={{
              background: 'linear-gradient(135deg, #0F1729 0%, #1a0a2e 100%)',
              border: '1px solid rgba(255,107,0,0.3)',
            }}
          >
            {/* Saffron accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'linear-gradient(90deg, #FF6B00, #FF9500, #FF6B00)' }}
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <img
                  src="/logo-badge.png"
                  alt="RideSync"
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-lg shadow-black/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-black text-base tracking-tight leading-tight">
                      Install RideSync
                    </p>
                    <button
                      onClick={handleDismiss}
                      className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      <XIcon />
                    </button>
                  </div>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    Get the full experience — offline access, ride alerts &amp; faster loading.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-60"
                  style={{
                    background: installing
                      ? 'rgba(255,107,0,0.4)'
                      : 'linear-gradient(135deg, #FF6B00, #FF9500)',
                    boxShadow: installing ? 'none' : '0 4px 16px rgba(255,107,0,0.35)',
                  }}
                >
                  {installing ? (
                    <>
                      <SpinnerIcon />
                      Installing…
                    </>
                  ) : (
                    <>
                      <DownloadIcon />
                      Install App
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Inline SVG icons to avoid any import issues
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
