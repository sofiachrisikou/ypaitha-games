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
import { speak } from '../../services/voice.js'

// Αντιδράσεις ανά αποστολή (επίσημο script HH-XX):
// key = κωδικός VO (φωνή), bubble = σύντομο κείμενο στην οθόνη.
const REACTIONS = {
  m1: {
    correct: [
      { key: 'HH-05', bubble: 'Τέλεια επιλογή!' },
      { key: 'HH-06', bubble: 'Δύναμη! 💪' },
      { key: 'HH-07', bubble: 'Κι άλλο ένα!' },
    ],
    wrong: [
      { key: 'HH-08', bubble: 'Όχι αυτό!' },
      { key: 'HH-09', bubble: 'Δοκίμασε ξανά' },
      { key: 'HH-10', bubble: 'Ψάξε ξανά' },
    ],
  },
  m2: {
    correct: [
      { key: 'HH-14', bubble: 'Ωραίο κολατσιό!' },
      { key: 'HH-15', bubble: 'Ενέργεια! ⚡' },
    ],
    wrong: [
      { key: 'HH-16', bubble: 'Όχι αυτό!' },
      { key: 'HH-17', bubble: 'Δοκίμασε ξανά' },
    ],
  },
  m3: {
    correct: [
      { key: 'HH-20', bubble: 'Σωστά!' },
      { key: 'HH-21', bubble: 'Το εντόπισες!' },
    ],
    wrong: [
      { key: 'HH-22', bubble: 'Αυτό το τρώμε συχνά!' },
      { key: 'HH-23', bubble: 'Κοίτα καλύτερα' },
    ],
  },
}

// Οδηγίες + VO + φόντο ανά αποστολή (οθόνη εισαγωγής).
const MISSIONS = {
  m1: { instr: 'Σύρε 5 υγιεινά τρόφιμα μέσα στο πιάτο!', voice: 'HH-03', bg: '/hh/m1/Background.png' },
  m2: { instr: 'Γέμισε το κουτί με υγιεινές επιλογές για το κολατσιό!', voice: 'HH-13', bg: '/hh/m2/Background.png' },
  m3: { instr: 'Άγγιξε όσα δεν τρώμε συχνά, πριν τελειώσει ο χρόνος!', voice: 'HH-19', bg: '/hh/m3/Background.png' },
}
// VO ολοκλήρωσης ανά αποστολή.
const DONE_VO = { m1: 'HH-12', m2: 'HH-18' }

// Θέση/μέγεθος μασκότ ανά αποστολή (ο κάτω-δεξιά χώρος διαφέρει).
const MASCOT_POS = {
  m1: { w: 560, right: -30, bottom: -40 }, // μέσα στον κίτρινο κύκλο
  m2: { w: 520, right: -30, bottom: -30 }, // μέσα στον κίτρινο κύκλο
  m3: { w: 420, right: -10, bottom: 300 }, // πιο πάνω, να μη σκεπάζει ΧΡΟΝΟΣ/ΣΚΟΡ
}

const CONFETTI_COLORS = ['#34c759', '#ff9f2e', '#2ec4f1', '#e5442e', '#ffd23f', '#ffffff']
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  dur: 2.6 + ((i * 7) % 12) / 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

const S = '/hh/start'
const E = '/hh/end'
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
  const [ready, setReady] = useState(false)
  const [reaction, setReaction] = useState(null)
  const rIdx = useRef({ correct: 0, wrong: 0 })

  const addScore = useCallback((delta) => setScore((s) => s + delta), [])
  const goHome = useCallback(() => navigate('/'), [navigate])
  const noop = useCallback(() => {}, [])

  // Αντίδραση μασκότ: φράση+φωνή ανάλογα με την τρέχουσα αποστολή.
  const onReaction = useCallback(
    (type) => {
      const set = (REACTIONS[stage] && REACTIONS[stage][type]) || []
      if (!set.length) return
      const item = set[rIdx.current[type]++ % set.length]
      speak(item.key)
      setReaction({ type, text: item.bubble, n: Date.now() })
    },
    [stage],
  )

  // Προχώρα στην επόμενη αποστολή, λέγοντας το VO ολοκλήρωσης.
  const advance = useCallback((from, to) => {
    if (DONE_VO[from]) speak(DONE_VO[from])
    setStage(to)
  }, [])

  // Οδηγίες σε κάθε νέα αποστολή· VO αρχής/τέλους.
  useEffect(() => {
    if (MISSIONS[stage]) setReady(false)
    if (stage === 'intro') speak('HH-01')
    if (stage === 'finale') {
      playWin()
      speak('HH-26')
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
        <button
          type="button"
          className="hh-start-btn"
          onClick={() => {
            speak('HH-02')
            setStage('m1')
          }}
          aria-label="Έναρξη"
        >
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
        <RiveHero src="/hh/rive/Hero_Screen01.riv" className="hh-finale__hero" fallback={`${E}/Hero.png`} />
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
        <Mission1Plate addScore={addScore} onReaction={onReaction} onComplete={() => advance('m1', 'm2')} />
      )}
      {ready && stage === 'm2' && (
        <Mission2LunchBox addScore={addScore} onReaction={onReaction} onNext={() => advance('m2', 'm3')} />
      )}
      {ready && stage === 'm3' && (
        <Mission3Traps addScore={addScore} onReaction={onReaction} onNext={() => advance('m3', 'finale')} />
      )}
      {ready && <MascotCompanion reaction={reaction} pos={MASCOT_POS[stage]} />}
    </div>
  )
}
