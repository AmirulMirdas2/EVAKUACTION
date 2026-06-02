import { useEffect, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import type { CardData, JenisBencana, CardPosition } from '../../types/game.types'
import { BENCANA_COLORS, BENCANA_EMOJI } from '../../types/game.types'

interface AnswerAnchorProps {
  slot: number
  player: 'player1' | 'player2'
  playerColor: string
  jenisBencana: JenisBencana
  /** Card placed in this slot (if any) */
  placedCard: CardPosition | null
  /** The actual card data for the placed card */
  cardData: CardData | null
  /** Evaluation result — only shown after submit/time-up */
  evaluationResult?: 'correct' | 'incorrect' | null
  /** Register this anchor's DOM element for hit-testing */
  onRegister?: (slot: number, element: HTMLElement | null) => void
  /** Register the placed card for hit-testing */
  onRegisterCard?: (cardId: string, element: HTMLElement | null) => void
}

/**
 * AnswerAnchor.tsx — Target slot where cards are dropped.
 *
 * Visual states:
 * - Empty: dashed border, transparent background, slot number
 * - Hover: highlighted border & background (managed via CSS class 'anchor-hover')
 * - Filled: displays the placed card's info
 * - Evaluation: green border (correct) or red (incorrect)
 */
function AnswerAnchorComponent({
  slot,
  player,
  playerColor,
  jenisBencana,
  placedCard,
  cardData,
  evaluationResult,
  onRegister,
  onRegisterCard,
}: AnswerAnchorProps) {
  const anchorRef = useRef<HTMLDivElement>(null)

  // Register anchor element for hit-testing
  useEffect(() => {
    if (onRegister && anchorRef.current) {
      onRegister(slot, anchorRef.current)
    }
    return () => {
      if (onRegister) {
        onRegister(slot, null)
      }
    }
  }, [slot, onRegister])

  // Re-register on resize to update bounding rects
  useEffect(() => {
    const handleResize = () => {
      if (onRegister && anchorRef.current) {
        onRegister(slot, anchorRef.current)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [slot, onRegister])

  const placeholderColor = BENCANA_COLORS[jenisBencana]
  const emoji = BENCANA_EMOJI[jenisBencana]

  // Determine border styling
  let borderStyle = '2px dashed rgba(255, 255, 255, 0.2)'
  let bgColor = 'rgba(255, 255, 255, 0.03)'
  let shadowStyle = 'none'

  if (evaluationResult === 'correct') {
    borderStyle = '2px solid #22C55E'
    bgColor = 'rgba(34, 197, 94, 0.1)'
    shadowStyle = '0 0 15px rgba(34, 197, 94, 0.3), inset 0 0 15px rgba(34, 197, 94, 0.05)'
  } else if (evaluationResult === 'incorrect') {
    borderStyle = '2px solid #EF4444'
    bgColor = 'rgba(239, 68, 68, 0.1)'
    shadowStyle = '0 0 15px rgba(239, 68, 68, 0.3), inset 0 0 15px rgba(239, 68, 68, 0.05)'
  } else if (placedCard) {
    borderStyle = `2px solid ${playerColor}66`
    bgColor = `${playerColor}11`
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <motion.div
        ref={anchorRef}
        data-anchor-slot={slot}
        data-anchor-player={player}
        className="answer-anchor"
        style={{
          width: 130,
          height: 170,
          borderRadius: 14,
          border: borderStyle,
          backgroundColor: bgColor,
          boxShadow: shadowStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: slot * 0.08 }}
      >
        {placedCard && cardData ? (
          /* ── Filled state: show placed card info ── */
          <motion.div
            ref={(el) => {
              if (onRegisterCard) onRegisterCard(placedCard.id, el)
            }}
            data-card-id={placedCard.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotateY: placedCard.isFaceDown ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              transformStyle: 'preserve-3d',
              position: 'relative',
              backgroundColor: placedCard.isFaceDown ? 'transparent' : 'inherit',
            }}
          >
            {/* ── Front Face ── */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8
            }}>
              {/* Mini card preview */}
              <div
                style={{
                  width: 80,
                  height: 60,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${placeholderColor}44 0%, ${placeholderColor}22 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={cardData.image}
                  alt={cardData.label}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {/* Fallback emoji behind image */}
                <span style={{ fontSize: 24, position: 'absolute', zIndex: -1 }}>{emoji}</span>
              </div>
              <span
                style={{
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.8)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontWeight: 500,
                }}
              >
                {cardData.label}
              </span>

              {/* Evaluation badge */}
              {evaluationResult && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: evaluationResult === 'correct' ? '#22C55E' : '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: `0 0 10px ${evaluationResult === 'correct' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }}
                >
                  {evaluationResult === 'correct' ? '✓' : '✗'}
                </motion.div>
              )}
            </div>

            {/* ── Back Face (Face Down) ── */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
              background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}44 100%)`,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `inset 0 0 20px ${playerColor}88`,
            }}>
              <span style={{ fontSize: 32, opacity: 0.5 }}>🛡️</span>
            </div>
          </motion.div>
        ) : (
          /* ── Empty state: show slot number ── */
          <>
            {/* Slot number */}
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.12)',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1,
              }}
            >
              {slot}
            </span>
            {/* Drop hint icon */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                marginTop: 8,
                fontSize: 16,
                opacity: 0.3,
              }}
            >
              ↓
            </motion.div>
          </>
        )}

        {/* Hover highlight overlay (controlled via CSS class from useDragGesture) */}
        <div
          className="anchor-hover-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            background: `radial-gradient(circle at center, ${playerColor}22 0%, transparent 70%)`,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Step label */}
      <span
        style={{
          fontSize: 10,
          color: 'rgba(255, 255, 255, 0.4)',
          fontWeight: 600,
          letterSpacing: '0.03em',
        }}
      >
        Langkah {slot}
      </span>
    </div>
  )
}

const AnswerAnchor = memo(AnswerAnchorComponent)
export default AnswerAnchor
