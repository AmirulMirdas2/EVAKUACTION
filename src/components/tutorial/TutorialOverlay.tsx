import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TUTORIAL_CARDS, type TutorialCard } from '../../data/tutorialCards'
import { liveHandDataRef } from '../../stores/gestureStore'

interface TutorialOverlayProps {
  onComplete: () => void
}

// Card dimensions matching Card.tsx
const CARD_W = 140
const CARD_H = 180
const CARD_HALF_W = CARD_W / 2
const CARD_HALF_H = CARD_H / 2

/**
 * TutorialOverlay — Interactive tutorial that teaches players how to
 * pinch-drag cards into anchor slots before the real game begins.
 *
 * Uses the same gesture system (liveHandDataRef) so players can practice
 * with real hand gestures on numbered tutorial cards.
 */
export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [phase, setPhase] = useState<'intro' | 'practice'>('intro')
  const [p1PlacedCount, setP1PlacedCount] = useState(0)
  const [p2PlacedCount, setP2PlacedCount] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const [showArrows, setShowArrows] = useState(true)

  const hasSeenBefore = localStorage.getItem('evakuaction-tutorial-seen') === 'true'

  // Phase 1: Show intro for 3 seconds then switch to practice
  useEffect(() => {
    const t = setTimeout(() => setPhase('practice'), 3000)
    return () => clearTimeout(t)
  }, [])

  // Show skip button after 10s (or immediately if returning player)
  useEffect(() => {
    if (hasSeenBefore) {
      setShowSkip(true)
    } else {
      const t = setTimeout(() => setShowSkip(true), 10000)
      return () => clearTimeout(t)
    }
  }, [hasSeenBefore])

  // Hide arrows after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowArrows(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const canStart = p1PlacedCount >= 1 && p2PlacedCount >= 1

  const handleComplete = () => {
    localStorage.setItem('evakuaction-tutorial-seen', 'true')
    onComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Semi-transparent backdrop — camera feed visible behind */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Phase 1: Intro overlay */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 110,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 64, marginBottom: 16 }}>🖐️</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: '#F59E0B' }}>
                Gunakan gerakan CUBIT
              </h2>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 500, lineHeight: 1.6 }}>
                untuk mengambil kartu lalu <strong>SERET</strong> ke slot jawaban!
              </p>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: 48, marginTop: 24 }}
              >
                🤏
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split-screen tutorial zones */}
      <div style={{
        position: 'relative', zIndex: 105,
        flex: 1, display: 'flex',
      }}>
        <TutorialPlayerZone
          player="player1"
          cards={TUTORIAL_CARDS.player1}
          playerColor="#3B82F6"
          playerLabel="Player 1"
          onPlacedChange={setP1PlacedCount}
          showArrows={showArrows}
        />
        {/* Center divider */}
        <div style={{
          width: 2, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
        }} />
        <TutorialPlayerZone
          player="player2"
          cards={TUTORIAL_CARDS.player2}
          playerColor="#EF4444"
          playerLabel="Player 2"
          onPlacedChange={setP2PlacedCount}
          showArrows={showArrows}
        />
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: 'relative', zIndex: 105,
        display: 'flex', justifyContent: 'center', gap: 24,
        padding: '16px 0 24px',
      }}>
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={handleComplete}
              style={{
                padding: '14px 32px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Lewati Tutorial
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canStart && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleComplete}
              style={{
                padding: '14px 40px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(34,197,94,0.4)',
                letterSpacing: '0.03em',
              }}
            >
              🎮 Mulai Bermain!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Instruction hint at bottom */}
      <div style={{
        position: 'relative', zIndex: 105,
        textAlign: 'center', paddingBottom: 16,
      }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          💡 Cubit kartu lalu seret ke slot manapun!
        </p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────── */
/*  Tutorial Player Zone (one per player)      */
/* ─────────────────────────────────────────── */

interface TutorialPlayerZoneProps {
  player: 'player1' | 'player2'
  cards: TutorialCard[]
  playerColor: string
  playerLabel: string
  onPlacedChange: (count: number) => void
  showArrows: boolean
}

interface SlotState {
  [slot: number]: string | null // cardId or null
}

function TutorialPlayerZone({
  player, cards, playerColor, playerLabel, onPlacedChange, showArrows,
}: TutorialPlayerZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardEls = useRef<Map<string, HTMLElement>>(new Map())
  const anchorEls = useRef<Map<number, HTMLElement>>(new Map())
  const dragRef = useRef<{
    cardId: string; el: HTMLElement; originRect: DOMRect;
    isDragging: boolean; cx: number; cy: number
  } | null>(null)
  const lastPinchRef = useRef(false)
  const hoveredSlotRef = useRef<number | null>(null)

  const [slots, setSlots] = useState<SlotState>({ 1: null, 2: null, 3: null, 4: null })
  const [placedIds, setPlacedIds] = useState<Set<string>>(new Set())

  // Report placed count upstream
  useEffect(() => {
    onPlacedChange(placedIds.size)
  }, [placedIds, onPlacedChange])

  const placeCard = useCallback((cardId: string, slot: number) => {
    setSlots(prev => {
      const updated = { ...prev }
      // Remove card from any other slot
      for (const s of Object.keys(updated)) {
        if (updated[Number(s)] === cardId) updated[Number(s)] = null
      }
      updated[slot] = cardId
      return updated
    })
    setPlacedIds(prev => { const n = new Set(prev); n.add(cardId); return n })
  }, [])

  // Gesture processing loop — same pattern as useDragGesture
  useEffect(() => {
    let running = true

    const process = () => {
      if (!running) return
      const hand = player === 'player1' ? liveHandDataRef.player1 : liveHandDataRef.player2
      const isPinching = hand?.isPinching ?? false

      if (hand) {
        const w = window.innerWidth
        const h = window.innerHeight
        const fx = (1 - hand.indexTipX) * w
        const fy = hand.indexTipY * h
        const wasPinching = lastPinchRef.current

        // Pinch start
        if (isPinching && !wasPinching) {
          for (const [cid, el] of cardEls.current.entries()) {
            if (placedIds.has(cid)) continue
            const r = el.getBoundingClientRect()
            if (fx >= r.left && fx <= r.right && fy >= r.top && fy <= r.bottom) {
              dragRef.current = { cardId: cid, el, originRect: r, isDragging: true, cx: fx, cy: fy }
              el.style.position = 'fixed'
              el.style.left = `${fx - CARD_HALF_W}px`
              el.style.top = `${fy - CARD_HALF_H}px`
              el.style.zIndex = '999'
              el.style.opacity = '0.9'
              el.style.transform = 'scale(1.1)'
              el.style.transition = 'none'
              el.style.margin = '0'
              break
            }
          }
        }

        // During drag
        if (isPinching && dragRef.current?.isDragging) {
          const ds = dragRef.current
          ds.el.style.left = `${fx - CARD_HALF_W}px`
          ds.el.style.top = `${fy - CARD_HALF_H}px`
          ds.cx = fx; ds.cy = fy

          // Hover detection on anchors
          let foundSlot: number | null = null
          for (const [slot, ael] of anchorEls.current.entries()) {
            const ar = ael.getBoundingClientRect()
            if (fx >= ar.left && fx <= ar.right && fy >= ar.top && fy <= ar.bottom) {
              foundSlot = slot; break
            }
          }
          if (foundSlot !== hoveredSlotRef.current) {
            if (hoveredSlotRef.current !== null) {
              const prev = anchorEls.current.get(hoveredSlotRef.current)
              if (prev) prev.style.borderColor = 'rgba(255,255,255,0.2)'
            }
            if (foundSlot !== null) {
              const next = anchorEls.current.get(foundSlot)
              if (next) next.style.borderColor = playerColor
            }
            hoveredSlotRef.current = foundSlot
          }
        }

        // Pinch end
        if (!isPinching && wasPinching && dragRef.current?.isDragging) {
          const ds = dragRef.current
          // Check drop
          let droppedSlot: number | null = null
          for (const [slot, ael] of anchorEls.current.entries()) {
            const ar = ael.getBoundingClientRect()
            if (ds.cx >= ar.left && ds.cx <= ar.right && ds.cy >= ar.top && ds.cy <= ar.bottom) {
              droppedSlot = slot; break
            }
          }

          // Reset hover
          if (hoveredSlotRef.current !== null) {
            const prev = anchorEls.current.get(hoveredSlotRef.current)
            if (prev) prev.style.borderColor = 'rgba(255,255,255,0.2)'
            hoveredSlotRef.current = null
          }

          if (droppedSlot !== null) {
            // Snap to anchor
            const ael = anchorEls.current.get(droppedSlot)
            if (ael) {
              const ar = ael.getBoundingClientRect()
              ds.el.style.transition = 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)'
              ds.el.style.left = `${ar.left + (ar.width - CARD_W) / 2}px`
              ds.el.style.top = `${ar.top + (ar.height - CARD_H) / 2}px`
              ds.el.style.transform = 'scale(1)'
              ds.el.style.opacity = '1'
              ds.el.style.zIndex = '50'
            }
            placeCard(ds.cardId, droppedSlot)
          } else {
            // Card stays at current position (user can re-pinch to continue)
            ds.el.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out'
            ds.el.style.transform = 'scale(1)'
            ds.el.style.opacity = '1'
            ds.el.style.zIndex = '10'
            // Keep position: fixed at current left/top so user can re-grab
          }
          dragRef.current = null
        }

        lastPinchRef.current = isPinching
      } else {
        // No hand — keep card at current position
        if (lastPinchRef.current && dragRef.current?.isDragging) {
          const ds = dragRef.current
          ds.el.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out'
          ds.el.style.transform = 'scale(1)'
          ds.el.style.opacity = '1'
          ds.el.style.zIndex = '10'
          // Keep position: fixed at current left/top so user can re-grab
          dragRef.current = null
        }
        lastPinchRef.current = false
      }

      requestAnimationFrame(process)
    }

    requestAnimationFrame(process)
    return () => { running = false }
  }, [player, placeCard, placedIds, playerColor])

  const visibleCards = useMemo(() => cards.filter(c => !placedIds.has(c.id)), [cards, placedIds])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        padding: '24px 12px 16px', position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 8, padding: '6px 14px', borderRadius: 12,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        border: `1px solid ${playerColor}44`,
      }}>
        <span style={{ fontSize: 16 }}>📖</span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: playerColor,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {playerLabel} — Tutorial
        </span>
      </div>

      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.6)',
        textAlign: 'center', margin: '0 0 12px',
      }}>
        Cubit kartu lalu seret ke slot manapun!
      </p>

      {/* Card grid */}
      <div style={{
        flex: '1 1 auto', display: 'flex', alignItems: 'center',
        justifyContent: 'center', width: '100%', position: 'relative',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(2, ${CARD_W}px)`,
          gap: 12, justifyContent: 'center',
        }}>
          {visibleCards.map(card => (
            <TutorialCardEl
              key={card.id}
              card={card}
              playerColor={playerColor}
              onRef={(el) => { if (el) cardEls.current.set(card.id, el); else cardEls.current.delete(card.id) }}
            />
          ))}
        </div>

        {/* Animated arrow hint */}
        {showArrows && visibleCards.length > 0 && (
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute', bottom: -10, left: '50%',
              transform: 'translateX(-50%)', fontSize: 28, opacity: 0.6,
              pointerEvents: 'none',
            }}
          >
            ↓
          </motion.div>
        )}
      </div>

      {/* Anchor slots */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center',
        flexWrap: 'wrap', padding: '12px 0',
      }}>
        {[1, 2, 3, 4].map(slot => {
          const filledCardId = slots[slot]
          const filledCard = filledCardId ? cards.find(c => c.id === filledCardId) : null
          return (
            <div
              key={slot}
              ref={el => { if (el) anchorEls.current.set(slot, el); else anchorEls.current.delete(slot) }}
              style={{
                width: CARD_W + 15, minHeight: CARD_H + 20, height: 'auto',
                borderRadius: 14,
                border: `2px dashed ${filledCard ? playerColor + '66' : 'rgba(255,255,255,0.2)'}`,
                backgroundColor: filledCard ? `${playerColor}11` : 'rgba(255,255,255,0.03)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease', position: 'relative',
              }}
            >
              {filledCard ? (
                <div style={{
                  fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center',
                }}>
                  ✓ Kartu {filledCard.number}
                </div>
              ) : (
                <>
                  <span style={{
                    fontSize: 36, fontWeight: 800,
                    color: 'rgba(255,255,255,0.1)', lineHeight: 1,
                  }}>
                    {slot}
                  </span>
                  {showArrows && (
                    <motion.span
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}
                    >
                      Letakkan di sini
                    </motion.span>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  Individual tutorial card                    */
/* ─────────────────────────────────────────── */

interface TutorialCardElProps {
  card: TutorialCard
  playerColor: string
  onRef: (el: HTMLElement | null) => void
}

function TutorialCardEl({ card, playerColor, onRef }: TutorialCardElProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      ref={onRef}
      id={card.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        width: CARD_W, minHeight: CARD_H, height: 'auto',
        borderRadius: 12, overflow: 'hidden',
        border: `2px solid ${playerColor}55`,
        backgroundColor: 'rgba(15,15,25,0.9)',
        cursor: 'grab', userSelect: 'none',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 4px 12px rgba(0,0,0,0.4), 0 0 8px ${playerColor}22`,
        position: 'relative',
      }}
    >
      {/* Pulsing border glow */}
      <motion.div
        animate={{
          boxShadow: [`0 0 0px ${playerColor}00`, `0 0 12px ${playerColor}66`, `0 0 0px ${playerColor}00`],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ position: 'absolute', inset: -2, borderRadius: 14, pointerEvents: 'none' }}
      />

      {/* Image */}
      <div style={{
        width: '100%', height: 100, flexShrink: 0,
        overflow: 'hidden', position: 'relative',
        background: `linear-gradient(135deg, ${playerColor}22, ${playerColor}08)`,
      }}>
        {!imgError ? (
          <img
            src={card.image}
            alt={`Tutorial ${card.number}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 32, opacity: 0.5,
          }}>
            📋
          </div>
        )}
      </div>

      {/* Number label */}
      <div style={{
        flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 6px', background: 'rgba(0,0,0,0.85)',
      }}>
        <span style={{
          fontSize: 20, fontWeight: 800, color: playerColor,
          textAlign: 'center',
        }}>
          {card.number}
        </span>
      </div>
    </motion.div>
  )
}
