import { useEffect, useLayoutEffect, useRef } from 'react'
import pt03Raw from './hero/hero-react.svg?raw'
import pt04Raw from './hero/hero-react-wrong.svg?raw'

// Κινούμενες αντιδράσεις από τα layers των Pt03 (σωστά) & Pt04 (λάθος).
const RAW = { hh06: pt03Raw, hh07: pt03Raw, hh09: pt04Raw, hh16: pt04Raw }

const CONF = {
  // ΣΩΣΤΑ (Pt03)
  hh06: {
    viewBox: '90 285 230 400',
    base: [18],
    headOpen: 19,
    headWink: 21,
    headWinkTf: 'translate(-231,0)',
    star: 22,
  },
  hh07: {
    viewBox: '805 285 230 400',
    base: [2, 3, 4, 6, 7, 8],
    neutral: [10, 11, 12],
    grin: 16,
    grinTf: 'translate(-421,-8)',
    laugh: 17,
    laughTf: 'translate(-630,-8)',
  },
  // ΛΑΘΟΣ (Pt04)
  hh09: {
    viewBox: '515 285 240 400',
    base: [21, 22, 23, 25, 26, 27, 28, 29], // σώμα + μπλούζα + ΔΕΞΙ χέρι (#26) + κεφάλι
    wag: [30, 31, 32, 33], // δάχτυλο σε γωνίες (κούνημα «όχι»)
  },
  hh16: {
    viewBox: '920 290 220 395',
    base: [35],
    neutral: 36,
    oops: 38,
    oopsTf: 'translate(-653,0)',
  },
}

export default function HeroReact({ type = 'hh06', className = '' }) {
  const hostRef = useRef(null)
  const timers = useRef([])

  const clear = () => {
    timers.current.forEach((t) => {
      clearTimeout(t)
      clearInterval(t)
    })
    timers.current = []
  }

  useLayoutEffect(() => {
    const svg = hostRef.current && hostRef.current.querySelector('svg')
    if (!svg) return
    const c = CONF[type]
    svg.setAttribute('viewBox', c.viewBox)
    const showOnly = (ids) => {
      const set = new Set(ids)
      Array.from(svg.children).forEach((el, i) => {
        if (el.tagName === 'defs' || el.tagName === 'style') return
        el.style.display = set.has(i) ? 'inline' : 'none'
      })
    }
    const tf = (idx, t) => {
      const el = svg.children[idx]
      if (!el) return
      if (t) el.setAttribute('transform', t)
      else el.removeAttribute('transform')
    }
    if (type === 'hh06') {
      tf(c.headWink, c.headWinkTf)
      // Το αστέρι μένει ΠΑΝΤΑ ορατό και «φωτίζει» (glow μέσω CSS) — δεν αναβοσβήνει.
      const starEl = svg.children[c.star]
      if (starEl) starEl.classList.add('hero-react__star')
      showOnly([...c.base, c.headOpen, c.star])
    } else if (type === 'hh07') {
      tf(c.grin, c.grinTf)
      tf(c.laugh, c.laughTf)
      showOnly([...c.base, ...c.neutral])
    } else if (type === 'hh09') {
      showOnly([...c.base, c.wag[2]]) // όρθιο δάχτυλο
    } else if (type === 'hh16') {
      tf(c.oops, c.oopsTf)
      showOnly([...c.base, c.neutral])
    }
    hostRef.current._show = showOnly
  }, [type])

  useEffect(() => {
    const host = hostRef.current
    const svg = host && host.querySelector('svg')
    if (!svg) return
    const c = CONF[type]
    const showOnly = host._show
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    clear()

    if (type === 'hh06') {
      // wink· το αστέρι μένει ορατό (φωτίζει μέσω CSS glow), αλλάζει μόνο το κεφάλι
      const iv = setInterval(() => {
        showOnly([...c.base, c.headWink, c.star])
        timers.current.push(setTimeout(() => showOnly([...c.base, c.headOpen, c.star]), 480))
      }, 1500)
      timers.current.push(iv)
    } else if (type === 'hh07') {
      // γέλιο: κούνημα κεφαλιού δεξ-αρ 2-3 φορές, μετά αρχικό
      const PIVOT = '1551 470'
      const setLaugh = (deg) => {
        showOnly([...c.base, c.laugh])
        svg.children[c.laugh].setAttribute('transform', `translate(-630,-8) rotate(${deg} ${PIVOT})`)
      }
      const angles = [7, -7, 7, -7, 4]
      let i = 0
      const step = () => {
        setLaugh(angles[i])
        i += 1
        if (i < angles.length) timers.current.push(setTimeout(step, 140))
        else timers.current.push(setTimeout(() => showOnly([...c.base, ...c.neutral]), 140))
      }
      step()
    } else if (type === 'hh09') {
      // «όχι»: κούνημα δαχτύλου δεξιά-αριστερά 2-3 φορές, μετά όρθιο
      const seq = [c.wag[0], c.wag[3], c.wag[0], c.wag[3], c.wag[0], c.wag[3]]
      let i = 0
      const step = () => {
        showOnly([...c.base, seq[i]])
        i += 1
        if (i < seq.length) timers.current.push(setTimeout(step, 160))
        else timers.current.push(setTimeout(() => showOnly([...c.base, c.wag[2]]), 160))
      }
      step()
    } else if (type === 'hh16') {
      // «οops»: έκπληξη 2 φορές, μετά ουδέτερο
      const seq = [c.oops, c.neutral, c.oops, c.neutral]
      let i = 0
      const step = () => {
        showOnly([...c.base, seq[i]])
        i += 1
        if (i < seq.length) timers.current.push(setTimeout(step, 300))
      }
      step()
    }
    return clear
  }, [type])

  return (
    <div
      ref={hostRef}
      className={`hero-react ${className}`}
      dangerouslySetInnerHTML={{ __html: RAW[type] }}
    />
  )
}
