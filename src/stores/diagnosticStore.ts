import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiagnosticStore, DiagnosticSoal, PilihanJawaban } from '../types/diagnostic.types'
import diagnosticSoalData from '../data/diagnosticSoal.json'

const soalList = diagnosticSoalData as DiagnosticSoal[]

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
 * Shuffle diagnostic questions AND their answer options.
 * jawaban_benar uses the option `id`, not position, so shuffling options is safe.
 */
function buildShuffledDiagnostic(): DiagnosticSoal[] {
  const shuffledQuestions = shuffleArray(soalList)
  return shuffledQuestions.map((soal) => ({
    ...soal,
    pilihan: shuffleArray(soal.pilihan) as PilihanJawaban[],
  }))
}

/**
 * Zustand store for managing diagnostic test state.
 *
 * Tracks current question index, user answers, score calculation,
 * and completion status for the pre-game diagnostic assessment.
 *
 * Questions and their options are shuffled via initDiagnostic().
 */
export const useDiagnosticStore = create<DiagnosticStore>()(
  persist(
    (set, get) => ({
      currentQuestion: 0,
      answers: {},
      score: 0,
      isCompleted: false,
      shuffledQuestions: [],

      initDiagnostic: () =>
        set({
          currentQuestion: 0,
          answers: {},
          score: 0,
          isCompleted: false,
          shuffledQuestions: buildShuffledDiagnostic(),
        }),

      setAnswer: (id: string, answer: string) =>
        set((state) => ({
          answers: { ...state.answers, [id]: answer },
        })),

      nextQuestion: () =>
        set((state) => {
          const shuffled = get().shuffledQuestions
          const next = state.currentQuestion + 1
          if (next >= shuffled.length) {
            // All questions answered — calculate score
            const answers = get().answers
            let score = 0
            for (const soal of shuffled) {
              if (answers[soal.id] === soal.jawaban_benar) {
                score++
              }
            }
            return {
              currentQuestion: next,
              score,
              isCompleted: true,
            }
          }
          return { currentQuestion: next }
        }),

      calculateScore: () =>
        set(() => {
          const answers = get().answers
          const shuffled = get().shuffledQuestions
          let score = 0
          for (const soal of shuffled) {
            if (answers[soal.id] === soal.jawaban_benar) {
              score++
            }
          }
          return { score, isCompleted: true }
        }),

      resetDiagnostic: () =>
        set({
          currentQuestion: 0,
          answers: {},
          score: 0,
          isCompleted: false,
          shuffledQuestions: [],
        }),
    }),
    {
      name: 'evakuaction-diagnostic',
      partialize: (state) => ({
        isCompleted: state.isCompleted,
        score: state.score,
      }),
    }
  )
)
