import { useRef, useCallback, useEffect } from 'react'
import { liveHandDataRef } from '../stores/gestureStore'

/**
 * Represents the character's draggable state tracked via refs
 * for optimal performance during real-time gesture tracking.
 */
interface CharDragState {
  /** The DOM element being dragged */
  element: HTMLElement
  /** Whether the character is currently being dragged */
  isDragging: boolean
  /** Current finger position in viewport pixels */
  currentX: number
  currentY: number
  /** Character width/height for centering */
  halfW: number
  halfH: number
}

/**
 * Represents a target zone for hit-testing
 */
interface TargetZone {
  id: string
  element: HTMLElement
}

/**
 * Custom hook that connects gesture data from gestureStore with drag & drop
 * logic for the survival challenge character.
 *
 * Uses the SAME pinch detection system as the card drag:
 * - Reads from liveHandDataRef (updated every MediaPipe frame)
 * - Uses requestAnimationFrame for smooth updates
 * - Pinch to grab, drag while pinching, release on pinch end
 *
 * @param player - Which player this hook instance serves ('player1' | 'player2')
 * @param onDrop - Callback when character is dropped on a zone
 * @param onMove - Callback for every position update while dragging
 * @param enabled - Whether drag is currently enabled
 */
export function useSurvivalDrag(
  player: 'player1' | 'player2',
  onDrop?: (zoneId: string | null, x: number, y: number) => void,
  onMove?: (x: number, y: number) => void,
  enabled: boolean = true
) {
  const dragStateRef = useRef<CharDragState | null>(null)
  const rafRef = useRef<number>(0)
  const characterRef = useRef<HTMLElement | null>(null)
  const targetZonesRef = useRef<TargetZone[]>([])
  const lastPinchRef = useRef<boolean>(false)
  const hoveredZoneRef = useRef<string | null>(null)

  /**
   * Convert normalized hand coordinates (0-1) to viewport pixel coordinates.
   * Same logic as useDragGesture.
   */
  const normalizedToPixel = useCallback(
    (normX: number, normY: number): { x: number; y: number } => {
      const w = window.innerWidth
      const h = window.innerHeight
      const mirroredX = 1 - normX
      return {
        x: mirroredX * w,
        y: normY * h,
      }
    },
    []
  )

  /**
   * Register the character DOM element for hit-testing.
   */
  const registerCharacter = useCallback((element: HTMLElement | null) => {
    characterRef.current = element
  }, [])

  /**
   * Register a target zone element for hit-testing.
   */
  const registerZone = useCallback((zoneId: string, element: HTMLElement | null) => {
    if (element) {
      const existing = targetZonesRef.current.findIndex((z) => z.id === zoneId)
      if (existing >= 0) {
        targetZonesRef.current[existing] = { id: zoneId, element }
      } else {
        targetZonesRef.current.push({ id: zoneId, element })
      }
    } else {
      targetZonesRef.current = targetZonesRef.current.filter((z) => z.id !== zoneId)
    }
  }, [])

  /**
   * Check if a viewport point is over the character element.
   */
  const hitTestCharacter = useCallback(
    (px: number, py: number): HTMLElement | null => {
      const el = characterRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
        return el
      }
      return null
    },
    []
  )

  /**
   * Check if a viewport point is over any registered target zone.
   */
  const hitTestZones = useCallback((px: number, py: number): string | null => {
    for (const zone of targetZonesRef.current) {
      const rect = zone.element.getBoundingClientRect()
      if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
        return zone.id
      }
    }
    return null
  }, [])

  /**
   * Main gesture processing loop — runs EVERY FRAME via requestAnimationFrame.
   * Same pattern as useDragGesture's processGesture.
   */
  useEffect(() => {
    let running = true

    const processGesture = () => {
      if (!running) return

      if (!enabled) {
        // Release any drag
        if (dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          ds.element.style.transition = 'transform 0.2s ease-out'
          ds.element.style.transform = 'scale(1)'
          ds.element.classList.remove('character-dragging')
          dragStateRef.current = null
        }
        lastPinchRef.current = false
        rafRef.current = requestAnimationFrame(processGesture)
        return
      }

      const hand = player === 'player1' ? liveHandDataRef.player1 : liveHandDataRef.player2
      const isPinching = hand?.isPinching ?? false

      if (hand) {
        const { x: fingerX, y: fingerY } = normalizedToPixel(hand.indexTipX, hand.indexTipY)
        const wasPinching = lastPinchRef.current

        // ── PINCH START: try to grab the character ──
        if (isPinching && !wasPinching) {
          const hitEl = hitTestCharacter(fingerX, fingerY)
          if (hitEl) {
            const rect = hitEl.getBoundingClientRect()
            dragStateRef.current = {
              element: hitEl,
              isDragging: true,
              currentX: fingerX,
              currentY: fingerY,
              halfW: rect.width / 2,
              halfH: rect.height / 2,
            }
            hitEl.style.position = 'absolute'
            hitEl.style.zIndex = '999'
            hitEl.style.transition = 'none'
            hitEl.classList.add('character-dragging')
          }
        }

        // ── DURING DRAG: update character position every frame ──
        if (isPinching && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          
          // Calculate local coordinates relative to the nearest positioned ancestor (offsetParent)
          // This fixes the split-screen positioning bug where player 2's container is offset by 50%
          const offsetParent = ds.element.offsetParent as HTMLElement
          const parentRect = offsetParent ? offsetParent.getBoundingClientRect() : { left: 0, top: 0 }
          
          ds.element.style.left = `${fingerX - parentRect.left - ds.halfW}px`
          ds.element.style.top = `${fingerY - parentRect.top - ds.halfH}px`
          ds.currentX = fingerX
          ds.currentY = fingerY

          // Notify move callback
          onMove?.(fingerX, fingerY)

          // Check zone hover
          const hoveredZone = hitTestZones(fingerX, fingerY)
          if (hoveredZone !== hoveredZoneRef.current) {
            // Remove previous hover
            if (hoveredZoneRef.current !== null) {
              const prevZone = targetZonesRef.current.find(z => z.id === hoveredZoneRef.current)
              prevZone?.element.classList.remove('zone-hover')
            }
            // Add new hover
            if (hoveredZone !== null) {
              const newZone = targetZonesRef.current.find(z => z.id === hoveredZone)
              newZone?.element.classList.add('zone-hover')
            }
            hoveredZoneRef.current = hoveredZone
          }
        }

        // ── PINCH END: drop the character ──
        if (!isPinching && wasPinching && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          const droppedZone = hitTestZones(ds.currentX, ds.currentY)

          // Remove zone hover
          if (hoveredZoneRef.current !== null) {
            const prevZone = targetZonesRef.current.find(z => z.id === hoveredZoneRef.current)
            prevZone?.element.classList.remove('zone-hover')
            hoveredZoneRef.current = null
          }

          ds.element.classList.remove('character-dragging')

          // Notify drop callback
          onDrop?.(droppedZone, ds.currentX, ds.currentY)

          dragStateRef.current = null
        }

        lastPinchRef.current = isPinching
      } else {
        // No hand detected
        if (lastPinchRef.current && dragStateRef.current?.isDragging) {
          const ds = dragStateRef.current
          ds.element.classList.remove('character-dragging')
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
  }, [player, enabled, normalizedToPixel, hitTestCharacter, hitTestZones, onDrop, onMove])

  return {
    registerCharacter,
    registerZone,
    dragStateRef,
  }
}
