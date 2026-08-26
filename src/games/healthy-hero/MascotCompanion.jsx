import { useEffect, useRef, useState } from 'react'
import RiveHero from '../../components/RiveHero.jsx'

// Ο ήρωας-σύντροφος κάτω δεξιά σε κάθε αποστολή. Αντιδρά στις επιλογές του
// παιδιού: μπαλόνι με φράση + κίνηση. Η θέση/μέγεθος ρυθμίζονται ανά αποστολή
// μέσω του `pos` ({ w, right, bottom }).
export default function MascotCompanion({ reaction, pos = { w: 560, right: -30, bottom: -40 } }) {
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

  const heroStyle = {
    width: pos.w,
    height: Math.round(pos.w * 1.27),
    right: pos.right,
    bottom: pos.bottom,
  }

  return (
    <div className="mascot" aria-hidden="true">
      {bubble && (
        <div className={`mascot__bubble mascot__bubble--${bubble.type}`} style={{ bottom: (pos.bottom || 0) + heroStyle.height - 120 }}>
          {bubble.text}
        </div>
      )}
      <div className={`mascot__hero ${anim ? `mascot__hero--${anim}` : ''}`} style={heroStyle}>
        <RiveHero src="/hh/rive/Hero_Screen01.riv" className="mascot__rive" fallback="/hh/end/Hero.png" width={460} height={600} />
      </div>
    </div>
  )
}
