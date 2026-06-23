import { motion } from 'framer-motion'
import type { StageScore } from './EarthquakeSurvivalChallenge'

interface SurvivalResultProps {
  stageScores: StageScore[]
  onComplete: () => void
}

/**
 * SurvivalResult — Final results display for the earthquake survival challenge.
 *
 * Shows per-stage breakdown and total score with premium styling.
 */
export default function SurvivalResult({ stageScores, onComplete }: SurvivalResultProps) {
  const totalScore = stageScores.reduce((sum, s) => sum + s.score, 0)
  const totalMax = stageScores.reduce((sum, s) => sum + s.maxScore, 0)
  const allPassed = stageScores.every(s => s.passed)

  return (
    <motion.div
      key="survival-result"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{
          width: 520,
          borderRadius: 24,
          background: 'linear-gradient(180deg, rgba(15,15,30,0.97) 0%, rgba(10,10,25,0.97) 100%)',
          border: `1px solid ${allPassed ? '#22C55E33' : '#F59E0B33'}`,
          padding: '32px 40px',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${allPassed ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)'}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 200,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${allPassed ? '#22C55E' : '#F59E0B'}, transparent)`,
          borderRadius: '0 0 4px 4px',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
            style={{ fontSize: 56, marginBottom: 8 }}
          >
            {allPassed ? '🏆' : '🎯'}
          </motion.div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 4px',
            letterSpacing: '0.02em',
          }}>
            HASIL SURVIVAL CHALLENGE
          </h2>
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}>
            Simulasi Mitigasi Gempa Bumi
          </p>
        </div>

        {/* Score display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginBottom: 28,
            padding: '16px 0',
            borderRadius: 16,
            background: allPassed
              ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.05))'
              : 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.05))',
            border: `1px solid ${allPassed ? '#22C55E22' : '#F59E0B22'}`,
          }}
        >
          <div style={{
            fontSize: 48,
            fontWeight: 900,
            color: allPassed ? '#22C55E' : '#F59E0B',
            fontFamily: "'JetBrains Mono', monospace",
            textShadow: `0 0 20px ${allPassed ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>
            {totalScore}/{totalMax}
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Total Poin
          </div>
        </motion.div>

        {/* Stage breakdown */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 28,
        }}>
          {stageScores.map((score, i) => (
            <motion.div
              key={score.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Stage number */}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: score.passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${score.passed ? '#22C55E44' : '#EF444444'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: score.passed ? '#22C55E' : '#EF4444',
                flexShrink: 0,
              }}>
                {score.stage}
              </div>

              {/* Stage title */}
              <span style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
              }}>
                {score.title}
              </span>

              {/* Pass/Fail badge */}
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: score.passed ? '#22C55E' : '#EF4444',
              }}>
                {score.passed ? '✓ LULUS' : '✗ GAGAL'}
              </span>

              {/* Score */}
              <span style={{
                fontSize: 16,
                fontWeight: 800,
                color: score.passed ? '#22C55E' : 'rgba(255,255,255,0.3)',
                fontFamily: "'JetBrains Mono', monospace",
                minWidth: 40,
                textAlign: 'right',
              }}>
                +{score.score}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Motivational message */}
        <div style={{
          padding: '12px 20px',
          borderRadius: 12,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.12)',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
            {allPassed
              ? '🌟 Sempurna! Kamu sudah menguasai langkah-langkah mitigasi gempa bumi. Ingat selalu: DROP, COVER, HOLD ON!'
              : '💪 Terus belajar! Pemahaman tentang mitigasi bencana sangat penting untuk keselamatanmu.'}
          </p>
        </div>

        {/* Continue button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            style={{
              padding: '14px 40px',
              borderRadius: 14,
              border: 'none',
              background: allPassed
                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              boxShadow: allPassed
                ? '0 4px 20px rgba(34,197,94,0.4)'
                : '0 4px 20px rgba(245,158,11,0.4)',
            }}
          >
            ➡️ LANJUTKAN
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
