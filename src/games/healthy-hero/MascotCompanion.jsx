import { useEffect, useRef, useState } from 'react'
import RiveHero from '../../components/RiveHero.jsx'
import HeroPoint from './HeroPoint.jsx'
import HeroReact from './HeroReact.jsx'

// Ο ήρωας-σύντροφος:
//  • idle: HH-03 (δείχνει)
//  • ΣΩΣΤΟ (εναλλάξ, ΜΕΝΕΙ): thumbs (Rive) / hh06 (wink+αστέρι) / hh07 (γέλιο)
//  • ΛΑΘΟΣ (εναλλάξ, ΜΕΝΕΙ): touch (Rive, ακουμπάει κεφάλι) / hh09 (κούνημα «όχι») / hh16 (oops)
const RIVE = { thumbs: '/hh/rive/Hero_Screen01.riv', touch: '/hh/rive/Hero_Screen02.riv' }
const CORRECT_CYCLE = ['thumbs', 'hh06', 'hh07']
const WRONG_CYCLE = ['touch', 'hh09', 'hh16']
const POINT_FACTOR = 0.62
const RIVE_FACTOR = 1.28
const POINT_SHIFT_X = -34

export default function MascotCompanion({ reaction, pos = { w: 560, right: -30, bottom: -20, zoom: 1.7 } }) {
  const [bubble, setBubble] = useState(null)
  const [display, setDisplay] = useState('point')
  const cIdx = useRef(-1)
  const wIdx = useRef(-1)
  const bubbleTimer = useRef()

  useEffect(() => {
    if (!reaction) return
    // Οι σωστές αντιδράσεις δεν έχουν κείμενο («—») — δείχνουμε bubble μόνο αν υπάρχει κείμενο.
    clearTimeout(bubbleTimer.current)
    if (reaction.text) {
      setBubble({ text: reaction.text, type: reaction.type })
      bubbleTimer.current = setTimeout(() => setBubble(null), 1900)
    } else {
      setBubble(null)
    }
    // ΜΕΝΕΙ μέχρι το επόμενο τρόφιμο (correct & wrong εναλλάξ)
    if (reaction.type === 'correct') {
      cIdx.current += 1
      setDisplay(CORRECT_CYCLE[cIdx.current % CORRECT_CYCLE.length])
    } else if (reaction.type === 'wrong') {
      wIdx.current += 1
      setDisplay(WRONG_CYCLE[wIdx.current % WRONG_CYCLE.length])
    }
  }, [reaction])

  useEffect(() => () => clearTimeout(bubbleTimer.current), [])

  const w = pos.w
  const h = Math.round(w * 1.27)
  const heroStyle = { width: w, height: h, right: pos.right, bottom: pos.bottom }
  const riveSrc = RIVE[display] // thumbs | touch
  const isPoint = display === 'point'
  const scale = (pos.zoom ?? 1.7) * (riveSrc ? RIVE_FACTOR : POINT_FACTOR)
  const tx = isPoint ? POINT_SHIFT_X : 0
  const bubbleType = bubble ? (bubble.type === 'wrong' ? 'wrong' : 'correct') : ''

  return (
    <div className="mascot" aria-hidden="true">
      {bubble && (
        <div
          className={`mascot__bubble mascot__bubble--${bubbleType}`}
          style={{ bottom: (pos.bottom || 0) + h - 120 }}
        >
          {bubble.text}
        </div>
      )}
      <div className={`mascot__hero mascot__hero--${display}`} style={heroStyle}>
        <div
          className="mascot__zoom"
          style={{ transform: `translateX(${tx}px) scale(${scale})`, transformOrigin: '50% 46%' }}
        >
          {riveSrc ? (
            <RiveHero src={riveSrc} className="mascot__rive" fallback="/hh/end/Hero.png" width={460} height={600} />
          ) : isPoint ? (
            <HeroPoint className="mascot__point" bounce />
          ) : (
            <HeroReact type={display} className="mascot__point" />
          )}
        </div>
      </div>
    </div>
  )
}
