import { Routes, Route } from 'react-router-dom'
import Stage from './components/Stage.jsx'
import IdleReset from './components/IdleReset.jsx'
import MuteButton from './components/MuteButton.jsx'
import Home from './screens/Home.jsx'
import Stats from './screens/Stats.jsx'
import Evzoulis from './games/evzoulis/Evzoulis.jsx'
import HealthyHero from './games/healthy-hero/HealthyHero.jsx'

// Ρίζα της εφαρμογής. Όλα ζωγραφίζονται μέσα σε ένα Stage 1080x1920
// που κλιμακώνεται ώστε να χωράει στην οθόνη του περιπτέρου.
export default function App() {
  return (
    <Stage>
      {/* Idle reset -> homepage. Ευζούλης 30s, Healthy Hero 20s (μέσα στο IdleReset). */}
      <IdleReset />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/healthy-hero" element={<HealthyHero />} />
        <Route path="/game/evzoulis" element={<Evzoulis />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
      <MuteButton />
    </Stage>
  )
}
