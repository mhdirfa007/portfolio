'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'

// Dynamically import the 3D scene to avoid SSR issues with Three.js
const RetroComputerScene = dynamic(
  () => import('@/components/retro-computer-scene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mb-4 font-mono text-xs tracking-widest text-amber-400/70">
            INITIALIZING TERMINAL...
          </div>
          <div className="mx-auto h-1 w-48 overflow-hidden bg-amber-950/40">
            <div className="h-full w-1/3 animate-pulse bg-amber-400" />
          </div>
        </div>
      </div>
    ),
  }
)

export default function Home() {
  // Power state: false = monitor off, true = monitor on
  const [powered, setPowered] = useState(false)
  // Screen state: only meaningful when powered on
  const [screenState, setScreenState] = useState<'boot' | 'login' | 'desktop' | 'document'>('boot')

  // Auto-power-on after the scene mounts for that "boot up" cinematic feel
  useEffect(() => {
    const t = setTimeout(() => setPowered(true), 1400)
    return () => clearTimeout(t)
  }, [])

  const handlePowerToggle = useCallback(() => {
    setPowered((p) => {
      const next = !p
      if (!next) setScreenState('boot')
      return next
    })
  }, [])

  // When powered on, go through boot → login
  useEffect(() => {
    if (!powered) return
    // Boot screen for ~2.5 seconds, then show login
    if (screenState === 'boot') {
      const t = setTimeout(() => setScreenState('login'), 2500)
      return () => clearTimeout(t)
    }
  }, [powered, screenState])

  const handleLogin = useCallback(() => {
    setScreenState('desktop')
  }, [])

  const handleInsertCD = useCallback(() => {
    setScreenState('document')
  }, [])

  const handleCloseDocument = useCallback(() => {
    setScreenState('desktop')
  }, [])

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-amber-100">
      {/* Background ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(60, 40, 10, 0.35) 0%, rgba(10, 10, 10, 0.95) 70%)',
        }}
      />
      {/* Subtle scanline overlay across whole page */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Top HUD */}
      <header className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/60 sm:px-6 sm:text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${powered ? 'bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.7)]' : 'bg-amber-900'}`}
          />
          <span>NEKO V2.4.1</span>
        </div>
        <div className="hidden sm:block">PORTFOLIO_TERMINAL // {new Date().getFullYear()}</div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">SIGNAL: STABLE</span>
          <span className="animate-pulse">●</span>
        </div>
      </header>

      {/* The 3D scene */}
      <div className="absolute inset-0">
        <RetroComputerScene
          powered={powered}
          screenState={screenState}
          onPowerToggle={handlePowerToggle}
          onLogin={handleLogin}
          onInsertCD={handleInsertCD}
          onCloseDocument={handleCloseDocument}
        />
      </div>

      {/* Footer hint — changes based on current screen state */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-center gap-1 px-4 py-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400/50 sm:text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>DRAG TO ROTATE</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>SCROLL TO ZOOM</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>
            {powered
              ? screenState === 'login'
                ? 'TYPE ANY PASSWORD + ENTER'
                : screenState === 'desktop'
                ? 'CLICK THE CD CASE ON THE DESK'
                : screenState === 'document'
                ? 'VIEWING RESUME.DOCX'
                : 'BOOTING...'
              : 'CLICK THE POWER BUTTON ON THE MONITOR'}
          </span>
        </div>
      </footer>
    </main>
  )
}
