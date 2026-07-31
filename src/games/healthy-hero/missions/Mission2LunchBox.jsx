import { useRef, useState } from 'react'
import { LUNCHBOX_ITEMS, LUNCHBOX_IMG, BG_IMG, LOGO_IMG, LUNCHBOX_GOAL as GOAL } from '../data/lunchbox.js'
import { STAGE_W } from '../../../components/Stage.jsx'

// Γεωμετρία (συντεταγμένες stage 1080x1920)
const CX = 540
const CY = 1080
const BOX_W = 640
const BOX_H = Math.round((BOX_W * 2000) / 1274) // αναλογία Lunch_Box.png
const HIT_DX = 280
const HIT_DY = 430
const RX = 430
const RY = 660

function slotPos(i, total) {
  const angle = (-90 + i * (360 / total)) * (Math.PI / 180)
  return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) }
}

// Θέσεις στο κάτω μέρος του κουτιού (2x2).
function boxSlot(j) {
  const col = j % 2
  const row = Math.floor(j / 2)
  return { x: CX - 115 + col * 230, y: CY + 120 + row * 200 }
}

export default function Mission2LunchBox({ addScore, onProgress, onNext }) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [tray, setTray] = useState(() =>
    LUNCHBOX_ITEMS.map((f, i) => ({ ...f, pos: slotPos(i, LUNCHBOX_ITEMS.length) })),
  )
  const [placed, setPlaced] = useState([])
  const [drag, setDrag] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [glow, setGlow] = useState(false)
  const [done, setDone] = useState(false)

  const toLocal = (clientX, clientY) => {
    const r = rootRef.current.getBoundingClientRect()
    const scale = r.width / STAGE_W
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale }
  }

  const overBox = (x, y) => Math.abs(x - CX) < HIT_DX && Math.abs(y - CY) < HIT_DY

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
          setTimeout(() => setDone(true), 400)
          setTimeout(() => onNext && onNext(), 2100)
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
      {/* Lunch box + badge */}
      <img
        src={LUNCHBOX_IMG}
        alt=""
        className={`lunchbox-img ${glow ? 'lunchbox-img--glow' : ''} ${done ? 'lunchbox-img--done' : ''}`}
        style={{ left: CX, top: CY, width: BOX_W, height: BOX_H }}
        draggable="false"
      />
      <img src={LOGO_IMG} alt="Αποστολή 2" className="mission-logo" style={{ left: CX, top: 250 }} draggable="false" />

      {/* Τρόφιμα μέσα στο κουτί */}
      {placed.map((f, j) => {
        const pos = boxSlot(j)
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

      {/* Επιλογές γύρω */}
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

      {feedback && <div className="feedback-toast">{feedback}</div>}

      {done && (
        <div className="lunchbox-done">
          <div className="lunchbox-done__emoji">🎉</div>
          <p className="lunchbox-done__text">Το κολατσιό είναι έτοιμο!</p>
        </div>
      )}
    </div>
  )
}
