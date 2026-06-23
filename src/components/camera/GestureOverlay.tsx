import { useEffect, useRef, type RefObject } from 'react'
import type { HandData, ZoneBoundaries, MediaPipeConfig } from '../../types/gesture.types'
import {
  HAND_CONNECTIONS,
  DEFAULT_PLAYER_COLORS,
  DEFAULT_ZONE_BOUNDARIES,
} from '../../types/gesture.types'

interface GestureOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  handsDataRef: RefObject<HandData[]>
  config: MediaPipeConfig
  boundaries?: ZoneBoundaries
}

/**
 * Determines the color for a hand based on its zone.
 */
function getHandColor(zone: HandData['zone']): string {
  switch (zone) {
    case 'left':
      return DEFAULT_PLAYER_COLORS.player1
    case 'right':
      return DEFAULT_PLAYER_COLORS.player2
    case 'buffer':
      return DEFAULT_PLAYER_COLORS.buffer
  }
}

/**
 * GestureOverlay renders hand landmarks and skeleton connections
 * directly onto a canvas overlay using requestAnimationFrame.
 *
 * This component does NOT use React state for rendering — all
 * drawing happens in a RAF loop for maximum performance.
 */
export default function GestureOverlay({
  videoRef,
  canvasRef,
  handsDataRef,
  config,
  boundaries = DEFAULT_ZONE_BOUNDARIES,
}: GestureOverlayProps) {
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    function draw() {
      if (!canvas || !ctx || !videoRef.current) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const video = videoRef.current

      // Match canvas size to video display size
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw buffer zone overlay
      const bufferLeftPx = boundaries.leftEnd * canvas.width
      const bufferRightPx = boundaries.rightStart * canvas.width

      // When mirrored, the buffer zone visual position needs to be flipped
      if (config.mirrorMode) {
        const mirroredLeft = canvas.width - bufferRightPx
        const mirroredRight = canvas.width - bufferLeftPx
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fillRect(mirroredLeft, 0, mirroredRight - mirroredLeft, canvas.height)
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fillRect(bufferLeftPx, 0, bufferRightPx - bufferLeftPx, canvas.height)
      }

      const hands = handsDataRef.current
      if (!hands || hands.length === 0) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      for (const hand of hands) {
        const color = getHandColor(hand.zone)
        const landmarks = hand.landmarks

        // Calculate pixel positions
        const points = landmarks.map((lm) => {
          let px: number
          if (config.mirrorMode) {
            px = (1 - lm.x) * canvas.width
          } else {
            px = lm.x * canvas.width
          }
          const py = lm.y * canvas.height
          return { x: px, y: py }
        })

        // Draw connections (skeleton)
        ctx.lineCap = 'round'

        for (const [start, end] of HAND_CONNECTIONS) {
          // Check if connection is part of thumb (1-4), index (5-8) or wrist (0)
          const isThumbOrIndex = (start <= 8 && end <= 8)
          ctx.strokeStyle = color
          ctx.lineWidth = isThumbOrIndex ? 4 : 2
          ctx.globalAlpha = isThumbOrIndex ? 0.9 : 0.2

          const p1 = points[start]
          const p2 = points[end]
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }

        // Draw landmark dots
        for (let i = 0; i < points.length; i++) {
          const p = points[i]
          const isThumbOrIndex = i <= 8
          const isTargetTip = i === 4 || i === 8

          ctx.globalAlpha = isThumbOrIndex ? 1.0 : 0.2
          const radius = isTargetTip ? 10 : (isThumbOrIndex ? 5 : 3)

          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = isTargetTip ? '#FBBF24' : (isThumbOrIndex ? '#FFFFFF' : color)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = isTargetTip ? 3 : 2
          ctx.stroke()
        }

        // Draw pinch indicator
        ctx.globalAlpha = 1.0
        const thumbTip = points[4]
        const indexTip = points[8]
        const pinchCenterX = (thumbTip.x + indexTip.x) / 2
        const pinchCenterY = (thumbTip.y + indexTip.y) / 2

        if (hand.isPinching) {
          // Glowing pinch indicator when pinching
          ctx.beginPath()
          ctx.arc(pinchCenterX, pinchCenterY, 20, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(
            pinchCenterX, pinchCenterY, 0,
            pinchCenterX, pinchCenterY, 20
          )
          gradient.addColorStop(0, '#FDE047') // Bright yellow
          gradient.addColorStop(0.5, '#FBBF24AA')
          gradient.addColorStop(1, '#F59E0B00')
          ctx.fillStyle = gradient
          ctx.fill()

          // Inner bright circle
          ctx.beginPath()
          ctx.arc(pinchCenterX, pinchCenterY, 8, 0, Math.PI * 2)
          ctx.fillStyle = '#FEF08A'
          ctx.fill()
          ctx.strokeStyle = '#F59E0B'
          ctx.lineWidth = 3
          ctx.stroke()

          // Outer ring pulse effect
          ctx.beginPath()
          ctx.arc(pinchCenterX, pinchCenterY, 22, 0, Math.PI * 2)
          ctx.strokeStyle = color + '66'
          ctx.lineWidth = 2
          ctx.stroke()
        } else {
          // Small indicator when not pinching
          ctx.beginPath()
          ctx.arc(pinchCenterX, pinchCenterY, 5, 0, Math.PI * 2)
          ctx.fillStyle = color + '88'
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Draw line between thumb and index
          ctx.beginPath()
          ctx.moveTo(thumbTip.x, thumbTip.y)
          ctx.lineTo(indexTip.x, indexTip.y)
          ctx.strokeStyle = color + '44'
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [canvasRef, videoRef, handsDataRef, config, boundaries])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 200 }}
    />
  )
}
