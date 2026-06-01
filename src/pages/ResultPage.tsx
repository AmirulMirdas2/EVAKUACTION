import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { useDiagnosticStore } from '../stores/diagnosticStore'
import WinnerAnnouncement from '../components/result/WinnerAnnouncement'
import ScoreBoard from '../components/result/ScoreBoard'
import RondeSummary from '../components/result/RondeSummary'
import MistakeAnalysis from '../components/result/MistakeAnalysis'

/**
 * Stagger delay values for the reveal animation.
 */
const STAGGER = {
  title: 0.1,
  winner: 0.0,
  scoreBoard: 0.3,
  rondeSummary: 0.6,
  mistakeAnalysis: 0.9,
  buttons: 1.2,
}

export default function ResultPage() {
  const navigate = useNavigate()
  const p1Score = useGameStore((s) => s.player1.score)
  const p2Score = useGameStore((s) => s.player2.score)
  const rondeHistory = useGameStore((s) => s.rondeHistory)
  const resetDiagnostic = useDiagnosticStore((s) => s.resetDiagnostic)

  const winner: 'player1' | 'player2' | 'draw' =
    p1Score > p2Score ? 'player1' : p2Score > p1Score ? 'player2' : 'draw'

  const handlePlayAgain = () => {
    // Navigate to /game and pass a state flag so GameBoard knows to reset
    navigate('/game', { replace: true, state: { reset: true } })
  }

  const handleBackToHome = () => {
    resetDiagnostic()
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #0B0F1A 0%, #111827 40%, #1E293B 100%)',
        padding: '40px 24px',
        overflow: 'auto',
      }}
    >
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.title }}
        style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}
      >
        🏆 Hasil Pertandingan
      </motion.div>

      {/* Section 1: Winner Announcement */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.winner, duration: 0.5 }}
      >
        <WinnerAnnouncement winner={winner} p1Score={p1Score} p2Score={p2Score} />
      </motion.div>

      {/* Section 2: Score Board */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.scoreBoard, duration: 0.5 }}
      >
        <ScoreBoard p1Score={p1Score} p2Score={p2Score} winner={winner} />
      </motion.div>

      {/* Section 3: Ronde Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.rondeSummary, duration: 0.5 }}
      >
        <RondeSummary rondeHistory={rondeHistory} />
      </motion.div>

      {/* Section 4: Mistake Analysis (NEW) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.mistakeAnalysis, duration: 0.5 }}
      >
        <MistakeAnalysis rondeHistory={rondeHistory} />
      </motion.div>

      {/* Section 5: Navigation buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.buttons, duration: 0.5 }}
        style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          style={{
            padding: '14px 36px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          🎮 MAIN LAGI
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToHome}
          style={{
            padding: '14px 32px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          🏠 KEMBALI KE AWAL
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
