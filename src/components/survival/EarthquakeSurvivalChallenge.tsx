import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SurvivalStage1 from './stages/SurvivalStage1'
import SurvivalStage2 from './stages/SurvivalStage2'
import SurvivalStage3 from './stages/SurvivalStage3'
import SurvivalStage4 from './stages/SurvivalStage4'
import SurvivalResult from './SurvivalResult'

/**
 * Score breakdown per stage
 */
export interface StageScore {
  stage: number
  title: string
  score: number
  maxScore: number
  passed: boolean
}

interface EarthquakeSurvivalChallengeProps {
  player: 'player1' | 'player2'
  onComplete: (totalScore: number, stageScores: StageScore[]) => void
}

/**
 * EarthquakeSurvivalChallenge — Main survival challenge controller.
 *
 * Orchestrates 4 sequential stages teaching earthquake mitigation:
 * 1. Berlindung di Bawah Meja (Drop, Cover, Hold On)
 * 2. Menjauhi Kaca (Avoid glass/windows)
 * 3. Evakuasi Melalui Tangga (Use stairs, not elevator)
 * 4. Menuju Titik Kumpul (Go to assembly point)
 *
 * All interactions use the existing pinch/drag system via useSurvivalDrag hook.
 */
export default function EarthquakeSurvivalChallenge({
  player,
  onComplete,
}: EarthquakeSurvivalChallengeProps) {
  const [currentStage, setCurrentStage] = useState(0) // 0 = intro, 1-4 = stages, 5 = result
  const [stageScores, setStageScores] = useState<StageScore[]>([])
  const [showTransition, setShowTransition] = useState(false)
  const [transitionText, setTransitionText] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Start automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mountedRef.current) setCurrentStage(1)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleStageComplete = useCallback((stage: number, passed: boolean) => {
    const titles = [
      '',
      'Berlindung di Bawah Meja',
      'Menjauhi Kaca',
      'Evakuasi Melalui Tangga',
      'Menuju Titik Kumpul',
    ]

    const score: StageScore = {
      stage,
      title: titles[stage],
      score: passed ? 25 : 0,
      maxScore: 25,
      passed,
    }

    setStageScores(prev => [...prev, score])

    // Show transition message
    const nextStage = stage + 1
    if (nextStage <= 4) {
      setTransitionText(passed ? '✓ Berhasil! Lanjut ke tahap berikutnya...' : '✗ Gagal! Lanjut ke tahap berikutnya...')
      setShowTransition(true)
      setTimeout(() => {
        if (mountedRef.current) {
          setShowTransition(false)
          setCurrentStage(nextStage)
        }
      }, 2000)
    } else {
      // All stages done
      setTransitionText(passed ? '✓ Evakuasi Berhasil!' : '✗ Gagal!')
      setShowTransition(true)
      setTimeout(() => {
        if (mountedRef.current) {
          setShowTransition(false)
          setCurrentStage(5)
        }
      }, 2000)
    }
  }, [])

  const handleResultComplete = useCallback(() => {
    const totalScore = stageScores.reduce((sum, s) => sum + s.score, 0)
    onComplete(totalScore, stageScores)
  }, [stageScores, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Subtle earthquake ambient background pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(239, 68, 68, 0.03) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Stage Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 110,
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🏚️</span>
          <span style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#F59E0B',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Survival Challenge — Gempa Bumi
          </span>
        </div>

        {/* Player indicator */}
        <div style={{
          padding: '4px 12px',
          borderRadius: 8,
          background: player === 'player1' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${player === 'player1' ? '#3B82F633' : '#EF444433'}`,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: player === 'player1' ? '#3B82F6' : '#EF4444',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {player === 'player1' ? 'Player 1' : 'Player 2'}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[1, 2, 3, 4].map((stage) => {
            const stageScore = stageScores.find(s => s.stage === stage)
            let bgColor = 'rgba(255,255,255,0.1)'
            let borderCol = 'rgba(255,255,255,0.15)'

            if (stage === currentStage) {
              bgColor = '#F59E0B'
              borderCol = '#F59E0B'
            } else if (stageScore?.passed) {
              bgColor = '#22C55E'
              borderCol = '#22C55E'
            } else if (stageScore && !stageScore.passed) {
              bgColor = '#EF4444'
              borderCol = '#EF4444'
            }

            return (
              <div key={stage} style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: bgColor,
                border: `2px solid ${borderCol}`,
                transition: 'all 0.3s ease',
                boxShadow: stage === currentStage ? '0 0 8px #F59E0B88' : 'none',
              }} />
            )
          })}
        </div>
      </div>

      {/* Stage content */}
      <div style={{
        position: 'absolute',
        top: 56,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        <AnimatePresence mode="wait">
          {/* Intro */}
          {currentStage === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: 80 }}
              >
                🏚️
              </motion.div>
              <h1 style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#F59E0B',
                letterSpacing: '0.04em',
                textAlign: 'center',
              }}>
                SURVIVAL CHALLENGE
              </h1>
              <p style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                maxWidth: 500,
                lineHeight: 1.6,
              }}>
                Gempa bumi terjadi! Pelajari langkah-langkah mitigasi
                dengan memindahkan karakter ke zona yang benar.
              </p>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: 14,
                  color: '#F59E0B',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Memulai...
              </motion.div>
            </motion.div>
          )}

          {/* Stage 1 */}
          {currentStage === 1 && (
            <SurvivalStage1
              key="stage1"
              player={player}
              onComplete={(passed) => handleStageComplete(1, passed)}
            />
          )}

          {/* Stage 2 */}
          {currentStage === 2 && (
            <SurvivalStage2
              key="stage2"
              player={player}
              onComplete={(passed) => handleStageComplete(2, passed)}
            />
          )}

          {/* Stage 3 */}
          {currentStage === 3 && (
            <SurvivalStage3
              key="stage3"
              player={player}
              onComplete={(passed) => handleStageComplete(3, passed)}
            />
          )}

          {/* Stage 4 */}
          {currentStage === 4 && (
            <SurvivalStage4
              key="stage4"
              player={player}
              onComplete={(passed) => handleStageComplete(4, passed)}
            />
          )}

          {/* Final Result */}
          {currentStage === 5 && (
            <SurvivalResult
              key="result"
              stageScores={stageScores}
              onComplete={handleResultComplete}
            />
          )}
        </AnimatePresence>

        {/* Stage transition overlay */}
        <AnimatePresence>
          {showTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 120,
              }}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: transitionText.startsWith('✓') ? '#22C55E' : '#EF4444',
                  textAlign: 'center',
                  textShadow: transitionText.startsWith('✓')
                    ? '0 0 20px rgba(34,197,94,0.5)'
                    : '0 0 20px rgba(239,68,68,0.5)',
                }}
              >
                {transitionText}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/**
 * Global API to start the earthquake challenge.
 * Can be called from outside React.
 */
let _startChallengeCallback: ((player: 'player1' | 'player2') => void) | null = null

export function registerChallengeStarter(cb: (player: 'player1' | 'player2') => void) {
  _startChallengeCallback = cb
}

export function startEarthquakeChallenge(player: 'player1' | 'player2' = 'player1') {
  _startChallengeCallback?.(player)
}
