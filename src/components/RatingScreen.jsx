import { useEffect, useRef, useState } from 'react'
import { saveVote } from '../services/votes.js'
import { speak } from '../services/voice.js'

const FACES = [
  { rating: 1, emoji: '😣', label: 'Πολύ δυσαρεστημένος' },
  { rating: 2, emoji: '😕', label: 'Δυσαρεστημένος' },
  { rating: 3, emoji: '🙂', label: 'Ευχαριστημένος' },
  { rating: 4, emoji: '😄', label: 'Πολύ ευχαριστημένος' },
]

// Οθόνη αξιολόγησης που εμφανίζεται στο τέλος κάθε παιχνιδιού.
// - tap σε φατσούλα -> αποθήκευση ψήφου (game, 1-4, timestamp) + ευχαριστίες 2s -> onDone
// - καμία ψήφος σε 15s -> onDone χωρίς ψήφο
export default function RatingScreen({ game, onDone }) {
  const [thanks, setThanks] = useState(false)
  const timeoutRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    // VO μόνο για το Healthy Hero (δεν επηρεάζει τον Ευζούλη).
    if (game === 'healthy-hero') speak('HH-29')
    // Αυτόματη επιστροφή μετά από 15s χωρίς ψήφο.
    timeoutRef.current = setTimeout(() => doneRef.current && doneRef.current(), 15000)
    return () => clearTimeout(timeoutRef.current)
  }, [game])

  const pick = (rating) => {
    if (thanks) return
    clearTimeout(timeoutRef.current)
    setThanks(true)
    if (game === 'healthy-hero') speak('HH-30')
    // Αποθήκευση χωρίς να μπλοκάρει το UI.
    saveVote({ game, rating }).catch(() => {})
    setTimeout(() => doneRef.current && doneRef.current(), 2000)
  }

  if (thanks) {
    return (
      <div className="screen rating rating--thanks">
        <div className="rating__thanks-emoji">💚</div>
        <h1 className="rating__thanks-title">Ευχαριστούμε!</h1>
        <p className="rating__thanks-sub">Η γνώμη σου καταγράφηκε.</p>
      </div>
    )
  }

  return (
    <div className="screen rating">
      <h1 className="rating__title">Πώς σου φάνηκε το παιχνίδι;</h1>
      <div className="rating__faces">
        {FACES.map((f) => (
          <button
            key={f.rating}
            type="button"
            className="rating__face"
            onClick={() => pick(f.rating)}
            aria-label={f.label}
          >
            <span className="rating__face-emoji">{f.emoji}</span>
            <span className="rating__face-label">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
