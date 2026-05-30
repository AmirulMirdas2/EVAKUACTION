import { motion } from 'framer-motion'
import { DEFAULT_PLAYER_COLORS } from '../../types/gesture.types'

/**
 * BoundaryDivider renders the visual split-screen boundary
 * between Player 1 (left) and Player 2 (right) zones.
 *
 * Features:
 * - Animated dashed center line with glow effect
 * - Player labels at the top
 * - Semi-transparent buffer zone overlays
 */
export default function BoundaryDivider() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    >
      {/* Buffer zone overlays — 10% on each side of center */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: '45%',
          width: '10%',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Center line container */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Player labels */}
        <div className="flex items-center gap-6 mt-4 select-none">
          <motion.div
            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase backdrop-blur-md"
            style={{
              color: DEFAULT_PLAYER_COLORS.player1,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${DEFAULT_PLAYER_COLORS.player1}44`,
              textShadow: `0 0 10px ${DEFAULT_PLAYER_COLORS.player1}88`,
            }}
            animate={{
              boxShadow: [
                `0 0 8px ${DEFAULT_PLAYER_COLORS.player1}22`,
                `0 0 16px ${DEFAULT_PLAYER_COLORS.player1}44`,
                `0 0 8px ${DEFAULT_PLAYER_COLORS.player1}22`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ← Player 1
          </motion.div>

          <div className="w-2 h-2 rounded-full bg-white/30" />

          <motion.div
            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase backdrop-blur-md"
            style={{
              color: DEFAULT_PLAYER_COLORS.player2,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${DEFAULT_PLAYER_COLORS.player2}44`,
              textShadow: `0 0 10px ${DEFAULT_PLAYER_COLORS.player2}88`,
            }}
            animate={{
              boxShadow: [
                `0 0 8px ${DEFAULT_PLAYER_COLORS.player2}22`,
                `0 0 16px ${DEFAULT_PLAYER_COLORS.player2}44`,
                `0 0 8px ${DEFAULT_PLAYER_COLORS.player2}22`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            Player 2 →
          </motion.div>
        </div>

        {/* Animated center divider line */}
        <div className="flex-1 relative mt-3 mb-3">
          {/* Glow backdrop */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
              filter: 'blur(4px)',
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Main dashed line using SVG for clean dashes */}
          <svg
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 h-full"
            width="4"
            style={{ overflow: 'visible' }}
          >
            <motion.line
              x1="2"
              y1="0"
              x2="2"
              y2="100%"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeLinecap="round"
              animate={{
                strokeDashoffset: [0, -36],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>

          {/* Center glow dot — pulses */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/60"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                '0 0 6px rgba(255,255,255,0.3)',
                '0 0 16px rgba(255,255,255,0.6)',
                '0 0 6px rgba(255,255,255,0.3)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Bottom zone labels */}
        <div className="flex items-center gap-4 mb-4 select-none">
          <div
            className="text-[10px] font-medium tracking-wider uppercase opacity-60"
            style={{ color: DEFAULT_PLAYER_COLORS.player1 }}
          >
            Zona Kiri
          </div>
          <div className="text-[10px] font-medium tracking-wider uppercase text-gray-500">
            Buffer
          </div>
          <div
            className="text-[10px] font-medium tracking-wider uppercase opacity-60"
            style={{ color: DEFAULT_PLAYER_COLORS.player2 }}
          >
            Zona Kanan
          </div>
        </div>
      </div>
    </div>
  )
}
