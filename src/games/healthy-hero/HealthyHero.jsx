import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RatingScreen from '../../components/RatingScreen.jsx'
import Mission1Plate from './missions/Mission1Plate.jsx'
import Mission2LunchBox from './missions/Mission2LunchBox.jsx'
import Mission3Traps from './missions/Mission3Traps.jsx'
import { playWin } from '../../services/sound.js'

// Confetti (σταθερές θέσεις — χωρίς τυχαιότητα)
const CONFETTI_COLORS = ['#34c759', '#ff9f2e', '#2ec4f1', '#e5442e', '#ffd23f', '#ffffff']
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  dur: 2.6 + ((i * 7) % 12) / 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

const S = '/hh/start'
const E = '/hh/end'
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

  // Φανφάρα στην τελική κάρτα.
  useEffect(() => {
    if (stage === 'finale') playWin()
  }, [stage])

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
        <img src={`${E}/Hero.png`} alt="" className="hh-intro__hero" draggable="false" />
        <button type="button" className="hh-start-btn" onClick={() => setStage('m1')} aria-label="Έναρξη">
          <img src={`${S}/Start_Button.png`} alt="Έναρξη" draggable="false" />
        </button>
      </div>
    )
  }

  if (stage === 'finale') {
    return (
      <div className="screen hh-finale" style={{ backgroundImage: `url(${E}/Background.png)` }}>
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <i
              key={i}
              style={{
                left: `${c.left}%`,
                background: c.color,
                animationDuration: `${c.dur}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
        </div>
        <img src={`${E}/Trophy.png`} alt="" className="hh-finale__trophy" draggable="false" />
        <img src={`${E}/Ribon.png`} alt="Συγχαρητήρια! Έγινες Super Healthy Hero!" className="hh-finale__ribbon" draggable="false" />
        <img src={`${E}/Hero.png`} alt="" className="hh-finale__hero" draggable="false" />
        <div className="hh-finale__score">Σκορ: ⭐ {score}</div>
        <button type="button" className="big-button big-button--primary hh-finale__btn" onClick={() => setStage('rating')}>
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
