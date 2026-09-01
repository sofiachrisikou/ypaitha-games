import { useRef, useState } from 'react'
import { FOODS, PLATE_IMG, BG_IMG, GOAL } from '../data/foods.js'
import { STAGE_W } from '../../../components/Stage.jsx'
import { playCorrect, playWrong, playWin } from '../../../services/sound.js'
import { speak } from '../../../services/voice.js'
import HeroWin from '../HeroWin.jsx'
import Confetti from '../Confetti.jsx'

// Γεωμετρία (συντεταγμένες stage 1080x1920)
const CX = 540
const CY = 1090
const PLATE = 620 // διάμετρος εικόνας πιάτου
const HIT_R = 275 // ακτίνα «μέσα στο πιάτο»
const RX = 430 // δακτύλιος τροφίμων (οριζόντια)
const RY = 560 // δακτύλιος τροφίμων (κάθετα)

// Κατανομή τροφίμων σε τόξο ~285°, αφήνοντας ΚΕΝΟ κάτω-δεξιά για τη μασκότ.
function slotPos(i, total) {
  const startDeg = 96
  const arcDeg = 285
  const angle = (startDeg + (i * arcDeg) / (total - 1)) * (Math.PI / 180)
  return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) }
}

function plateSlot(j) {
  if (j === 0) return { x: CX, y: CY }
  const angle = (-90 + (j - 1) * (360 / (GOAL - 1))) * (Math.PI / 180)
  const r = 135
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}

export default function Mission1Plate({ addScore, onProgress, onReaction, onComplete }) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [tray, setTray] = useState(() =>
    FOODS.map((f, i) => ({ ...f, pos: slotPos(i, FOODS.length) })),
  )
  const [placed, setPlaced] = useState([])
  const [drag, setDrag] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [glow, setGlow] = useState(false)
  const [won, setWon] = useState(false)

  const toLocal = (clientX, clientY) => {
    const r = rootRef.current.getBoundingClientRect()
    const scale = r.width / STAGE_W
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale }
  }

  const onMove = (e) => {
    const d = dragRef.current
    if (!d || d.rejecting) return
    const p = toLocal(e.clientX, e.clientY)
    const nd = { ...d, x: p.x - d.offX, y: p.y - d.offY }
    dragRef.current = nd
    setDrag(nd)
  }

  const endListeners = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }

  const onUp = () => {
    endListeners()
    const d = dragRef.current
    if (!d || d.rejecting) return
    const food = FOODS.find((f) => f.id === d.id)
    const overPlate = Math.hypot(d.x - CX, d.y - CY) < HIT_R

    if (overPlate && food.healthy) {
      const newCount = placed.length + 1
      const willComplete = newCount >= GOAL
      const isAlmost = newCount === GOAL - 2 // σημείο «άλλα 2 και το πιάτο είναι έτοιμο»
      setTray((t) => t.filter((f) => f.id !== d.id))
      setPlaced((pl) => {
        const next = [...pl, food]
        if (onProgress) onProgress(next.length)
        return next
      })
      addScore(10)
      // Στο «άλλα 2» ΔΕΝ παίζουμε τον ήχο correct — ακούγεται μόνο η ατάκα HH-11.
      if (!isAlmost) playCorrect()
      if (willComplete) {
        // Τελευταίο φαγητό: πρώτα τελειώνει το VO της αντίδρασης, ΜΕΤΑ το VO νίκης + pop-up.
        onReaction &&
          onReaction('correct', () => {
            setWon(true)
            playWin()
            speak('HH-12') // «Μπράβο, ήρωα! Το πιάτο είναι γεμάτο δύναμη!»
          })
      } else if (isAlmost) {
        // «Άλλα δύο…» (3/5): ο ήρωας «κοιτάζει γύρω / λίγο έμεινε» (Pt07) + μόνο το HH-11.
        onReaction && onReaction('correct', null, { anim: 'almost' })
        speak('HH-11')
      } else {
        onReaction && onReaction('correct')
      }
      setGlow(true)
      setTimeout(() => setGlow(false), 600)
      dragRef.current = null
      setDrag(null)
      return
    }

    if (overPlate && !food.healthy) {
      const rd = { ...d, rejecting: true }
      dragRef.current = rd
      setDrag(rd)
      playWrong()
      onReaction && onReaction('wrong')
      setFeedback('Δοκίμασε κάτι πιο θρεπτικό!')
      setTimeout(() => {
        dragRef.current = null
        setDrag(null)
        setFeedback(null)
      }, 900)
      return
    }

    dragRef.current = null
    setDrag(null)
  }

  const onPointerDown = (e, food) => {
    if (dragRef.current || won) return
    e.preventDefault()
    const p = toLocal(e.clientX, e.clientY)
    dragRef.current = {
      id: food.id,
      x: food.pos.x,
      y: food.pos.y,
      offX: p.x - food.pos.x,
      offY: p.y - food.pos.y,
      rejecting: false,
    }
    setDrag(dragRef.current)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="mission hh-mission" ref={rootRef} style={{ backgroundImage: `url(${BG_IMG})` }}>
      {/* Πιάτο */}
      <img
        src={PLATE_IMG}
        alt=""
        className={`plate-img ${glow ? 'plate-img--glow' : ''}`}
        style={{ left: CX, top: CY, width: PLATE, height: PLATE }}
        draggable="false"
      />

      {/* Τρόφιμα μέσα στο πιάτο (πράσινο variant) */}
      {placed.map((f, j) => {
        const pos = plateSlot(j)
        return (
          <img
            key={f.id}
            src={f.ok || f.img}
            alt={f.name}
            className="food-img food-img--placed"
            style={{ left: pos.x, top: pos.y }}
            draggable="false"
          />
        )
      })}

      {/* Τρόφιμα γύρω */}
      {tray.map((food) => {
        const isDragging = drag && drag.id === food.id
        const rejecting = isDragging && drag.rejecting
        const x = isDragging ? drag.x : food.pos.x
        const y = isDragging ? drag.y : food.pos.y
        const src = rejecting ? food.bad || food.img : food.img
        return (
          <button
            key={food.id}
            type="button"
            className={`food ${isDragging ? 'food--dragging' : ''} ${rejecting ? 'food--reject' : ''}`}
            style={{ left: x, top: y }}
            onPointerDown={(e) => onPointerDown(e, food)}
            aria-label={food.name}
          >
            <img src={src} alt="" className="food-img" draggable="false" />
          </button>
        )
      })}

      {won && (
        <div className="reward-overlay">
          <Confetti />
          <div className="reward-overlay__card">
            <HeroWin className="reward-overlay__hero" />
            <h2 className="reward-overlay__title">Αποστολή 1 ολοκληρώθηκε!</h2>
            <button type="button" className="big-button big-button--primary" onClick={onComplete}>
              Επόμενη αποστολή →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
