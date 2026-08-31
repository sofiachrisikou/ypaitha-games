import { useEffect, useRef } from 'react'
import heroSvgRaw from './hero/hero-fly.svg?raw'

// Ολόκληρες σχεδιασμένες πόζες του γραφίστα (σωστά χέρια, σωστά ακουμπισμένα).
// Πτήση: frame 6 (γροθιά ψηλά). Idle: frame 20 (χέρια στη μέση).
const ENTER_DELAY = 900 // πρώτα «φορτώνει» η οθόνη
const FLIGHT_MS = 1500 // διάρκεια πτήσης (ίδιο με το CSS hero-travel)
const FLY_FRAME = 6
const IDLE_FRAME = 20
// Στο τέλος της πτήσης «κάθεται»: γροθιά -> χέρια κάτω -> χέρια στη μέση.
// [frame, ms πριν το τέλος της πτήσης]
const SETTLE = [
  [15, 260], // χέρια κάτω
  [20, 90], // χέρια στη μέση
]

export default function HeroRig({ className = '', leaving = false, onLanded }) {
  const hostRef = useRef(null)
  const svgRef = useRef(null)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const showFrame = (svg, n) => {
    svg.querySelectorAll('[data-frame]').forEach((g) => {
      g.style.display = g.getAttribute('data-frame') === String(n) ? 'inline' : 'none'
    })
  }

  // Είσοδος: wait -> flight (γροθιά ψηλά) -> settle (χέρια στη μέση) -> idle
  useEffect(() => {
    const host = hostRef.current
    const svg = host && host.querySelector('svg')
    if (!svg) return
    svgRef.current = svg
    if (!svg.dataset.prepared) {
      svg.removeAttribute('width')
      svg.removeAttribute('height')
      svg.setAttribute('preserveAspectRatio', 'xMidYMax meet')
      svg.classList.add('hero-rig__svg')
      svg.dataset.prepared = '1'
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      showFrame(svg, IDLE_FRAME)
      host.classList.remove('is-waiting', 'is-flying', 'is-leaving')
      host.classList.add('is-idle')
      onLanded && onLanded()
      return
    }

    clearTimers()
    host.classList.remove('is-idle', 'is-flying', 'is-leaving')
    host.classList.add('is-waiting')
    showFrame(svg, FLY_FRAME)

    timers.current.push(
      setTimeout(() => {
        host.classList.remove('is-waiting')
        host.classList.add('is-flying')
        // Πρόγραμμα «καθίσματος» των χεριών προς το τέλος της πτήσης.
        SETTLE.forEach(([f, before]) => {
          timers.current.push(setTimeout(() => showFrame(svg, f), FLIGHT_MS - before))
        })
        timers.current.push(
          setTimeout(() => {
            host.classList.remove('is-flying')
            host.classList.add('is-idle')
            showFrame(svg, IDLE_FRAME)
            onLanded && onLanded()
          }, FLIGHT_MS)
        )
      }, ENTER_DELAY)
    )
    return clearTimers
  }, [])

  // Απογείωση όταν πατηθεί ΕΝΑΡΞΗ (ξανά γροθιά ψηλά καθώς φεύγει).
  useEffect(() => {
    if (!leaving) return
    const host = hostRef.current
    const svg = svgRef.current
    if (!host || !svg) return
    clearTimers()
    host.classList.remove('is-idle', 'is-flying', 'is-waiting')
    host.classList.add('is-leaving')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) showFrame(svg, FLY_FRAME)
  }, [leaving])

  return (
    <div
      ref={hostRef}
      className={`hero-rig is-waiting ${className}`}
      dangerouslySetInnerHTML={{ __html: heroSvgRaw }}
    />
  )
}
