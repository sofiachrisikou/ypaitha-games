import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RatingScreen from '../../components/RatingScreen.jsx'
import Mission1Plate from './missions/Mission1Plate.jsx'
import Mission2LunchBox from './missions/Mission2LunchBox.jsx'
import Mission3Traps from './missions/Mission3Traps.jsx'
import MissionIntro from './MissionIntro.jsx'
import RiveHero from '../../components/RiveHero.jsx'
import MascotCompanion from './MascotCompanion.jsx'
import { playWin } from '../../services/sound.js'
import { speak, CLIPS } from '../../services/voice.js'

// Φράσεις που εναλλάσσονται (φωνή + μπαλόνι) ανά τύπο αντίδρασης.
const PRAISE_KEYS = ['bravo', 'poly_kala', 'ta_kataferes', 'sinexise']
const ENCOURAGE_KEYS = ['dokimase', 'oxi_afto', 'ligo_akoma']

// Οδηγίες + assets ανά αποστολή (για την οθόνη εισαγωγής).
const MISSIONS = {
  m1: { instr: 'Σύρε 5 υγιεινά τρόφιμα μέσα στο πιάτο!', voice: 'm1_intro', bg: '/hh/m1/Background.png' },
  m2: { instr: 'Γέμισε το κουτί με υγιεινές επιλογές για το κολατσιό!', voice: 'm2_intro', bg: '/hh/m2/Background.png' },
  m3: { instr: 'Άγγιξε όσα δεν τρώμε συχνά, πριν τελειώσει ο χρόνος!', voice: 'm3_intro', bg: '/hh/m3/Background.png' },
}

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
  { src: `${S}/apple.png`, x: 225, y: 935, w: 150, d: 0 },
  { src: `${S}/Cheese.png`, x: 160, y: 1155, w: 150, d: 1.1 },
  { src: `${S}/Sandwich.png`, x: 360, y: 1120, w: 180, d: 0.6 },
  { src: `${S}/Yoghurt.png`, x: 195, y: 1360, w: 150, d: 0.3 },
  { src: `${S}/Broccoli.png`, x: 385, y: 1370, w: 150, d: 0.9 },
]

// Ροή: intro -> m1 -> m2 -> m3 -> finale -> rating -> homepage
export default function HealthyHero() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('intro')
  const [score, setScore] = useState(0)
  const [ready, setReady] = useState(false) // οδηγίες αποστολής ολοκληρώθηκαν;
  const [reaction, setReaction] = useState(null) // { type, text } για τη μασκότ
  const rIdx = useRef({ correct: 0, wrong: 0 })

  const addScore = useCallback((delta) => setScore((s) => s + delta), [])
  const goHome = useCallback(() => navigate('/'), [navigate])
  const noop = useCallback(() => {}, [])

  // Αντίδραση μασκότ: επιλέγει φράση, τη λέει (φωνή) και τη δείχνει σε μπαλόνι.
  const onReaction = useCallback((type) => {
    const keys = type === 'correct' ? PRAISE_KEYS : ENCOURAGE_KEYS
    const key = keys[rIdx.current[type === 'correct' ? 'correct' : 'wrong']++ % keys.length]
    speak(key)
    setReaction({ type, text: CLIPS[key] || '', n: Date.now() })
  }, [])

  // Σε κάθε νέα αποστολή δείξε πρώτα τις οδηγίες. Στο τέλος φανφάρα + φωνή.
  useEffect(() => {
    if (MISSIONS[stage]) setReady(false)
    if (stage === 'finale') {
      playWin()
      speak('super_hero')
    }
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
        <RiveHero src="/hh/rive/Hero_Screen01.riv" className="hh-intro__hero" fallback={`${E}/Hero.png`} />
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
        <RiveHero src="/hh/rive/Hero_Screen02.riv" className="hh-finale__hero" fallback={`${E}/Hero.png`} />
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

  const meta = MISSIONS[stage]
  return (
    <div className="screen hh-game hh-fade">
      {!ready && meta && (
        <MissionIntro
          bg={meta.bg}
          hero={`${E}/Hero.png`}
          text={meta.instr}
          voiceKey={meta.voice}
          onStart={() => setReady(true)}
        />
      )}
      {ready && stage === 'm1' && (
        <Mission1Plate addScore={addScore} onProgress={noop} onReaction={onReaction} onComplete={() => setStage('m2')} />
      )}
      {ready && stage === 'm2' && (
        <Mission2LunchBox addScore={addScore} onProgress={noop} onReaction={onReaction} onNext={() => setStage('m3')} />
      )}
      {ready && stage === 'm3' && (
        <Mission3Traps addScore={addScore} onProgress={noop} onReaction={onReaction} onNext={() => setStage('finale')} />
      )}
      {ready && <MascotCompanion reaction={reaction} />}
    </div>
  )
}
