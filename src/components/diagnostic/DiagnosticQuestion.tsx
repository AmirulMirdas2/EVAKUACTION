import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DiagnosticSoal } from '../../types/diagnostic.types'

interface DiagnosticQuestionProps {
  soal: DiagnosticSoal
  questionNumber: number
  totalQuestions: number
  onAnswer: (questionId: string, answerId: string) => void
}

/**
 * DiagnosticQuestion — Renders a single multiple-choice diagnostic question.
 *
 * Shows question text, 4 clickable option cards, instant feedback
 * (correct/incorrect), explanation, then auto-advances after 2s.
 */
export default function DiagnosticQuestion({
  soal,
  questionNumber,
  totalQuestions,
  onAnswer,
}: DiagnosticQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null)
    setShowResult(false)
  }, [soal.id])

  const handleSelect = (answerId: string) => {
    if (selectedAnswer) return // Already answered
    setSelectedAnswer(answerId)
    setShowResult(true)

    // Auto-advance after 2.5 seconds
    setTimeout(() => {
      onAnswer(soal.id, answerId)
    }, 2500)
  }

  const getOptionStyle = (optionId: string) => {
    const base: React.CSSProperties = {
      width: '100%',
      padding: '16px 20px',
      borderRadius: 14,
      border: '2px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 500,
      textAlign: 'left',
      cursor: selectedAnswer ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily: "'Inter', sans-serif",
    }

    if (!showResult) return base

    if (optionId === soal.jawaban_benar) {
      return {
        ...base,
        border: '2px solid #22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)',
      }
    }
    if (optionId === selectedAnswer && optionId !== soal.jawaban_benar) {
      return {
        ...base,
        border: '2px solid #EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
      }
    }
    return {
      ...base,
      opacity: 0.4,
    }
  }

  const getOptionBadgeStyle = (optionId: string) => {
    const base: React.CSSProperties = {
      width: 36,
      height: 36,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 700,
      flexShrink: 0,
      border: '1px solid rgba(255, 255, 255, 0.15)',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase' as const,
    }

    if (!showResult) return base

    if (optionId === soal.jawaban_benar) {
      return {
        ...base,
        border: '1px solid #22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        color: '#22C55E',
      }
    }
    if (optionId === selectedAnswer && optionId !== soal.jawaban_benar) {
      return {
        ...base,
        border: '1px solid #EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        color: '#EF4444',
      }
    }
    return base
  }

  const progress = (questionNumber / totalQuestions) * 100

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={soal.id}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{
          width: '100%',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Soal {questionNumber} dari {totalQuestions}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#F59E0B',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
              }}
            />
          </div>
        </div>

        {/* Question text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.5,
            marginBottom: 28,
            letterSpacing: '-0.01em',
          }}
        >
          {soal.pertanyaan}
        </motion.h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {soal.pilihan.map((option, idx) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.07, duration: 0.35 }}
              whileHover={!selectedAnswer ? { scale: 1.02, borderColor: 'rgba(255,255,255,0.25)' } : {}}
              whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option.id)}
              style={getOptionStyle(option.id)}
            >
              <span style={getOptionBadgeStyle(option.id)}>{option.id}</span>
              <span style={{ flex: 1 }}>{option.teks}</span>
              {showResult && option.id === soal.jawaban_benar && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 20, flexShrink: 0 }}
                >
                  ✓
                </motion.span>
              )}
              {showResult &&
                option.id === selectedAnswer &&
                option.id !== soal.jawaban_benar && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: 20, flexShrink: 0 }}
                  >
                    ✗
                  </motion.span>
                )}
            </motion.button>
          ))}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                marginTop: 20,
                padding: '16px 20px',
                borderRadius: 14,
                backgroundColor:
                  selectedAnswer === soal.jawaban_benar
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${
                  selectedAnswer === soal.jawaban_benar
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'
                }`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color:
                    selectedAnswer === soal.jawaban_benar ? '#22C55E' : '#EF4444',
                  marginBottom: 6,
                }}
              >
                {selectedAnswer === soal.jawaban_benar
                  ? '✓ Jawaban Benar!'
                  : '✗ Jawaban Salah'}
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0,
                }}
              >
                {soal.penjelasan}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
