import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import SurvivalCharacter from '../SurvivalCharacter'
import { useSurvivalDrag } from '../../../hooks/useSurvivalDrag'

interface SurvivalStage1Props {
  player: 'player1' | 'player2'
  onComplete: (passed: boolean) => void
}

/**
 * Stage 1 — Berlindung di Bawah Meja
 *
 * Teaching: Drop, Cover, Hold On
 *
 * Layout: Room with a table. Player must drag character under the table
 * and keep them there for 3 seconds.
 */
export default function SurvivalStage1({ player, onComplete }: SurvivalStage1Props) {
  const [holdTime, setHoldTime] = useState(0)
  const [isInZone, setIsInZone] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  const handleDrop = useCallback((zoneId: string | null) => {
    if (completedRef.current) return
    setIsInZone(zoneId === 'under-table')
  }, [])

  const handleMove = useCallback((_x: number, _y: number) => {
    // Position tracking during drag — not needed for stage 1
  }, [])

  const { registerCharacter, registerZone } = useSurvivalDrag(
    player,
    handleDrop,
    handleMove,
    !completed
  )

  // Hold timer: character must stay in zone for 3 seconds
  useEffect(() => {
    if (isInZone && !completed) {
      holdTimerRef.current = setInterval(() => {
        setHoldTime(prev => {
          const next = prev + 0.1
          if (next >= 3) {
            completedRef.current = true
            setCompleted(true)
            if (holdTimerRef.current) clearInterval(holdTimerRef.current)
            setTimeout(() => onComplete(true), 1000)
            return 3
          }
          return next
        })
      }, 100)
    } else {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current)
      setHoldTime(0)
    }
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current)
    }
  }, [isInZone, completed, onComplete])

  // Countdown timer
  useEffect(() => {
    if (completed) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          completedRef.current = true
          setCompleted(true)
          clearInterval(timer)
          setTimeout(() => onComplete(false), 1000)
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
            Tahap 1/4
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>
            Berlindung di Bawah Meja
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
          maxWidth: 400,
          lineHeight: 1.5,
        }}>
          Gempa terjadi! Jepit dan seret karakter ke <strong style={{ color: '#22C55E' }}>bawah meja</strong> untuk berlindung.
          Tahan selama 3 detik.
        </p>
      </div>

      {/* Room SVG scene */}
      <div style={{
        position: 'relative',
        width: 600,
        height: 400,
        margin: '0 auto',
      }}>
        {/* Room background */}
        <svg width="600" height="400" viewBox="0 0 600 400" style={{ position: 'absolute', inset: 0 }}>
          {/* Floor */}
          <rect x="0" y="300" width="600" height="100" fill="#1E293B" />
          <line x1="0" y1="300" x2="600" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Wall */}
          <rect x="0" y="0" width="600" height="300" fill="#0F172A" />

          {/* Wall pattern */}
          <rect x="40" y="40" width="120" height="80" rx="4" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <rect x="440" y="40" width="120" height="80" rx="4" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Table top */}
          <rect x="180" y="200" width="240" height="12" rx="3" fill="#78350F" stroke="#92400E" strokeWidth="1" />

          {/* Table legs */}
          <rect x="190" y="212" width="8" height="88" fill="#78350F" stroke="#92400E" strokeWidth="0.5" />
          <rect x="402" y="212" width="8" height="88" fill="#78350F" stroke="#92400E" strokeWidth="0.5" />

          {/* Table shadow */}
          <ellipse cx="300" cy="300" rx="130" ry="6" fill="rgba(0,0,0,0.3)" />

          {/* Decorative books on table */}
          <rect x="230" y="188" width="30" height="12" rx="2" fill="#3B82F6" opacity="0.6" />
          <rect x="270" y="185" width="25" height="15" rx="2" fill="#EF4444" opacity="0.6" />

          {/* Clock on wall */}
          <circle cx="300" cy="80" r="25" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="300" y1="80" x2="300" y2="62" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
          <line x1="300" y1="80" x2="312" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Under table zone (target) */}
        <div
          ref={(el) => registerZone('under-table', el)}
          style={{
            position: 'absolute',
            left: 198,
            top: 212,
            width: 204,
            height: 86,
            border: `2px dashed ${isInZone ? '#22C55E' : '#22C55E88'}`,
            borderRadius: 8,
            backgroundColor: isInZone ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.05)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {!isInZone && (
            <span style={{
              fontSize: 12,
              color: '#22C55E',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              opacity: 0.7,
            }}>
              🛡️ ZONA BERLINDUNG
            </span>
          )}
        </div>

        {/* Hold progress bar */}
        {isInZone && !completed && (
          <div style={{
            position: 'absolute',
            left: 220,
            top: 175,
            width: 160,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
            zIndex: 65,
          }}>
            <motion.div
              style={{
                height: '100%',
                borderRadius: 4,
                background: 'linear-gradient(90deg, #22C55E, #16A34A)',
                width: `${(holdTime / 3) * 100}%`,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        )}

        {/* Character (initial position: bottom right of room) */}
        <div style={{
          position: 'absolute',
          left: 460,
          top: 230,
          zIndex: 50,
        }}>
          <SurvivalCharacter onRegister={registerCharacter} size={64} />
        </div>

        {/* Earthquake shake effect */}
        {!completed && (
          <motion.div
            animate={{ x: [0, -2, 2, -1, 1, 0] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              border: '2px solid rgba(245,158,11,0.1)',
              borderRadius: 8,
            }}
          />
        )}

        {/* Success overlay */}
        {completed && (
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
                padding: '16px 32px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.2))',
                border: '2px solid #22C55E',
                boxShadow: '0 0 30px rgba(34,197,94,0.3)',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color: '#22C55E' }}>
                ✓ Berhasil Berlindung!
              </span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Educational tip */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: 12,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.15)',
        maxWidth: 500,
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          💡 <strong style={{ color: '#F59E0B' }}>DROP, COVER, HOLD ON</strong> — Saat gempa, segera berlindung
          di bawah meja yang kokoh, lindungi kepala dan leher, serta pegangan kuat pada kaki meja.
        </p>
      </div>
    </motion.div>
  )
}
