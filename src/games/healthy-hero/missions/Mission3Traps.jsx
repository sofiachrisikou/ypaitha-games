import { useEffect, useRef, useState } from 'react'
import { TRAP_ITEMS, BG_IMG, TRAP_TIME, TRAP_POINTS } from '../data/traps.js'
import { playCorrect, playWrong, playWin } from '../../../services/sound.js'
import { praise, encourage } from '../../../services/voice.js'

const TRAPS_TOTAL = TRAP_ITEMS.filter((f) => !f.healthy).length
const COLS = [250, 540, 830]
const ROWS = [480, 730, 980, 1230, 1470]

function gridPos(i) {
  const col = i % 3
  const row = Math.floor(i / 3)
  const jitter = ((i * 37) % 50) - 25
  return { x: COLS[col] + jitter, y: ROWS[row] }
}

export default function Mission3Traps({ addScore, onProgress, onNext }) {
  const [found, setFound] = useState(() => new Set())
  const [wrongId, setWrongId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [floats, setFloats] = useState([])
  const [pts, setPts] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TRAP_TIME)
  const [finished, setFinished] = useState(null) // null | 'win' | 'timeout'
  const finishedRef = useRef(false)
  const floatId = useRef(0)

  const finish = (kind) => {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinished(kind)
    if (kind === 'win') playWin()
    setTimeout(() => onNext && onNext(), 1900)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          finish('timeout')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = (item, pos) => {
    if (finishedRef.current || found.has(item.id)) return

    if (!item.healthy) {
      setFound((prev) => {
        const next = new Set(prev)
        next.add(item.id)
        if (onProgress) onProgress(next.size)
        if (next.size >= TRAPS_TOTAL) finish('win')
        return next
      })
      addScore(TRAP_POINTS)
      playCorrect()
      praise()
      setPts((p) => p + TRAP_POINTS)
      const id = ++floatId.current
      setFloats((f) => [...f, { id, x: pos.x, y: pos.y }])
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 900)
    } else {
      playWrong()
      encourage()
      setWrongId(item.id)
      setFeedback('Αυτό κάνει καλό — άφησέ το!')
      setTimeout(() => {
        setWrongId(null)
        setFeedback(null)
      }, 800)
    }
  }

  return (
    <div className="mission hh-mission hh-mission--traps" style={{ backgroundImage: `url(${BG_IMG})` }}>
      {/* Τρόφιμα στο τραπέζι */}
      {TRAP_ITEMS.map((item, i) => {
        const pos = gridPos(i)
        const isFound = found.has(item.id)
        return (
          <button
            key={item.id}
            type="button"
            className={`food food--tap ${isFound ? 'food--found' : ''} ${wrongId === item.id ? 'food--reject' : ''}`}
            style={{ left: pos.x, top: pos.y }}
            onPointerDown={() => tap(item, pos)}
            aria-label={item.name}
            disabled={isFound}
          >
            <img src={item.img} alt="" className="food-img" draggable="false" />
          </button>
        )
      })}

      {/* Floating +πόντοι */}
      {floats.map((f) => (
        <div key={f.id} className="score-float" style={{ left: f.x, top: f.y }}>
          +{TRAP_POINTS}
        </div>
      ))}

      {feedback && <div className="feedback-toast feedback-toast--soft">{feedback}</div>}

      {/* ΧΡΟΝΟΣ / ΣΚΟΡ — αριθμοί πάνω στους baked-in κύκλους του background */}
      <div className={`hh-num ${timeLeft <= 5 ? 'hh-num--low' : ''}`} style={{ left: 470, top: 1852 }}>
        {timeLeft}
      </div>
      <div className="hh-num" style={{ left: 702, top: 1806 }}>
        {pts}
      </div>

      {finished && (
        <div className="reward-overlay">
          <div className="reward-overlay__card">
            <div className="reward-overlay__emoji">{finished === 'win' ? '🥳' : '⏰'}</div>
            <h2 className="reward-overlay__title">
              {finished === 'win' ? 'Τις βρήκες όλες!' : 'Ο χρόνος τελείωσε!'}
            </h2>
            <p className="reward-overlay__text">
              Βρήκες {found.size} από {TRAPS_TOTAL} παγίδες.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
