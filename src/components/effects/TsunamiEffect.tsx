import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'

/**
 * TsunamiEffect — Efek ambient gelombang tsunami yang realistis & dramatis.
 *
 * SIKLUS:
 * 1. idle: Air berada di 45vh (setengah layar).
 * 2. receding (Surut): Air perlahan ditarik ke laut (dari kanan ke kiri) + Muncul Peringatan!
 * 3. striking (Hantaman): Gelombang raksasa SVG datang menyapu layar + dorongan ke soal.
 * 4. flooding (Banjir Susulan): Air naik kembali ke 45vh.
 *
 * Loop Total: ~32 detik.
 */
export default function TsunamiEffect() {
  const phase = useGameStore((s) => s.phase)
  const [tsunamiPhase, setTsunamiPhase] = useState<'idle' | 'receding' | 'striking' | 'flooding'>('idle')
  const [waveKey, setWaveKey] = useState(0)

  const intervalRef = useRef<number>(0)
  const sequenceTimersRef = useRef<number[]>([])
  const pushTimeoutRef = useRef<number>(0)
  const pushCleanupRef = useRef<number>(0)

  // Generate partikel percikan air (spray) — statis untuk performa
  const sprayParticles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${10 + Math.random() * 45}%`,
      left: `${10 + Math.random() * 45}%`,
      size: `${2 + Math.random() * 5}px`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 8}s`,
      dx: `${40 + Math.random() * 100}px`,
      dy: `${-35 + Math.random() * 70}px`,
    }))
  }, [])

  const clearAllTimers = useCallback(() => {
    sequenceTimersRef.current.forEach(clearTimeout)
    sequenceTimersRef.current = []
    clearTimeout(pushTimeoutRef.current)
    clearTimeout(pushCleanupRef.current)
  }, [])

  const runSequence = useCallback(() => {
    clearAllTimers()

    // 1. Mulai surut & peringatan (0s) - Durasi 8s
    setTsunamiPhase('receding')

    // 2. Tsunami datang! (9s)
    const tStriking = window.setTimeout(() => {
      setTsunamiPhase('striking')
      setWaveKey((k) => k + 1) // Reset animasi wave

      // Efek dorongan soal saat ombak lewat tengah (~6.5s setelah striking mulai)
      pushTimeoutRef.current = window.setTimeout(() => {
        const card = document.getElementById('scenario-card')
        if (card) {
          card.classList.remove('tsunami-push')
          void card.offsetWidth
          card.classList.add('tsunami-push')
          pushCleanupRef.current = window.setTimeout(() => {
            card.classList.remove('tsunami-push')
          }, 2000)
        }
      }, 6500)
    }, 9000)

    // 3. Ombak lewat, air mulai tenang/naik lagi (25s)
    const tFlooding = window.setTimeout(() => {
      setTsunamiPhase('flooding')
    }, 25000)

    // 4. Kembali ke idle (30s) -> Berakhir sebelum siklus berikutnya (32s)
    const tIdle = window.setTimeout(() => {
      setTsunamiPhase('idle')
    }, 30000)

    sequenceTimersRef.current.push(tStriking, tFlooding, tIdle)
  }, [clearAllTimers])

  // Expose trigger untuk testing manual
  useEffect(() => {
    ;(window as any).triggerTsunami = runSequence
    return () => {
      delete (window as any).triggerTsunami
    }
  }, [runSequence])

  // Auto-trigger loop
  useEffect(() => {
    if (phase === 'playing') {
      // Tunggu sebentar di idle, lalu mulai sequence
      const startDelay = window.setTimeout(() => {
        runSequence()
        // Loop tiap 32 detik
        intervalRef.current = window.setInterval(runSequence, 32000)
      }, 2000)

      return () => {
        clearTimeout(startDelay)
        clearInterval(intervalRef.current)
        clearAllTimers()
        setTsunamiPhase('idle')
        const card = document.getElementById('scenario-card')
        if (card) card.classList.remove('tsunami-push')
      }
    }
  }, [phase, runSequence, clearAllTimers])

  // Helper penentu class untuk Sea Base
  const getSeaClass = () => {
    switch (tsunamiPhase) {
      case 'idle': return 'sea-idle'
      case 'receding': return 'sea-receding'
      case 'striking': return 'sea-striking'
      case 'flooding': return 'sea-flooding'
      default: return 'sea-idle'
    }
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 20 }}
    >
      {/* ── BORDER SIRENE DARURAT (Flash Merah saat surut) ── */}
      {tsunamiPhase === 'receding' && <div className="siren-flash" />}

      {/* ── BASE AIR LAUT (Genangan setengah layar) ── */}
      <div className={`tsunami-sea ${getSeaClass()}`}>
        {/* Ombak kecil genangan */}
        <div className="wave wave1" style={{ opacity: 0.5 }} />
        <div className="wave wave2" style={{ opacity: 0.3 }} />
      </div>

      {/* ── UI PERINGATAN SURUT ── */}
      {tsunamiPhase === 'receding' && (
        <div className="tsunami-warning-container">
          <div className="tsunami-warning-text">⚠ BAHAYA TSUNAMI ⚠</div>
          <div className="tsunami-warning-sub">AIR LAUT SURUT! SEGERA EVAKUASI!</div>
        </div>
      )}

      {/* ── GELOMBANG TSUNAMI RAKSASA (Hanya saat striking) ── */}
      {tsunamiPhase === 'striking' && (
        <div key={waveKey}>
          {/* Efek getaran kamera (layar guncang) saat ombak mendekat */}
          <div className="tsunami-camera-shake" />

          {/* Gelombang Utama */}
          <div className="tsunami-wave tsunami-wave-main">
            <svg
              viewBox="0 0 1200 400"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <defs>
                <linearGradient id="tsunami-grad-main" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(33,150,243,0.10)" />
                  <stop offset="15%" stopColor="rgba(33,150,243,0.65)" />
                  <stop offset="50%" stopColor="rgba(25,118,210,0.80)" />
                  <stop offset="100%" stopColor="rgba(13,71,161,0.88)" />
                </linearGradient>
              </defs>
              <path
                d="M 0 400 L 0 200 Q 50 190, 100 160 Q 180 120, 280 70 Q 380 25, 460 10 Q 520 0, 560 15 Q 620 35, 700 80 Q 800 135, 920 175 Q 1060 205, 1200 215 L 1200 400 Z"
                fill="url(#tsunami-grad-main)"
              />
              <path
                d="M 0 200 Q 50 190, 100 160 Q 180 120, 280 70 Q 380 25, 460 10 Q 520 0, 560 15 Q 620 35, 700 80 Q 800 135, 920 175 Q 1060 205, 1200 215"
                fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="6" strokeLinecap="round"
              />
              <path
                d="M 30 210 Q 120 185, 220 140 Q 320 85, 420 45 Q 500 15, 580 30 Q 660 55, 760 105 Q 870 160, 990 195 Q 1100 210, 1200 220"
                fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeDasharray="10 14"
              />
            </svg>
            {sprayParticles.slice(0, 40).map((spray) => (
              <div
                key={spray.id}
                className="tsunami-spray"
                style={{
                  top: spray.top, left: spray.left, width: spray.size, height: spray.size,
                  animationDuration: spray.duration, animationDelay: spray.delay,
                  '--spray-dx': spray.dx, '--spray-dy': spray.dy,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Gelombang Kedua (Menyusul) */}
          <div className="tsunami-wave tsunami-wave-second">
            <svg
              viewBox="0 0 1200 400"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <defs>
                <linearGradient id="tsunami-grad-second" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(21,101,192,0.08)" />
                  <stop offset="15%" stopColor="rgba(21,101,192,0.55)" />
                  <stop offset="50%" stopColor="rgba(13,71,161,0.75)" />
                  <stop offset="100%" stopColor="rgba(1,34,94,0.85)" />
                </linearGradient>
              </defs>
              <path
                d="M 0 400 L 0 160 Q 60 150, 130 115 Q 220 75, 330 35 Q 430 5, 500 0 Q 560 0, 610 20 Q 680 50, 780 100 Q 890 155, 1020 185 Q 1120 205, 1200 210 L 1200 400 Z"
                fill="url(#tsunami-grad-second)"
              />
              <path
                d="M 0 160 Q 60 150, 130 115 Q 220 75, 330 35 Q 430 5, 500 0 Q 560 0, 610 20 Q 680 50, 780 100 Q 890 155, 1020 185 Q 1120 205, 1200 210"
                fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="5" strokeLinecap="round"
              />
            </svg>
            {sprayParticles.slice(40).map((spray) => (
              <div
                key={spray.id}
                className="tsunami-spray"
                style={{
                  top: spray.top, left: spray.left, width: spray.size, height: spray.size,
                  animationDuration: spray.duration, animationDelay: spray.delay,
                  '--spray-dx': spray.dx, '--spray-dy': spray.dy,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
