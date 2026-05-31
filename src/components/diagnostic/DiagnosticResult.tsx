import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getDiagnosticCategory } from '../../types/diagnostic.types'
import { useDiagnosticStore } from '../../stores/diagnosticStore'

/**
 * DiagnosticResult — Shows diagnostic score, category badge,
 * recommendation text, and navigation buttons.
 */
export default function DiagnosticResult() {
  const navigate = useNavigate()
  const score = useDiagnosticStore((s) => s.score)
  const resetDiagnostic = useDiagnosticStore((s) => s.resetDiagnostic)

  const category = getDiagnosticCategory(score)
  const totalQuestions = 10

  const handleStartGame = () => {
    navigate('/game')
  }

  const handleRetry = () => {
    resetDiagnostic()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      style={{
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* Score circle */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          margin: '0 auto 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))',
          border: '3px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.15)',
        }}
      >
        <span
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 2,
          }}
        >
          / {totalQuestions}
        </span>
      </motion.div>

      {/* Category badge */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: 0.4,
          duration: 0.5,
          type: 'spring',
          stiffness: 300,
          damping: 15,
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 28px',
          borderRadius: 50,
          background:
            'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 28 }}>{category.emoji}</span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#F59E0B',
            letterSpacing: '0.02em',
          }}
        >
          {category.label}
        </span>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 8,
          padding: '0 20px',
        }}
      >
        {category.description}
      </motion.p>

      {/* Recommendation */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 36,
          fontStyle: 'italic',
        }}
      >
        Rekomendasi: {category.recommendation}
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        style={{ display: 'flex', gap: 14, justifyContent: 'center' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartGame}
          style={{
            padding: '14px 36px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          🎮 MULAI GAME
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          style={{
            padding: '14px 28px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          🔄 Ulangi Tes
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
