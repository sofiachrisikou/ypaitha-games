import { useLayoutEffect, useRef } from 'react'
import framesRaw from './hero/hero-frames.svg?raw'

// Πλαίσια pop-up (οδηγίες & νίκη) του γραφίστα — HERO_Windows-Buttons.svg.
// Κάθε πλαίσιο = σύνολο top-level layers· δείχνουμε μόνο αυτά και κόβουμε το viewBox.
// Το κουμπί (ΠΑΜΕ / ΕΠΟΜΕΝΗ) είναι ζωγραφισμένο μέσα — βάζουμε διάφανο clickable από πάνω.
const FRAMES = {
  instr_m1: { layers: [2, 7, 1], vb: [94, 415, 501, 241], btn: [235, 565, 224, 91] },
  instr_m2: { layers: [9, 10, 8], vb: [101, 878, 501, 241], btn: [242, 1028, 224, 91] },
  instr_m3: { layers: [13, 14, 12], vb: [116, 1426, 501, 274], btn: [244, 1609, 224, 91] },
  win_m1: { layers: [3, 4, 5], vb: [792, 92, 487, 553], btn: [827, 525, 422, 81] },
  win_m2: { layers: [6], vb: [857, 925, 448, 68], btn: null },
  win_m3: { layers: [11, 16, 15], vb: [810, 1135, 487, 553], btn: null },
}

export default function PopupFrame({ frame, onButton, className = '' }) {
  const hostRef = useRef(null)
  const cfg = FRAMES[frame]

  useLayoutEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg || !cfg) return
    svg.setAttribute('viewBox', cfg.vb.join(' '))
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    const set = new Set(cfg.layers)
    Array.from(svg.children).forEach((el, i) => {
      if (el.tagName === 'defs' || el.tagName === 'style') return
      el.style.display = set.has(i) ? 'inline' : 'none'
    })
  }, [frame, cfg])

  if (!cfg) return null
  const [vx, vy, vw, vh] = cfg.vb
  const btnStyle = cfg.btn
    ? {
        left: `${((cfg.btn[0] - vx) / vw) * 100}%`,
        top: `${((cfg.btn[1] - vy) / vh) * 100}%`,
        width: `${(cfg.btn[2] / vw) * 100}%`,
        height: `${(cfg.btn[3] / vh) * 100}%`,
      }
    : null

  return (
    <div className={`popup-frame ${className}`} style={{ aspectRatio: `${vw} / ${vh}` }}>
      <div ref={hostRef} className="popup-frame__svg" dangerouslySetInnerHTML={{ __html: framesRaw }} />
      {btnStyle && onButton && (
        <button type="button" className="popup-frame__btn" style={btnStyle} onClick={onButton} aria-label="Συνέχεια" />
      )}
    </div>
  )
}
