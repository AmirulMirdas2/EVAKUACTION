/**
 * Represents a single 3D landmark point from MediaPipe Hands.
 */
export interface Landmark {
  x: number // Normalized X coordinate (0.0 - 1.0)
  y: number // Normalized Y coordinate (0.0 - 1.0)
  z: number // Depth coordinate
}

/**
 * Screen zones for the split-screen dual-player mode.
 * - 'left': Player 1 zone (x: 0.0 - 0.45)
 * - 'right': Player 2 zone (x: 0.55 - 1.0)
 * - 'buffer': Dead zone in the middle (x: 0.45 - 0.55)
 */
export type Zone = 'left' | 'right' | 'buffer'

/**
 * Processed hand data with gesture recognition metadata.
 */
export interface HandData {
  /** Which hand is detected ('Left' or 'Right') */
  handedness: 'Left' | 'Right'
  /** All 21 landmark points from MediaPipe */
  landmarks: Landmark[]
  /** Euclidean distance between thumb tip and index finger tip (normalized) */
  pinchDistance: number
  /** True when pinchDistance falls below the threshold */
  isPinching: boolean
  /** Normalized X position of index finger tip (landmark #8), range 0-1 */
  indexTipX: number
  /** Normalized Y position of index finger tip (landmark #8), range 0-1 */
  indexTipY: number
  /** The screen zone this hand is currently in */
  zone: Zone
}

/**
 * Configuration for the MediaPipe hand detection system.
 */
export interface MediaPipeConfig {
  /** Maximum number of hands to detect simultaneously */
  maxNumHands: number
  /** Detection confidence threshold (0.0 - 1.0) */
  minDetectionConfidence: number
  /** Tracking confidence threshold (0.0 - 1.0) */
  minTrackingConfidence: number
  /** Model complexity (0 = lite, 1 = full) */
  modelComplexity: 0 | 1
  /** Whether the video feed is mirrored (flipped horizontally) */
  mirrorMode: boolean
}

/**
 * Zone boundary thresholds (normalized X coordinates).
 */
export interface ZoneBoundaries {
  /** End of left zone / start of buffer */
  leftEnd: number
  /** End of buffer / start of right zone */
  rightStart: number
}

/**
 * Player color configuration.
 */
export interface PlayerColors {
  player1: string
  player2: string
  buffer: string
}

/**
 * Default zone boundaries.
 */
export const DEFAULT_ZONE_BOUNDARIES: ZoneBoundaries = {
  leftEnd: 0.45,
  rightStart: 0.55,
}

/**
 * Default player colors.
 */
export const DEFAULT_PLAYER_COLORS: PlayerColors = {
  player1: '#3B82F6', // Blue
  player2: '#EF4444', // Red
  buffer: '#6B7280',  // Gray
}

/**
 * Default MediaPipe configuration.
 */
export const DEFAULT_MEDIAPIPE_CONFIG: MediaPipeConfig = {
  maxNumHands: 2,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
  modelComplexity: 1,
  mirrorMode: true,
}

/**
 * Pinch detection threshold (normalized distance).
 */
export const PINCH_THRESHOLD = 0.06

/**
 * MediaPipe hand landmark connections for drawing the skeleton.
 * Each pair represents [startIndex, endIndex] of connected landmarks.
 */
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
]
