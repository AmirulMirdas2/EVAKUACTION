import { motion, AnimatePresence } from 'framer-motion'
import { useMediaPipe } from '../../hooks/useMediaPipe'
import { useGestureStore } from '../../stores/gestureStore'
import GestureOverlay from './GestureOverlay'
import BoundaryDivider from './BoundaryDivider'
import { DEFAULT_PLAYER_COLORS } from '../../types/gesture.types'

/**
 * Status indicator dot component with animation.
 */
function StatusDot({
  status,
}: {
  status: 'detected' | 'no-hands' | 'unavailable'
}) {
  const colors = {
    detected: '#22C55E',
    'no-hands': '#EAB308',
    unavailable: '#EF4444',
  }
  const labels = {
    detected: 'Tangan Terdeteksi',
    'no-hands': 'Tidak Ada Tangan',
    unavailable: 'Kamera Tidak Tersedia',
  }
  const emojis = {
    detected: '🟢',
    'no-hands': '🟡',
    unavailable: '🔴',
  }

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md select-none"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${colors[status]}44`,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        animate={{
          scale: status === 'detected' ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {emojis[status]}
      </motion.span>
      <span className="text-white text-xs font-medium">{labels[status]}</span>
    </motion.div>
  )
}

/**
 * Player zone indicator showing detection status for each player.
 */
function PlayerIndicator({
  player,
  isDetected,
  color,
  position,
}: {
  player: string
  isDetected: boolean
  color: string
  position: 'left' | 'right'
}) {
  return (
    <motion.div
      className={`absolute bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md select-none`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${color}44`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: position === 'left' ? 0.2 : 0.3 }}
    >
      <AnimatePresence mode="wait">
        {isDetected ? (
          <motion.div
            key="detected"
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                scale: [1, 1.3, 1],
                boxShadow: [
                  `0 0 4px ${color}44`,
                  `0 0 10px ${color}88`,
                  `0 0 4px ${color}44`,
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-xs font-medium" style={{ color }}>
              Tangan Terdeteksi ✓
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="not-detected"
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-gray-500/50" />
            <span className="text-xs font-medium text-gray-400">
              Arahkan Tangan ke Sini
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player label */}
      <div
        className="ml-2 pl-2 border-l text-[10px] font-bold uppercase tracking-wider opacity-70"
        style={{
          borderColor: `${color}33`,
          color,
        }}
      >
        {player}
      </div>
    </motion.div>
  )
}

/**
 * Loading overlay shown during MediaPipe initialization.
 */
function LoadingOverlay() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ zIndex: 50 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center p-8 rounded-2xl bg-gray-900/90 border border-gray-700/50 shadow-2xl">
        <motion.div
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl mb-4"
        >
          🖐️
        </motion.div>
        
        <h3 className="text-xl font-bold text-white mb-6">Memuat sistem kamera...</h3>
        
        {/* Fake progress bar */}
        <div className="w-64 h-3 bg-gray-800 rounded-full overflow-hidden mb-3 relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
        </div>
        
        <motion.p
          className="text-gray-400 text-sm font-medium tracking-wide italic"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          "Menyiapkan pendeteksi tangan..."
        </motion.p>
      </div>
    </motion.div>
  )
}

/**
 * CameraView is the main component that integrates the camera feed,
 * gesture overlay, and split-screen boundary divider.
 *
 * It renders:
 * 1. A <video> element with the camera feed (mirrored by default)
 * 2. A <canvas> overlay with hand landmarks and skeleton
 * 3. The BoundaryDivider split-screen visual
 * 4. Detection status indicators for each player
 */
export default function CameraView() {
  const { isLoading, videoRef, canvasRef, handsDataRef, config } =
    useMediaPipe()

  const cameraStatus = useGestureStore((s) => s.cameraStatus)
  const player1Hand = useGestureStore((s) => s.player1Hand)
  const player2Hand = useGestureStore((s) => s.player2Hand)
  const detectedHandsCount = useGestureStore((s) => s.detectedHandsCount)

  // Determine overall detection status
  const detectionStatus =
    cameraStatus === 'unavailable'
      ? 'unavailable'
      : detectedHandsCount > 0
        ? 'detected'
        : 'no-hands'

  return (
    <div
      id="camera-view-container"
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Video feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: config.mirrorMode ? 'scaleX(-1)' : 'none',
          zIndex: 1,
        }}
        autoPlay
        playsInline
        muted
      />

      {/* Darkening overlay for better contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.2) 100%)',
          zIndex: 2,
        }}
      />

      {/* Gesture overlay (canvas) */}
      <GestureOverlay
        videoRef={videoRef}
        canvasRef={canvasRef}
        handsDataRef={handsDataRef}
        config={config}
      />

      {/* Boundary divider */}
      <BoundaryDivider />

      {/* Top-left: detection status */}
      <div className="absolute top-4 left-4" style={{ zIndex: 30 }}>
        <StatusDot status={detectionStatus as 'detected' | 'no-hands' | 'unavailable'} />
      </div>

      {/* Top-right: FPS / info badge */}
      <div className="absolute top-4 right-4" style={{ zIndex: 30 }}>
        <motion.div
          className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-mono text-white/70 select-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          EVAKUACTION • Duel Mode
        </motion.div>
      </div>

      {/* Player 1 indicator (bottom-left) */}
      <PlayerIndicator
        player="P1"
        isDetected={player1Hand !== null}
        color={DEFAULT_PLAYER_COLORS.player1}
        position="left"
      />

      {/* Player 2 indicator (bottom-right) */}
      <PlayerIndicator
        player="P2"
        isDetected={player2Hand !== null}
        color={DEFAULT_PLAYER_COLORS.player2}
        position="right"
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>

      {/* Camera unavailable overlay */}
      <AnimatePresence>
        {cameraStatus === 'unavailable' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
            style={{ zIndex: 60 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-bold text-red-500 mb-2">
              Kamera Tidak Dapat Diakses
            </h3>
            <p className="text-gray-400 text-center max-w-md px-4 mb-8">
              Pastikan browser memiliki izin kamera dan tidak ada aplikasi lain yang sedang menggunakannya.
            </p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              whileHover={{ scale: 1.05, backgroundColor: '#2563EB' }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Coba Lagi
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
