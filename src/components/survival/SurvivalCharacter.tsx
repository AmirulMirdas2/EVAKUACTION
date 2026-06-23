import { useEffect, useRef, memo } from 'react'

interface SurvivalCharacterProps {
  /** Callback to register the DOM element for pinch hit-testing */
  onRegister: (element: HTMLElement | null) => void
  /** Size of the character */
  size?: number
  /** Optional initial position style overrides */
  style?: React.CSSProperties
}

/**
 * SurvivalCharacter — Draggable character for the survival challenge.
 *
 * Simple SVG person icon that registers itself for pinch-based dragging.
 * Uses the same registration pattern as Card.tsx (onRegister callback).
 */
function SurvivalCharacterComponent({ onRegister, size = 64, style }: SurvivalCharacterProps) {
  const charRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (charRef.current) {
      onRegister(charRef.current)
    }
    return () => onRegister(null)
  }, [onRegister])

  return (
    <div
      ref={charRef}
      className="survival-character"
      style={{
        width: size,
        height: size,
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow background */}
        <circle cx="40" cy="40" r="36" fill="rgba(245,158,11,0.1)" />

        {/* Head */}
        <circle cx="40" cy="20" r="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />

        {/* Eyes */}
        <circle cx="36" cy="18" r="1.5" fill="#1F2937" />
        <circle cx="44" cy="18" r="1.5" fill="#1F2937" />

        {/* Smile */}
        <path
          d="M36 23 Q40 27 44 23"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <rect x="32" y="30" width="16" height="22" rx="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />

        {/* Arms */}
        <rect x="18" y="32" width="14" height="6" rx="3" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
        <rect x="48" y="32" width="14" height="6" rx="3" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />

        {/* Legs */}
        <rect x="33" y="52" width="6" height="16" rx="3" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1" />
        <rect x="41" y="52" width="6" height="16" rx="3" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1" />

        {/* Shoes */}
        <rect x="31" y="65" width="10" height="5" rx="2.5" fill="#374151" />
        <rect x="39" y="65" width="10" height="5" rx="2.5" fill="#374151" />
      </svg>

      {/* Grab indicator */}
      <div style={{
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        opacity: 0.8,
      }}>
        ✊ JEPIT
      </div>
    </div>
  )
}

const SurvivalCharacter = memo(SurvivalCharacterComponent)
export default SurvivalCharacter
