import { useMemo, memo } from 'react'
import Card from './Card'
import type { CardData, JenisBencana } from '../../types/game.types'

interface CardDeckProps {
  cards: CardData[]
  jenisBencana: JenisBencana
  playerColor: string
  /** IDs of cards that have been placed in anchor slots */
  placedCardIds: Set<string>
  /** Register card elements for hit-testing */
  onRegisterCard?: (cardId: string, element: HTMLElement | null) => void
}

/**
 * CardDeck.tsx — Displays a grid of cards for one player.
 *
 * Cards that have been placed in anchor slots are hidden from the deck.
 * Remaining cards are displayed in a 2×2 grid layout.
 */
function CardDeckComponent({
  cards,
  jenisBencana,
  playerColor,
  placedCardIds,
  onRegisterCard,
}: CardDeckProps) {
  // Shuffle cards on first render (using Fisher-Yates)
  const shuffledCards = useMemo(() => {
    const arr = [...cards]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [cards])

  // Only show cards that haven't been placed
  const visibleCards = shuffledCards.filter((c) => !placedCardIds.has(c.id))

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 160px)',
        gap: 16, // gap-4 (equivalent to roughly gap-3/gap-4 in tailwind, 16px is better for 160px cards)
        justifyContent: 'center',
        padding: '8px 0',
        minHeight: 224, // 208 + 16 gap
        alignContent: 'start',
      }}
    >
      {visibleCards.map((card, index) => (
        <div
          key={card.id}
          style={{
            position: 'relative',
            // Stagger animation delay
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <Card
            card={card}
            jenisBencana={jenisBencana}
            playerColor={playerColor}
            isPlaced={false}
            onRegister={onRegisterCard}
          />
        </div>
      ))}
    </div>
  )
}

const CardDeck = memo(CardDeckComponent)
export default CardDeck
