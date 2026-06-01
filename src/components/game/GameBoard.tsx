import { useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CameraView from '../camera/CameraView'
import PlayerZone from './PlayerZone'
import ScenarioDisplay from './ScenarioDisplay'
import { useGameStore } from '../../stores/gameStore'
import type { SoalData } from '../../types/game.types'
import { BENCANA_COLORS, BENCANA_EMOJI } from '../../types/game.types'

/**
 * EvaluationPopup — Overlay showing evaluation results and scientific explanation.
 */
function EvaluationPopup({
  soal,
  p1Score,
  p2Score,
  onNext,
  isLastRonde,
}: {
  soal: SoalData
  p1Score: number
  p2Score: number
  onNext: () => void
  isLastRonde: boolean
}) {
  const color = BENCANA_COLORS[soal.jenis_bencana]
  const emoji = BENCANA_EMOJI[soal.jenis_bencana]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{
          maxWidth: 560,
          width: '90%',
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(15, 15, 30, 0.97) 0%, rgba(10, 10, 25, 0.97) 100%)',
          border: `1px solid ${color}44`,
          padding: '28px 32px',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${color}15`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative top glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            borderRadius: '0 0 4px 4px',
          }}
        />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 40 }}>{emoji}</span>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#fff',
              margin: '8px 0 4px',
              letterSpacing: '0.02em',
            }}
          >
            Evaluasi Ronde
          </h2>
          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
            }}
          >
            Berikut penjelasan ilmiah prosedur yang benar
          </p>
        </div>

        {/* Score comparison */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#3B82F6',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Player 1
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              +{p1Score}
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 50,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignSelf: 'center',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#EF4444',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Player 2
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              +{p2Score}
            </div>
          </div>
        </div>

        {/* Scientific explanation */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            backgroundColor: `${color}0D`,
            border: `1px solid ${color}22`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: color,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            💡 Penjelasan Ilmiah
          </div>
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
            }}
          >
            {soal.penjelasan_evaluasi}
          </p>
        </div>

        {/* Correct order */}
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            📋 Urutan Yang Benar
          </div>
          {soal.kartu
            .slice()
            .sort((a, b) => a.urutan_benar - b.urutan_benar)
            .map((card) => (
              <div
                key={card.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    backgroundColor: '#22C55E22',
                    border: '1px solid #22C55E44',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#22C55E',
                    flexShrink: 0,
                  }}
                >
                  {card.urutan_benar}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.4,
                  }}
                >
                  {card.label}
                </span>
              </div>
            ))}
        </div>

        {/* Next button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: 12,
            border: 'none',
            background: `linear-gradient(135deg, ${color} 0%, ${color}BB 100%)`,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: `0 4px 16px ${color}33`,
          }}
        >
          {isLastRonde ? '🏁 Lihat Hasil Akhir' : '➡️ Ronde Berikutnya'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/**
 * GameBoard.tsx — Main game component integrating all pieces.
 *
 * Layout:
 * - Background: CameraView (camera feed + gesture overlay + boundary divider)
 * - Middle layer: PlayerZone left (P1) + PlayerZone right (P2)
 * - Top layer: ScenarioDisplay + EvaluationPopup
 *
 * Manages:
 * - Loading and cycling through soal data
 * - Timer countdown
 * - Phase transitions (playing → evaluation → next round)
 */
export default function GameBoard() {
  const navigate = useNavigate()
  const phase = useGameStore((s) => s.phase)
  const ronde = useGameStore((s) => s.ronde)
  const maxRonde = useGameStore((s) => s.maxRonde)
  const currentSoal = useGameStore((s) => s.currentSoal)
  const timeRemaining = useGameStore((s) => s.timeRemaining)
  const timerEnabled = useGameStore((s) => s.timerEnabled)
  const player1 = useGameStore((s) => s.player1)
  const player2 = useGameStore((s) => s.player2)
  const setCurrentSoal = useGameStore((s) => s.setCurrentSoal)
  const nextRonde = useGameStore((s) => s.nextRonde)
  const decrementTimer = useGameStore((s) => s.decrementTimer)
  const evaluateRonde = useGameStore((s) => s.evaluateRonde)
  const shuffledSoalList = useGameStore((s) => s.shuffledSoalList)
  const resetGame = useGameStore((s) => s.resetGame)

  const location = useLocation()

  // If navigated here with state.reset = true (from ResultPage), reset the game state safely
  useEffect(() => {
    if (location.state?.reset) {
      resetGame()
      // Clear the state so it doesn't loop if the user refreshes
      navigate('/game', { replace: true, state: {} })
    }
  }, [location.state, navigate, resetGame])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load soal for current ronde from the shuffled list
  useEffect(() => {
    if (phase === 'playing' && !currentSoal) {
      const soalIndex = (ronde - 1) % shuffledSoalList.length
      setCurrentSoal(shuffledSoalList[soalIndex])
    }
  }, [phase, ronde, currentSoal, setCurrentSoal, shuffledSoalList])

  // Timer countdown
  useEffect(() => {
    if (phase === 'playing' && timerEnabled) {
      timerRef.current = setInterval(() => {
        const state = useGameStore.getState()
        if (state.timeRemaining <= 0) {
          // Time's up — force evaluation
          evaluateRonde()
        } else {
          decrementTimer()
        }
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, timerEnabled, decrementTimer, evaluateRonde])

  // Calculate ronde scores for evaluation popup
  const calculateRondeScore = useCallback(
    (playerCards: { id: string; anchorSlot: number | null }[]) => {
      if (!currentSoal) return 0
      let score = 0
      for (const placed of playerCards) {
        const cardData = currentSoal.kartu.find((k) => k.id === placed.id)
        if (cardData && placed.anchorSlot === cardData.urutan_benar) {
          score += 10
        }
      }
      return score
    },
    [currentSoal]
  )

  // Handle next round
  const handleNextRonde = () => {
    if (ronde >= maxRonde) {
      // Game finished — navigate to result page
      navigate('/result')
    } else {
      nextRonde()
    }
  }

  return (
    <div
      id="game-board"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ── Layer 1: Camera background ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <CameraView />
      </div>

      {/* ── Layer 2: Game overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 25,
          pointerEvents: 'none',
        }}
      >
        {/* Scenario Display (shared, top center) */}
        {currentSoal && phase === 'playing' && (
          <div style={{ pointerEvents: 'auto' }}>
            <ScenarioDisplay
              soal={currentSoal}
              ronde={ronde}
              maxRonde={maxRonde}
              timeRemaining={timeRemaining}
              timerEnabled={timerEnabled}
            />
          </div>
        )}

        {/* Player zones — split screen */}
        {currentSoal && (phase === 'playing' || phase === 'evaluation') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              pointerEvents: 'auto',
            }}
          >
            <PlayerZone
              player="player1"
              soal={currentSoal}
              isEvaluation={phase === 'evaluation'}
            />
            <PlayerZone
              player="player2"
              soal={currentSoal}
              isEvaluation={phase === 'evaluation'}
            />
          </div>
        )}
      </div>

      {/* ── Layer 3: Evaluation popup overlay ── */}
      <AnimatePresence>
        {phase === 'evaluation' && currentSoal && (
          <EvaluationPopup
            soal={currentSoal}
            p1Score={calculateRondeScore(player1.cardsPlaced)}
            p2Score={calculateRondeScore(player2.cardsPlaced)}
            onNext={handleNextRonde}
            isLastRonde={ronde >= maxRonde}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
