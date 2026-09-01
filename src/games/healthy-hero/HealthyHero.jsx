import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RatingScreen from '../../components/RatingScreen.jsx'
import Mission1Plate from './missions/Mission1Plate.jsx'
import Mission2LunchBox from './missions/Mission2LunchBox.jsx'
import Mission3Traps from './missions/Mission3Traps.jsx'
import MissionIntro from './MissionIntro.jsx'
import HeroWelcomeRive from './HeroWelcomeRive.jsx'
import MascotCompanion from './MascotCompanion.jsx'
import TunePanel from './TunePanel.jsx'
import { playWin } from '../../services/sound.js'
import { speak, stopVoice } from '../../services/voice.js'

// Κρυφή λειτουργία ρύθμισης: ?tune=1 (και ?stage=m1/m2/m3 για μετάβαση).
const PARAMS = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
const TUNE = PARAMS.get('tune') === '1'

// Αντιδράσεις ανά αποστολή (επίσημο script HH-XX):
// key = κωδικός VO (φωνή), bubble = σύντομο κείμενο στην οθόνη.
// Κάθε αντίδραση ορίζει ΚΙΝΗΣΗ (anim) + ΗΧΟ (key) + προαιρετικό κείμενο (bubble).
// Οι σωστές δεν έχουν κείμενο («—»). Το head-shake (hh07) παίζει ΠΑΝΤΑ «Ναι!» (HH-S1).
// Για ποικιλία μπαίνουν και επιφωνήματα: HH-S1 «Ναι!», HH-S2 «Woohoo!», HH-S3 «Ωπ!».
const REACTIONS = {
  m1: {
    correct: [
      { anim: 'thumbs', key: 'HH-05', bubble: '' },
      { anim: 'hh06', key: 'HH-06', bubble: '' },
      { anim: 'hh07', key: 'HH-S1', bubble: '' }, // head-shake + «Ναι!»
      { anim: 'thumbs', key: 'HH-S2', bubble: '' }, // «Woohoo!»
    ],
    wrong: [
      { anim: 'touch', key: 'HH-08', bubble: 'Δοκίμασε ξανά' },
      { anim: 'hh09', key: 'HH-S3', bubble: 'Ψάξε ξανά' }, // «Ωπ!» + κούνημα «όχι»
      { anim: 'hh16', key: 'HH-10', bubble: 'Σχεδόν!' },
    ],
  },
  m2: {
    correct: [
      { anim: 'thumbs', key: 'HH-14', bubble: '' },
      { anim: 'hh06', key: 'HH-15', bubble: '' },
      { anim: 'hh07', key: 'HH-S1', bubble: '' }, // head-shake + «Ναι!»
      { anim: 'thumbs', key: 'HH-S2', bubble: '' }, // «Woohoo!»
    ],
    wrong: [
      { anim: 'touch', key: 'HH-16', bubble: 'Δοκίμασε ξανά' },
      { anim: 'hh09', key: 'HH-S3', bubble: 'Ψάξε ξανά' }, // «Ωπ!»
      { anim: 'hh16', key: 'HH-17', bubble: 'Ψάξε ξανά' },
    ],
  },
  m3: {
    correct: [
      { anim: 'thumbs', key: 'HH-20', bubble: '' },
      { anim: 'hh06', key: 'HH-21', bubble: '' },
      { anim: 'hh07', key: 'HH-S1', bubble: '' }, // head-shake + «Ναι!»
      { anim: 'thumbs', key: 'HH-S2', bubble: '' }, // «Woohoo!»
    ],
    wrong: [
      { anim: 'touch', key: 'HH-22', bubble: 'Πιο συχνά!' },
      { anim: 'hh09', key: 'HH-S3', bubble: 'Κοίτα ξανά' }, // «Ωπ!»
      { anim: 'hh16', key: 'HH-23', bubble: 'Κοίτα ξανά' },
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
  m1: { w: 586, right: -146, bottom: -87, zoom: 1.6 },
  m2: { w: 560, right: -121, bottom: -79, zoom: 1.7 },
  m3: { w: 548, right: -124, bottom: -68, zoom: 1.75 },
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
  const [stage, setStage] = useState(() => (TUNE && PARAMS.get('stage')) || 'intro')
  const [score, setScore] = useState(0)
  const [ready, setReady] = useState(TUNE) // σε tune mode ξεκίνα κατευθείαν στην αποστολή
  const [reaction, setReaction] = useState(null)
  const [leaving, setLeaving] = useState(false) // απογείωση ήρωα στο πάτημα ΕΝΑΡΞΗ
  const [tunePos, setTunePos] = useState(() => MASCOT_POS[(TUNE && PARAMS.get('stage')) || 'm1'] || MASCOT_POS.m1)
  const rIdx = useRef({ correct: 0, wrong: 0 })

  const addScore = useCallback((delta) => setScore((s) => s + delta), [])
  const goHome = useCallback(() => navigate('/'), [navigate])
  const noop = useCallback(() => {}, [])

  // Αντίδραση μασκότ: φράση+φωνή ανάλογα με την τρέχουσα αποστολή.
  const onReaction = useCallback(
    (type, onEnd, opts = {}) => {
      const { silent = false, anim: fixedAnim } = opts
      // fixedAnim: σταθερή κίνηση ΧΩΡΙΣ να «καταναλώνει» τον κύκλο ούτε να παίζει VO
      // (π.χ. στο «άλλα 2», ώστε το head-shake+«Ναι!» να πέσει σε φωνητικό τρόφιμο).
      if (fixedAnim) {
        setReaction({ type, anim: fixedAnim, text: '', n: Date.now() })
        return onEnd && onEnd()
      }
      const set = (REACTIONS[stage] && REACTIONS[stage][type]) || []
      if (!set.length) return onEnd && onEnd()
      const item = set[rIdx.current[type]++ % set.length]
      // silent: κάνε μόνο την κίνηση (από τον κύκλο), χωρίς VO.
      if (silent) onEnd && onEnd()
      else speak(item.key, onEnd) // onEnd() -> όταν τελειώσει το VO (για chaining με το VO νίκης)
      setReaction({ type, anim: item.anim, text: silent ? '' : item.bubble, n: Date.now() })
    },
    [stage],
  )

  // Προχώρα στην επόμενη αποστολή. (Το VO ολοκλήρωσης λέγεται πλέον ΑΜΕΣΩΣ
  // μόλις εμφανιστεί το pop-up νίκης, μέσα σε κάθε αποστολή.)
  const advance = useCallback((from, to) => {
    setStage(to)
  }, [])

  // Οδηγίες σε κάθε νέα αποστολή· VO αρχής/τέλους.
  useEffect(() => {
    if (MISSIONS[stage]) {
      if (!TUNE) setReady(false)
      setReaction(null) // καθάρισε την τελευταία αντίδραση -> ο ήρωας ξεκινά «δείχνει»
      setTunePos(MASCOT_POS[stage] || MASCOT_POS.m1)
    }
    if (stage === 'intro') speak('HH-01')
    if (stage === 'finale') {
      playWin()
      // HH-26 «Έγινες Super Healthy Hero!» -> σερί το HH-27 για το σκορ.
      speak('HH-26', () => speak('HH-27'))
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
        <HeroWelcomeRive className="hh-intro__hero" leaving={leaving} />
        <button
          type="button"
          className="hh-start-btn"
          disabled={leaving}
          onClick={() => {
            if (leaving) return
            setLeaving(true) // ο ήρωας απογειώνεται (αργά) και μετά η οθόνη μένει σκέτη
            let moved = false
            const go = () => {
              if (moved) return
              moved = true
              setStage('m1')
            }
            // Πήγαινε στην αποστολή ΜΟΝΟ όταν: (α) τελειώσει το VO ΚΑΙ
            // (β) περάσει λίγη ώρα ώστε να μείνει σκέτη η οθόνη. Με ασφαλές όριο.
            let voDone = false
            let minDone = false
            const maybeGo = () => {
              if (voDone && minDone) go()
            }
            speak('HH-02', () => {
              voDone = true
              maybeGo()
            })
            setTimeout(() => {
              minDone = true
              maybeGo()
            }, 2600) // λίγα δευτ. σκέτη οθόνη αφού φύγει ο ήρωας
            setTimeout(go, 5000) // ασφαλές όριο
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
        <img src={`${E}/Celebration.gif`} alt="" className="hh-finale__hero" draggable="false" />
        <div className="hh-finale__score">Σκορ: ⭐ {score}</div>
        <button type="button" className="big-button big-button--primary hh-finale__btn" onClick={() => { stopVoice(); setStage('rating') }}>
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
          stage={stage}
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
      {ready && <MascotCompanion reaction={reaction} pos={TUNE ? tunePos : MASCOT_POS[stage]} />}
      {TUNE && <TunePanel stage={stage} pos={tunePos} onChange={setTunePos} />}
    </div>
  )
}
