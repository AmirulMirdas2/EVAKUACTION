import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import DiagnosticPage from './pages/DiagnosticPage'
import ResultPage from './pages/ResultPage'
import GameBoard from './components/game/GameBoard'
import { useDiagnosticStore } from './stores/diagnosticStore'
import { useGameStore } from './stores/gameStore'

/**
 * Protected route: /game — only accessible after diagnostic is completed.
 */
function ProtectedGameRoute() {
  const isCompleted = useDiagnosticStore((s) => s.isCompleted)
  return isCompleted ? <GameBoard /> : <Navigate to="/" replace />
}

/**
 * Protected route: /result — only accessible after all rounds are finished.
 */
function ProtectedResultRoute() {
  const gameFinished = useGameStore((s) => s.gameFinished)
  return gameFinished ? <ResultPage /> : <Navigate to="/" replace />
}

/**
 * AnimatedRoutes — Wraps routes with AnimatePresence for page transitions.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/game" element={<ProtectedGameRoute />} />
        <Route path="/result" element={<ProtectedResultRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

/**
 * Main application component with routing.
 */
function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
