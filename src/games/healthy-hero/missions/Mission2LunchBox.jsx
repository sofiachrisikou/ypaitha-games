import { useRef, useState } from 'react'
import { LUNCHBOX_ITEMS, BG_IMG, LUNCHBOX_GOAL as GOAL } from '../data/lunchbox.js'
import { STAGE_W } from '../../../components/Stage.jsx'
import { playCorrect, playWrong, playWin } from '../../../services/sound.js'
import { speak } from '../../../services/voice.js'
import Confetti from '../Confetti.jsx'

// Το κουτί + το badge είναι ήδη ζωγραφισμένα στο Background.png.
// Εδώ βάζουμε μόνο τα draggable φαγητά και τα ρίχνουμε στις θήκες.

// Θέσεις επιλογών γύρω από το κουτί (αριστερή στήλη + κάτω, ώστε να μην
// πέφτουν πάνω στο κουτί που πιάνει το πάνω-κέντρο).
// Θέσεις επιλογών — αριστερή στήλη + δεξιά κάτω από το κουτί + κάτω-αριστερά,
// ΜΑΚΡΙΑ από τον κάτω-δεξιά κίτρινο κύκλο (θέση ήρωα).
const POS = [
  { x: 135, y: 660 }, // αριστερή στήλη
  { x: 135, y: 860 },
  { x: 135, y: 1060 },
  { x: 135, y: 1260 },
  { x: 135, y: 1470 },
  { x: 350, y: 1290 }, // κέντρο-κάτω από το κουτί (μακριά από τον ήρωα)
  { x: 545, y: 1290 },
  { x: 290, y: 1540 }, // κάτω σύμπλεγμα, με απόσταση
  { x: 510, y: 1540 },
  { x: 290, y: 1760 },
  { x: 510, y: 1760 },
]

// Θέσεις μέσα στις θήκες του κουτιού (κατά το background).
const SLOTS = [
  { x: 470, y: 800 },
  { x: 825, y: 765 },
  { x: 835, y: 1010 },
  { x: 470, y: 1035 },
]

// Περιοχή «μέσα στο κουτί» (θήκες).
const overBox = (x, y) => x > 340 && x < 985 && y > 640 && y < 1145

export default function Mission2LunchBox({ addScore, onProgress, onReaction, onNext }) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [tray, setTray] = useState(() =>
    LUNCHBOX_ITEMS.slice(0, POS.length).map((f, i) => ({ ...f, pos: POS[i] })),
  )
  const [placed, setPlaced] = useState([])
  const [drag, setDrag] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [flash, setFlash] = useState(false)
  const [done, setDone] = useState(false)

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
    const food = LUNCHBOX_ITEMS.find((f) => f.id === d.id)
    const inBox = overBox(d.x, d.y)

    if (inBox && food.healthy) {
      const willComplete = placed.length + 1 >= GOAL
      setTray((t) => t.filter((f) => f.id !== d.id))
      setPlaced((pl) => {
        const next = [...pl, food]
        if (onProgress) onProgress(next.length)
        return next
      })
      addScore(10)
      playCorrect()
      if (willComplete) {
        // Τελευταίο: reaction VO -> win VO + pop-up -> (τέλος) -> επόμενη αποστολή.
        onReaction &&
          onReaction('correct', () => {
            setDone(true)
            playWin()
            speak('HH-18', () => onNext && onNext())
          })
      } else {
        onReaction && onReaction('correct')
      }
      setFlash(true)
      setTimeout(() => setFlash(false), 500)
      dragRef.current = null
      setDrag(null)
      return
    }

    if (inBox && !food.healthy) {
      const rd = { ...d, rejecting: true }
      dragRef.current = rd
      setDrag(rd)
      playWrong()
      onReaction && onReaction('wrong')
      setFeedback('Αυτό δεν είναι για κάθε μέρα!')
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
    if (dragRef.current || done) return
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
      {/* Πράσινη λάμψη πάνω στις θήκες όταν μπαίνει σωστό */}
      {flash && <div className="box-flash" />}

      {/* Φαγητά μέσα στις θήκες */}
      {placed.map((f, j) => {
        const pos = SLOTS[j] || SLOTS[SLOTS.length - 1]
        return (
          <img
            key={f.id}
            src={f.img}
            alt={f.name}
            className="food-img food-img--placed"
            style={{ left: pos.x, top: pos.y }}
            draggable="false"
          />
        )
      })}

      {/* Επιλογές */}
      {tray.map((food) => {
        const isDragging = drag && drag.id === food.id
        const rejecting = isDragging && drag.rejecting
        const x = isDragging ? drag.x : food.pos.x
        const y = isDragging ? drag.y : food.pos.y
        return (
          <button
            key={food.id}
            type="button"
            className={`food ${isDragging ? 'food--dragging' : ''} ${rejecting ? 'food--reject' : ''}`}
            style={{ left: x, top: y }}
            onPointerDown={(e) => onPointerDown(e, food)}
            aria-label={food.name}
          >
            <img src={food.img} alt="" className="food-img" draggable="false" />
          </button>
        )
      })}

      {done && (
        <>
          <div className="stage-dim" />
          <Confetti />
          <div className="lunchbox-done">
            <img src="/hh/Win.gif" alt="" className="lunchbox-done__hero" draggable="false" />
            <p className="lunchbox-done__text">Αποστολή 2 ολοκληρώθηκε!</p>
          </div>
        </>
      )}
    </div>
  )
}
