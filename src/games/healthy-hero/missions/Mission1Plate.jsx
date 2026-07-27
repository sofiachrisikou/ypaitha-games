import { useRef, useState } from 'react'
import { FOODS } from '../data/foods.js'
import { STAGE_W } from '../../../components/Stage.jsx'

// Γεωμετρία (σε συντεταγμένες stage 1080x1920)
const CX = 540 // κέντρο πιάτου X
const CY = 940 // κέντρο πιάτου Y
const PLATE_R = 250 // ακτίνα πιάτου (για hit-test & εμφάνιση)
const RX = 380 // οριζόντια ακτίνα δακτυλίου τροφίμων
const RY = 620 // κάθετη ακτίνα δακτυλίου τροφίμων
const GOAL = 5 // πόσα υγιεινά χρειάζονται

// Θέση κάθε τροφίμου γύρω από το πιάτο (έλλειψη).
function slotPos(i, total) {
  const angle = (-90 + i * (360 / total)) * (Math.PI / 180)
  return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) }
}

// Θέση φαγητού μέσα στο πιάτο (μικρός δακτύλιος).
function plateSlot(j) {
  if (j === 0 && GOAL > 1) return { x: CX, y: CY }
  const angle = (-90 + j * (360 / GOAL)) * (Math.PI / 180)
  const r = 120
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}

export default function Mission1Plate({ score, addScore, onProgress, onComplete }) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [tray, setTray] = useState(() =>
    FOODS.map((f, i) => ({ ...f, pos: slotPos(i, FOODS.length) })),
  )
  const [placed, setPlaced] = useState([])
  const [drag, setDrag] = useState(null) // {id, x, y, offX, offY, rejecting}
  const [feedback, setFeedback] = useState(null)
  const [glow, setGlow] = useState(false)
  const [won, setWon] = useState(false)

  // client px -> stage συντεταγμένες (λαμβάνει υπόψη το scale του Stage).
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
    const overPlate = Math.hypot(d.x - CX, d.y - CY) < PLATE_R

    if (overPlate && food.healthy) {
      // Αποδοχή: πράσινη λάμψη + πόντοι
      setTray((t) => t.filter((f) => f.id !== d.id))
      setPlaced((pl) => {
        const next = [...pl, food]
        if (onProgress) onProgress(next.length)
        if (next.length >= GOAL) setTimeout(() => setWon(true), 500)
        return next
      })
      addScore(10)
      setGlow(true)
      setTimeout(() => setGlow(false), 600)
      dragRef.current = null
      setDrag(null)
      return
    }

    if (overPlate && !food.healthy) {
      // Απόρριψη: κοκκινίζει, κουνιέται, γυρνάει πίσω με μήνυμα
      const rd = { ...d, rejecting: true }
      dragRef.current = rd
      setDrag(rd)
      setFeedback('Δοκίμασε κάτι πιο θρεπτικό!')
      setTimeout(() => {
        dragRef.current = null
        setDrag(null)
        setFeedback(null)
      }, 900)
      return
    }

    // Άφημα εκτός πιάτου: επιστροφή στη θέση του
    dragRef.current = null
    setDrag(null)
  }

  const onPointerDown = (e, food) => {
    if (dragRef.current || won) return
    e.preventDefault()
    const p = toLocal(e.clientX, e.clientY)
    const d = { id: food.id, x: food.pos.x, y: food.pos.y, offX: p.x - food.pos.x, offY: p.y - food.pos.y, rejecting: false }
    dragRef.current = d
    setDrag(d)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="mission mission1" ref={rootRef}>
      <h2 className="mission1__title">Γέμισε το σωστό πιάτο</h2>
      <p className="mission1__hint">Σύρε {GOAL} υγιεινά τρόφιμα στο πιάτο!</p>

      {/* Πιάτο */}
      <div
        className={`plate ${glow ? 'plate--glow' : ''}`}
        style={{ left: CX, top: CY, width: PLATE_R * 2, height: PLATE_R * 2 }}
      >
        {placed.length === 0 && <span className="plate__placeholder">🍽️</span>}
        {placed.map((f, j) => {
          const pos = plateSlot(j)
          return (
            <span
              key={f.id}
              className="plate__food"
              style={{ left: pos.x - CX + PLATE_R, top: pos.y - CY + PLATE_R }}
            >
              {f.image}
            </span>
          )
        })}
      </div>

      {/* Τρόφιμα γύρω από το πιάτο */}
      {tray.map((food) => {
        const isDragging = drag && drag.id === food.id
        const x = isDragging ? drag.x : food.pos.x
        const y = isDragging ? drag.y : food.pos.y
        const cls = [
          'food',
          isDragging ? 'food--dragging' : '',
          isDragging && drag.rejecting ? 'food--reject' : '',
        ]
          .join(' ')
          .trim()
        return (
          <button
            key={food.id}
            type="button"
            className={cls}
            style={{ left: x, top: y }}
            onPointerDown={(e) => onPointerDown(e, food)}
            aria-label={food.name}
          >
            <span className="food__emoji">{food.image}</span>
          </button>
        )
      })}

      {/* Μήνυμα ανάδρασης */}
      {feedback && <div className="feedback-toast">{feedback}</div>}

      {/* Οθόνη επιβράβευσης */}
      {won && (
        <div className="reward-overlay">
          <div className="reward-overlay__card">
            <div className="reward-overlay__emoji">🎉</div>
            <h2 className="reward-overlay__title">Μπράβο, ήρωα!</h2>
            <p className="reward-overlay__text">Γέμισες το πιάτο με υγιεινές τροφές!</p>
            <p className="reward-overlay__score">Πόντοι: ⭐ {score}</p>
            <button type="button" className="big-button big-button--primary" onClick={onComplete}>
              Επόμενη αποστολή →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
