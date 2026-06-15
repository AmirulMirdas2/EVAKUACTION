/**
 * Tutorial card data for the interactive tutorial overlay.
 *
 * Each player receives 4 numbered cards. These cards use tutorial images
 * from public/assets/tutorial/ and are purely for teaching gesture mechanics —
 * no scoring, no correct order.
 */

export interface TutorialCard {
  id: string
  image: string
  number: number
  label: string
}

export const TUTORIAL_CARDS: {
  player1: TutorialCard[]
  player2: TutorialCard[]
} = {
  player1: [
    { id: 'tutorial-1', image: '/assets/tutorial/tutorial-1.png', number: 1, label: 'Kartu Tutorial 1' },
    { id: 'tutorial-2', image: '/assets/tutorial/tutorial-2.png', number: 2, label: 'Kartu Tutorial 2' },
    { id: 'tutorial-3', image: '/assets/tutorial/tutorial-3.png', number: 3, label: 'Kartu Tutorial 3' },
    { id: 'tutorial-4', image: '/assets/tutorial/tutorial-4.png', number: 4, label: 'Kartu Tutorial 4' },
  ],
  player2: [
    { id: 'tutorial-5', image: '/assets/tutorial/tutorial-5.png', number: 5, label: 'Kartu Tutorial 5' },
    { id: 'tutorial-6', image: '/assets/tutorial/tutorial-6.png', number: 6, label: 'Kartu Tutorial 6' },
    { id: 'tutorial-7', image: '/assets/tutorial/tutorial-7.png', number: 7, label: 'Kartu Tutorial 7' },
    { id: 'tutorial-8', image: '/assets/tutorial/tutorial-8.png', number: 8, label: 'Kartu Tutorial 8' },
  ],
}
