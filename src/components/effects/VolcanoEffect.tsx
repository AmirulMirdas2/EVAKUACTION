import { useEffect, useState, useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'

/**
 * VolcanoEffect — Efek Erupsi Gunung Berapi.
 * 
 * FASE:
 * 1. smoking: timeRemaining > 10 (Gunung sudah ada di awal permainan, keluar asap terus)
 * 2. erupting: timeRemaining <= 10 (Keluar lava tinggi, abu, partikel api, dan soal terbakar)
 * 3. climax: timeRemaining <= 5 (Lava memuncak, langit makin gelap)
 */
export default function VolcanoEffect() {
  const { phase, timeRemaining } = useGameStore()
  const [eruptionState, setEruptionState] = useState<'idle' | 'smoking' | 'erupting' | 'climax'>('idle')

  // Logic Phase
  useEffect(() => {
    if (phase !== 'playing') {
      setEruptionState('idle')
      return
    }
    
    if (timeRemaining <= 5 && timeRemaining > 0) {
      setEruptionState('climax')
    } else if (timeRemaining <= 10 && timeRemaining > 0) {
      setEruptionState('erupting')
    } else if (timeRemaining > 10) {
      setEruptionState('smoking')
    } else {
      setEruptionState('idle')
    }
  }, [timeRemaining, phase])

  // Logic membakar soal
  useEffect(() => {
    const card = document.getElementById('scenario-card')
    if (eruptionState === 'erupting' || eruptionState === 'climax') {
      if (card && !card.classList.contains('card-burning')) {
        card.classList.add('card-burning')
      }
    } else {
      if (card) card.classList.remove('card-burning')
    }

    return () => {
      if (card) card.classList.remove('card-burning')
    }
  }, [eruptionState])

  // Partikel statis untuk performa
  const { embers, ashes, smokes } = useMemo(() => {
    const embersList = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${45 + Math.random() * 10}%`,
      size: `${2 + Math.random() * 4}px`,
      duration: `${1 + Math.random() * 2}s`,
      delay: `${Math.random() * 2}s`,
      drift: `${-40 + Math.random() * 80}px`,
    }))

    const ashesList = Array.from({ length: 250 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${-10 + Math.random() * -30}%`,
      size: `${1 + Math.random() * 3}px`,
      duration: `${4 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }))

    // Asap selalu keluar sejak awal (Fase Smoking)
    const smokesList = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${46 + Math.random() * 8}%`,
      size: `${60 + Math.random() * 100}px`,
      duration: `${10 + Math.random() * 8}s`, // Sangat lambat naiknya
      delay: `${Math.random() * 15}s`,
      drift: `${-200 + Math.random() * 400}px`, // Tersebar jauh ke samping
    }))

    return { embers: embersList, ashes: ashesList, smokes: smokesList }
  }, [])

  if (eruptionState === 'idle') return null

  const isErupting = eruptionState === 'erupting' || eruptionState === 'climax'
  const isClimax = eruptionState === 'climax'

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }} // Berada jauh di belakang (background layar)
    >
      {/* 1. Langit Gelap (Dark Sky Overlay) */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-3000 ease-in-out"
        style={{ opacity: isClimax ? 0.7 : isErupting ? 0.5 : 0.1 }}
      />

      {/* Container Gunung (Ikut bergetar saat erupsi) */}
      <div className={`absolute bottom-0 w-full flex justify-center ${isErupting ? 'volcano-tremor' : ''}`}>
        
        {/* 2. Gunung Stratovolcano (SVG) */}
        <svg 
          width="600" 
          height="350" 
          viewBox="0 0 600 350" 
          className="relative z-10"
          style={{ transform: 'translateY(20px)' }}
        >
          <defs>
            <linearGradient id="volcano-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c2c2c" />
              <stop offset="20%" stopColor="#212121" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
            {/* Cahaya lava dari kawah */}
            <radialGradient id="crater-glow" cx="0.5" cy="0" r="1">
              <stop offset="0%" stopColor="rgba(255, 61, 0, 0.9)" />
              <stop offset="40%" stopColor="rgba(255, 61, 0, 0)" />
            </radialGradient>
          </defs>

          {/* Badan Gunung */}
          <path 
            d="M 50 350 Q 250 200, 280 50 L 320 50 Q 350 200, 550 350 Z" 
            fill="url(#volcano-grad)" 
          />
          {/* Kawah */}
          <ellipse cx="300" cy="50" rx="22" ry="6" fill="#111" />
          {/* Cahaya Lava */}
          {isErupting && <circle cx="300" cy="40" r="80" fill="url(#crater-glow)" />}
        </svg>

        {/* 3. Semburan Asap (Selalu ada dari awal permainan) */}
        <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-0 h-0 z-0">
          
          {/* Awan Panas (Muncul saat erupsi) */}
          {isErupting && (
            <div className={`pyroclastic-cloud ${isClimax ? 'scale-125' : ''}`} />
          )}

          {/* Asap Vulkanik Besar - Selalu naik sampai atas layar */}
          {smokes.map(s => (
            <div
              key={`smoke-${s.id}`}
              className="volcano-smoke"
              style={{
                left: s.left,
                width: s.size,
                height: s.size,
                animationDuration: isClimax ? `${parseFloat(s.duration) * 0.7}s` : s.duration,
                animationDelay: s.delay,
                '--smoke-drift': s.drift,
                // Asap lebih tebal saat erupsi
                opacity: isErupting ? 0.7 : 0.3
              } as React.CSSProperties}
            />
          ))}

          {/* Lava Spout Utama (Keluar saat <= 10 detik) */}
          {isErupting && (
            <div className={`lava-spout ${isClimax ? 'lava-climax' : ''}`} />
          )}

          {/* Bara Api (Embers) (Keluar saat <= 10 detik) */}
          {isErupting && embers.map(e => (
            <div
              key={`ember-${e.id}`}
              className="volcano-ember"
              style={{
                left: e.left,
                width: e.size,
                height: e.size,
                animationDuration: isClimax ? `${parseFloat(e.duration) * 0.6}s` : e.duration,
                animationDelay: e.delay,
                '--ember-drift': e.drift
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* 4. Hujan Abu Vulkanik (Seluruh Layar, muncul saat erupsi) */}
      {isErupting && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {ashes.map(a => (
            <div
              key={`ash-${a.id}`}
              className="volcano-ash"
              style={{
                left: a.left,
                top: a.top,
                width: a.size,
                height: a.size,
                animationDuration: isClimax ? `${parseFloat(a.duration) * 0.8}s` : a.duration,
                animationDelay: a.delay,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
