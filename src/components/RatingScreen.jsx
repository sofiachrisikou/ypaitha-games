import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { saveVote } from '../services/votes.js'
import { speak } from '../services/voice.js'
import rateSvg from '../../public/rate-screen.svg?raw'

// Σειρά των top-level <g> στο Rate_Screen.svg -> rating (g[0] = φόντο/τίτλος).
// g[1]=πορτοκαλί(2), g[2]=κίτρινη(3), g[3]=κόκκινη(1), g[4]=πράσινη(4).
const CARD_RATING = [null, 2, 3, 1, 4]

export default function RatingScreen({ game, onDone }) {
  const [picked, setPicked] = useState(null)
  const hostRef = useRef(null)
  const timeoutRef = useRef(null)
  const doneRef = useRef(onDone)
  const pickedRef = useRef(false)
  doneRef.current = onDone

  useEffect(() => {
    if (game === 'healthy-hero') speak('HH-29')
    else if (game === 'evzoulis') speak('EZ-41') // «Πες μας πώς σου φάνηκε το παιχνίδι!»
    timeoutRef.current = setTimeout(() => doneRef.current && doneRef.current(), 15000)
    return () => clearTimeout(timeoutRef.current)
  }, [game])

  const pick = (rating) => {
    if (pickedRef.current) return
    pickedRef.current = true
    clearTimeout(timeoutRef.current)
    setPicked(rating)
    if (game === 'healthy-hero') speak('HH-30')
    else if (game === 'evzoulis') speak('EZ-42') // «Σ’ ευχαριστώ! Τα λέμε σύντομα!»
    saveVote({ game, rating }).catch(() => {})
    setTimeout(() => doneRef.current && doneRef.current(), 1600)
  }

  // Κάνε τις 4 κάρτες να αιωρούνται + clickable (press όπως στην αρχική).
  useLayoutEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    const gs = svg.querySelectorAll(':scope > g')
    gs.forEach((g, i) => {
      const rating = CARD_RATING[i]
      if (!rating) return
      g.classList.add('rate-card')
      g.dataset.rating = String(rating)
      g.style.transformBox = 'fill-box'
      g.style.transformOrigin = '50% 50%'
      g.style.animationDelay = `${(i - 1) * 0.35}s`
      g.style.cursor = 'pointer'
      const press = () => g.classList.add('is-press')
      const release = () => g.classList.remove('is-press')
      g.addEventListener('pointerdown', press)
      g.addEventListener('pointerup', release)
      g.addEventListener('pointerleave', release)
      g.addEventListener('click', () => pick(rating))
    })
  }, [])

  // Επισήμανση επιλεγμένης κάρτας + θάμπωμα των υπολοίπων.
  useEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    svg.querySelectorAll('.rate-card').forEach((g) => {
      g.classList.toggle('is-picked', picked != null && Number(g.dataset.rating) === picked)
      g.classList.toggle('is-dim', picked != null && Number(g.dataset.rating) !== picked)
    })
  }, [picked])

  return (
    <div className="screen rating-svg">
      <div className="rating-svg__art" ref={hostRef} dangerouslySetInnerHTML={{ __html: rateSvg }} />
      {picked && <div className="rating-svg__thanks">Ευχαριστούμε!</div>}
    </div>
  )
}
