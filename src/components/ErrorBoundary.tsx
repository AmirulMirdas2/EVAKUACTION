import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center',
          background: '#0B0F1A', color: '#fff', padding: 24, textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>⚠️ Oops!</h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>
            Sistem mendeteksi kesalahan. Jangan khawatir, kita bisa mulai lagi.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '16px 32px', borderRadius: 12, background: '#3B82F6', 
              color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer'
            }}
          >
            🏠 KEMBALI KE BERANDA
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
