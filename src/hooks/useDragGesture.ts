import { useRef, useCallback, useEffect } from 'react'
import { useGestureStore } from '../stores/gestureStore'
import { useGameStore } from '../stores/gameStore'

/**
 * Represents a card's draggable state tracked via refs (not React state)
 * for optimal performance during real-time gesture tracking.
 */
interface DragState {
  cardId: string
  /** The DOM element being dragged */
  element: HTMLElement | null
  /** Whether the card is currently being dragged */
  isDragging: boolean
  /** The original position before drag started */
  originX: number
  originY: number
  /** Current drag position */
  currentX: number
  currentY: number
  /** Offset between finger and card center when grab started */
  offsetX: number
  offsetY: number
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

/**
 * Custom hook that connects gesture data from gestureStore with drag & drop
 * logic for virtual cards.
 *
 * Performance strategy:
 * - All drag positions are tracked via useRef, NOT useState
 * - Card positions are updated via direct DOM transform manipulation
 * - React re-renders are only triggered for state transitions (pickup, drop)
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
   * Update all anchor rects (call on resize/layout changes).
   */
  const updateAnchorRects = useCallback(() => {
    // This is called when we need to refresh anchor positions
    // Individual anchors re-register via registerAnchor
  }, [])

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
   * Convert normalized hand coordinates (0-1) to pixel coordinates
   * relative to the viewport.
   */
  const normalizedToPixel = useCallback(
    (normX: number, normY: number): { x: number; y: number } => {
      // The camera feed covers the full viewport
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      // Mirror mode: the gesture store already provides raw coords,
      // but the video is mirrored. So we need to flip X.
      const mirroredX = 1 - normX
      return {
        x: mirroredX * viewportW,
        y: normY * viewportH,
      }
    },
    []
  )

  /**
   * Check if a point is over any card element.
   */
  const hitTestCards = useCallback(
    (px: number, py: number): { cardId: string; element: HTMLElement } | null => {
      for (const [cardId, element] of cardElementsRef.current.entries()) {
        // Skip placed cards
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
   * Check if a point is over any anchor slot.
   */
  const hitTestAnchors = useCallback((px: number, py: number): number | null => {
    for (const anchor of anchorRectsRef.current) {
      if (
        px >= anchor.left &&
        px <= anchor.right &&
        py >= anchor.top &&
        py <= anchor.bottom
      ) {
        return anchor.slot
      }
    }
    return null
  }, [])

  /**
   * Main gesture processing loop — runs via requestAnimationFrame.
   */
  useEffect(() => {
    let running = true

    const processGesture = () => {
      if (!running) return

      const gestureState = useGestureStore.getState()
      const hand = player === 'player1' ? gestureState.player1Hand : gestureState.player2Hand
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
              originX: rect.left,
              originY: rect.top,
              currentX: fingerX,
              currentY: fingerY,
              offsetX: fingerX - (rect.left + rect.width / 2),
              offsetY: fingerY - (rect.top + rect.height / 2),
            }
            // Apply drag visual state immediately
            hit.element.style.zIndex = '100'
            hit.element.style.opacity = '0.9'
            hit.element.style.transform = `translate(${fingerX - rect.width / 2 - rect.left}px, ${fingerY - rect.height / 2 - rect.top}px) scale(1.1)`
            hit.element.style.transition = 'none'
            hit.element.classList.add('card-dragging')
          }
        }

        // ── DURING DRAG: update card position ──
        if (isPinching && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          if (ds.element) {
            const baseRect = ds.element.parentElement?.getBoundingClientRect()
            if (baseRect) {
              const tx = fingerX - ds.offsetX - baseRect.left - ds.element.offsetWidth / 2
              const ty = fingerY - ds.offsetY - baseRect.top - ds.element.offsetHeight / 2
              ds.element.style.transform = `translate(${tx}px, ${ty}px) scale(1.1)`
              ds.currentX = fingerX
              ds.currentY = fingerY
            }

            // Check anchor hover
            const hoveredSlot = hitTestAnchors(fingerX, fingerY)
            if (hoveredSlot !== hoveredAnchorRef.current) {
              // Remove previous hover
              if (hoveredAnchorRef.current !== null) {
                const prevAnchor = document.querySelector(
                  `[data-anchor-slot="${hoveredAnchorRef.current}"][data-anchor-player="${player}"]`
                ) as HTMLElement | null
                prevAnchor?.classList.remove('anchor-hover')
              }
              // Add new hover
              if (hoveredSlot !== null) {
                const newAnchor = document.querySelector(
                  `[data-anchor-slot="${hoveredSlot}"][data-anchor-player="${player}"]`
                ) as HTMLElement | null
                newAnchor?.classList.add('anchor-hover')
              }
              hoveredAnchorRef.current = hoveredSlot
            }
          }
        }

        // ── PINCH END: drop the card ──
        if (!isPinching && wasPinching && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          const droppedSlot = hitTestAnchors(ds.currentX, ds.currentY)

          // Remove anchor hover
          if (hoveredAnchorRef.current !== null) {
            const prevAnchor = document.querySelector(
              `[data-anchor-slot="${hoveredAnchorRef.current}"][data-anchor-player="${player}"]`
            ) as HTMLElement | null
            prevAnchor?.classList.remove('anchor-hover')
            hoveredAnchorRef.current = null
          }

          if (droppedSlot !== null && ds.element) {
            // Snap card to anchor slot
            ds.element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
            ds.element.style.opacity = '1'
            ds.element.style.zIndex = '50'
            ds.element.classList.remove('card-dragging')
            ds.element.classList.add('card-placed')

            // Place card in game store
            useGameStore.getState().placeCard(player, ds.cardId, droppedSlot)
            placedCardsRef.current.add(ds.cardId)

            // Find anchor element and snap to its position
            const anchorEl = document.querySelector(
              `[data-anchor-slot="${droppedSlot}"][data-anchor-player="${player}"]`
            ) as HTMLElement | null
            if (anchorEl && ds.element.parentElement) {
              const anchorRect = anchorEl.getBoundingClientRect()
              const parentRect = ds.element.parentElement.getBoundingClientRect()
              const tx = anchorRect.left - parentRect.left + (anchorRect.width - ds.element.offsetWidth) / 2
              const ty = anchorRect.top - parentRect.top + (anchorRect.height - ds.element.offsetHeight) / 2
              ds.element.style.transform = `translate(${tx}px, ${ty}px) scale(1)`
            }
          } else if (ds.element) {
            // Return card to origin with spring animation
            ds.element.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
            ds.element.style.transform = 'translate(0px, 0px) scale(1)'
            ds.element.style.opacity = '1'
            ds.element.style.zIndex = '10'
            ds.element.classList.remove('card-dragging')
          }

          dragStateRef.current = null
        }

        lastPinchRef.current = isPinching
      } else {
        // No hand detected — if was dragging, return card to origin
        if (lastPinchRef.current && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          if (ds.element) {
            ds.element.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
            ds.element.style.transform = 'translate(0px, 0px) scale(1)'
            ds.element.style.opacity = '1'
            ds.element.style.zIndex = '10'
            ds.element.classList.remove('card-dragging')
          }
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
