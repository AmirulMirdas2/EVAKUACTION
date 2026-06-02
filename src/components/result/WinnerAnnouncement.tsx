import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface WinnerAnnouncementProps {
  winner: 'player1' | 'player2' | 'draw'
  p1Score: number
  p2Score: number
}

/**
 * WinnerAnnouncement — Animated winner reveal with confetti burst.
 *
 * Shows a large pulsing text with the winner name or "SERI" message,
 * and fires canvas-confetti particles on mount.
 */
export default function WinnerAnnouncement({
  winner,
  p1Score,
  p2Score,
}: WinnerAnnouncementProps) {
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    const duration = 2500
    const end = Date.now() + duration

    // Use a diverse and festive color palette for the confetti
    const colors = [
      '#3B82F6', '#60A5FA', '#EF4444', '#F87171',
      '#F59E0B', '#FBBF24', '#10B981', '#34D399',
      '#A855F7', '#C084FC', '#EC4899', '#F472B6'
    ]

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.8 },
        colors,
      })
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.8 },
        colors,
      })
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [winner])

  const getText = () => {
    if (winner === 'draw') return 'SERI!'
    return winner === 'player1' ? 'PLAYER 1 MENANG!' : 'PLAYER 2 MENANG!'
  }

  const getSubtext = () => {
    if (winner === 'draw') return 'Pertandingan Seimbang 🤝'
    const diff = Math.abs(p1Score - p2Score)
    return `Unggul ${diff} poin!`
  }

  const getEmoji = () => {
    if (winner === 'draw') return '🤝'
    return '🎉'
  }

  const getColor = () => {
    if (winner === 'player1') return '#3B82F6'
    if (winner === 'player2') return '#EF4444'
    return '#F59E0B'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      style={{
        textAlign: 'center',
        marginBottom: 40,
      }}
    >
      {/* Trophy / emoji */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        style={{ fontSize: 64, marginBottom: 12 }}
      >
        {getEmoji()}
      </motion.div>

      {/* Winner text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: getColor(),
          letterSpacing: '0.04em',
          textShadow: `0 0 40px ${getColor()}44`,
          marginBottom: 8,
          lineHeight: 1.2,
        }}
      >
        {getText()}
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
        }}
      >
        {getSubtext()}
      </motion.p>
    </motion.div>
  )
}
