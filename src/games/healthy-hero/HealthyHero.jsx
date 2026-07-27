import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreBar from '../../components/ScoreBar.jsx'
import BigButton from '../../components/BigButton.jsx'
import RatingScreen from '../../components/RatingScreen.jsx'
import Mission1Plate from './missions/Mission1Plate.jsx'
import Mission2LunchBox from './missions/Mission2LunchBox.jsx'
import Mission3Traps from './missions/Mission3Traps.jsx'

// Ροή του παιχνιδιού: intro -> m1 -> m2 -> m3 -> rating -> homepage
export default function HealthyHero() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('intro')
  const [score, setScore] = useState(0)
  const [progress, setProgress] = useState(0)

  const addScore = useCallback((delta) => setScore((s) => s + delta), [])
  const goHome = useCallback(() => navigate('/'), [navigate])

  if (stage === 'intro') {
    return (
      <div className="screen intro intro--hero">
        <div className="intro__emoji">🥦</div>
        <h1 className="intro__title">Healthy Hero</h1>
        <p className="intro__subtitle">Αποστολή 1: Γέμισε το σωστό πιάτο</p>
        <BigButton variant="primary" onClick={() => setStage('m1')}>
          Ξεκίνα την αποστολή ▶
        </BigButton>
      </div>
    )
  }

  if (stage === 'rating') {
    return <RatingScreen game="healthy-hero" onDone={goHome} />
  }

  // Αποστολές — με μπάρα σκορ στο πάνω μέρος.
  const goal = stage === 'm1' ? 5 : null
  return (
    <div className="screen game game--hero">
      <ScoreBar
        score={score}
        title="Healthy Hero"
        goal={goal}
        progress={goal != null ? progress : null}
      />
      <div className="game__body">
        {stage === 'm1' && (
          <Mission1Plate
            score={score}
            addScore={addScore}
            onProgress={setProgress}
            onComplete={() => setStage('m2')}
          />
        )}
        {stage === 'm2' && <Mission2LunchBox onNext={() => setStage('m3')} />}
        {stage === 'm3' && <Mission3Traps onNext={() => setStage('rating')} />}
      </div>
    </div>
  )
}
