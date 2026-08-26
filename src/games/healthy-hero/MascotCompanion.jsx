import { useEffect, useRef, useState } from 'react'
import RiveHero from '../../components/RiveHero.jsx'

// Ο ήρωας-σύντροφος κάτω δεξιά σε κάθε αποστολή. Αντιδρά στις επιλογές του
// παιδιού: μπαλόνι με φράση + κίνηση (χαρά στο σωστό, ενθάρρυνση στο λάθος).
export default function MascotCompanion({ reaction }) {
  const [bubble, setBubble] = useState(null) // { text, type }
  const [anim, setAnim] = useState(null) // 'correct' | 'wrong'
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

  return (
    <div className="mascot" aria-hidden="true">
      {bubble && <div className={`mascot__bubble mascot__bubble--${bubble.type}`}>{bubble.text}</div>}
      <div className={`mascot__hero ${anim ? `mascot__hero--${anim}` : ''}`}>
        <RiveHero
          src="/hh/rive/Hero_Screen01.riv"
          className="mascot__rive"
          fallback="/hh/end/Hero.png"
          width={460}
          height={600}
        />
      </div>
    </div>
  )
}
