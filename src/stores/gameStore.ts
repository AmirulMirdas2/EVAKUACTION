import { create } from 'zustand'
import type { GameStore, SoalData, PlayerState, CardPosition } from '../types/game.types'

/**
 * Default player state factory.
 */
function createDefaultPlayerState(): PlayerState {
  return {
    score: 0,
    currentRonde: 1,
    cardsPlaced: [],
    isReady: false,
  }
}

/**
 * Calculate score for a player's placed cards.
 * +10 points for each card placed in the correct slot.
 */
function calculateScore(cardsPlaced: CardPosition[], soal: SoalData | null): number {
  if (!soal) return 0
  let score = 0
  for (const placed of cardsPlaced) {
    const cardData = soal.kartu.find((k) => k.id === placed.id)
    if (cardData && placed.anchorSlot === cardData.urutan_benar) {
      score += 10
    }
  }
  return score
}

/**
 * Zustand store for managing game state.
 *
 * Manages game phases, rounds, player states, card placement,
 * scoring, and evaluation logic.
 */
export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'playing',
  currentSoal: null,
  ronde: 1,
  maxRonde: 5,
  player1: createDefaultPlayerState(),
  player2: createDefaultPlayerState(),
  timeRemaining: 60,
  timerEnabled: true,

  setPhase: (phase) => set({ phase }),

  setCurrentSoal: (soal: SoalData) =>
    set({
      currentSoal: soal,
      player1: { ...createDefaultPlayerState(), score: get().player1.score },
      player2: { ...createDefaultPlayerState(), score: get().player2.score },
      timeRemaining: 60,
    }),

  placeCard: (player, cardId, slot) =>
    set((state) => {
      const playerState = state[player]
      // Remove card from any previous slot
      const filtered = playerState.cardsPlaced.filter((c) => c.id !== cardId)
      // Also remove any card currently in this slot
      const withoutSlot = filtered.filter((c) => c.anchorSlot !== slot)
      const newPlaced: CardPosition = {
        id: cardId,
        x: 0,
        y: 0,
        isDragging: false,
        owner: player,
        anchorSlot: slot,
      }
      return {
        [player]: {
          ...playerState,
          cardsPlaced: [...withoutSlot, newPlaced],
        },
      }
    }),

  removeCard: (player, cardId) =>
    set((state) => {
      const playerState = state[player]
      return {
        [player]: {
          ...playerState,
          cardsPlaced: playerState.cardsPlaced.filter((c) => c.id !== cardId),
        },
      }
    }),

  setPlayerReady: (player, ready) =>
    set((state) => ({
      [player]: {
        ...state[player],
        isReady: ready,
      },
    })),

  nextRonde: () =>
    set((state) => {
      const newRonde = state.ronde + 1
      return {
        ronde: newRonde,
        phase: 'playing',
        player1: {
          ...createDefaultPlayerState(),
          score: state.player1.score,
          currentRonde: newRonde,
        },
        player2: {
          ...createDefaultPlayerState(),
          score: state.player2.score,
          currentRonde: newRonde,
        },
        timeRemaining: 60,
        currentSoal: null,
      }
    }),

  resetGame: () =>
    set({
      phase: 'playing',
      currentSoal: null,
      ronde: 1,
      player1: createDefaultPlayerState(),
      player2: createDefaultPlayerState(),
      timeRemaining: 60,
    }),

  decrementTimer: () =>
    set((state) => {
      const newTime = Math.max(0, state.timeRemaining - 1)
      return { timeRemaining: newTime }
    }),

  evaluateRonde: () =>
    set((state) => {
      const p1Score = calculateScore(state.player1.cardsPlaced, state.currentSoal)
      const p2Score = calculateScore(state.player2.cardsPlaced, state.currentSoal)
      return {
        phase: 'evaluation',
        player1: {
          ...state.player1,
          score: state.player1.score + p1Score,
          isReady: true,
        },
        player2: {
          ...state.player2,
          score: state.player2.score + p2Score,
          isReady: true,
        },
      }
    }),
}))
