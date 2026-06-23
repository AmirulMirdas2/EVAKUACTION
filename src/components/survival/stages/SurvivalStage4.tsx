import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import SurvivalCharacter from '../SurvivalCharacter'
import { useSurvivalDrag } from '../../../hooks/useSurvivalDrag'

interface SurvivalStage4Props {
  player: 'player1' | 'player2'
  onComplete: (passed: boolean) => void
}

// Hazard objects on the map
const HAZARDS = [
  { id: 'building', label: '🏢 Gedung', x: 80, y: 60, w: 120, h: 140, reason: 'Jangan berdiri dekat gedung — bisa runtuh!' },
  { id: 'tree', label: '🌳 Pohon', x: 520, y: 70, w: 90, h: 120, reason: 'Pohon bisa tumbang saat gempa!' },
  { id: 'electric', label: '⚡ Tiang Listrik', x: 100, y: 280, w: 80, h: 100, reason: 'Tiang listrik bisa roboh dan menyebabkan tersengat listrik!' },
  { id: 'parking', label: '🚗 Parkiran', x: 440, y: 280, w: 130, h: 80, reason: 'Kendaraan bisa bergeser dan menimpa!' },
]

/**
 * Stage 4 — Menuju Titik Kumpul
 *
 * Teaching: Go to assembly point after evacuation
 *
 * Layout: Outdoor area with building, tree, electric pole, parking lot.
 * Player must drag character to the assembly point (titik kumpul),
 * avoiding hazard zones.
 */
export default function SurvivalStage4({ player, onComplete }: SurvivalStage4Props) {
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<'success' | 'hazard' | null>(null)
  const [hazardReason, setHazardReason] = useState('')
  const [timeLeft, setTimeLeft] = useState(15)
  const completedRef = useRef(false)

  const handleDrop = useCallback((zoneId: string | null) => {
    if (completedRef.current) return

    if (zoneId === 'assembly-point') {
      completedRef.current = true
      setCompleted(true)
      setResult('success')
      setTimeout(() => onComplete(true), 1500)
      return
    }

    // Check if dropped on a hazard
    const hazard = HAZARDS.find(h => h.id === zoneId)
    if (hazard) {
      completedRef.current = true
      setCompleted(true)
      setResult('hazard')
      setHazardReason(hazard.reason)
      setTimeout(() => onComplete(false), 2500)
    }
  }, [onComplete])

  const handleMove = useCallback(() => {}, [])

  const { registerCharacter, registerZone } = useSurvivalDrag(
    player,
    handleDrop,
    handleMove,
    !completed
  )

  // Countdown timer
  useEffect(() => {
    if (completed) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!completedRef.current) {
            completedRef.current = true
            setCompleted(true)
            setTimeout(() => onComplete(false), 1000)
          }
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [completed, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Stage info bar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '8px 24px',
        borderRadius: 16,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
        zIndex: 60,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tahap 4/4
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>
            Menuju Titik Kumpul
          </span>
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: 8,
          background: timeLeft <= 5 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${timeLeft <= 5 ? '#EF444444' : 'rgba(255,255,255,0.1)'}`,
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            color: timeLeft <= 5 ? '#EF4444' : '#fff',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 55,
      }}>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 450,
          lineHeight: 1.5,
        }}>
          Kamu sudah keluar gedung! Pindahkan karakter ke <strong style={{ color: '#22C55E' }}>Titik Kumpul</strong>.
          Hindari gedung, pohon, tiang listrik, dan parkiran.
        </p>
      </div>

      {/* Outdoor scene */}
      <div style={{
        position: 'relative',
        width: 720,
        height: 440,
        margin: '0 auto',
      }}>
        {/* Outdoor SVG background */}
        <svg width="720" height="440" viewBox="0 0 720 440" style={{ position: 'absolute', inset: 0 }}>
          {/* Sky */}
          <rect x="0" y="0" width="720" height="240" fill="#0C1222" />

          {/* Ground */}
          <rect x="0" y="240" width="720" height="200" fill="#1A2332" />
          <line x1="0" y1="240" x2="720" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Ground texture */}
          <rect x="0" y="240" width="720" height="200" fill="url(#groundPattern)" opacity="0.3" />
          <defs>
            <pattern id="groundPattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)" />
            </pattern>
          </defs>

          {/* Road markings */}
          <rect x="300" y="240" width="120" height="200" fill="rgba(100,116,139,0.08)" />
          <line x1="360" y1="250" x2="360" y2="280" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,8" />
          <line x1="360" y1="300" x2="360" y2="330" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,8" />
          <line x1="360" y1="350" x2="360" y2="380" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,8" />
        </svg>

        {/* Hazard zones */}
        {HAZARDS.map((hazard) => (
          <div
            key={hazard.id}
            ref={(el) => registerZone(hazard.id, el)}
            style={{
              position: 'absolute',
              left: hazard.x,
              top: hazard.y,
              width: hazard.w,
              height: hazard.h,
              borderRadius: 12,
              border: '2px dashed rgba(239,68,68,0.3)',
              backgroundColor: 'rgba(239,68,68,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: 32 }}>{hazard.label.split(' ')[0]}</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {hazard.label.split(' ').slice(1).join(' ')}
            </span>
            <span style={{
              fontSize: 9,
              color: '#EF4444',
              fontWeight: 600,
              opacity: 0.7,
            }}>
              ⚠️ BAHAYA
            </span>
          </div>
        ))}

        {/* Assembly Point (Titik Kumpul) — Bottom center */}
        <div
          ref={(el) => registerZone('assembly-point', el)}
          style={{
            position: 'absolute',
            left: 280,
            top: 350,
            width: 160,
            height: 80,
            borderRadius: 12,
            border: '3px solid #22C55E88',
            backgroundColor: 'rgba(34,197,94,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 0 20px rgba(34,197,94,0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Pulsing glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 16,
              border: '2px solid #22C55E44',
              pointerEvents: 'none',
            }}
          />
          <span style={{ fontSize: 24 }}>🟩</span>
          <span style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#22C55E',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            TITIK KUMPUL
          </span>
        </div>

        {/* Character (start position: near building) */}
        <div style={{
          position: 'absolute',
          left: 240,
          top: 250,
          zIndex: 50,
        }}>
          <SurvivalCharacter onRegister={registerCharacter} size={64} />
        </div>

        {/* Result overlays */}
        {result === 'hazard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 8,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                padding: '20px 36px',
                borderRadius: 16,
                background: 'rgba(239,68,68,0.15)',
                border: '2px solid #EF4444',
                boxShadow: '0 0 30px rgba(239,68,68,0.3)',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: '#EF4444', marginBottom: 8 }}>
                ❌ Lokasi Berbahaya!
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                {hazardReason}
              </div>
            </motion.div>
          </motion.div>
        )}

        {result === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 8,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                padding: '20px 36px',
                borderRadius: 16,
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid #22C55E',
                boxShadow: '0 0 30px rgba(34,197,94,0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: '#22C55E', marginBottom: 8 }}>
                ✓ Evakuasi Berhasil!
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                Kamu berhasil mencapai titik kumpul dengan selamat
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Educational tip */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: 12,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.15)',
        maxWidth: 540,
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          💡 <strong style={{ color: '#F59E0B' }}>Menuju Titik Kumpul</strong> — Setelah keluar gedung, segera
          menuju titik kumpul yang jauh dari gedung, pohon, tiang listrik, dan kendaraan. Area terbuka yang
          luas adalah lokasi paling aman setelah gempa.
        </p>
      </div>
    </motion.div>
  )
}
