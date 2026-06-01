import { motion } from 'framer-motion'
import type { RondeResult, CardResult, JenisBencana } from '../../types/game.types'
import { BENCANA_LABEL, BENCANA_EMOJI } from '../../types/game.types'

interface MistakeAnalysisProps {
  rondeHistory: RondeResult[]
}

/**
 * Groups mistakes by player from all rondes.
 */
function getMistakesByPlayer(
  rondeHistory: RondeResult[],
  player: 'player1' | 'player2'
) {
  const mistakes: {
    ronde: number
    jenisBencana: string
    penjelasan: string
    card: CardResult
  }[] = []

  for (const ronde of rondeHistory) {
    const cards = player === 'player1' ? ronde.player1Cards : ronde.player2Cards
    for (const card of cards) {
      if (!card.isCorrect) {
        mistakes.push({
          ronde: ronde.ronde,
          jenisBencana: ronde.jenisBencana,
          penjelasan: ronde.penjelasan,
          card,
        })
      }
    }
  }

  return mistakes
}

/**
 * Single mistake item card.
 */
function MistakeCard({
  ronde,
  jenisBencana,
  card,
  playerColor,
}: {
  ronde: number
  jenisBencana: string
  card: CardResult
  playerColor: string
}) {
  const emoji = BENCANA_EMOJI[jenisBencana as JenisBencana] || '🔥'
  const label = BENCANA_LABEL[jenisBencana as JenisBencana] || jenisBencana

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        borderRadius: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Error icon top-left */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 22,
          height: 22,
          borderRadius: 6,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          color: '#EF4444',
        }}
      >
        ✗
      </div>

      {/* Round header */}
      <div
        style={{
          marginLeft: 32,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: playerColor,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Ronde {ronde} — {label}
        </span>
      </div>

      {/* Card detail */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
        }}
      >
        {/* Mini card */}
        <div
          style={{
            width: 80,
            height: 110,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {card.cardImage ? (
            <img
              src={card.cardImage}
              alt={card.cardLabel}
              style={{
                width: '100%',
                height: '70%',
                objectFit: 'cover',
                borderRadius: '10px 10px 0 0',
              }}
              onError={(e) => {
                // Fallback if image not found
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : null}
          <div
            style={{
              fontSize: 8,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              padding: '4px 6px',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {card.cardLabel}
          </div>
        </div>

        {/* Arrow + slot comparison */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {/* Wrong slot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: '#EF4444',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {card.wrongSlot ?? '—'}
            </div>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>→</span>
            {/* Correct slot */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: '#22C55E',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {card.correctSlot}
            </div>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Salah → Benar
          </span>
        </div>
      </div>

      {/* Explanation text */}
      <p
        style={{
          fontSize: 11,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 10,
        }}
      >
        Kamu meletakkan kartu <strong style={{ color: 'rgba(255,255,255,0.8)' }}>"{card.cardLabel}"</strong> di urutan{' '}
        <strong style={{ color: '#EF4444' }}>{card.wrongSlot ?? '—'}</strong>, seharusnya urutan{' '}
        <strong style={{ color: '#22C55E' }}>{card.correctSlot}</strong>.
      </p>
    </motion.div>
  )
}

/**
 * All-correct badge per player.
 */
function PerfectBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      style={{
        padding: '20px 24px',
        borderRadius: 14,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#22C55E',
          letterSpacing: '0.02em',
        }}
      >
        Sempurna! Semua jawaban benar
      </div>
    </motion.div>
  )
}

/**
 * Golden banner when both players have zero mistakes.
 */
function GoldenPerfect() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '32px 24px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,179,8,0.12) 50%, rgba(245,158,11,0.08) 100%)',
        border: '1px solid rgba(245,158,11,0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated glow */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        style={{ fontSize: 48, marginBottom: 12, position: 'relative', zIndex: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🏅
      </motion.div>
      <motion.h3
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#F59E0B',
          marginBottom: 6,
          letterSpacing: '0.02em',
          position: 'relative',
          zIndex: 1,
          textShadow: '0 0 20px rgba(245,158,11,0.3)',
        }}
        animate={{
          textShadow: [
            '0 0 20px rgba(245,158,11,0.3)',
            '0 0 30px rgba(245,158,11,0.5)',
            '0 0 20px rgba(245,158,11,0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        SEMPURNA!
      </motion.h3>
      <p
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Tidak ada kesalahan sama sekali! Kedua pemain menyusun semua kartu dengan benar.
      </p>
    </motion.div>
  )
}

/**
 * MistakeAnalysis — Detailed breakdown of card placement errors per player.
 *
 * Displays each incorrectly placed card with visual comparison of
 * the chosen slot vs the correct slot, plus explanatory text.
 */
export default function MistakeAnalysis({ rondeHistory }: MistakeAnalysisProps) {
  const p1Mistakes = getMistakesByPlayer(rondeHistory, 'player1')
  const p2Mistakes = getMistakesByPlayer(rondeHistory, 'player2')

  const bothPerfect = p1Mistakes.length === 0 && p2Mistakes.length === 0

  return (
    <div
      style={{
        maxWidth: 700,
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
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        🔍 Analisis Kesalahan
      </h3>

      {bothPerfect ? (
        <GoldenPerfect />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}
        >
          {/* Player 1 column */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#3B82F6',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#3B82F6',
                }}
              />
              Player 1
              {p1Mistakes.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ({p1Mistakes.length} kesalahan)
                </span>
              )}
            </div>

            {p1Mistakes.length === 0 ? (
              <PerfectBadge />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p1Mistakes.map((m, idx) => (
                  <MistakeCard
                    key={`p1-${m.ronde}-${m.card.cardId}-${idx}`}
                    ronde={m.ronde}
                    jenisBencana={m.jenisBencana}
                    card={m.card}
                    playerColor="#3B82F6"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Player 2 column */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#EF4444',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#EF4444',
                }}
              />
              Player 2
              {p2Mistakes.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ({p2Mistakes.length} kesalahan)
                </span>
              )}
            </div>

            {p2Mistakes.length === 0 ? (
              <PerfectBadge />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p2Mistakes.map((m, idx) => (
                  <MistakeCard
                    key={`p2-${m.ronde}-${m.card.cardId}-${idx}`}
                    ronde={m.ronde}
                    jenisBencana={m.jenisBencana}
                    card={m.card}
                    playerColor="#EF4444"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
