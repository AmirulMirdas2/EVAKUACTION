import { useEffect, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import type { CardData, JenisBencana } from '../../types/game.types'
import { BENCANA_COLORS, BENCANA_EMOJI } from '../../types/game.types'

interface CardProps {
  card: CardData
  jenisBencana: JenisBencana
  playerColor: string
  isPlaced: boolean
  /** Whether evaluation is showing (green/red borders) */
  evaluationResult?: 'correct' | 'incorrect' | null
  /** Register this card's DOM element for hit-testing */
  onRegister?: (cardId: string, element: HTMLElement | null) => void
}

/**
 * Card.tsx — Individual disaster procedure card.
 *
 * Visual states:
 * - Normal: soft shadow, rounded border
 * - Dragging: applied via CSS class .card-dragging from useDragGesture
 * - Placed: green border (correct) or red (incorrect) during evaluation
 *
 * The drag position is managed via direct DOM transform in useDragGesture,
 * NOT through Framer Motion, for optimal performance.
 * Framer Motion is only used for entrance/state-transition animations.
 */
function CardComponent({
  card,
  jenisBencana,
  playerColor,
  isPlaced,
  evaluationResult,
  onRegister,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imgErrorRef = useRef(false)

  // Register card element for hit-testing in useDragGesture
  useEffect(() => {
    if (onRegister && cardRef.current) {
      onRegister(card.id, cardRef.current)
    }
    return () => {
      if (onRegister) {
        onRegister(card.id, null)
      }
    }
  }, [card.id, onRegister])

  const placeholderColor = BENCANA_COLORS[jenisBencana]
  const emoji = BENCANA_EMOJI[jenisBencana]

  // Determine border color based on state
  let borderColor = 'rgba(255, 255, 255, 0.15)'
  if (evaluationResult === 'correct') {
    borderColor = '#22C55E'
  } else if (evaluationResult === 'incorrect') {
    borderColor = '#EF4444'
  } else if (isPlaced) {
    borderColor = playerColor + '88'
  }

  return (
    <motion.div
      ref={cardRef}
      data-card-id={card.id}
      className={`card-component ${isPlaced ? 'card-placed' : ''}`}
      style={{
        width: 120,
        height: 160,
        borderRadius: 12,
        border: `2px solid ${borderColor}`,
        backgroundColor: 'rgba(15, 15, 25, 0.9)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        cursor: isPlaced ? 'default' : 'grab',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        boxShadow: evaluationResult === 'correct'
          ? '0 0 20px rgba(34, 197, 94, 0.4), 0 4px 12px rgba(0,0,0,0.3)'
          : evaluationResult === 'incorrect'
            ? '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
        willChange: 'transform',
        zIndex: 10,
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      {/* Card image area / placeholder */}
      <div
        style={{
          width: '100%',
          height: 100,
          background: `linear-gradient(135deg, ${placeholderColor}33 0%, ${placeholderColor}11 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${placeholderColor}22 0%, transparent 50%), radial-gradient(circle at 80% 30%, ${placeholderColor}18 0%, transparent 40%)`,
          }}
        />

        {/* Try to load actual image, fallback to placeholder */}
        {!imgErrorRef.current ? (
          <img
            src={card.image}
            alt={card.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
            }}
            onError={() => {
              imgErrorRef.current = true
              // Force re-render by updating a parent-level state
              // For simplicity, we hide the img on error via CSS
              const imgEl = document.querySelector(
                `[data-card-id="${card.id}"] img`
              ) as HTMLImageElement | null
              if (imgEl) imgEl.style.display = 'none'
            }}
          />
        ) : null}

        {/* Placeholder emoji + label overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 32 }}>{emoji}</span>
          <span
            style={{
              fontSize: 8,
              color: placeholderColor,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            {jenisBencana.replace('_', ' ')}
          </span>
        </div>

        {/* Evaluation badge */}
        {evaluationResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: evaluationResult === 'correct' ? '#22C55E' : '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              zIndex: 5,
              boxShadow: `0 0 10px ${evaluationResult === 'correct' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
            }}
          >
            {evaluationResult === 'correct' ? '✓' : '✗'}
          </motion.div>
        )}
      </div>

      {/* Card label */}
      <div
        style={{
          padding: '6px 8px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
          height: 60,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 9,
            lineHeight: 1.3,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {card.label}
        </span>
      </div>

      {/* Player color accent bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${playerColor}, transparent)`,
          opacity: 0.6,
        }}
      />
    </motion.div>
  )
}

const Card = memo(CardComponent)
export default Card
