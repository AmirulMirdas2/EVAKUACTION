import { create } from 'zustand'
import type { HandData } from '../types/gesture.types'

/**
 * Zustand store for managing gesture state across components.
 * 
 * This store is updated ONLY when pinch state changes to avoid
 * unnecessary re-renders. Continuous hand position data is managed
 * via useRef in the useMediaPipe hook for performance.
 */
interface GestureStore {
  /** Current hand data for Player 1 (left zone), null if no hand detected */
  player1Hand: HandData | null
  /** Current hand data for Player 2 (right zone), null if no hand detected */
  player2Hand: HandData | null
  /** Convenience getter: whether Player 1 is currently pinching */
  isPlayer1Pinching: boolean
  /** Convenience getter: whether Player 2 is currently pinching */
  isPlayer2Pinching: boolean
  /** Update Player 1's hand data */
  setPlayer1Hand: (hand: HandData | null) => void
  /** Update Player 2's hand data */
  setPlayer2Hand: (hand: HandData | null) => void
  /** Camera availability status */
  cameraStatus: 'available' | 'unavailable' | 'loading'
  /** Set camera status */
  setCameraStatus: (status: 'available' | 'unavailable' | 'loading') => void
  /** Number of hands currently detected */
  detectedHandsCount: number
  /** Set detected hands count */
  setDetectedHandsCount: (count: number) => void
}

export const useGestureStore = create<GestureStore>((set) => ({
  player1Hand: null,
  player2Hand: null,
  isPlayer1Pinching: false,
  isPlayer2Pinching: false,
  cameraStatus: 'loading',
  detectedHandsCount: 0,

  setPlayer1Hand: (hand) =>
    set({
      player1Hand: hand,
      isPlayer1Pinching: hand?.isPinching ?? false,
    }),

  setPlayer2Hand: (hand) =>
    set({
      player2Hand: hand,
      isPlayer2Pinching: hand?.isPinching ?? false,
    }),

  setCameraStatus: (status) => set({ cameraStatus: status }),
  
  setDetectedHandsCount: (count) => set({ detectedHandsCount: count }),
}))
