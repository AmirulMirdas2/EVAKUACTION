import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SurvivalCharacter from '../SurvivalCharacter'
import { useSurvivalDrag } from '../../../hooks/useSurvivalDrag'

interface SurvivalStage2Props {
  player: 'player1' | 'player2'
  onComplete: (passed: boolean) => void
}

/**
 * Stage 2 — Menjauhi Kaca
 *
 * Teaching: Stay away from windows/glass during earthquake
 *
 * Layout: Room with windows on top. Glass starts cracking, then shatters.
 * Player must drag character to the safe zone before glass falls.
 */
export default function SurvivalStage2({ player, onComplete }: SurvivalStage2Props) {
  const [completed, setCompleted] = useState(false)
  const [glassCracking, setGlassCracking] = useState(false)
  const [glassShattered, setGlassShattered] = useState(false)
  const [charInDangerZone, setCharInDangerZone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(12)
  const completedRef = useRef(false)
  const charPosRef = useRef({ x: 0, y: 0 })

  // Start glass cracking after 3 seconds
  useEffect(() => {
    const crackTimer = setTimeout(() => setGlassCracking(true), 3000)
    const shatterTimer = setTimeout(() => {
      setGlassShattered(true)
      // Check if character is in danger zone when glass shatters
      setTimeout(() => {
        if (!completedRef.current) {
          // Check character position relative to glass zone
          const dangerEl = document.getElementById('stage2-danger-zone')
          const charEl = document.querySelector('.survival-character') as HTMLElement
          if (dangerEl && charEl) {
            const dangerRect = dangerEl.getBoundingClientRect()
            const charRect = charEl.getBoundingClientRect()
            const charCenterX = charRect.left + charRect.width / 2
            const charCenterY = charRect.top + charRect.height / 2
            const isInDanger = charCenterX >= dangerRect.left && charCenterX <= dangerRect.right &&
              charCenterY >= dangerRect.top && charCenterY <= dangerRect.bottom
            if (isInDanger) {
              setCharInDangerZone(true)
              completedRef.current = true
              setCompleted(true)
              setTimeout(() => onComplete(false), 1500)
            }
          }
        }
      }, 500)
    }, 7000)
    return () => {
      clearTimeout(crackTimer)
      clearTimeout(shatterTimer)
    }
  }, [onComplete])

  const handleDrop = useCallback((zoneId: string | null) => {
    if (completedRef.current) return
    if (zoneId === 'safe-zone') {
      completedRef.current = true
      setCompleted(true)
      setTimeout(() => onComplete(true), 1000)
    }
  }, [onComplete])

  const handleMove = useCallback((x: number, y: number) => {
    charPosRef.current = { x, y }
  }, [])

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

  // Generate glass shards for animation
  const shards = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 100 + Math.random() * 400,
      delay: Math.random() * 0.5,
      size: 8 + Math.random() * 16,
      rotation: Math.random() * 360,
    }))
  ).current

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
            Tahap 2/4
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>
            Menjauhi Kaca & Jendela
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
          Kaca jendela mulai retak! Segera pindahkan karakter ke <strong style={{ color: '#22C55E' }}>Safe Zone</strong> sebelum kaca pecah.
        </p>
      </div>

      {/* Room scene */}
      <div style={{
        position: 'relative',
        width: 650,
        height: 420,
        margin: '0 auto',
      }}>
        <svg width="650" height="420" viewBox="0 0 650 420" style={{ position: 'absolute', inset: 0 }}>
          {/* Floor */}
          <rect x="0" y="320" width="650" height="100" fill="#1E293B" />
          <line x1="0" y1="320" x2="650" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Wall */}
          <rect x="0" y="0" width="650" height="320" fill="#0F172A" />

          {/* Windows */}
          {[100, 260, 420].map((x, i) => (
            <g key={i}>
              {/* Window frame */}
              <rect x={x} y="60" width="100" height="120" rx="4" fill="rgba(135,206,250,0.15)" stroke={glassCracking ? '#EF4444' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
              {/* Window panes */}
              <line x1={x + 50} y1="60" x2={x + 50} y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1={x} y1="120" x2={x + 100} y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Cracks */}
              {glassCracking && (
                <>
                  <line x1={x + 30} y1="80" x2={x + 70} y2="130" stroke="#EF4444" strokeWidth="1.5" opacity="0.8" />
                  <line x1={x + 60} y1="90" x2={x + 40} y2="160" stroke="#EF4444" strokeWidth="1" opacity="0.6" />
                  <line x1={x + 20} y1="110" x2={x + 80} y2="150" stroke="#EF4444" strokeWidth="1" opacity="0.5" />
                </>
              )}

              {/* Window emoji label */}
              <text x={x + 50} y="50" textAnchor="middle" fontSize="24">🪟</text>
            </g>
          ))}
        </svg>

        {/* Danger zone (near windows) */}
        <div
          id="stage2-danger-zone"
          style={{
            position: 'absolute',
            left: 60,
            top: 40,
            width: 520,
            height: 200,
            border: `2px dashed ${glassShattered ? '#EF4444' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 8,
            backgroundColor: glassShattered ? 'rgba(239,68,68,0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 8,
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8 }}>
            ⚠️ ZONA BAHAYA — DEKAT KACA
          </span>
        </div>

        {/* Safe zone (bottom) */}
        <div
          ref={(el) => registerZone('safe-zone', el)}
          style={{
            position: 'absolute',
            left: 220,
            top: 330,
            width: 210,
            height: 70,
            border: '2px dashed #22C55E88',
            borderRadius: 8,
            backgroundColor: 'rgba(34,197,94,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <span style={{ fontSize: 13, color: '#22C55E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🟩 SAFE ZONE
          </span>
        </div>

        {/* Glass shards animation */}
        <AnimatePresence>
          {glassShattered && shards.map(shard => (
            <motion.div
              key={shard.id}
              initial={{
                x: shard.x,
                y: 60 + Math.random() * 120,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                y: 350 + Math.random() * 50,
                opacity: [0, 0.8, 0.6, 0],
                rotate: shard.rotation,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.8,
                delay: shard.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'absolute',
                width: shard.size,
                height: shard.size * 0.6,
                background: 'linear-gradient(135deg, rgba(147,197,253,0.8), rgba(191,219,254,0.4))',
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 60%, 60% 100%, 0% 80%)',
                pointerEvents: 'none',
                zIndex: 70,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Character (initial: near windows — in danger) */}
        <div style={{
          position: 'absolute',
          left: 280,
          top: 240,
          zIndex: 50,
        }}>
          <SurvivalCharacter onRegister={registerCharacter} size={64} />
        </div>

        {/* Hit by glass indicator */}
        {charInDangerZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(239,68,68,0.2)',
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
                background: 'rgba(239,68,68,0.15)',
                border: '2px solid #EF4444',
                boxShadow: '0 0 30px rgba(239,68,68,0.3)',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color: '#EF4444' }}>
                ✗ Terkena Pecahan Kaca!
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Success overlay */}
        {completed && !charInDangerZone && (
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
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid #22C55E',
                boxShadow: '0 0 30px rgba(34,197,94,0.3)',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color: '#22C55E' }}>
                ✓ Selamat dari Pecahan Kaca!
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Earthquake shake */}
        {!completed && (
          <motion.div
            animate={{ x: [0, -2, 3, -1, 2, 0] }}
            transition={{ duration: 0.25, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: 8,
            }}
          />
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
          💡 <strong style={{ color: '#F59E0B' }}>Jauhi Kaca & Jendela</strong> — Saat gempa, kaca jendela bisa
          pecah dan menyebabkan luka serius. Segera menjauh dari jendela, cermin, dan benda kaca lainnya.
        </p>
      </div>
    </motion.div>
  )
}
