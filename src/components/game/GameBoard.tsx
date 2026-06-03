import { useEffect, useCallback, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CameraView from '../camera/CameraView'
import PlayerZone from './PlayerZone'
import ScenarioDisplay from './ScenarioDisplay'
import { useGameStore } from '../../stores/gameStore'
import type { SoalData, CardPosition } from '../../types/game.types'
import { BENCANA_COLORS, BENCANA_EMOJI } from '../../types/game.types'

/**
 * EvaluationPopup — Overlay showing evaluation results and scientific explanation.
 */
function EvaluationPopup({
  soal,
  p1Score,
  p2Score,
  p1Cards,
  p2Cards,
  onNext,
  isLastRonde,
}: {
  soal: SoalData
  p1Score: number
  p2Score: number
  p1Cards: CardPosition[]
  p2Cards: CardPosition[]
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
          maxWidth: 900,
          width: '80%',
          minHeight: 400,
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(15, 15, 30, 0.97) 0%, rgba(10, 10, 25, 0.97) 100%)',
          border: `1px solid ${color}44`,
          padding: '32px 48px',
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#fff',
              margin: '8px 0 4px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            {emoji} EVALUASI — {soal.jenis_bencana.replace('_', ' ')}
          </h2>
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

        {/* Correct order */}
        <div
          style={{
            marginBottom: 24,
            padding: '24px 32px',
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 16,
            }}
          >
            📋 URUTAN YANG BENAR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {soal.kartu
              .slice()
              .sort((a, b) => a.urutan_benar - b.urutan_benar)
              .map((card) => {
                const p1Placed = p1Cards.find(c => c.id === card.id)
                const p2Placed = p2Cards.find(c => c.id === card.id)
                const p1Correct = p1Placed && p1Placed.anchorSlot === card.urutan_benar
                const p2Correct = p2Placed && p2Placed.anchorSlot === card.urutan_benar

                return (
                  <div
                    key={card.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '8px 0',
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: '#22C55E22',
                        border: '1px solid #22C55E44',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#22C55E',
                        flexShrink: 0,
                      }}
                    >
                      {card.urutan_benar}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: '#fff',
                        flex: 1,
                      }}
                    >
                      {card.label}
                    </span>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 16, color: p1Correct ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
                        {p1Correct ? '✓ P1' : '✗ P1'}
                      </span>
                      <span style={{ fontSize: 16, color: p2Correct ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
                        {p2Correct ? '✓ P2' : '✗ P2'}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Scientific explanation */}
        <div
          style={{
            padding: '24px 32px',
            borderRadius: 16,
            backgroundColor: `${color}0D`,
            border: `1px solid ${color}22`,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: color,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            📖 PENJELASAN
          </div>
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
            }}
          >
            {soal.penjelasan_evaluasi}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            style={{
              padding: '16px 48px',
              borderRadius: 16,
              border: 'none',
              background: '#22C55E',
              color: '#fff',
              fontSize: 20,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              boxShadow: `0 4px 20px rgba(34, 197, 94, 0.4)`,
            }}
          >
            {isLastRonde ? '🏁 LIHAT HASIL AKHIR' : '➡️ LANJUT KE RONDE BERIKUTNYA'}
          </motion.button>
        </div>
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
  const setPhase = useGameStore((s) => s.setPhase)

  const location = useLocation()

  const [showTutorial, setShowTutorial] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownNum, setCountdownNum] = useState<number | string>(3)
  const [resultCountdown, setResultCountdown] = useState<number | null>(null)

  // Handle refresh and initial onboarding
  useEffect(() => {
    // 1. Detect refresh
    const isReload = performance.getEntriesByType('navigation').some(
      (n) => (n as PerformanceNavigationTiming).type === 'reload'
    )
    if (isReload && ronde > 1) {
      alert('Sesi berakhir, mulai ulang')
      window.location.href = '/'
      return
    }

    // 2. Show tutorial/countdown on first round
    if (phase === 'playing' && ronde === 1) {
      const hasSeenTutorial = localStorage.getItem('evakuaction_tutorial_seen')
      if (!hasSeenTutorial) {
        setShowTutorial(true)
      } else {
        startCountdown()
      }
    } else if (phase === 'playing' && ronde > 1) {
      startCountdown()
    }
  }, [phase, ronde])

  const startCountdown = () => {
    setShowTutorial(false)
    setShowCountdown(true)
    setCountdownNum(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdownNum(count)
      } else if (count === 0) {
        setCountdownNum('MULAI!')
      } else {
        clearInterval(interval)
        setShowCountdown(false)
      }
    }, 1000)
  }

  const handleSkipTutorial = () => {
    localStorage.setItem('evakuaction_tutorial_seen', 'true')
    startCountdown()
  }

  // Handle showing_result phase
  useEffect(() => {
    if (phase === 'showing_result') {
      setResultCountdown(3)
      let count = 3
      const interval = setInterval(() => {
        count--
        if (count > 0) {
          setResultCountdown(count)
        } else {
          clearInterval(interval)
          setResultCountdown(null)
          setPhase('evaluation')
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [phase, setPhase])

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

  // Preload images for the current active scenario
  useEffect(() => {
    if (currentSoal) {
      currentSoal.kartu.forEach((kartu) => {
        const img = new Image()
        img.src = kartu.image
      })
    }
  }, [currentSoal])

  // Timer countdown
  useEffect(() => {
    if (phase === 'playing' && timerEnabled && !showTutorial && !showCountdown) {
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
  }, [phase, timerEnabled, showTutorial, showCountdown, decrementTimer, evaluateRonde])

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

        {/* Sound Indicator (UI Only) */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 50,
          }}
        >
          <span style={{ fontSize: 24 }}>🔊</span>
        </div>

        {/* Player zones — split screen */}
        {currentSoal && (phase === 'playing' || phase === 'showing_result' || phase === 'evaluation') && (
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
              isEvaluation={phase === 'showing_result' || phase === 'evaluation'}
            />
            <PlayerZone
              player="player2"
              soal={currentSoal}
              isEvaluation={phase === 'showing_result' || phase === 'evaluation'}
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
            p1Cards={player1.cardsPlaced}
            p2Cards={player2.cardsPlaced}
            onNext={handleNextRonde}
            isLastRonde={ronde >= maxRonde}
          />
        )}
      </AnimatePresence>
      {/* ── Layer 4: Tutorial & Countdown Overlays ── */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              padding: 32,
            }}
          >
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, color: '#F59E0B' }}>
              🎓 Tutorial Gestur Tangan
            </h2>
            <div style={{ display: 'flex', gap: 40, marginBottom: 60 }}>
              <div style={{ textAlign: 'center', maxWidth: 200 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤏</div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>1. Jepit Kartu</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Dekatkan ibu jari dan telunjuk untuk menjepit kartu.</p>
              </div>
              <div style={{ textAlign: 'center', maxWidth: 200 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🖐️</div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>2. Seret ke Slot</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Tahan jepitan dan gerakkan tangan untuk meletakkan kartu.</p>
              </div>
              <div style={{ textAlign: 'center', maxWidth: 200 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏱️</div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>3. Kunci Jawaban</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Jepit area SELESAI selama 1.5 detik untuk mengunci jawaban.</p>
              </div>
            </div>
            <button
              onClick={handleSkipTutorial}
              style={{
                padding: '16px 40px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(59,130,246,0.4)'
              }}
            >
              Mengerti, Mulai!
            </button>
          </motion.div>
        )}

        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              key={countdownNum}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: '#F59E0B',
                textShadow: '0 0 40px rgba(245,158,11,0.5)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {countdownNum}
            </motion.div>
          </motion.div>
        )}

        {/* showing_result phase overlay */}
        {phase === 'showing_result' && resultCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 55,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key={resultCountdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '4px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                fontWeight: 900,
                color: '#F59E0B',
                marginBottom: 24,
                boxShadow: '0 0 40px rgba(245,158,11,0.5)',
              }}
            >
              {resultCountdown}
            </motion.div>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Perhatikan hasil jawabanmu...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
