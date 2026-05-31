import { create } from 'zustand'
import type { DiagnosticStore } from '../types/diagnostic.types'
import diagnosticSoalData from '../data/diagnosticSoal.json'
import type { DiagnosticSoal } from '../types/diagnostic.types'

const soalList = diagnosticSoalData as DiagnosticSoal[]

/**
 * Zustand store for managing diagnostic test state.
 *
 * Tracks current question index, user answers, score calculation,
 * and completion status for the pre-game diagnostic assessment.
 */
export const useDiagnosticStore = create<DiagnosticStore>((set, get) => ({
  currentQuestion: 0,
  answers: {},
  score: 0,
  isCompleted: false,

  setAnswer: (id: string, answer: string) =>
    set((state) => ({
      answers: { ...state.answers, [id]: answer },
    })),

  nextQuestion: () =>
    set((state) => {
      const next = state.currentQuestion + 1
      if (next >= soalList.length) {
        // All questions answered — calculate score
        const answers = get().answers
        let score = 0
        for (const soal of soalList) {
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
      let score = 0
      for (const soal of soalList) {
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
    }),
}))
