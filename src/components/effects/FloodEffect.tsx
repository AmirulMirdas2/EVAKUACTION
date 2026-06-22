import { useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'

export default function FloodEffect() {
  const { phase, timeRemaining } = useGameStore()
  
  // Hasilkan partikel hujan secara statis agar tidak berubah-ubah saat re-render
  const rainDrops = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${0.5 + Math.random() * 1}s`,
      animationDelay: `${Math.random() * 2}s`,
    }))
  }, [])

  // Kalkulasi tinggi air berdasarkan waktu atau fase permainan
  const MAX_TIME = 60
  let targetHeight = 0
  
  if (phase === 'playing') {
    // Air naik secara bertahap seiring berjalannya waktu
    // Misal dari 0vh ke 100vh dalam 60 detik.
    const percentPassed = ((MAX_TIME - timeRemaining) / MAX_TIME) * 100
    targetHeight = percentPassed
  } else if (phase === 'showing_result' || phase === 'evaluation') {
    // Jika waktu habis atau pemain menekan Selesai, air langsung naik maksimal
    targetHeight = 100
  }

  return (
    <>
      {/* Rain Effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {rainDrops.map((drop) => (
          <div
            key={drop.id}
            className="rain-drop"
            style={{
              left: drop.left,
              animationDuration: drop.animationDuration,
              animationDelay: drop.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Flood Water Level */}
      <div 
        className="flood-container pointer-events-none"
        style={{ height: `${targetHeight}vh` }}
      >
        <div className="wave wave1" />
        <div className="wave wave2" />
      </div>
    </>
  )
}
