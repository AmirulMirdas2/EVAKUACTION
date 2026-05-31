/**
 * Types for the EVAKUACTION diagnostic test system.
 */

/** A single answer option for a diagnostic question */
export interface PilihanJawaban {
  id: string
  teks: string
}

/** A single diagnostic question */
export interface DiagnosticSoal {
  id: string
  pertanyaan: string
  pilihan: PilihanJawaban[]
  jawaban_benar: string
  penjelasan: string
}

/** Diagnostic result category */
export interface DiagnosticCategory {
  label: string
  emoji: string
  description: string
  recommendation: string
}

/** Diagnostic store interface */
export interface DiagnosticStore {
  currentQuestion: number
  answers: Record<string, string>
  score: number
  isCompleted: boolean
  setAnswer: (id: string, answer: string) => void
  nextQuestion: () => void
  calculateScore: () => void
  resetDiagnostic: () => void
}

/** Get category based on diagnostic score */
export function getDiagnosticCategory(score: number): DiagnosticCategory {
  if (score <= 3) {
    return {
      label: 'Pemula Siaga',
      emoji: '🌱',
      description:
        'Kamu perlu belajar lebih banyak tentang kesiapsiagaan bencana. Jangan khawatir, game ini akan membantumu!',
      recommendation: 'Baca galeri fakta dulu atau langsung main',
    }
  }
  if (score <= 6) {
    return {
      label: 'Pejuang Siaga',
      emoji: '⚡',
      description:
        'Pengetahuanmu cukup baik! Tingkatkan lagi dengan bermain.',
      recommendation: 'Siap bermain',
    }
  }
  return {
    label: 'Ahli Siaga',
    emoji: '🏆',
    description:
      'Luar biasa! Kamu sudah sangat paham kesiapsiagaan bencana.',
    recommendation: 'Tantang temanmu!',
  }
}
