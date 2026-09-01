import { useEffect, useState } from 'react'
import { speak, stopVoice } from '../../services/voice.js'
import HeroPoint from './HeroPoint.jsx'
import PopupFrame from './PopupFrame.jsx'

// Σαφείς οδηγίες πριν από κάθε αποστολή: ο ήρωας ΔΕΙΧΝΕΙ (HH-03) τι να κάνει.
// Στο «Πάμε!» κάνει μικρή αναπήδηση + χαρούμενο πρόσωπο (HH-04).
export default function MissionIntro({ bg, text, voiceKey, onStart, stage }) {
  // Στα στάδια 2 & 3 ο γραφίστας έστειλε animated GIF αντί για το pointing hero.
  const useGif = stage === 'm2' || stage === 'm3'
  const gifSrc = stage === 'm3' ? '/hh/Instructions3.gif' : '/hh/Instructions.gif'
  const [jumping, setJumping] = useState(false)

  useEffect(() => {
    speak(voiceKey) // HH-03
  }, [voiceKey])

  const handleStart = () => {
    if (jumping) return
    stopVoice() // σταμάτα την ατάκα οδηγιών ώστε να μην ακούγεται πάνω στην αποστολή
    setJumping(true)
    setTimeout(() => onStart(), 420)
  }

  return (
    <div className="mission-intro" style={{ backgroundImage: `url(${bg})` }}>
      <div className="mission-intro__dim" />
      <div className="mission-intro__card">
        {useGif ? (
          <img
            src={gifSrc}
            alt=""
            className={`mission-intro__hero${jumping ? ' is-jump' : ''}`}
            draggable="false"
          />
        ) : (
          <HeroPoint className={`mission-intro__hero${jumping ? ' is-jump' : ''}`} happy={jumping} />
        )}
        {/* Πλαίσιο οδηγιών του γραφίστα (κείμενο + κουμπί ΠΑΜΕ ζωγραφισμένα μέσα). */}
        <PopupFrame frame={`instr_${stage}`} onButton={handleStart} className="mission-intro__frame" />
      </div>
    </div>
  )
}
