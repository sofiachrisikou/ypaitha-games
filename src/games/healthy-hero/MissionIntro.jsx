import { useEffect } from 'react'
import { speak } from '../../services/voice.js'

// Σαφείς οδηγίες πριν από κάθε αποστολή: ο ήρωας εξηγεί τι να κάνει το παιδί.
// Μπλοκάρει την αλληλεπίδραση μέχρι το παιδί να πατήσει «Πάμε!».
export default function MissionIntro({ bg, hero, text, voiceKey, onStart }) {
  useEffect(() => {
    speak(voiceKey)
  }, [voiceKey])

  return (
    <div className="mission-intro" style={{ backgroundImage: `url(${bg})` }}>
      <div className="mission-intro__dim" />
      <div className="mission-intro__card">
        <img src={hero} alt="" className="mission-intro__hero" draggable="false" />
        <div className="mission-intro__bubble">
          <p className="mission-intro__text">{text}</p>
        </div>
        <button type="button" className="big-button big-button--primary mission-intro__btn" onClick={onStart}>
          Πάμε! ▶
        </button>
      </div>
    </div>
  )
}
