import { useEffect, useLayoutEffect, useRef } from 'react'
import heroWinRaw from './hero/hero-win.svg?raw'

// Κίνηση νίκης (HH-18): χτυπάει τις γροθιές πάνω-κάτω + γελαστό πρόσωπο (loop).
const VIEWBOX = '140 245 285 400'
const BASE = [4, 5, 6, 8] // σώμα + πόδια + μπλούζα
const UP = [16, 20, 2] // γροθιές ψηλά + laugh
const DOWN = [12, 17, 1] // γροθιές κάτω + grin
const TF = { 1: 'translate(-263,-6)', 2: 'translate(-481,-6)' } // κεφάλια πάνω στη θέση της βάσης

function show(svg, ids) {
  const set = new Set(ids)
  Array.from(svg.children).forEach((el, i) => {
    if (el.tagName === 'defs' || el.tagName === 'style') return
    el.style.display = set.has(i) ? 'inline' : 'none'
  })
}

export default function HeroWin({ className = '' }) {
  const hostRef = useRef(null)
  const iv = useRef(null)

  useLayoutEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    svg.setAttribute('viewBox', VIEWBOX)
    if (svg.children[1]) svg.children[1].setAttribute('transform', TF[1])
    if (svg.children[2]) svg.children[2].setAttribute('transform', TF[2])
    show(svg, [...BASE, ...UP])
  }, [])

  useEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Πιο ήρεμο pump, συγχρονισμένο με το χοροπηδητό (CSS hero-win-hop):
    // γροθιές ψηλά στο άλμα, κάτω στην προσγείωση.
    let up = true
    iv.current = setInterval(() => {
      up = !up
      show(svg, [...BASE, ...(up ? UP : DOWN)])
    }, 400)
    return () => clearInterval(iv.current)
  }, [])

  return (
    <div
      ref={hostRef}
      className={`hero-win ${className}`}
      dangerouslySetInnerHTML={{ __html: heroWinRaw }}
    />
  )
}
