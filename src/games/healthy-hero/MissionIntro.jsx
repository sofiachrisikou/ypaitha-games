import { useEffect, useState } from 'react'
import { speak } from '../../services/voice.js'
import HeroPoint from './HeroPoint.jsx'

// Σαφείς οδηγίες πριν από κάθε αποστολή: ο ήρωας ΔΕΙΧΝΕΙ (HH-03) τι να κάνει.
// Στο «Πάμε!» κάνει μικρή αναπήδηση + χαρούμενο πρόσωπο (HH-04).
export default function MissionIntro({ bg, text, voiceKey, onStart }) {
  const [jumping, setJumping] = useState(false)

  useEffect(() => {
    speak(voiceKey) // HH-03
  }, [voiceKey])

  const handleStart = () => {
    if (jumping) return
    setJumping(true)
    setTimeout(() => onStart(), 420)
  }

  return (
    <div className="mission-intro" style={{ backgroundImage: `url(${bg})` }}>
      <div className="mission-intro__dim" />
      <div className="mission-intro__card">
        <HeroPoint className={`mission-intro__hero${jumping ? ' is-jump' : ''}`} happy={jumping} />
        <div className="mission-intro__bubble">
          <p className="mission-intro__text">{text}</p>
        </div>
        <button
          type="button"
          className="big-button big-button--primary mission-intro__btn"
          onClick={handleStart}
        >
          Πάμε! ▶
        </button>
      </div>
    </div>
  )
}
