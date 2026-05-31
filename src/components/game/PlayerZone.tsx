import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import CardDeck from '../card/CardDeck'
import AnswerAnchor from '../card/AnswerAnchor'
import { useDragGesture } from '../../hooks/useDragGesture'
import { useGameStore } from '../../stores/gameStore'
import type { SoalData, CardPosition } from '../../types/game.types'
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
    // If both players are ready, trigger evaluation
    const otherPlayer = player === 'player1' ? 'player2' : 'player1'
    const otherState = useGameStore.getState()[otherPlayer]
    if (otherState.isReady) {
      evaluateRonde()
    }
  }

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

      {/* ── Card Deck Area ── */}
      <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center' }}>
        <CardDeck
          cards={soal.kartu}
          jenisBencana={soal.jenis_bencana}
          playerColor={playerColor}
          placedCardIds={placedCardIds}
          onRegisterCard={registerCard}
        />
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
            />
          )
        })}
      </div>

      {/* ── "Selesai" Button ── */}
      {allSlotsFilled && !playerState.isReady && phase === 'playing' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={handleFinish}
          style={{
            marginTop: 8,
            padding: '10px 28px',
            borderRadius: 12,
            border: 'none',
            background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}CC 100%)`,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: `0 4px 16px ${playerColor}44, 0 2px 8px rgba(0,0,0,0.3)`,
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ✓ Selesai
        </motion.button>
      )}

      {/* ── Waiting indicator ── */}
      {playerState.isReady && phase === 'playing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 8,
            padding: '8px 20px',
            borderRadius: 10,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            fontSize: 11,
            fontWeight: 600,
            color: '#22C55E',
            letterSpacing: '0.03em',
          }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Menunggu pemain lain...
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  )
}
