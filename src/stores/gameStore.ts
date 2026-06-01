import { create } from 'zustand'
import type { GameStore, SoalData, PlayerState, CardPosition, RondeResult, CardResult } from '../types/game.types'
import soalData from '../data/soal.json'

/**
 * Fisher-Yates shuffle algorithm.
 * Returns a new shuffled array without mutating the original.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Shuffle soal order AND shuffle kartu within each soal (display order only).
 * urutan_benar on each card remains unchanged.
 */
function buildShuffledSoalList(): SoalData[] {
  const rawSoalList = soalData as SoalData[]
  const shuffledOrder = shuffleArray(rawSoalList)
  return shuffledOrder.map((soal) => ({
    ...soal,
    kartu: shuffleArray(soal.kartu), // shuffle card display order; urutan_benar stays intact
  }))
}

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
 * Build per-card correctness array for ronde history.
 * Now includes wrongSlot, correctSlot, cardLabel, and cardImage.
 */
function buildCardResults(
  cardsPlaced: CardPosition[],
  soal: SoalData
): CardResult[] {
  return cardsPlaced.map((placed) => {
    const cardData = soal.kartu.find((k) => k.id === placed.id)
    return {
      cardId: placed.id,
      cardLabel: cardData?.label ?? placed.id,
      cardImage: cardData?.image ?? '',
      isCorrect: !!(cardData && placed.anchorSlot === cardData.urutan_benar),
      wrongSlot: placed.anchorSlot,
      correctSlot: cardData?.urutan_benar ?? 0,
    }
  })
}

/**
 * Zustand store for managing game state.
 *
 * Manages game phases, rounds, player states, card placement,
 * scoring, evaluation logic, and round history for the result page.
 *
 * Soal are shuffled on every initGame/resetGame call using Fisher-Yates.
 */
export const useGameStore = create<GameStore>((set, get) => {
  // Build initial shuffled soal list
  const initialShuffledSoal = buildShuffledSoalList()

  return {
    phase: 'playing',
    currentSoal: null,
    ronde: 1,
    maxRonde: 5,
    player1: createDefaultPlayerState(),
    player2: createDefaultPlayerState(),
    timeRemaining: 60,
    timerEnabled: true,
    rondeHistory: [],
    gameFinished: false,
    shuffledSoalList: initialShuffledSoal,

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

    returnCardToDeck: (player, cardId) =>
      set((state) => {
        const playerState = state[player]
        return {
          [player]: {
            ...playerState,
            cardsPlaced: playerState.cardsPlaced.filter((c) => c.id !== cardId),
          },
        }
      }),

    flipPlayerCards: (player, isFaceDown) =>
      set((state) => ({
        [player]: {
          ...state[player],
          cardsPlaced: state[player].cardsPlaced.map(c => ({ ...c, isFaceDown }))
        }
      })),

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
        rondeHistory: [],
        gameFinished: false,
        shuffledSoalList: buildShuffledSoalList(), // Re-shuffle on every new game
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

        // Build ronde history entry with full card details
        const rondeResult: RondeResult = {
          ronde: state.ronde,
          jenisBencana: state.currentSoal?.jenis_bencana || '',
          penjelasan: state.currentSoal?.penjelasan_evaluasi || '',
          player1Score: p1Score,
          player2Score: p2Score,
          player1Cards: state.currentSoal
            ? buildCardResults(state.player1.cardsPlaced, state.currentSoal)
            : [],
          player2Cards: state.currentSoal
            ? buildCardResults(state.player2.cardsPlaced, state.currentSoal)
            : [],
        }

        const isLastRonde = state.ronde >= state.maxRonde

        return {
          phase: 'evaluation',
          player1: {
            ...state.player1,
            score: state.player1.score + p1Score,
            isReady: true,
            cardsPlaced: state.player1.cardsPlaced.map(c => ({ ...c, isFaceDown: false }))
          },
          player2: {
            ...state.player2,
            score: state.player2.score + p2Score,
            isReady: true,
            cardsPlaced: state.player2.cardsPlaced.map(c => ({ ...c, isFaceDown: false }))
          },
          rondeHistory: [...state.rondeHistory, rondeResult],
          gameFinished: isLastRonde,
        }
      }),
  }
})
