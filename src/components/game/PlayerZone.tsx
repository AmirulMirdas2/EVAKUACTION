import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CardDeck from '../card/CardDeck'
import AnswerAnchor from '../card/AnswerAnchor'
import { useDragGesture } from '../../hooks/useDragGesture'
import { useGameStore } from '../../stores/gameStore'
import { liveHandDataRef } from '../../stores/gestureStore'
import type { SoalData, CardPosition } from '../../types/game.types'
import { BENCANA_EMOJI, BENCANA_COLORS } from '../../types/game.types'
import { DEFAULT_PLAYER_COLORS } from '../../types/gesture.types'

interface PlayerZoneProps {
  player: 'player1' | 'player2'
  soal: SoalData
  /** Whether we're in evaluation phase */
  isEvaluation: boolean
}

/**
 * PlayerZone.tsx — Self-contained zone for a single player.
 *
 * Contains:
 * - Player header with name + score
 * - CardDeck (cards not yet placed)
 * - AnswerAnchor slots (4 horizontal slots at bottom)
 * - "Selesai" (Done) button when all slots are filled
 *
 * The zone is isolated: Player 1's cards can't be dragged to Player 2's zone.
 */
export default function PlayerZone({ player, soal, isEvaluation }: PlayerZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Game state
  const playerState = useGameStore((s) => s[player])
  const phase = useGameStore((s) => s.phase)
  const setPlayerReady = useGameStore((s) => s.setPlayerReady)
  const flipPlayerCards = useGameStore((s) => s.flipPlayerCards)
  const evaluateRonde = useGameStore((s) => s.evaluateRonde)

  // Drag gesture hook
  const { registerCard, registerAnchor } = useDragGesture(player, containerRef)

  // Player config
  const isP1 = player === 'player1'
  const playerColor = isP1 ? DEFAULT_PLAYER_COLORS.player1 : DEFAULT_PLAYER_COLORS.player2
  const playerLabel = isP1 ? 'Player 1' : 'Player 2'

  // Track placed card IDs
  const placedCardIds = useMemo(
    () => new Set(playerState.cardsPlaced.map((c) => c.id)),
    [playerState.cardsPlaced]
  )

  // Check if all 4 slots are filled
  const allSlotsFilled = playerState.cardsPlaced.length >= 4

  // Get card data for a placed card
  const getCardData = (cardId: string) =>
    soal.kartu.find((k) => k.id === cardId) ?? null

  // Get placed card for a specific slot
  const getPlacedCard = (slot: number): CardPosition | null =>
    playerState.cardsPlaced.find((c) => c.anchorSlot === slot) ?? null

  // Get evaluation result for a placed card in a specific slot
  const getEvalResult = (slot: number): 'correct' | 'incorrect' | null => {
    if (!isEvaluation) return null
    const placed = getPlacedCard(slot)
    if (!placed) return null
    const cardData = getCardData(placed.id)
    if (!cardData) return null
    return cardData.urutan_benar === slot ? 'correct' : 'incorrect'
  }

  // Handle "Selesai" button
  const handleFinish = () => {
    setPlayerReady(player, true)
    flipPlayerCards(player, true)
    setIsSelesaiFlashing(true)
    setTimeout(() => setIsSelesaiFlashing(false), 500)
    
    // If both players are ready, trigger evaluation
    const otherPlayer = player === 'player1' ? 'player2' : 'player1'
    const otherState = useGameStore.getState()[otherPlayer]
    if (otherState.isReady) {
      evaluateRonde()
    }
  }

  const handleFinishRef = useRef(handleFinish)
  handleFinishRef.current = handleFinish

  const selesaiZoneRef = useRef<HTMLDivElement>(null)
  const progressCircleRef = useRef<SVGCircleElement>(null)
  const [isSelesaiFlashing, setIsSelesaiFlashing] = useState(false)

  // Gesture checking loop for the Selesai zone
  useEffect(() => {
    let running = true
    let pinchStartTime = 0

    const checkSelesaiGesture = () => {
      if (!running) return

      if (allSlotsFilled && !playerState.isReady && phase === 'playing') {
        const hand = player === 'player1' ? liveHandDataRef.player1 : liveHandDataRef.player2
        const isPinching = hand?.isPinching ?? false

        const zoneEl = selesaiZoneRef.current
        
        let isInside = false
        if (isPinching && hand && zoneEl) {
           const w = window.innerWidth
           const h = window.innerHeight
           const fingerX = (1 - hand.indexTipX) * w
           const fingerY = hand.indexTipY * h
           const rect = zoneEl.getBoundingClientRect()
           if (fingerX >= rect.left && fingerX <= rect.right && fingerY >= rect.top && fingerY <= rect.bottom) {
             isInside = true
           }
        }

        if (isInside) {
          if (pinchStartTime === 0) {
            pinchStartTime = performance.now()
          } else {
            const duration = performance.now() - pinchStartTime
            const progress = Math.min(duration / 1500, 1)
            
            if (progressCircleRef.current) {
               progressCircleRef.current.style.strokeDashoffset = `${100 - (progress * 100)}`
            }

            if (duration >= 1500) {
              pinchStartTime = 0
              if (progressCircleRef.current) progressCircleRef.current.style.strokeDashoffset = '100'
              handleFinishRef.current()
            }
          }
          if (zoneEl) {
            zoneEl.style.transform = 'scale(1.05)'
            zoneEl.style.boxShadow = `0 0 20px ${playerColor}88`
          }
        } else {
          pinchStartTime = 0
          if (progressCircleRef.current) progressCircleRef.current.style.strokeDashoffset = '100'
          if (zoneEl) {
            zoneEl.style.transform = 'scale(1)'
            zoneEl.style.boxShadow = 'none'
          }
        }
      }

      requestAnimationFrame(checkSelesaiGesture)
    }

    requestAnimationFrame(checkSelesaiGesture)
    return () => { running = false }
  }, [allSlotsFilled, playerState.isReady, phase, player, playerColor])

  return (
    <motion.div
      ref={containerRef}
      data-player-zone={player}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: isP1 ? 0.1 : 0.2 }}
      style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '100px 12px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Player Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
          padding: '6px 14px',
          borderRadius: 12,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${playerColor}33`,
        }}
      >
        {/* Player dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: playerColor,
            boxShadow: `0 0 8px ${playerColor}88`,
          }}
        />
        {/* Player name */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: playerColor,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {playerLabel}
        </span>
        {/* Score */}
        <div
          style={{
            padding: '2px 8px',
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.08)',
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {playerState.score} pts
        </div>
      </div>

      {/* ── Disaster Label ── */}
      <div
        style={{
          marginBottom: 16,
          padding: '6px 16px',
          borderRadius: 20,
          background: `linear-gradient(90deg, transparent, ${BENCANA_COLORS[soal.jenis_bencana]}33, transparent)`,
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: 18 }}>{BENCANA_EMOJI[soal.jenis_bencana]}</span>
        {soal.jenis_bencana.replace('_', ' ')} — RONDE {useGameStore((s) => s.ronde)}
      </div>

      {/* ── Card Deck Area ── */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Semi-transparent backdrop for better visibility against camera feed */}
        <div
          style={{
            position: 'absolute',
            inset: '0 10%',
            background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.6) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ zIndex: 1 }}>
          <CardDeck
            cards={soal.kartu}
            jenisBencana={soal.jenis_bencana}
            playerColor={playerColor}
            placedCardIds={placedCardIds}
            onRegisterCard={registerCard}
          />
        </div>
      </div>

      {/* ── Answer Anchor Area ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '8px 0',
        }}
      >
        {[1, 2, 3, 4].map((slot) => {
          const placed = getPlacedCard(slot)
          return (
            <AnswerAnchor
              key={slot}
              slot={slot}
              player={player}
              playerColor={playerColor}
              jenisBencana={soal.jenis_bencana}
              placedCard={placed}
              cardData={placed ? getCardData(placed.id) : null}
              evaluationResult={getEvalResult(slot)}
              onRegister={registerAnchor}
              onRegisterCard={registerCard}
            />
          )
        })}
      </div>

      {/* ── Gesture "Selesai" Zone ── */}
      {allSlotsFilled && !playerState.isReady && phase === 'playing' && (
        <motion.div
          ref={selesaiZoneRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            marginTop: 16,
            width: '80%',
            maxWidth: 300,
            padding: '12px 24px',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${playerColor}22 0%, ${playerColor}44 100%)`,
            border: `2px solid ${playerColor}88`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            position: 'relative',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
        >
          {/* Animated pulsing background when idle */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 16,
              background: playerColor,
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
          
          {/* Progress Circular Icon */}
          <div style={{ position: 'relative', width: 32, height: 32 }}>
            <svg width="32" height="32" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <circle
                ref={progressCircleRef}
                cx="18" cy="18" r="16" fill="none" stroke="#fff" strokeWidth="4"
                strokeDasharray="100" strokeDashoffset="100"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              ✊
            </div>
          </div>

          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Jepit untuk Selesai
          </span>
        </motion.div>
      )}

      {/* ── Ready Status / Waiting indicator ── */}
      {playerState.isReady && phase === 'playing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, backgroundColor: isSelesaiFlashing ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.15)' }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            borderRadius: 16,
            border: '2px solid rgba(34, 197, 94, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>✓</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>SIAP!</span>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: 11, color: '#22C55E', opacity: 0.8 }}
            >
              Menunggu lawan...
            </motion.span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
