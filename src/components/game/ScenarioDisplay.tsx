import { motion, AnimatePresence } from 'framer-motion'
import type { SoalData } from '../../types/game.types'
import { BENCANA_EMOJI, BENCANA_LABEL, BENCANA_COLORS } from '../../types/game.types'

interface ScenarioDisplayProps {
  soal: SoalData | null
  ronde: number
  maxRonde: number
  timeRemaining: number
  timerEnabled: boolean
}

/**
 * ScenarioDisplay.tsx — Shows the current disaster scenario question.
 *
 * Positioned at the top center of the screen, shared between both players.
 * Features animated entrance and a countdown timer.
 */
export default function ScenarioDisplay({
  soal,
  ronde,
  maxRonde,
  timeRemaining,
  timerEnabled,
}: ScenarioDisplayProps) {
  if (!soal) return null

  const emoji = BENCANA_EMOJI[soal.jenis_bencana]
  const label = BENCANA_LABEL[soal.jenis_bencana]
  const color = BENCANA_COLORS[soal.jenis_bencana]
  const isTimeWarning = timeRemaining <= 15
  const isTimeCritical = timeRemaining <= 5

  return (
    <AnimatePresence mode="wait">
      <div
        key={`wrapper-${soal.id}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          key={soal.id}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{
            width: '100%',
            maxWidth: 720,
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'none',
          }}
        >
        {/* Main scenario card */}
        <div
          style={{
            width: '100%',
            borderRadius: 20,
            background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.95) 0%, rgba(10, 10, 20, 0.90) 100%)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${color}44`,
            padding: '20px 28px',
            boxShadow: `0 12px 48px rgba(0,0,0,0.5), 0 0 30px ${color}20`,
          }}
        >
          {/* Top row: badge + ronde indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            {/* Disaster type badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px 6px 10px',
                borderRadius: 24,
                backgroundColor: `${color}25`,
                border: `1px solid ${color}55`,
              }}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: color,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </div>

            {/* Ronde indicator + Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Timer */}
              {timerEnabled && (
                <motion.div
                  animate={
                    isTimeCritical
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={
                    isTimeCritical
                      ? { duration: 0.5, repeat: Infinity }
                      : {}
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 24,
                    backgroundColor: isTimeCritical
                      ? 'rgba(239, 68, 68, 0.2)'
                      : isTimeWarning
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${
                      isTimeCritical
                        ? 'rgba(239, 68, 68, 0.5)'
                        : isTimeWarning
                          ? 'rgba(245, 158, 11, 0.4)'
                          : 'rgba(255,255,255,0.15)'
                    }`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⏱️</span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isTimeCritical
                        ? '#EF4444'
                        : isTimeWarning
                          ? '#F59E0B'
                          : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </motion.div>
              )}

              {/* Ronde */}
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.03em',
                }}
              >
                Ronde {ronde}/{maxRonde}
              </div>
            </div>
          </div>

          {/* Scenario text */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 5,
                minHeight: 44,
                borderRadius: 3,
                background: `linear-gradient(180deg, ${color} 0%, ${color}44 100%)`,
                flexShrink: 0,
                marginTop: 3,
              }}
            />
            <p
              style={{
                fontSize: 20,
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.92)',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {soal.skenario}
            </p>
          </div>

          {/* Instruction hint */}
          <div
            style={{
              marginTop: 14,
              textAlign: 'center',
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            ✋ Cubit (pinch) kartu lalu seret ke slot yang benar
          </div>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  )
}
