import { useEffect, useRef, useState } from 'react'
import { TRAP_ITEMS, TRAP_TIME } from '../data/traps.js'

const TRAPS_TOTAL = TRAP_ITEMS.filter((f) => !f.healthy).length

// Πλέγμα 3 στηλών x 4 γραμμών (συντεταγμένες stage, μέσα στο game__body).
function gridPos(i) {
  const cols = 3
  const col = i % cols
  const row = Math.floor(i / cols)
  const xs = [240, 540, 840]
  const y0 = 470
  const stepY = 300
  return { x: xs[col], y: y0 + row * stepY }
}

export default function Mission3Traps({ addScore, onProgress, onNext }) {
  const [found, setFound] = useState(() => new Set())
  const [wrongId, setWrongId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TRAP_TIME)
  const [finished, setFinished] = useState(null) // null | 'win' | 'timeout'
  const finishedRef = useRef(false)

  const finish = (kind) => {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinished(kind)
    setTimeout(() => onNext && onNext(), 1800)
  }

  // Χρονόμετρο
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

  const tap = (item) => {
    if (finishedRef.current || found.has(item.id)) return

    if (!item.healthy) {
      // Σωστή παγίδα -> εξαφανίζεται + πόντοι
      setFound((prev) => {
        const next = new Set(prev)
        next.add(item.id)
        if (onProgress) onProgress(next.size)
        if (next.size >= TRAPS_TOTAL) finish('win')
        return next
      })
      addScore(10)
    } else {
      // Υγιεινό -> ενθάρρυνση, χωρίς πόντους
      setWrongId(item.id)
      setFeedback('Αυτό κάνει καλό — άφησέ το!')
      setTimeout(() => {
        setWrongId(null)
        setFeedback(null)
      }, 800)
    }
  }

  const pct = Math.max(0, (timeLeft / TRAP_TIME) * 100)

  return (
    <div className="mission mission3">
      <h2 className="mission1__title">Βρες τις διατροφικές παγίδες</h2>
      <p className="mission1__hint">Άγγιξε όσα δεν τρώμε συχνά, πριν τελειώσει ο χρόνος!</p>

      {/* Χρονόμετρο */}
      <div className="timer">
        <div className="timer__label">⏱️ {timeLeft}s</div>
        <div className="timer__track">
          <div
            className={`timer__fill ${timeLeft <= 5 ? 'timer__fill--low' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Τρόφιμα στο τραπέζι */}
      {TRAP_ITEMS.map((item, i) => {
        const pos = gridPos(i)
        const isFound = found.has(item.id)
        const cls = [
          'food',
          'food--tap',
          isFound ? 'food--found' : '',
          wrongId === item.id ? 'food--reject' : '',
        ]
          .join(' ')
          .trim()
        return (
          <button
            key={item.id}
            type="button"
            className={cls}
            style={{ left: pos.x, top: pos.y }}
            onPointerDown={() => tap(item)}
            aria-label={item.name}
            disabled={isFound}
          >
            <span className="food__emoji">{item.image}</span>
          </button>
        )
      })}

      {feedback && <div className="feedback-toast feedback-toast--soft">{feedback}</div>}

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
