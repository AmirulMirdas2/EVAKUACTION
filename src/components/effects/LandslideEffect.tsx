import { useEffect, useState, useMemo, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'

/**
 * LandslideEffect — Efek Tanah Longsor.
 * Aktif otomatis di 10 detik terakhir ronde.
 * 
 * FASE:
 * 1. idle: timeRemaining > 10 (Belum terjadi apa-apa)
 * 2. trembling: 7 < timeRemaining <= 10 (Lereng muncul, getaran ringan, debu tipis, batu awal jatuh)
 * 3. main: 5 < timeRemaining <= 7 (Longsoran utama, debu tebal, benturan ke area soal)
 * 4. climax: 0 < timeRemaining <= 5 (Intensitas maksimal, kerikil sangat banyak)
 */
export default function LandslideEffect() {
  const { phase, timeRemaining } = useGameStore()
  const [landslideState, setLandslideState] = useState<'idle' | 'trembling' | 'main' | 'climax'>('idle')
  const pushCleanupRef = useRef<number>(0)

  // Trigger State Management
  useEffect(() => {
    if (phase !== 'playing') {
      setLandslideState('idle')
      return
    }
    
    if (timeRemaining <= 5 && timeRemaining > 0) {
      setLandslideState('climax')
    } else if (timeRemaining <= 7 && timeRemaining > 0) {
      setLandslideState('main')
    } else if (timeRemaining <= 10 && timeRemaining > 0) {
      setLandslideState('trembling')
    } else {
      setLandslideState('idle')
    }
  }, [timeRemaining, phase])

  // Efek benturan ke container soal saat longsoran utama terjadi (fase main)
  useEffect(() => {
    if (landslideState === 'main') {
      const card = document.getElementById('scenario-card')
      if (card) {
        card.classList.remove('landslide-hit')
        void card.offsetWidth // force reflow
        card.classList.add('landslide-hit')
        
        pushCleanupRef.current = window.setTimeout(() => {
          card.classList.remove('landslide-hit')
        }, 1000)
      }
    }
    return () => clearTimeout(pushCleanupRef.current)
  }, [landslideState])

  // Generate partikel batuan & debu secara statis via useMemo
  const { rocks, gravels, dusts } = useMemo(() => {
    // Batu besar (30-80) -> Kita buat 80, dirender bertahap sesuai fase
    const rocksList = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      // Mulai dari kiri atas lereng
      startX: `${-10 + Math.random() * 30}vw`,
      startY: `${-20 + Math.random() * 50}vh`,
      size: `${20 + Math.random() * 40}px`, // Batu cukup besar
      duration: `${1.5 + Math.random() * 2}s`, // Jatuh cukup cepat
      delay: `${Math.random() * 5}s`, // Delay tersebar
      rotation: `${Math.random() * 360}deg`,
      rotationSpeed: `${Math.random() * 2}s`,
    }))

    // Kerikil kecil & tanah (banyak, cepat) -> 200 partikel
    const gravelsList = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      startX: `${-20 + Math.random() * 40}vw`,
      startY: `${-20 + Math.random() * 60}vh`,
      size: `${2 + Math.random() * 6}px`,
      duration: `${0.8 + Math.random() * 1.5}s`, // Jatuh sangat cepat
      delay: `${Math.random() * 4}s`,
    }))

    // Partikel debu cokelat (menyebar luas) -> 150 partikel
    const dustsList = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 50}vw`, // Dominan di kiri
      top: `${20 + Math.random() * 80}vh`,
      size: `${40 + Math.random() * 100}px`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }))

    return { rocks: rocksList, gravels: gravelsList, dusts: dustsList }
  }, [])

  // Agar bisa ditrigger dari console
  useEffect(() => {
    ;(window as any).triggerLandslide = () => {
      // Simulasi dari trembling -> main -> climax
      setLandslideState('trembling')
      setTimeout(() => setLandslideState('main'), 3000)
      setTimeout(() => setLandslideState('climax'), 5000)
      setTimeout(() => setLandslideState('idle'), 10000)
    }
    return () => {
      delete (window as any).triggerLandslide
    }
  }, [])

  if (landslideState === 'idle') return null

  const isTrembling = landslideState === 'trembling' || landslideState === 'main' || landslideState === 'climax'
  const isMain = landslideState === 'main' || landslideState === 'climax'
  const isClimax = landslideState === 'climax'

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }} // Latar belakang, tidak mengganggu interaksi
    >
      {/* 1. Overlay Atmosfer Debu Tipis */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ 
          backgroundColor: 'rgba(120, 90, 60, 0.08)',
          opacity: isClimax ? 1 : isMain ? 0.6 : 0.2 
        }}
      />

      {/* 2. Lereng / Tebing SVG (Kiri Bawah) */}
      {/* Container ini ikut bergetar saat trembling */}
      <div className={`absolute bottom-0 left-0 w-[60vw] h-[70vh] origin-bottom-left transition-transform duration-1000 ${isTrembling ? 'landslide-bg-tremor scale-100' : 'scale-90 opacity-0'}`}>
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            {/* Gradien tanah alami */}
            <linearGradient id="cliff-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8D6E63" />
              <stop offset="40%" stopColor="#6D4C41" />
              <stop offset="100%" stopColor="#5D4037" />
            </linearGradient>
            {/* Tekstur / highlight untuk organik */}
            <linearGradient id="cliff-highlight" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>

          {/* Bentuk tebing miring dari kiri atas (0,0) ke kanan bawah (100,100) */}
          <path 
            d="M 0 0 Q 30 10, 50 40 Q 70 70, 100 100 L 0 100 Z" 
            fill="url(#cliff-grad)" 
          />
          <path 
            d="M 0 0 Q 30 10, 50 40 Q 70 70, 100 100 L 0 100 Z" 
            fill="url(#cliff-highlight)" 
          />
          
          {/* Layer tanah runtuh (overlay organik) */}
          <path 
            d="M 0 20 Q 20 40, 45 60 Q 65 80, 90 100 L 0 100 Z" 
            fill="#4E342E" 
            opacity={isMain ? "0.8" : "0"} 
            className="transition-opacity duration-1000"
          />
        </svg>
      </div>

      {/* 3. Bebatuan Besar (Rocks) */}
      {isTrembling && rocks.slice(0, isClimax ? 80 : isMain ? 50 : 20).map(rock => (
        <div
          key={`rock-${rock.id}`}
          className="landslide-rock"
          style={{
            left: rock.startX,
            top: rock.startY,
            width: rock.size,
            height: rock.size,
            animationDuration: isClimax ? `${parseFloat(rock.duration) * 0.7}s` : rock.duration,
            animationDelay: rock.delay,
            '--rock-rot': rock.rotation,
            '--rock-rot-speed': rock.rotationSpeed,
          } as React.CSSProperties}
        />
      ))}

      {/* 4. Kerikil & Butiran Tanah Kecil */}
      {isMain && gravels.slice(0, isClimax ? 200 : 80).map(gravel => (
        <div
          key={`gravel-${gravel.id}`}
          className="landslide-gravel"
          style={{
            left: gravel.startX,
            top: gravel.startY,
            width: gravel.size,
            height: gravel.size,
            animationDuration: isClimax ? `${parseFloat(gravel.duration) * 0.8}s` : gravel.duration,
            animationDelay: gravel.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* 5. Awan Debu Longsor */}
      {isTrembling && dusts.slice(0, isClimax ? 150 : isMain ? 100 : 30).map(dust => (
        <div
          key={`dust-${dust.id}`}
          className="landslide-dust"
          style={{
            left: dust.left,
            top: dust.top,
            width: dust.size,
            height: dust.size,
            animationDuration: dust.duration,
            animationDelay: dust.delay,
          }}
        />
      ))}
    </div>
  )
}
