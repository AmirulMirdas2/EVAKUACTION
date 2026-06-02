import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100%', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #0B0F1A 0%, #111827 100%)',
        color: '#fff', padding: 24, textAlign: 'center'
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 16 }}>🗺️</div>
      <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, color: '#F59E0B' }}>
        404 NOT FOUND
      </h1>
      <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
        Halaman yang Anda cari sepertinya tersesat di zona evakuasi.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '16px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #2563EB)', 
          color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
        }}
      >
        🏠 KEMBALI KE BERANDA
      </button>
    </motion.div>
  )
}
