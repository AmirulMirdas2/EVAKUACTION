import { useRef, useCallback, useEffect } from 'react'
import { liveHandDataRef } from '../stores/gestureStore'
import { useGameStore } from '../stores/gameStore'

/**
 * Represents a card's draggable state tracked via refs (not React state)
 * for optimal performance during real-time gesture tracking.
 */
interface DragState {
  cardId: string
  /** The DOM element being dragged */
  element: HTMLElement
  /** Whether the card is currently being dragged */
  isDragging: boolean
  /** The original bounding rect before drag started */
  originRect: DOMRect
  /** Current finger position in viewport pixels */
  currentX: number
  currentY: number
}

/**
 * Configuration for anchor slot hit detection
 */
interface AnchorRect {
  slot: number
  left: number
  top: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}

// Card dimensions (must match Card.tsx)
const CARD_WIDTH = 120
const CARD_HEIGHT = 160
const CARD_HALF_W = CARD_WIDTH / 2
const CARD_HALF_H = CARD_HEIGHT / 2

/**
 * Custom hook that connects gesture data from gestureStore with drag & drop
 * logic for virtual cards.
 *
 * Performance strategy:
 * - All drag positions are tracked via useRef, NOT useState
 * - Card positions are updated via direct DOM transform manipulation
 * - Reads from liveHandDataRef (updated every MediaPipe frame) — NOT from
 *   the Zustand store which only updates on pinch/zone changes
 * - Uses requestAnimationFrame for smooth 30fps+ updates
 *
 * @param player - Which player this hook instance serves ('player1' | 'player2')
 * @param containerRef - Ref to the player zone container element
 */
