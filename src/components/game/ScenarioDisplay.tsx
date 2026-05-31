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
      <motion.div
        key={soal.id}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          width: '100%',
          maxWidth: 720,
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Main scenario card */}
        <div
          style={{
            width: '100%',
            borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.92) 0%, rgba(10, 10, 20, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${color}33`,
            padding: '14px 20px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${color}15`,
          }}
        >
          {/* Top row: badge + ronde indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            {/* Disaster type badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px 4px 8px',
                borderRadius: 20,
                backgroundColor: `${color}20`,
                border: `1px solid ${color}44`,
              }}
            >
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <span
                style={{
                  fontSize: 11,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 20,
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
                  <span style={{ fontSize: 12 }}>⏱️</span>
                  <span
                    style={{
                      fontSize: 13,
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
                  padding: '4px 10px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: 11,
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              style={{
                width: 4,
                minHeight: 36,
                borderRadius: 2,
                background: `linear-gradient(180deg, ${color} 0%, ${color}44 100%)`,
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.88)',
                fontWeight: 400,
                margin: 0,
              }}
            >
              {soal.skenario}
            </p>
          </div>

          {/* Instruction hint */}
          <div
            style={{
              marginTop: 10,
              textAlign: 'center',
              fontSize: 10,
              color: 'rgba(255, 255, 255, 0.35)',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            ✋ Cubit (pinch) kartu lalu seret ke slot yang benar
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
