import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Animated background particle for disaster theme.
 */
function Particle({
  delay,
  x,
  size,
  duration,
  type,
}: {
  delay: number
  x: number
  size: number
  duration: number
  type: 'rain' | 'ember' | 'rock'
}) {
  const color =
    type === 'rain'
      ? 'rgba(96, 165, 250, 0.4)'
      : type === 'ember'
        ? 'rgba(245, 158, 11, 0.5)'
        : 'rgba(120, 113, 108, 0.4)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: `${x}vw` }}
      animate={{
        opacity: [0, 0.8, 0.6, 0],
        y: ['0vh', '105vh'],
        x: type === 'rain' ? `${x + 2}vw` : `${x}vw`,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        position: 'absolute',
        width: size,
        height: type === 'rain' ? size * 3 : size,
        borderRadius: type === 'rain' ? size : '50%',
        backgroundColor: color,
        zIndex: 0,
        pointerEvents: 'none',
        filter: type === 'ember' ? `blur(${size > 4 ? 2 : 1}px)` : 'none',
      }}
    />
  )
}

/**
 * Floating Card preview for background decoration.
 */
function FloatingCard({
  image,
  label,
  color,
  x,
  y,
  rotate,
  delay,
}: {
  image: string
  label: string
  color: string
  x: string
  y: string
  rotate: number
  delay: number
}) {
  return (
    <motion.div
      initial={{ y: 0, rotate }}
      animate={{
        y: [-15, 15, -15],
        rotate: [rotate - 5, rotate + 5, rotate - 5],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 140,
        height: 190,
        borderRadius: 14,
        backgroundColor: 'rgba(15, 15, 25, 0.6)',
        border: `2px solid ${color}66`,
        boxShadow: `0 15px 40px rgba(0,0,0,0.5), 0 0 25px ${color}22`,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', height: '75%', position: 'relative' }}>
        <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)', width: '100%' }}>
        <span style={{ fontSize: 10, color: '#fff', textAlign: 'center', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{label}</span>
      </div>
    </motion.div>
  )
}

/**
 * Tutorial modal overlay with 4-step how-to-play guide.
 */
function TutorialModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      icon: '📝',
      title: 'Tes Diagnostik',
      desc: 'Jawab 10 soal pilihan ganda untuk mengukur pengetahuan awal tentang kesiapsiagaan bencana.',
    },
    {
      icon: '👋',
      title: 'Gunakan Tangan',
      desc: 'Arahkan tangan ke kamera. Gunakan gesture tangan untuk mengontrol kartu di layar.',
    },
    {
      icon: '🃏',
      title: 'Drag & Susun Kartu',
      desc: 'Drag kartu prosedur keselamatan ke slot yang benar sesuai urutan yang tepat.',
    },
    {
      icon: '✅',
      title: 'Evaluasi & Skor',
      desc: 'Setelah menyusun kartu, pinch untuk menyelesaikan. Skor dihitung otomatis per ronde.',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          width: '90%',
          borderRadius: 24,
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.97) 0%, rgba(10, 15, 30, 0.97) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </motion.button>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#fff',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          🎮 Cara Bermain
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          Ikuti 4 langkah berikut untuk bermain EVAKUACTION
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.1, duration: 0.35 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#F59E0B',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    LANGKAH {idx + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {step.title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.5)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * LandingPage — Immersive landing page for EVAKUACTION.
 *
 * Features:
 * - Dark gradient background with animated particles
 * - Glowing title with staggered entrance animation
 * - Pulsing "MULAI BERMAIN" button
 * - "CARA BERMAIN" modal
 * - Badge for IPS Kelas VII SMP
 */
export default function LandingPage() {
  const navigate = useNavigate()
  const [showTutorial, setShowTutorial] = useState(false)

  const handleStart = useCallback(() => {
    navigate('/diagnostic')
  }, [navigate])

  // Generate particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 8,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 6 + Math.random() * 6,
    type: (['rain', 'ember', 'rock'] as const)[i % 3],
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, #0B0F1A 0%, #111827 40%, #1E293B 100%)',
      }}
    >
      {/* Animated particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      {/* Floating Card Previews */}
      <FloatingCard image="/assets/cards/gempa/berlindung-meja.png" label="Berlindung di Bawah Meja" color="#EAB308" x="12%" y="20%" rotate={-12} delay={0} />
      <FloatingCard image="/assets/cards/tsunami/lari-dataran-tinggi.png" label="Lari ke Dataran Tinggi" color="#3B82F6" x="8%" y="60%" rotate={15} delay={1.2} />
      <FloatingCard image="/assets/cards/gunung-api/tas-siaga.png" label="Siapkan Tas Siaga" color="#EF4444" x="80%" y="15%" rotate={18} delay={0.6} />
      <FloatingCard image="/assets/cards/banjir/mengungsi.png" label="Mengungsi ke Tempat Aman" color="#06B6D4" x="78%" y="65%" rotate={-10} delay={2.1} />

      {/* Radial glow behind title */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Badge — top right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          padding: '8px 16px',
          borderRadius: 10,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          fontSize: 11,
          fontWeight: 600,
          color: '#60A5FA',
          letterSpacing: '0.02em',
          zIndex: 10,
        }}
      >
        📚 Mata Pelajaran IPS Kelas VII SMP
      </motion.div>

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 10,
          padding: '0 24px',
        }}
      >
        {/* Volcano emoji */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{ fontSize: 56, marginBottom: 16 }}
        >
          🌋
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '0.06em',
            marginBottom: 8,
            lineHeight: 1.1,
            textShadow:
              '0 0 40px rgba(245, 158, 11, 0.3), 0 0 80px rgba(239, 68, 68, 0.15)',
          }}
        >
          EVAKU
          <span
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ACTION
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{
            fontSize: 17,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 48,
            letterSpacing: '0.02em',
          }}
        >
          Game Kartu Interaktif Kesiapsiagaan Bencana
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* MULAI BERMAIN */}
          <motion.button
            id="btn-mulai"
            whileHover={{
              scale: 1.1,
              boxShadow: '0 12px 50px rgba(245, 158, 11, 0.5)',
            }}
            whileTap={{ scale: 0.92 }}
            animate={{
              boxShadow: [
                '0 6px 25px rgba(245, 158, 11, 0.25)',
                '0 6px 40px rgba(245, 158, 11, 0.45)',
                '0 6px 25px rgba(245, 158, 11, 0.25)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            onClick={handleStart}
            style={{
              padding: '20px 64px',
              borderRadius: 20,
              border: 'none',
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              color: '#fff',
              fontSize: 22,
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              fontFamily: "'Inter', sans-serif",
              minWidth: 320,
            }}
          >
            🎮 MULAI BERMAIN
          </motion.button>

          {/* CARA BERMAIN */}
          <motion.button
            id="btn-tutorial"
            whileHover={{
              scale: 1.04,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowTutorial(true)}
            style={{
              padding: '14px 40px',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              minWidth: 260,
              letterSpacing: '0.04em',
            }}
          >
            📖 CARA BERMAIN
          </motion.button>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{
            marginTop: 48,
            fontSize: 14,
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.4)',
            fontWeight: 400,
          }}
        >
          "Belajar Siaga, Bermain Bersama"
        </motion.p>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 24,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.35)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.03em',
          lineHeight: 1.6,
        }}
      >
        <div>Media Pembelajaran IPS Kelas VII SMP | Tema Kesiapsiagaan Bencana</div>
        <div style={{ color: 'rgba(255, 255, 255, 0.25)' }}>Universitas Syiah Kuala © 2026</div>
      </motion.div>

      {/* Tutorial modal */}
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
