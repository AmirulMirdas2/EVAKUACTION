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
  PINCH_THRESHOLD,
} from '../types/gesture.types'
import { useGestureStore } from '../stores/gestureStore'

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
 * Calculate the Euclidean distance between two landmarks (2D, normalized).
 */
function landmarkDistance(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
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
          const thumbTip = landmarks[4]
          const indexTip = landmarks[8]
          const pinchDistance = landmarkDistance(thumbTip, indexTip)
          const isPinching = pinchDistance < PINCH_THRESHOLD

          const indexTipX = indexTip.x
          const indexTipY = indexTip.y
          const zone = getZone(indexTipX, boundaries, mergedConfig.mirrorMode)

          // MediaPipe reports handedness from the camera's perspective.
          // When mirrored, 'Right' in data appears on the left side of screen.
          const label = handedness.label as 'Left' | 'Right'

          hands.push({
            handedness: label,
            landmarks,
            pinchDistance,
            isPinching,
            indexTipX,
            indexTipY,
            zone,
          })
        }
      }

      // Update ref (no re-render)
      handsDataRef.current = hands

      // Determine which hands map to which players based on zone
      let p1Hand: HandData | null = null
      let p2Hand: HandData | null = null

      for (const hand of hands) {
        if (hand.zone === 'left' && !p1Hand) {
          p1Hand = hand
        } else if (hand.zone === 'right' && !p2Hand) {
          p2Hand = hand
        }
        // Hands in 'buffer' zone are ignored
      }

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
