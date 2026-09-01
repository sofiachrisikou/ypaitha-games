import { useEffect, useLayoutEffect, useRef } from 'react'
import raw from './hero/hero-almost.svg?raw'

// «Λίγο έμεινε» idle — ο ήρωας κοιτάζει γύρω (ενθάρρυνση). Από HERO_Elements_Pt07:
// 9 ΠΛΗΡΕΙΣ πόζες (children 1..9), κάθε μία με διαφορετική γωνία κεφαλιού.
// Τις ευθυγραμμίζουμε από τα πόδια (bottom-center) και τις παίζουμε flipbook.
const VIEWBOX = '40 258 220 392'
// feet-align transform ανά πόζα (tx από bottom-center, ty ~ -2)
const TF = {
  1: 'translate(0,0)',
  2: 'translate(-677,-2)',
  3: 'translate(-1112,-2)',
  4: 'translate(-895,-2)',
  5: 'translate(-1329,-2)',
  6: 'translate(-457,-2)',
  7: 'translate(-237,-2)',
  8: 'translate(-1550,-2)',
  9: 'translate(-1758,-2)',
}
// σειρά «κοιτάζει γύρω»: κέντρο -> αριστερά -> κέντρο -> δεξιά -> κέντρο
const ORDER = [1, 2, 3, 2, 1, 6, 8, 9, 8, 6]

function show(svg, idx) {
  Array.from(svg.children).forEach((el, i) => {
    if (el.tagName === 'defs' || el.tagName === 'style') return
    el.style.display = i === idx ? 'inline' : 'none'
  })
}

export default function HeroAlmost({ className = '' }) {
  const hostRef = useRef(null)
  const iv = useRef(null)

  useLayoutEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    svg.setAttribute('viewBox', VIEWBOX)
    Object.entries(TF).forEach(([i, tf]) => {
      if (svg.children[i]) svg.children[i].setAttribute('transform', tf)
    })
    show(svg, ORDER[0])
  }, [])

  useEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let k = 0
    iv.current = setInterval(() => {
      k = (k + 1) % ORDER.length
      show(svg, ORDER[k])
    }, 300)
    return () => clearInterval(iv.current)
  }, [])

  return <div ref={hostRef} className={`hero-almost ${className}`} dangerouslySetInnerHTML={{ __html: raw }} />
}
