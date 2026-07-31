import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import RatingScreen from '../../components/RatingScreen.jsx'
import Mission1Plate from './missions/Mission1Plate.jsx'
import Mission2LunchBox from './missions/Mission2LunchBox.jsx'
import Mission3Traps from './missions/Mission3Traps.jsx'

const S = '/hh/start'
// Διακοσμητικά τρόφιμα που «επιπλέουν» στην αρχική (θέσεις κατά το σχέδιο).
const FLOAT_FOODS = [
  { src: `${S}/apple.png`, x: 205, y: 930, w: 155, d: 0 },
  { src: `${S}/Sandwich.png`, x: 245, y: 1090, w: 195, d: 0.6 },
  { src: `${S}/Cheese.png`, x: 170, y: 1250, w: 155, d: 1.1 },
  { src: `${S}/Yoghurt.png`, x: 240, y: 1410, w: 150, d: 0.3 },
  { src: `${S}/Broccoli.png`, x: 165, y: 1555, w: 155, d: 0.9 },
]

// Ροή: intro -> m1 -> m2 -> m3 -> finale -> rating -> homepage
export default function HealthyHero() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('intro')
  const [score, setScore] = useState(0)

  const addScore = useCallback((delta) => setScore((s) => s + delta), [])
  const goHome = useCallback(() => navigate('/'), [navigate])
  const noop = useCallback(() => {}, [])

  if (stage === 'intro') {
    return (
      <div className="screen hh-intro" style={{ backgroundImage: `url(${S}/Background.png)` }}>
        {FLOAT_FOODS.map((f, i) => (
          <img
            key={i}
            src={f.src}
            alt=""
            className="hh-float"
            style={{ left: f.x, top: f.y, width: f.w, animationDelay: `${f.d}s` }}
            draggable="false"
          />
        ))}
        <img src={`${S}/Hero.png`} alt="" className="hh-intro__hero" draggable="false" />
        <button type="button" className="hh-start-btn" onClick={() => setStage('m1')} aria-label="Έναρξη">
          <img src={`${S}/Start_Button.png`} alt="Έναρξη" draggable="false" />
        </button>
      </div>
    )
  }

  if (stage === 'finale') {
    return (
      <div className="screen hh-finale">
        <div className="hh-finale__trophy">🏆</div>
        <div className="hh-finale__banner">
          <div className="hh-finale__congrats">ΣΥΓΧΑΡΗΤΗΡΙΑ!</div>
          <div className="hh-finale__sub">ΕΓΙΝΕΣ SUPER HEALTHY HERO!</div>
        </div>
        <img src={`${S}/Hero.png`} alt="" className="hh-finale__hero" draggable="false" />
        <div className="hh-finale__score">Σκορ: ⭐ {score}</div>
        <button type="button" className="big-button big-button--primary" onClick={() => setStage('rating')}>
          Συνέχεια →
        </button>
      </div>
    )
  }

  if (stage === 'rating') {
    return <RatingScreen game="healthy-hero" onDone={goHome} />
  }

  return (
    <div className="screen hh-game">
      {stage === 'm1' && (
        <Mission1Plate addScore={addScore} onProgress={noop} onComplete={() => setStage('m2')} />
      )}
      {stage === 'm2' && (
        <Mission2LunchBox addScore={addScore} onProgress={noop} onNext={() => setStage('m3')} />
      )}
      {stage === 'm3' && (
        <Mission3Traps addScore={addScore} onProgress={noop} onNext={() => setStage('finale')} />
      )}
    </div>
  )
}