export function useDragGesture(
  player: 'player1' | 'player2',
  _containerRef?: React.RefObject<HTMLElement | null>
) {
  // Drag state for the currently-dragged card, tracked via ref
  const dragStateRef = useRef<DragState | null>(null)
  const rafRef = useRef<number>(0)
  const cardElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const anchorRectsRef = useRef<AnchorRect[]>([])
  const hoveredAnchorRef = useRef<number | null>(null)
  const lastPinchRef = useRef<boolean>(false)
  // Track placed cards via ref to avoid stale closure issues
  const placedCardsRef = useRef<Set<string>>(new Set())

  /**
   * Register a card DOM element for hit-testing.
   */
  const registerCard = useCallback((cardId: string, element: HTMLElement | null) => {
    if (element) {
      cardElementsRef.current.set(cardId, element)
    } else {
      cardElementsRef.current.delete(cardId)
    }
  }, [])

  /**
   * Register an anchor slot's bounding rect for hit-testing.
   */
  const registerAnchor = useCallback((slot: number, element: HTMLElement | null) => {
    if (!element) {
      anchorRectsRef.current = anchorRectsRef.current.filter((a) => a.slot !== slot)
      return
    }
    const rect = element.getBoundingClientRect()
    const existing = anchorRectsRef.current.find((a) => a.slot === slot)
    const anchorData: AnchorRect = {
      slot,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    }
    if (existing) {
      Object.assign(existing, anchorData)
    } else {
      anchorRectsRef.current.push(anchorData)
    }
  }, [])

  /**
   * Update all anchor rects — call on resize/layout changes.
   */
  const updateAnchorRects = useCallback(() => {
    // Re-read bounding rects for all registered anchors
    document.querySelectorAll(`[data-anchor-player="${player}"]`).forEach((el) => {
      const slot = parseInt(el.getAttribute('data-anchor-slot') ?? '0', 10)
      if (slot > 0) {
        registerAnchor(slot, el as HTMLElement)
      }
    })
  }, [player, registerAnchor])

  /**
   * Mark a card as placed (so it can't be dragged again).
   */
  const markCardPlaced = useCallback((cardId: string) => {
    placedCardsRef.current.add(cardId)
  }, [])

  /**
   * Unmark a card as placed.
   */
  const unmarkCardPlaced = useCallback((cardId: string) => {
    placedCardsRef.current.delete(cardId)
  }, [])

  /**
   * Convert normalized hand coordinates (0-1) to viewport pixel coordinates.
   *
   * MediaPipe returns raw coordinates in camera space.
   * The video element is rendered mirrored (scaleX(-1)), so to map the
   * raw coordinate to the mirrored viewport position we flip X: (1 - normX).
   *
   * Uses the container's bounding rect as the coordinate space, since the
   * camera feed may not exactly match window.innerWidth/innerHeight.
   */
  const normalizedToPixel = useCallback(
    (normX: number, normY: number): { x: number; y: number } => {
      // Use the full viewport as reference since the camera covers the full screen
      const w = window.innerWidth
      const h = window.innerHeight

      // Flip X to match the mirrored video display
      const mirroredX = 1 - normX

      return {
        x: mirroredX * w,
        y: normY * h,
      }
    },
    []
  )

  /**
   * Check if a viewport point is over any registered card element.
   */
  const hitTestCards = useCallback(
    (px: number, py: number): { cardId: string; element: HTMLElement } | null => {
      for (const [cardId, element] of cardElementsRef.current.entries()) {
        // Skip cards already placed in anchors
        if (placedCardsRef.current.has(cardId)) continue

        const rect = element.getBoundingClientRect()
        if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
          return { cardId, element }
        }
      }
      return null
    },
    []
  )

  /**
   * Check if a viewport point is over any anchor slot.
   * Re-reads bounding rects live for accuracy.
   */
  const hitTestAnchors = useCallback((px: number, py: number): number | null => {
    // Re-read anchor positions live (they may shift due to layout changes)
    const anchors = document.querySelectorAll(`[data-anchor-player="${player}"]`)
    for (const el of anchors) {
      const slot = parseInt(el.getAttribute('data-anchor-slot') ?? '0', 10)
      if (slot <= 0) continue
      const rect = el.getBoundingClientRect()
      if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
        return slot
      }
    }
    return null
  }, [player])

  /**
   * Main gesture processing loop — runs EVERY FRAME via requestAnimationFrame.
   *
   * CRITICAL: Reads hand position from liveHandDataRef (updated every MediaPipe frame),
   * NOT from the Zustand store which only updates on pinch/zone state changes.
   * This ensures the dragged card follows the finger in real-time.
   */
  useEffect(() => {
    let running = true

    const processGesture = () => {
      if (!running) return

      // ── Read live hand data (updated every frame by useMediaPipe) ──
      const hand = player === 'player1' ? liveHandDataRef.player1 : liveHandDataRef.player2
      const isPinching = hand?.isPinching ?? false

      if (hand) {
        const { x: fingerX, y: fingerY } = normalizedToPixel(hand.indexTipX, hand.indexTipY)
        const wasPinching = lastPinchRef.current

        // ── PINCH START: try to grab a card ──
        if (isPinching && !wasPinching) {
          const hit = hitTestCards(fingerX, fingerY)
          if (hit) {
            const rect = hit.element.getBoundingClientRect()
            dragStateRef.current = {
              cardId: hit.cardId,
              element: hit.element,
              isDragging: true,
              originRect: rect,
              currentX: fingerX,
              currentY: fingerY,
            }
            // Apply drag visual state immediately
            hit.element.style.position = 'fixed'
            hit.element.style.left = `${fingerX - CARD_HALF_W}px`
            hit.element.style.top = `${fingerY - CARD_HALF_H}px`
            hit.element.style.width = `${CARD_WIDTH}px`
            hit.element.style.height = `${CARD_HEIGHT}px`
            hit.element.style.zIndex = '999'
            hit.element.style.opacity = '0.9'
            hit.element.style.transform = 'scale(1.1)'
            hit.element.style.transition = 'none'
            hit.element.style.margin = '0'
            hit.element.classList.add('card-dragging')
          }
        }

        // ── DURING DRAG: update card position every frame ──
        if (isPinching && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          // Move card so its center follows the fingertip
          ds.element.style.left = `${fingerX - CARD_HALF_W}px`
          ds.element.style.top = `${fingerY - CARD_HALF_H}px`
          ds.currentX = fingerX
          ds.currentY = fingerY

          // Check anchor hover
          const hoveredSlot = hitTestAnchors(fingerX, fingerY)
          if (hoveredSlot !== hoveredAnchorRef.current) {
            // Remove previous hover highlight
            if (hoveredAnchorRef.current !== null) {
              const prevAnchor = document.querySelector(
                `[data-anchor-slot="${hoveredAnchorRef.current}"][data-anchor-player="${player}"]`
              ) as HTMLElement | null
              prevAnchor?.classList.remove('anchor-hover')
            }
            // Add new hover highlight
            if (hoveredSlot !== null) {
              const newAnchor = document.querySelector(
                `[data-anchor-slot="${hoveredSlot}"][data-anchor-player="${player}"]`
              ) as HTMLElement | null
              newAnchor?.classList.add('anchor-hover')
            }
            hoveredAnchorRef.current = hoveredSlot
          }
        }

        // ── PINCH END: drop the card ──
        if (!isPinching && wasPinching && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          const droppedSlot = hitTestAnchors(ds.currentX, ds.currentY)

          // Remove anchor hover highlight
          if (hoveredAnchorRef.current !== null) {
            const prevAnchor = document.querySelector(
              `[data-anchor-slot="${hoveredAnchorRef.current}"][data-anchor-player="${player}"]`
            ) as HTMLElement | null
            prevAnchor?.classList.remove('anchor-hover')
            hoveredAnchorRef.current = null
          }

          if (droppedSlot !== null) {
            // ── Snap card to anchor slot ──
            const anchorEl = document.querySelector(
              `[data-anchor-slot="${droppedSlot}"][data-anchor-player="${player}"]`
            ) as HTMLElement | null

            if (anchorEl) {
              const anchorRect = anchorEl.getBoundingClientRect()
              ds.element.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              ds.element.style.left = `${anchorRect.left + (anchorRect.width - CARD_WIDTH) / 2}px`
              ds.element.style.top = `${anchorRect.top + (anchorRect.height - CARD_HEIGHT) / 2}px`
              ds.element.style.transform = 'scale(1)'
              ds.element.style.opacity = '1'
              ds.element.style.zIndex = '50'
            }

            ds.element.classList.remove('card-dragging')
            ds.element.classList.add('card-placed')

            // Place card in game store
            useGameStore.getState().placeCard(player, ds.cardId, droppedSlot)
            placedCardsRef.current.add(ds.cardId)
          } else {
            // ── Return card to origin with spring animation ──
            ds.element.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            ds.element.style.left = `${ds.originRect.left}px`
            ds.element.style.top = `${ds.originRect.top}px`
            ds.element.style.transform = 'scale(1)'
            ds.element.style.opacity = '1'
            ds.element.style.zIndex = '10'
            ds.element.classList.remove('card-dragging')

            // After animation completes, reset to flow layout
            setTimeout(() => {
              if (ds.element && !ds.element.classList.contains('card-placed')) {
                ds.element.style.position = ''
                ds.element.style.left = ''
                ds.element.style.top = ''
                ds.element.style.width = ''
                ds.element.style.height = ''
                ds.element.style.zIndex = ''
                ds.element.style.margin = ''
                ds.element.style.transform = ''
                ds.element.style.transition = ''
              }
            }, 450)
          }

          dragStateRef.current = null
        }

        lastPinchRef.current = isPinching
      } else {
        // No hand detected — if was dragging, return card to origin
        if (lastPinchRef.current && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          ds.element.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          ds.element.style.left = `${ds.originRect.left}px`
          ds.element.style.top = `${ds.originRect.top}px`
          ds.element.style.transform = 'scale(1)'
          ds.element.style.opacity = '1'
          ds.element.style.zIndex = '10'
          ds.element.classList.remove('card-dragging')

          // Reset to flow layout after animation
          const el = ds.element
          setTimeout(() => {
            if (el && !el.classList.contains('card-placed')) {
              el.style.position = ''
              el.style.left = ''
              el.style.top = ''
              el.style.width = ''
              el.style.height = ''
              el.style.zIndex = ''
              el.style.margin = ''
              el.style.transform = ''
              el.style.transition = ''
            }
          }, 450)

          dragStateRef.current = null
        }
        lastPinchRef.current = false
      }

      rafRef.current = requestAnimationFrame(processGesture)
    }

    rafRef.current = requestAnimationFrame(processGesture)

    return () => {
      running = false
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [player, normalizedToPixel, hitTestCards, hitTestAnchors])

  return {
    registerCard,
    registerAnchor,
    updateAnchorRects,
    markCardPlaced,
    unmarkCardPlaced,
    dragStateRef,
  }
}
