import { useEffect, useLayoutEffect, useRef } from 'react'
import heroHurryRaw from './hero/hero-hurry.svg?raw'

// HH-24 «βιάσου» (στάδιο 3, στα 10΄΄): ο ήρωας κοιτάει το ρολόι του και σηκώνει
// το βλέμμα προς το παιδί — χαρούμενη αγωνία. Layers από HERO_Elements_Pt06:
//   σώμα(1) + αριστερό χέρι(4) + δεξί χέρι με ρολόι(7)· κεφάλι εναλλάξ:
//   ίσια(2) <-> σκυμμένο(3, μετατοπισμένο πάνω στο σώμα).
const VIEWBOX = '360 255 240 400'
const BASE = [1, 4, 7]
const HEAD_UP = 2
const HEAD_DOWN = 3
const HEAD_DOWN_TF = 'translate(-249,4)'

function show(svg, ids) {
  const set = new Set(ids)
  Array.from(svg.children).forEach((el, i) => {
    if (el.tagName === 'defs' || el.tagName === 'style') return
    el.style.display = set.has(i) ? 'inline' : 'none'
  })
}

export default function HeroHurry({ className = '' }) {
  const hostRef = useRef(null)
  const iv = useRef(null)

  useLayoutEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    svg.setAttribute('viewBox', VIEWBOX)
    if (svg.children[HEAD_DOWN]) svg.children[HEAD_DOWN].setAttribute('transform', HEAD_DOWN_TF)
    show(svg, [...BASE, HEAD_UP])
  }, [])

  useEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let down = false
    iv.current = setInterval(() => {
      down = !down
      show(svg, [...BASE, down ? HEAD_DOWN : HEAD_UP])
    }, 460)
    return () => clearInterval(iv.current)
  }, [])

  return (
    <div ref={hostRef} className={`hero-hurry ${className}`} dangerouslySetInnerHTML={{ __html: heroHurryRaw }} />
  )
}
