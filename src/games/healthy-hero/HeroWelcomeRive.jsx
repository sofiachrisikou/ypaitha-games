import { useEffect, useRef, useState } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Ήρωας καλωσορίσματος (welcome) από το Rive του γραφίστα (Hero_Mascot_02.riv).
//   coming  -> μπαίνει πετώντας και προσγειώνεται σε idle
//   idle    -> ελαφρύ hover όσο περιμένει το «Πάμε» (CSS)
//   ΕΝΑΡΞΗ  -> φεύγει ευθεία διαγώνια εκτός οθόνης (CSS)
const SRC = '/hh/rive/Hero_Mascot_02.riv'
const SM = 'Hero_StateMachine'
const IDLE_AFTER = 2000 // πότε τελειώνει η είσοδος -> ξεκινά το hover

export default function HeroWelcomeRive({ className = '', leaving = false }) {
  const canvasRef = useRef(null)
  const inputs = useRef({})
  const imgRef = useRef(null)
  const timers = useRef([])
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let alive = true
    let rive
    try {
      rive = new Rive({
        src: SRC,
        canvas,
        autoplay: true,
        stateMachines: SM,
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        onLoad: () => {
          if (!alive) return
          try {
            rive.resizeDrawingSurfaceToCanvas()
          } catch {
            /* noop */
          }
          try {
            ;(rive.stateMachineInputs(SM) || []).forEach((i) => {
              inputs.current[i.name] = i
            })
          } catch {
            /* noop */
          }
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setIdle(true)
            return
          }
          const t = inputs.current.coming
          if (t && t.fire) t.fire() // είσοδος
          timers.current.push(setTimeout(() => setIdle(true), IDLE_AFTER)) // μετά -> hover
        },
        onLoadError: () => {
          if (imgRef.current) imgRef.current.style.display = 'block'
        },
      })
    } catch {
      if (imgRef.current) imgRef.current.style.display = 'block'
    }

    const onResize = () => {
      try {
        rive && rive.resizeDrawingSurfaceToCanvas()
      } catch {
        /* noop */
      }
    }
    window.addEventListener('resize', onResize)
    return () => {
      alive = false
      timers.current.forEach(clearTimeout)
      timers.current = []
      window.removeEventListener('resize', onResize)
      try {
        rive && rive.cleanup()
      } catch {
        /* noop */
      }
    }
  }, [])

  return (
    <span
      className={`hero-rive ${className} ${idle && !leaving ? 'is-idle' : ''} ${
        leaving ? 'is-leaving' : ''
      }`}
    >
      <canvas ref={canvasRef} className="rive-canvas" width={640} height={800} />
      <img
        ref={imgRef}
        src="/hh/end/Hero.png"
        alt=""
        className="rive-fallback"
        draggable="false"
        style={{ display: 'none' }}
      />
    </span>
  )
}
