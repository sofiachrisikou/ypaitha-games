import { useState } from 'react'
import { isMuted, toggleMute } from '../services/sound.js'

// Καθολικό κουμπί σίγασης (πάνω-δεξιά). Η κατάσταση σώζεται τοπικά.
export default function MuteButton() {
  const [muted, setMuted] = useState(isMuted())
  return (
    <button
      type="button"
      className="mute-btn"
      onClick={() => setMuted(toggleMute())}
      aria-label={muted ? 'Ενεργοποίηση ήχου' : 'Σίγαση'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
