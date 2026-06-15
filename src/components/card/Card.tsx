import { useEffect, useRef, memo, useState } from 'react'
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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
      id={card.id}
      data-card-id={card.id}
      className={`card-component ${isPlaced ? 'card-placed' : ''}`}
      style={{
        width: isPlaced ? '100%' : 160,
        minHeight: isPlaced ? '100%' : 208,
        height: isPlaced ? '100%' : 'auto',
        borderRadius: 12,
        border: `2px solid ${borderColor}`,
        backgroundColor: 'rgba(15, 15, 25, 0.9)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        cursor: isPlaced ? 'default' : 'grab',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Card image area — fixed 120px height, flex-shrink-0 so it doesn't compress */}
      <div
        style={{
          width: '100%',
          height: 120,
          background: `linear-gradient(135deg, ${placeholderColor}33 0%, ${placeholderColor}11 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Fallback placeholder (shows on error/missing image) */}
        {imageError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: placeholderColor ?? '#374151',
              opacity: 0.3,
            }}
          />
        )}
        {imageError && (
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
            <span style={{ fontSize: 36 }}>{emoji}</span>
            <span
              style={{
                fontSize: 9,
                color: '#fff',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              {jenisBencana.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Skeleton Shimmer — only while loading, removed once loaded */}
        {!imageLoaded && !imageError && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%)',
              backgroundSize: '200% 100%',
              zIndex: 3,
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Actual Image — purely inline styles, no Tailwind class conflicts */}
        {!imageError && (
          <img
            src={card.image}
            alt={card.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              zIndex: 4,
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

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

      {/* Card label — flex-grow, text wraps fully without truncation */}
      <div
        style={{
          padding: '8px 8px',
          background: 'rgba(0,0,0,0.85)',
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.3,
            color: '#fff',
            fontWeight: 600,
            textAlign: 'center',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            display: 'block',
            margin: 0,
          }}
        >
          {card.label}
        </p>
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
