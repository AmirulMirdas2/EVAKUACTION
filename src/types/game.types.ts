/**
 * Types for the EVAKUACTION card game system.
 */

/** Jenis bencana yang tersedia dalam game */
export type JenisBencana = 'gempa' | 'tsunami' | 'banjir' | 'longsor' | 'gunung_api'

/** Data kartu prosedur keselamatan */
export interface CardData {
  id: string
  label: string
  /** Path ke static asset gambar kartu */
  image: string
  /** Urutan prosedur yang benar (1, 2, 3, dst) */
  urutan_benar: number
}

/** Data soal skenario bencana */
export interface SoalData {
  id: string
  /** Deskripsi situasi bencana */
  skenario: string
  jenis_bencana: JenisBencana
  /** Array kartu jawaban (urutan diacak saat render) */
  kartu: CardData[]
  /** Penjelasan ilmiah yang muncul setelah ronde */
  penjelasan_evaluasi: string
}

/** Posisi kartu di papan permainan */
export interface CardPosition {
  id: string
  x: number
  y: number
  isDragging: boolean
  owner: 'player1' | 'player2'
  /** null jika belum di-drop ke anchor */
  anchorSlot: number | null
  /** true jika kartu sudah dibalik face-down (setelah ready) */
  isFaceDown?: boolean
}

/** Result of a single round, stored for recap on the result page */
/** Detail of a single card's placement result */
export interface CardResult {
  cardId: string
  cardLabel: string
  cardImage: string
  isCorrect: boolean
  /** The slot the player placed the card in (null if not placed) */
  wrongSlot: number | null
  /** The correct slot for this card */
  correctSlot: number
}

export interface RondeResult {
  ronde: number
  jenisBencana: string
  /** The penjelasan_evaluasi text from the soal */
  penjelasan: string
  player1Score: number
  player2Score: number
  player1Cards: CardResult[]
  player2Cards: CardResult[]
}

/** Phase permainan */
export type GamePhase = 'diagnostic' | 'playing' | 'evaluation' | 'result'

/** State per player */
export interface PlayerState {
  score: number
  currentRonde: number
  /** Kartu yang sudah diletakkan di anchor */
  cardsPlaced: CardPosition[]
  isReady: boolean
}

/** Main game store interface */
export interface GameStore {
  phase: GamePhase
  currentSoal: SoalData | null
  /** Ronde ke berapa (1-5) */
  ronde: number
  /** Default 5 */
  maxRonde: number
  player1: PlayerState
  player2: PlayerState
  /** Timer countdown per ronde (in seconds) */
  timeRemaining: number
  timerEnabled: boolean
  /** History of each round's results for the result page */
  rondeHistory: RondeResult[]
  /** Flag indicating game has finished all rounds */
  gameFinished: boolean
  /** Shuffled soal list for this game session */
  shuffledSoalList: SoalData[]

  setPhase: (phase: GamePhase) => void
  setCurrentSoal: (soal: SoalData) => void
  placeCard: (player: 'player1' | 'player2', cardId: string, slot: number) => void
  removeCard: (player: 'player1' | 'player2', cardId: string) => void
  returnCardToDeck: (player: 'player1' | 'player2', cardId: string) => void
  setPlayerReady: (player: 'player1' | 'player2', ready: boolean) => void
  flipPlayerCards: (player: 'player1' | 'player2', isFaceDown: boolean) => void
  nextRonde: () => void
  resetGame: () => void
  decrementTimer: () => void
  evaluateRonde: () => void
}

/** Warna placeholder berdasarkan jenis bencana */
export const BENCANA_COLORS: Record<JenisBencana, string> = {
  gempa: '#F59E0B',
  tsunami: '#3B82F6',
  banjir: '#06B6D4',
  longsor: '#78716C',
  gunung_api: '#EF4444',
}

/** Emoji ikon berdasarkan jenis bencana */
export const BENCANA_EMOJI: Record<JenisBencana, string> = {
  gempa: '🏚️',
  tsunami: '🌊',
  banjir: '💧',
  longsor: '⛰️',
  gunung_api: '🌋',
}

/** Label bahasa Indonesia untuk jenis bencana */
export const BENCANA_LABEL: Record<JenisBencana, string> = {
  gempa: 'Gempa Bumi',
  tsunami: 'Tsunami',
  banjir: 'Banjir',
  longsor: 'Tanah Longsor',
  gunung_api: 'Gunung Berapi',
}
