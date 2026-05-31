import { motion } from 'framer-motion'
import type { RondeResult } from '../../types/game.types'
import { BENCANA_EMOJI, BENCANA_LABEL } from '../../types/game.types'
import type { JenisBencana } from '../../types/game.types'

interface RondeSummaryProps {
  rondeHistory: RondeResult[]
}

/**
 * RondeSummary — Table recap of each round showing disaster type,
 * per-card correctness, and player scores.
 */
export default function RondeSummary({ rondeHistory }: RondeSummaryProps) {
  if (!rondeHistory || rondeHistory.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      style={{
        maxWidth: 600,
        margin: '0 auto',
        marginBottom: 36,
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        📋 Rekap Per Ronde
      </h3>

      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      >
        {rondeHistory.map((ronde, idx) => {
          const emoji = BENCANA_EMOJI[ronde.jenisBencana as JenisBencana] || '🔥'
          const label = BENCANA_LABEL[ronde.jenisBencana as JenisBencana] || ronde.jenisBencana

          return (
            <motion.div
              key={ronde.ronde}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + idx * 0.1, duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 20px',
                gap: 16,
                borderBottom:
                  idx < rondeHistory.length - 1
                    ? '1px solid rgba(255,255,255,0.06)'
                    : 'none',
              }}
            >
              {/* Round number */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  flexShrink: 0,
                }}
              >
                {ronde.ronde}
              </div>

              {/* Disaster type */}
              <div style={{ flex: '0 0 120px' }}>
                <span style={{ fontSize: 16, marginRight: 6 }}>{emoji}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Player 1 cards */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#3B82F6',
                    marginRight: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  P1
                </span>
                {ronde.player1Cards.map((card, cIdx) => (
                  <span
                    key={cIdx}
                    style={{
                      fontSize: 14,
                      color: card.isCorrect ? '#22C55E' : '#EF4444',
                    }}
                  >
                    {card.isCorrect ? '✓' : '✗'}
                  </span>
                ))}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  +{ronde.player1Score}
                </span>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: 1,
                  height: 24,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              />

              {/* Player 2 cards */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#EF4444',
                    marginRight: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  P2
                </span>
                {ronde.player2Cards.map((card, cIdx) => (
                  <span
                    key={cIdx}
                    style={{
                      fontSize: 14,
                      color: card.isCorrect ? '#22C55E' : '#EF4444',
                    }}
                  >
                    {card.isCorrect ? '✓' : '✗'}
                  </span>
                ))}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  +{ronde.player2Score}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
