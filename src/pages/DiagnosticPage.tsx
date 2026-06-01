import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DiagnosticQuestion from '../components/diagnostic/DiagnosticQuestion'
import DiagnosticResult from '../components/diagnostic/DiagnosticResult'
import { useDiagnosticStore } from '../stores/diagnosticStore'

export default function DiagnosticPage() {
  const [started, setStarted] = useState(false)
  const currentQuestion = useDiagnosticStore((s) => s.currentQuestion)
  const isCompleted = useDiagnosticStore((s) => s.isCompleted)
  const setAnswer = useDiagnosticStore((s) => s.setAnswer)
  const nextQuestion = useDiagnosticStore((s) => s.nextQuestion)
  const initDiagnostic = useDiagnosticStore((s) => s.initDiagnostic)
  const shuffledQuestions = useDiagnosticStore((s) => s.shuffledQuestions)

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswer(questionId, answerId)
    nextQuestion()
  }

  const handleStart = () => {
    initDiagnostic() // Shuffle questions and options
    setStarted(true)
  }

  const bgStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #0B0F1A 0%, #111827 40%, #1E293B 100%)',
    overflow: 'auto',
  }

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} style={{ ...bgStyle, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ maxWidth: 520, textAlign: 'center', padding: '0 24px', zIndex: 10 }}>
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} style={{ fontSize: 56, marginBottom: 20 }}>📝</motion.div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Tes Diagnostik</h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Sebelum memulai game, jawab 10 soal berikut untuk mengukur pengetahuan awalmu tentang kesiapsiagaan bencana.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            {[{ icon: '📊', label: '10 Soal' }, { icon: '⏱️', label: 'Tanpa Batas Waktu' }, { icon: '🎯', label: 'Pilihan Ganda' }].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStart} style={{ padding: '16px 48px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(59,130,246,0.3)', fontFamily: "'Inter', sans-serif" }}>
            🚀 Mulai Tes
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  if (isCompleted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} style={bgStyle}>
        <DiagnosticResult />
      </motion.div>
    )
  }

  const currentSoal = shuffledQuestions[currentQuestion]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} style={{ ...bgStyle, padding: '40px 24px' }}>
      <AnimatePresence mode="wait">
        {currentSoal && (
          <DiagnosticQuestion key={currentSoal.id} soal={currentSoal} questionNumber={currentQuestion + 1} totalQuestions={shuffledQuestions.length} onAnswer={handleAnswer} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
