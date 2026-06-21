import { useEffect, useRef, useCallback, useState } from 'react'
import type {
  HandData,
  Landmark,
  MediaPipeConfig,
  Zone,
  ZoneBoundaries,
} from '../types/gesture.types'
import {
  DEFAULT_MEDIAPIPE_CONFIG,
  DEFAULT_ZONE_BOUNDARIES,
} from '../types/gesture.types'
import { useGestureStore, liveHandDataRef } from '../stores/gestureStore'

// MediaPipe Hands types (loaded via CDN, not imported)
interface MPHands {
  setOptions(options: Record<string, unknown>): void
  onResults(callback: (results: MPResults) => void): void
  send(inputs: { image: HTMLVideoElement }): Promise<void>
  close(): Promise<void>
  initialize(): Promise<void>
}

interface MPResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>
  multiHandedness?: Array<{ index: number; score: number; label: string }>
}

/**
 * Dynamically loads MediaPipe Hands via CDN script injection.
 * Returns the Hands constructor from the global scope.
 */
function loadMediaPipeScript(): Promise<
  new (config: { locateFile: (file: string) => string }) => MPHands
> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as unknown as Record<string, unknown>).Hands) {
      resolve(
        (window as unknown as Record<string, unknown>).Hands as new (config: {
          locateFile: (file: string) => string
        }) => MPHands
      )
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      const HandsClass = (window as unknown as Record<string, unknown>)
        .Hands as
        | (new (config: {
            locateFile: (file: string) => string
          }) => MPHands)
        | undefined

      if (HandsClass) {
        resolve(HandsClass)
      } else {
        reject(new Error('MediaPipe Hands class not found after script load'))
      }
    }

    script.onerror = () => reject(new Error('Failed to load MediaPipe Hands script'))
    document.head.appendChild(script)
  })
}

/**
 * Determine which screen zone a hand is in based on its index fingertip X position.
 */
function getZone(
  indexTipX: number,
  boundaries: ZoneBoundaries,
  mirrorMode: boolean
): Zone {
  // When mirrored, the X axis is flipped: what appears on the left of the screen
  // actually has a high X value in the raw landmark data.
  const effectiveX = mirrorMode ? 1 - indexTipX : indexTipX

  if (effectiveX < boundaries.leftEnd) return 'left'
  if (effectiveX > boundaries.rightStart) return 'right'
  return 'buffer'
}

/**
 * Custom hook for MediaPipe Hands integration.
 *
 * Performance strategy:
 * - Hand landmark data is stored in useRef (no re-renders per frame)
 * - Zustand store is only updated when pinch state *changes*
 * - Canvas rendering runs via requestAnimationFrame, independent of React
 */
