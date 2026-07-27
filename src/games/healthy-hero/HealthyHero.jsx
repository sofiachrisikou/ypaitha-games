import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreBar from '../../components/ScoreBar.jsx'
import BigButton from '../../components/BigButton.jsx'
import RatingScreen from '../../components/RatingScreen.jsx'
import Mission1Plate from './missions/Mission1Plate.jsx'
import Mission2LunchBox from './missions/Mission2LunchBox.jsx'
import Mission3Traps from './missions/Mission3Traps.jsx'
import { LUNCHBOX_GOAL } from './data/lunchbox.js'
import { TRAP_ITEMS } from './data/traps.js'

const TRAPS_TOTAL = TRAP_ITEMS.filter((f) => !f.healthy).length

// Ρυθμίσεις μπάρας σκορ ανά αποστολή (goal + εικονίδιο προόδου).
const STAGE_META = {
  m1: { goal: 5, icon: '🍽️' },
  m2: { goal: LUNCHBOX_GOAL, icon: '🍱' },
  m3: { goal: TRAPS_TOTAL, icon: '🎯' },
}

// Ροή του παιχνιδιού: intro -> m1 -> m2 -> m3 -> finale -> rating -> homepage
export default function HealthyHero() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('intro')
  const [score, setScore] = useState(0)
  const [progress, setProgress] = useState(0)

  const addScore = useCallback((delta) => setScore((s) => s + delta), [])
  const goHome = useCallback(() => navigate('/'), [navigate])

  // Μετάβαση σε νέα αποστολή με μηδενισμό της προόδου.
  const advance = useCallback((next) => {
    setProgress(0)
    setStage(next)
  }, [])

  if (stage === 'intro') {
    return (
      <div className="screen intro intro--hero">
        <div className="intro__emoji">🦸</div>
        <h1 className="intro__title">Healthy Hero</h1>
        <p className="intro__subtitle">Γίνε κι εσύ Σούπερ Ήρωας της Διατροφής!</p>
        <BigButton variant="primary" onClick={() => advance('m1')}>
          Ξεκίνα την αποστολή ▶
        </BigButton>
      </div>
    )
  }

  if (stage === 'finale') {
    return (
      <div className="screen finale">
        <div className="finale__badge">
          <div className="finale__hero">🦸</div>
          <div className="finale__stars">⭐️⭐️⭐️</div>
          <h1 className="finale__title">Super Healthy Hero!</h1>
          <p className="finale__text">Τα κατάφερες σε όλες τις αποστολές!</p>
          <p className="finale__score">Σκορ: ⭐ {score}</p>
        </div>
        <BigButton variant="primary" onClick={() => setStage('rating')}>
          Συνέχεια →
        </BigButton>
      </div>
    )
  }

  if (stage === 'rating') {
    return <RatingScreen game="healthy-hero" onDone={goHome} />
  }

  // Αποστολές — με μπάρα σκορ στο πάνω μέρος.
  const meta = STAGE_META[stage]
  return (
    <div className="screen game game--hero">
      <ScoreBar
        score={score}
        title="Healthy Hero"
        goal={meta?.goal}
        progress={meta ? progress : null}
        progressIcon={meta?.icon}
      />
      <div className="game__body">
        {stage === 'm1' && (
          <Mission1Plate
            score={score}
            addScore={addScore}
            onProgress={setProgress}
            onComplete={() => advance('m2')}
          />
        )}
        {stage === 'm2' && (
          <Mission2LunchBox
            score={score}
            addScore={addScore}
            onProgress={setProgress}
            onNext={() => advance('m3')}
          />
        )}
        {stage === 'm3' && (
          <Mission3Traps
            addScore={addScore}
            onProgress={setProgress}
            onNext={() => advance('finale')}
          />
        )}
      </div>
    </div>
  )
}
