import { useEffect, useLayoutEffect, useRef } from 'react'
import heroPointRaw from './hero/hero-point.svg?raw'

// Ήρωας που «δείχνει» (HH-03), φτιαγμένος από τα κομμάτια του Pt02.
// Δείκτες top-level children μέσα στο SVG:
const BODY = 1
const ARM_R = 4 // δεξί χέρι στη μέση (μόνιμο)
const RAISE = [
  [5, 0], // αριστερό χέρι στη μέση
  [11, 80],
  [12, 150],
  [13, 220],
  [19, 320],
  [20, 410],
  [21, 500], // δάχτυλο ψηλά
]
const POINT = 21
const DIP = 20
const FACES = { grin: [23, -1069], happy: [30, -1270] } // [childIndex, translateX]
const EMPHASIS_MS = 1800

export default function HeroPoint({ className = '', style, happy = false, bounce = false }) {
  const hostRef = useRef(null)
  const timers = useRef([])
  const leftArm = useRef(5)

  const draw = (faceName) => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    const show = new Set([BODY, ARM_R, leftArm.current])
    let faceIdx = null
    if (faceName && FACES[faceName]) {
      faceIdx = FACES[faceName][0]
      show.add(faceIdx)
    }
    Array.from(svg.children).forEach((c, i) => {
      if (c.tagName === 'defs') return
      c.style.display = show.has(i) ? 'inline' : 'none'
    })
    if (faceIdx != null) {
      svg.children[faceIdx].setAttribute('transform', `translate(${FACES[faceName][1]},0)`)
    }
  }

  // Αρχικό render πριν το paint (χωρίς flash).
  useLayoutEffect(() => {
    leftArm.current = 5
    draw(null)
  }, [])

  // Κίνηση «δείχνει»: ανέβασμα + επαναλαμβανόμενη έμφαση (παύση όταν happy).
  useEffect(() => {
    const clear = () => {
      timers.current.forEach((t) => {
        clearTimeout(t)
        clearInterval(t)
      })
      timers.current = []
    }
    if (happy) {
      clear()
      leftArm.current = POINT
      draw('happy')
      return clear
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      leftArm.current = POINT
      draw(null)
      return clear
    }
    RAISE.forEach(([f, t]) =>
      timers.current.push(
        setTimeout(() => {
          leftArm.current = f
          draw(null)
        }, t)
      )
    )
    const iv = setInterval(() => {
      leftArm.current = DIP
      draw(null)
      timers.current.push(
        setTimeout(() => {
          leftArm.current = POINT
          draw(null)
        }, 150)
      )
    }, EMPHASIS_MS)
    timers.current.push(iv)
    return clear
  }, [happy])

  return (
    <div
      ref={hostRef}
      className={`hero-point${bounce ? ' is-bounce' : ''} ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: heroPointRaw }}
    />
  )
}
