import { useRef, useState } from 'react'
import { LUNCHBOX_ITEMS, LUNCHBOX_GOAL as GOAL } from '../data/lunchbox.js'
import { STAGE_W } from '../../../components/Stage.jsx'

// Γεωμετρία lunch box (συντεταγμένες stage 1080x1920)
const BOX = { x: 540, y: 940, w: 620, h: 560 } // κέντρο + διαστάσεις
const RX = 400
const RY = 640

function slotPos(i, total) {
  const angle = (-90 + i * (360 / total)) * (Math.PI / 180)
  return { x: BOX.x + RX * Math.cos(angle), y: BOX.y + RY * Math.sin(angle) }
}

// Θέση φαγητού μέσα στο κουτί (πλέγμα 2x2).
function boxSlot(j) {
  const col = j % 2
  const row = Math.floor(j / 2)
  return { x: BOX.x - 130 + col * 260, y: BOX.y - 110 + row * 220 }
}

export default function Mission2LunchBox({ score, addScore, onProgress, onNext }) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [tray, setTray] = useState(() =>
    LUNCHBOX_ITEMS.map((f, i) => ({ ...f, pos: slotPos(i, LUNCHBOX_ITEMS.length) })),
  )
  const [placed, setPlaced] = useState([])
  const [drag, setDrag] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [glow, setGlow] = useState(false)
  const [closed, setClosed] = useState(false)

  const toLocal = (clientX, clientY) => {
    const r = rootRef.current.getBoundingClientRect()
    const scale = r.width / STAGE_W
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale }
  }

  const overBox = (x, y) =>
    Math.abs(x - BOX.x) < BOX.w / 2 && Math.abs(y - BOX.y) < BOX.h / 2

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
      setTray((t) => t.filter((f) => f.id !== d.id))
      setPlaced((pl) => {
        const next = [...pl, food]
        if (onProgress) onProgress(next.length)
        if (next.length >= GOAL) {
          setTimeout(() => setClosed(true), 400)
          setTimeout(() => onNext && onNext(), 1900)
        }
        return next
      })
      addScore(10)
      setGlow(true)
      setTimeout(() => setGlow(false), 600)
      dragRef.current = null
      setDrag(null)
      return
    }

    if (inBox && !food.healthy) {
      const rd = { ...d, rejecting: true }
      dragRef.current = rd
      setDrag(rd)
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
    if (dragRef.current || closed) return
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
    <div className="mission mission2" ref={rootRef}>
      <h2 className="mission1__title">Ετοίμασε το Lunch Box</h2>
      <p className="mission1__hint">Βάλε {GOAL} υγιεινές επιλογές στο κουτί!</p>

      {/* Lunch box */}
      <div
        className={`lunchbox ${glow ? 'lunchbox--glow' : ''} ${closed ? 'lunchbox--closed' : ''}`}
        style={{ left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h }}
      >
        {placed.length === 0 && !closed && <span className="lunchbox__placeholder">🍱</span>}
        {!closed &&
          placed.map((f, j) => {
            const pos = boxSlot(j)
            return (
              <span
                key={f.id}
                className="lunchbox__food"
                style={{ left: pos.x - (BOX.x - BOX.w / 2), top: pos.y - (BOX.y - BOX.h / 2) }}
              >
                {f.image}
              </span>
            )
          })}
        <div className="lunchbox__lid" />
      </div>

      {closed && (
        <div className="lunchbox__done">
          <div className="lunchbox__done-emoji">🎉</div>
          <p className="lunchbox__done-text">Το κολατσιό είναι έτοιμο!</p>
        </div>
      )}

      {/* Επιλογές γύρω */}
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

      {feedback && <div className="feedback-toast">{feedback}</div>}
    </div>
  )
}
