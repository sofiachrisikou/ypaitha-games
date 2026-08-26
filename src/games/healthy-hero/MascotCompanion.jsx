import { useEffect, useRef, useState } from 'react'
import RiveHero from '../../components/RiveHero.jsx'

// Ο ήρωας-σύντροφος. Θέση/μέγεθος/zoom ρυθμίζονται ανά αποστολή μέσω `pos`
// ({ w, right, bottom, zoom }). Το zoom «μπαίνει μέσα» στον χαρακτήρα και κόβει
// το κενό padding του Rive, ώστε να γεμίζει το πλαίσιο.
export default function MascotCompanion({ reaction, pos = { w: 560, right: -30, bottom: -20, zoom: 1.7 } }) {
  const [bubble, setBubble] = useState(null)
  const [anim, setAnim] = useState(null)
  const timer = useRef()

  useEffect(() => {
    if (!reaction) return
    setBubble({ text: reaction.text, type: reaction.type })
    setAnim(reaction.type)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setBubble(null)
      setAnim(null)
    }, 1900)
    return () => clearTimeout(timer.current)
  }, [reaction])

  const w = pos.w
  const h = Math.round(w * 1.27)
  const heroStyle = { width: w, height: h, right: pos.right, bottom: pos.bottom }

  return (
    <div className="mascot" aria-hidden="true">
      {bubble && (
        <div
          className={`mascot__bubble mascot__bubble--${bubble.type}`}
          style={{ bottom: (pos.bottom || 0) + h - 120 }}
        >
          {bubble.text}
        </div>
      )}
      <div className={`mascot__hero ${anim ? `mascot__hero--${anim}` : ''}`} style={heroStyle}>
        <div className="mascot__zoom" style={{ transform: `scale(${pos.zoom ?? 1.7})`, transformOrigin: '50% 46%' }}>
          <RiveHero src="/hh/rive/Hero_Screen01.riv" className="mascot__rive" fallback="/hh/end/Hero.png" width={460} height={600} />
        </div>
      </div>
    </div>
  )
}
