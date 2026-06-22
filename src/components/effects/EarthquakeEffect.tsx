import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'

/**
 * EarthquakeEffect — Efek ambient gempa bumi modern.
 *
 * Saat ronde bertema gempa aktif, efek ini secara periodik:
 * 1. Mengguncang HANYA container soal (ScenarioDisplay #scenario-card)
 * 2. Menampilkan gelombang seismik transparan (ripple) dari pusat soal
 * 3. Menampilkan partikel debu tipis yang naik perlahan
 *
 * Durasi: ~3 detik per trigger, loop otomatis (3s aktif + 2s jeda).
 * API: window.triggerEarthquake() — dapat dipanggil manual untuk testing.
 * Semua elemen overlay: pointer-events: none — tidak mengganggu interaksi.
 *
 * ATURAN ARSITEKTUR:
 * - TIDAK mengguncang seluruh halaman/viewport
 * - TIDAK mengubah posisi/ukuran GameBoard, PlayerZone, AnswerAnchor, Card
 * - TIDAK menggunakan blur berat, flashing, atau library eksternal
 * - TIDAK menggunakan requestAnimationFrame untuk animasi (CSS only)
 */
export default function EarthquakeEffect() {
  const phase = useGameStore((s) => s.phase)
  const [isActive, setIsActive] = useState(false)
  const [rippleKey, setRippleKey] = useState(0)
  const intervalRef = useRef<number>(0)
  const timeoutRef = useRef<number>(0)

  // Generate partikel debu secara statis (tidak berubah saat re-render)
  const dustParticles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      // Cluster debu di sekitar area tengah (tempat ScenarioDisplay)
      left: `${25 + Math.random() * 50}%`,
      bottom: `${25 + Math.random() * 30}%`,
      size: `${2 + Math.random() * 4}px`,
      duration: `${2 + Math.random() * 1.5}s`,
      delay: `${Math.random() * 2}s`,
      driftX: `${-20 + Math.random() * 40}px`,
    }))
  }, [])

  /**
   * triggerEarthquake — Memicu efek gempa selama 3 detik.
   *
   * 1. Menambahkan class `question-shake` ke #scenario-card
   * 2. Menampilkan ripple gelombang seismik
   * 3. Menampilkan partikel debu
   * 4. Setelah 3 detik, semua efek dihapus otomatis
   */
  const triggerEarthquake = useCallback(() => {
    setIsActive(true)
    setRippleKey((k) => k + 1) // Force remount ripples agar animasi restart

    // Tambah class shake ke container soal saja
    const card = document.getElementById('scenario-card')
    if (card) {
      card.classList.add('question-shake')
    }

    // Bersihkan timeout sebelumnya jika ada
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Hentikan semua efek setelah 3 detik
    timeoutRef.current = window.setTimeout(() => {
      setIsActive(false)
      const cardEl = document.getElementById('scenario-card')
      if (cardEl) {
        cardEl.classList.remove('question-shake')
      }
    }, 3000)
  }, [])

  // Expose triggerEarthquake() sebagai API global untuk testing/integrasi
  useEffect(() => {
    ;(window as any).triggerEarthquake = triggerEarthquake
    return () => {
      delete (window as any).triggerEarthquake
    }
  }, [triggerEarthquake])

  // Auto-trigger loop selama fase 'playing'
  useEffect(() => {
    if (phase === 'playing') {
      // Trigger awal setelah delay singkat
      const startDelay = window.setTimeout(() => {
        triggerEarthquake()
        // Loop: 3s aktif + 2s jeda = siklus 5 detik
        intervalRef.current = window.setInterval(triggerEarthquake, 5000)
      }, 800)

      return () => {
        clearTimeout(startDelay)
        clearInterval(intervalRef.current)
        clearTimeout(timeoutRef.current)
        setIsActive(false)
        // Pastikan class shake dibersihkan saat cleanup
        const card = document.getElementById('scenario-card')
        if (card) card.classList.remove('question-shake')
      }
    }
  }, [phase, triggerEarthquake])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 20 }}
    >
      {/* ── Gelombang Seismik Transparan ── */}
      {/* Beberapa ripple yang melebar dari pusat area soal */}
      {isActive && (
        <div key={rippleKey}>
          {[0, 0.35, 0.7, 1.05].map((delay, i) => (
            <div
              key={i}
              className="seismic-ripple"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      )}

      {/* ── Partikel Debu Tipis ── */}
      {/* Debu halus muncul selama gempa berlangsung, naik perlahan */}
      {isActive &&
        dustParticles.map((dust) => (
          <div
            key={dust.id}
            className="quake-dust"
            style={
              {
                left: dust.left,
                bottom: dust.bottom,
                width: dust.size,
                height: dust.size,
                animationDuration: dust.duration,
                animationDelay: dust.delay,
                '--drift-x': dust.driftX,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  )
}
