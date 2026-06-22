import { useGameStore } from '../../stores/gameStore'
import FloodEffect from './FloodEffect'
import EarthquakeEffect from './EarthquakeEffect'
import TsunamiEffect from './TsunamiEffect'
import VolcanoEffect from './VolcanoEffect'
import LandslideEffect from './LandslideEffect'

export default function DisasterEffectLayer() {
  const currentSoal = useGameStore((s) => s.currentSoal)
  const jenisBencana = currentSoal?.jenis_bencana

  // Jika tidak ada soal yang aktif, tidak perlu render efek
  if (!jenisBencana) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {jenisBencana === 'banjir' && <FloodEffect />}
      {jenisBencana === 'gempa' && <EarthquakeEffect />}
      {jenisBencana === 'tsunami' && <TsunamiEffect />}
      {jenisBencana === 'gunung_api' && <VolcanoEffect />}
      {jenisBencana === 'longsor' && <LandslideEffect />}
      {/* Efek bencana lain akan ditambahkan di sini nantinya */}
    </div>
  )
}
