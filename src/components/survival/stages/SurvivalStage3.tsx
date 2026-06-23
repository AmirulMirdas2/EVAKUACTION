import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import SurvivalCharacter from '../SurvivalCharacter'
import { useSurvivalDrag } from '../../../hooks/useSurvivalDrag'

interface SurvivalStage3Props {
  player: 'player1' | 'player2'
  onComplete: (passed: boolean) => void
}

/**
 * Stage 3 — Evakuasi Melalui Tangga
 *
 * Teaching: Use stairs, NOT elevators during earthquake
 *
 * Layout: Hallway with elevator on left and stairs on right.
 * Player must drag character to the stairs (correct) not elevator (incorrect).
 */
export default function SurvivalStage3({ player, onComplete }: SurvivalStage3Props) {
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<'stairs' | 'elevator' | null>(null)
  const [timeLeft, setTimeLeft] = useState(12)
  const completedRef = useRef(false)

  const handleDrop = useCallback((zoneId: string | null) => {
    if (completedRef.current) return

    if (zoneId === 'stairs') {
      completedRef.current = true
      setCompleted(true)
      setResult('stairs')
      setTimeout(() => onComplete(true), 1500)
    } else if (zoneId === 'elevator') {
      completedRef.current = true
      setCompleted(true)
      setResult('elevator')
      setTimeout(() => onComplete(false), 2000)
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
            Tahap 3/4
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>
            Evakuasi — Tangga atau Lift?
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
          maxWidth: 420,
          lineHeight: 1.5,
        }}>
          Gempa berhenti sementara. Segera evakuasi! Pilih jalur yang <strong style={{ color: '#22C55E' }}>benar</strong> untuk keluar gedung.
        </p>
      </div>

      {/* Scene */}
      <div style={{
        position: 'relative',
        width: 700,
        height: 420,
        margin: '0 auto',
      }}>
        <svg width="700" height="420" viewBox="0 0 700 420" style={{ position: 'absolute', inset: 0 }}>
          {/* Floor */}
          <rect x="0" y="340" width="700" height="80" fill="#1E293B" />
          <line x1="0" y1="340" x2="700" y2="340" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Corridor wall */}
          <rect x="0" y="0" width="700" height="340" fill="#0F172A" />

          {/* Hallway lines */}
          <line x1="350" y1="0" x2="350" y2="340" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="8,4" />

          {/* EXIT sign */}
          <rect x="310" y="20" width="80" height="30" rx="4" fill="#22C55E" opacity="0.2" />
          <text x="350" y="40" textAnchor="middle" fill="#22C55E" fontSize="14" fontWeight="bold">EXIT</text>
        </svg>

        {/* ── Elevator Zone (LEFT — WRONG) ── */}
        <div
          ref={(el) => registerZone('elevator', el)}
          style={{
            position: 'absolute',
            left: 60,
            top: 80,
            width: 200,
            height: 250,
            borderRadius: 12,
            border: `2px solid ${result === 'elevator' ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
            backgroundColor: result === 'elevator' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Elevator SVG */}
          <svg width="100" height="140" viewBox="0 0 100 140">
            {/* Elevator frame */}
            <rect x="5" y="5" width="90" height="130" rx="6" fill="rgba(100,116,139,0.2)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            {/* Doors */}
            <rect x="15" y="20" width="32" height="100" rx="2" fill="rgba(148,163,184,0.15)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <rect x="53" y="20" width="32" height="100" rx="2" fill="rgba(148,163,184,0.15)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {/* Door seam */}
            <line x1="50" y1="20" x2="50" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* Up/Down buttons */}
            <circle cx="50" cy="13" r="4" fill="rgba(245,158,11,0.3)" stroke="#F59E0B" strokeWidth="1" />
          </svg>

          <span style={{ fontSize: 28 }}>🛗</span>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            LIFT
          </span>
        </div>

        {/* ── Stairs Zone (RIGHT — CORRECT) ── */}
        <div
          ref={(el) => registerZone('stairs', el)}
          style={{
            position: 'absolute',
            right: 60,
            top: 80,
            width: 200,
            height: 250,
            borderRadius: 12,
            border: `2px solid ${result === 'stairs' ? '#22C55E' : 'rgba(255,255,255,0.12)'}`,
            backgroundColor: result === 'stairs' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Stairs SVG */}
          <svg width="100" height="140" viewBox="0 0 100 140">
            {/* Stair steps */}
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <g key={i}>
                <rect
                  x={10 + i * 10}
                  y={20 + i * 16}
                  width={80 - i * 10}
                  height={14}
                  fill="rgba(34,197,94,0.1)"
                  stroke="rgba(34,197,94,0.3)"
                  strokeWidth="1"
                  rx="1"
                />
              </g>
            ))}
            {/* Railing */}
            <line x1="10" y1="15" x2="10" y2="135" stroke="rgba(34,197,94,0.3)" strokeWidth="2" />
            <line x1="90" y1="15" x2="90" y2="135" stroke="rgba(34,197,94,0.3)" strokeWidth="2" />
          </svg>

          <span style={{ fontSize: 28 }}>🪜</span>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            TANGGA DARURAT
          </span>
        </div>

        {/* Character (center bottom) */}
        <div style={{
          position: 'absolute',
          left: 318,
          top: 340,
          zIndex: 50,
        }}>
          <SurvivalCharacter onRegister={registerCharacter} size={64} />
        </div>

        {/* Result overlays */}
        {result === 'elevator' && (
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
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444', marginBottom: 8 }}>
                ❌ Jangan Gunakan Lift!
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                Lift bisa macet atau jatuh saat gempa
              </div>
            </motion.div>
          </motion.div>
        )}

        {result === 'stairs' && (
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
                ✓ Gunakan Tangga Darurat!
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
          💡 <strong style={{ color: '#F59E0B' }}>Gunakan Tangga, Bukan Lift</strong> — Saat gempa, lift bisa
          rusak, macet, atau jatuh. Selalu gunakan tangga darurat untuk evakuasi dari gedung bertingkat.
        </p>
      </div>
    </motion.div>
  )
}