export function useMediaPipe(
  config: Partial<MediaPipeConfig> = {},
  boundaries: ZoneBoundaries = DEFAULT_ZONE_BOUNDARIES
) {
  const mergedConfig = { ...DEFAULT_MEDIAPIPE_CONFIG, ...config }

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsDataRef = useRef<HandData[]>([])
  const animationFrameRef = useRef<number>(0)
  const handsInstanceRef = useRef<MPHands | null>(null)
  const lastP1PinchRef = useRef<boolean>(false)
  const lastP2PinchRef = useRef<boolean>(false)
  const lastP1ZoneRef = useRef<Zone | null>(null)
  const lastP2ZoneRef = useRef<Zone | null>(null)
  const isDetectingRef = useRef<boolean>(false)

  // Anti-sabotage: track which hand (by handedness) is "locked" to each zone.
  // Once a hand enters a zone, only that same handedness is accepted.
  // This prevents the opponent from reaching into the other player's zone.
  const lockedP1HandednessRef = useRef<'Left' | 'Right' | null>(null)
  const lockedP2HandednessRef = useRef<'Left' | 'Right' | null>(null)
  const p1LockLostTimeRef = useRef<number>(0)
  const p2LockLostTimeRef = useRef<number>(0)
  const LOCK_EXPIRY_MS = 500 // Lock expires 500ms after the locked hand leaves

  // FPS tracking variables
  const fpsTrackerRef = useRef({
    frameCount: 0,
    lastFpsTime: performance.now(),
    lowFpsCount: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)

  const {
    setPlayer1Hand,
    setPlayer2Hand,
    setCameraStatus,
    setDetectedHandsCount,
  } = useGestureStore()

  /**
   * Process MediaPipe results. Runs every frame but only triggers
   * React state updates when pinch state changes.
   */
  const onResults = useCallback(
    (results: MPResults) => {
      const hands: HandData[] = []

      // --- FPS TRACKING ---
      const tracker = fpsTrackerRef.current
      tracker.frameCount++
      const now = performance.now()
      if (now - tracker.lastFpsTime >= 1000) {
        const fps = Math.round((tracker.frameCount * 1000) / (now - tracker.lastFpsTime))
        
        if (import.meta.env.DEV) {
          let fpsEl = document.getElementById('mp-fps-counter')
          if (!fpsEl) {
            fpsEl = document.createElement('div')
            fpsEl.id = 'mp-fps-counter'
            fpsEl.style.position = 'fixed'
            fpsEl.style.bottom = '10px'
            fpsEl.style.left = '10px'
            fpsEl.style.padding = '4px 8px'
            fpsEl.style.background = 'rgba(0,0,0,0.7)'
            fpsEl.style.color = '#0f0'
            fpsEl.style.fontFamily = 'monospace'
            fpsEl.style.fontSize = '12px'
            fpsEl.style.zIndex = '9999'
            fpsEl.style.borderRadius = '4px'
            document.body.appendChild(fpsEl)
          }
          fpsEl.textContent = `CV: ${fps}fps`
        }

        if (fps < 15) {
          tracker.lowFpsCount++
          if (tracker.lowFpsCount >= 3) {
            let toastEl = document.getElementById('low-fps-toast')
            if (!toastEl) {
              toastEl = document.createElement('div')
              toastEl.id = 'low-fps-toast'
              toastEl.style.position = 'fixed'
              toastEl.style.top = '20px'
              toastEl.style.left = '50%'
              toastEl.style.transform = 'translateX(-50%)'
              toastEl.style.background = '#EF4444'
              toastEl.style.color = '#fff'
              toastEl.style.padding = '12px 24px'
              toastEl.style.borderRadius = '8px'
              toastEl.style.zIndex = '9999'
              toastEl.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.5)'
              toastEl.style.fontWeight = 'bold'
              toastEl.style.transition = 'opacity 0.3s'
              toastEl.innerText = '⚠️ Performa kamera menurun. Pastikan pencahayaan cukup dan tutup aplikasi lain.'
              document.body.appendChild(toastEl)
              
              setTimeout(() => {
                if (toastEl) {
                  toastEl.style.opacity = '0'
                  setTimeout(() => toastEl?.remove(), 300)
                }
              }, 5000)
            }
            tracker.lowFpsCount = 0
          }
        } else {
          tracker.lowFpsCount = 0
        }

        tracker.frameCount = 0
        tracker.lastFpsTime = now
      }
      // --------------------

      if (results.multiHandLandmarks && results.multiHandedness) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const rawLandmarks = results.multiHandLandmarks[i]
          const handedness = results.multiHandedness[i]

          const landmarks: Landmark[] = rawLandmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }))

          // Landmark indices: 4 = thumb tip, 8 = index finger tip
          const THUMB_TIP = 4
          const INDEX_TIP = 8
          const thumbTip = landmarks[THUMB_TIP]
          const indexTip = landmarks[INDEX_TIP]
          
          // Hitung pinch distance HANYA antara landmark 4 dan 8
          const pinchDistance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
          )
          const isPinching = pinchDistance < 0.05 // PINCH_THRESHOLD is 0.05

          // Posisi "kursor" saat drag: titik TENGAH antara jempol dan telunjuk
          const cursorX = (thumbTip.x + indexTip.x) / 2
          const cursorY = (thumbTip.y + indexTip.y) / 2
          
          const zone = getZone(cursorX, boundaries, mergedConfig.mirrorMode)

          // MediaPipe reports handedness from the camera's perspective.
          // When mirrored, 'Right' in data appears on the left side of screen.
          const label = handedness.label as 'Left' | 'Right'

          hands.push({
            handedness: label,
            landmarks,
            pinchDistance,
            isPinching,
            indexTipX: cursorX, // Map to the new cursor position
            indexTipY: cursorY,
            zone,
          })
        }
      }

      // Update ref (no re-render)
      handsDataRef.current = hands

      // ── Anti-sabotage hand assignment ──
      // Each zone locks to the first hand (by handedness) that enters it.
      // Additional hands in the same zone are ignored to prevent sabotage.
      let p1Hand: HandData | null = null
      let p2Hand: HandData | null = null

      // Collect hands per zone
      const leftHands = hands.filter(h => h.zone === 'left')
      const rightHands = hands.filter(h => h.zone === 'right')

      // --- Player 1 (left zone) ---
      if (leftHands.length > 0) {
        if (lockedP1HandednessRef.current) {
          // Zone is locked: only accept the hand matching the locked handedness
          const lockedHand = leftHands.find(h => h.handedness === lockedP1HandednessRef.current)
          if (lockedHand) {
            p1Hand = lockedHand
            p1LockLostTimeRef.current = 0 // Reset lost timer
          } else {
            // Locked hand left the zone, but another hand is here — ignore it
            // Start expiry timer if not already started
            if (p1LockLostTimeRef.current === 0) {
              p1LockLostTimeRef.current = performance.now()
            } else if (performance.now() - p1LockLostTimeRef.current > LOCK_EXPIRY_MS) {
              // Lock expired — allow re-locking to the first available hand
              lockedP1HandednessRef.current = leftHands[0].handedness
              p1Hand = leftHands[0]
              p1LockLostTimeRef.current = 0
            }
            // Otherwise: do NOT assign any hand (sabotage blocked)
          }
        } else {
          // No lock yet — lock to the first hand in the zone
          lockedP1HandednessRef.current = leftHands[0].handedness
          p1Hand = leftHands[0]
          p1LockLostTimeRef.current = 0
        }
      } else {
        // No hands in left zone
        if (lockedP1HandednessRef.current) {
          if (p1LockLostTimeRef.current === 0) {
            p1LockLostTimeRef.current = performance.now()
          } else if (performance.now() - p1LockLostTimeRef.current > LOCK_EXPIRY_MS) {
            // Lock expired after hand left
            lockedP1HandednessRef.current = null
            p1LockLostTimeRef.current = 0
          }
        }
      }

      // --- Player 2 (right zone) ---
      if (rightHands.length > 0) {
        if (lockedP2HandednessRef.current) {
          // Zone is locked: only accept the hand matching the locked handedness
          const lockedHand = rightHands.find(h => h.handedness === lockedP2HandednessRef.current)
          if (lockedHand) {
            p2Hand = lockedHand
            p2LockLostTimeRef.current = 0 // Reset lost timer
          } else {
            // Locked hand left the zone, but another hand is here — ignore it
            if (p2LockLostTimeRef.current === 0) {
              p2LockLostTimeRef.current = performance.now()
            } else if (performance.now() - p2LockLostTimeRef.current > LOCK_EXPIRY_MS) {
              // Lock expired — allow re-locking
              lockedP2HandednessRef.current = rightHands[0].handedness
              p2Hand = rightHands[0]
              p2LockLostTimeRef.current = 0
            }
          }
        } else {
          // No lock yet — lock to the first hand in the zone
          lockedP2HandednessRef.current = rightHands[0].handedness
          p2Hand = rightHands[0]
          p2LockLostTimeRef.current = 0
        }
      } else {
        // No hands in right zone
        if (lockedP2HandednessRef.current) {
          if (p2LockLostTimeRef.current === 0) {
            p2LockLostTimeRef.current = performance.now()
          } else if (performance.now() - p2LockLostTimeRef.current > LOCK_EXPIRY_MS) {
            // Lock expired after hand left
            lockedP2HandednessRef.current = null
            p2LockLostTimeRef.current = 0
          }
        }
      }
      // ── Update live hand data ref EVERY FRAME (non-reactive) ──
      // This is read by useDragGesture in its rAF loop for real-time tracking.
      liveHandDataRef.player1 = p1Hand
      liveHandDataRef.player2 = p2Hand

      // Only update Zustand store when pinch state or zone presence changes
      const p1Pinching = p1Hand?.isPinching ?? false
      const p2Pinching = p2Hand?.isPinching ?? false
      const p1Zone = p1Hand?.zone ?? null
      const p2Zone = p2Hand?.zone ?? null

      if (
        p1Pinching !== lastP1PinchRef.current ||
        p1Zone !== lastP1ZoneRef.current
      ) {
        lastP1PinchRef.current = p1Pinching
        lastP1ZoneRef.current = p1Zone
        setPlayer1Hand(p1Hand)
      }

      if (
        p2Pinching !== lastP2PinchRef.current ||
        p2Zone !== lastP2ZoneRef.current
      ) {
        lastP2PinchRef.current = p2Pinching
        lastP2ZoneRef.current = p2Zone
        setPlayer2Hand(p2Hand)
      }

      // Update detected hands count only when it changes
      const currentCount = hands.length
      const storeCount = useGestureStore.getState().detectedHandsCount
      if (currentCount !== storeCount) {
        setDetectedHandsCount(currentCount)
      }
    },
    [
      boundaries,
      mergedConfig.mirrorMode,
      setPlayer1Hand,
      setPlayer2Hand,
      setDetectedHandsCount,
    ]
  )

  /**
   * Initialize MediaPipe Hands and start the camera.
   */
  useEffect(() => {
    let isCancelled = false

    async function init() {
      try {
        setCameraStatus('loading')
        setIsLoading(true)

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        })

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setCameraStatus('available')

        // Load MediaPipe Hands via CDN
        const HandsClass = await loadMediaPipeScript()

        if (isCancelled) return

        const hands = new HandsClass({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })

        hands.setOptions({
          maxNumHands: mergedConfig.maxNumHands,
          minDetectionConfidence: mergedConfig.minDetectionConfidence,
          minTrackingConfidence: mergedConfig.minTrackingConfidence,
          modelComplexity: mergedConfig.modelComplexity,
        })

        hands.onResults(onResults)

        // Pre-initialize the model
        await hands.initialize()

        if (isCancelled) {
          hands.close()
          return
        }

        handsInstanceRef.current = hands
        setIsLoading(false)

        // Start detection loop
        isDetectingRef.current = true
        setIsDetecting(true)

        const detectLoop = async () => {
          if (
            !isDetectingRef.current ||
            !videoRef.current ||
            !handsInstanceRef.current
          )
            return

          if (videoRef.current.readyState >= 2) {
            try {
              await handsInstanceRef.current.send({ image: videoRef.current })
            } catch {
              // Silently handle frame send errors (can happen during cleanup)
            }
          }

          if (isDetectingRef.current) {
            animationFrameRef.current = requestAnimationFrame(detectLoop)
          }
        }

        detectLoop()
      } catch (error) {
        console.error('Failed to initialize camera/MediaPipe:', error)
        setCameraStatus('unavailable')
        setIsLoading(false)
      }
    }

    init()

    return () => {
      isCancelled = true
      isDetectingRef.current = false
      setIsDetecting(false)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (handsInstanceRef.current) {
        handsInstanceRef.current.close()
        handsInstanceRef.current = null
      }

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }

      // Cleanup live data to prevent memory leak
      liveHandDataRef.player1 = null
      liveHandDataRef.player2 = null

      // Cleanup dev UI
      const fpsEl = document.getElementById('mp-fps-counter')
      if (fpsEl) fpsEl.remove()
      const toastEl = document.getElementById('low-fps-toast')
      if (toastEl) toastEl.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    isLoading,
    isDetecting,
    handsDataRef,
    videoRef,
    canvasRef,
    config: mergedConfig,
  }
}
