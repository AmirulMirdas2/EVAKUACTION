import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RondeResult, CardResult, JenisBencana } from '../../types/game.types'
import { BENCANA_LABEL, BENCANA_EMOJI } from '../../types/game.types'

interface MistakeAnalysisProps {
  rondeHistory: RondeResult[]
}

/**
 * Simplified mistake item for the tabbed layout.
 */
function MistakeItem({ card }: { card: CardResult }) {
  return (
    <div
      style={{
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        padding: '12px 14px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ color: '#EF4444', fontWeight: 'bold', marginTop: -2 }}>✗</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
          Kartu "{card.cardLabel}"
        </div>
      </div>
      <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          Kamu letakkan: {card.wrongSlot === null ? (
            <span style={{ color: '#EF4444' }}>Tidak dijawab</span>
          ) : (
            <span style={{ color: '#EF4444' }}>urutan {card.wrongSlot}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          Seharusnya: <span style={{ color: '#22C55E' }}>urutan {card.correctSlot}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * All-correct badge per player for the active round.
 */
function RoundPerfectBadge() {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 18, color: '#22C55E' }}>✓</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>
        Semua jawaban benar!
      </div>
    </div>
  )
}

export default function MistakeAnalysis({ rondeHistory }: MistakeAnalysisProps) {
  if (rondeHistory.length === 0) return null

  // Find the first round with any mistake
  const defaultActiveRonde = Math.max(0, rondeHistory.findIndex(ronde =>
    [...ronde.player1Cards, ...ronde.player2Cards].some(card => !card.isCorrect)
  ))

  const [activeRondeIdx, setActiveRondeIdx] = useState<number>(defaultActiveRonde)
  const activeRonde = rondeHistory[activeRondeIdx]

  const totalCards = rondeHistory.flatMap(r => [...r.player1Cards, ...r.player2Cards]).length
  const bothPerfectOverall = totalCards > 0 && rondeHistory.flatMap(r => [...r.player1Cards, ...r.player2Cards]).every(c => c.isCorrect)

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', marginBottom: 36 }}>
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

      {bothPerfectOverall ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '32px 24px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,179,8,0.12) 50%, rgba(245,158,11,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F59E0B', marginBottom: 6 }}>
            SEMPURNA!
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Tidak ada kesalahan sama sekali! Kedua pemain menyusun semua kartu dengan benar.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {rondeHistory.map((ronde, idx) => {
              const isActive = idx === activeRondeIdx
              const hasMistake = [...ronde.player1Cards, ...ronde.player2Cards].some(c => !c.isCorrect)
              const emoji = BENCANA_EMOJI[ronde.jenisBencana as JenisBencana] || '🔥'
              const label = BENCANA_LABEL[ronde.jenisBencana as JenisBencana] || ronde.jenisBencana

              return (
                <button
                  key={ronde.ronde}
                  onClick={() => setActiveRondeIdx(idx)}
                  style={{
                    position: 'relative',
                    padding: '10px 16px',
                    borderRadius: 12,
                    border: `1px solid ${isActive ? (hasMistake ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)') : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: isActive 
                      ? (hasMistake ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)') 
                      : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700 }}>Ronde {ronde.ronde}</div>
                  <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{emoji}</span> <span>{label}</span>
                  </div>
                  
                  {/* Indicator Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: hasMistake ? '#EF4444' : '#22C55E',
                      border: '2px solid #111827',
                    }}
                  />
                </button>
              )
            })}
          </div>

          {/* Active Tab Content */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: '24px',
              overflow: 'hidden',
            }}
          >
            <AnimatePresence mode="wait">
              {activeRonde && (
                <motion.div
                  key={activeRonde.ronde}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 24,
                  }}
                >
                  {/* Player 1 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Player 1
                      </span>
                    </div>
                    
                    {activeRonde.player1Cards.filter(c => !c.isCorrect).length === 0 ? (
                      <RoundPerfectBadge />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeRonde.player1Cards.filter(c => !c.isCorrect).map((c, i) => (
                          <MistakeItem key={`p1-${c.cardId}-${i}`} card={c} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Player 2 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Player 2
                      </span>
                    </div>
                    
                    {activeRonde.player2Cards.filter(c => !c.isCorrect).length === 0 ? (
                      <RoundPerfectBadge />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeRonde.player2Cards.filter(c => !c.isCorrect).map((c, i) => (
                          <MistakeItem key={`p2-${c.cardId}-${i}`} card={c} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
