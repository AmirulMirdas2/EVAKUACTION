import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ScoreBoardProps {
  p1Score: number
  p2Score: number
  winner: 'player1' | 'player2' | 'draw'
}

/**
 * ScoreBoard — Animated side-by-side score display with count-up effect.
 *
 * Each player's score animates from 0 to final value.
 * Winner gets a crown badge.
 */
export default function ScoreBoard({ p1Score, p2Score, winner }: ScoreBoardProps) {
  const [displayP1, setDisplayP1] = useState(0)
  const [displayP2, setDisplayP2] = useState(0)

  // Count-up animation
  useEffect(() => {
    const duration = 1500
    const steps = 30
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayP1(Math.round(eased * p1Score))
      setDisplayP2(Math.round(eased * p2Score))

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [p1Score, p2Score])

  const playerCardStyle = (
    color: string,
    isWinner: boolean
  ): React.CSSProperties => ({
    flex: 1,
    padding: '28px 20px',
    borderRadius: 20,
    background: `linear-gradient(180deg, ${color}15 0%, ${color}08 100%)`,
    border: `2px solid ${isWinner ? color + '66' : color + '22'}`,
    textAlign: 'center',
    position: 'relative',
    boxShadow: isWinner ? `0 0 30px ${color}15` : 'none',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      style={{
        display: 'flex',
        gap: 20,
        alignItems: 'stretch',
        marginBottom: 32,
        maxWidth: 500,
        margin: '0 auto 32px',
      }}
    >
      {/* Player 1 */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={playerCardStyle('#3B82F6', winner === 'player1')}
      >
        {winner === 'player1' && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 300 }}
            style={{
              position: 'absolute',
              top: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 28,
            }}
          >
            👑
          </motion.div>
        )}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#3B82F6',
            marginBottom: 12,
          }}
        >
          Player 1
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}
        >
          {displayP1}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          poin
        </div>
      </motion.div>

      {/* VS divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.08em',
          }}
        >
          VS
        </span>
      </div>

      {/* Player 2 */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={playerCardStyle('#EF4444', winner === 'player2')}
      >
        {winner === 'player2' && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 300 }}
            style={{
              position: 'absolute',
              top: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 28,
            }}
          >
            👑
          </motion.div>
        )}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#EF4444',
            marginBottom: 12,
          }}
        >
          Player 2
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}
        >
          {displayP2}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          poin
        </div>
      </motion.div>
    </motion.div>
  )
}
