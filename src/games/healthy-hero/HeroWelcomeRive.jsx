import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Ήρωας καλωσορίσματος (welcome) από το Rive του γραφίστα (Hero_Mascot_01.riv).
// Ροή: πετάει μέσα από κάτω (trigger «flying») -> προσγειώνεται σε idle («landing»).
// Στην ΕΝΑΡΞΗ (leaving): thumbs-up + φεύγει προς τα πάνω (CSS).
const SRC = '/hh/rive/Hero_Mascot_01.riv'
const SM = 'Hero_StateMachine'
const LAND_DELAY = 1700 // πόσο κρατάει το πέταγμα πριν προσγειωθεί

export default function HeroWelcomeRive({ className = '', leaving = false }) {
  const canvasRef = useRef(null)
  const inputs = useRef({})
  const timers = useRef([])
  const imgRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let alive = true
    let rive
    const fire = (n) => {
      const t = inputs.current[n]
      if (t && t.fire) t.fire()
    }
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
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
          // Είσοδος: πέταγμα -> προσγείωση σε idle.
          fire('flying')
          timers.current.push(setTimeout(() => fire('landing'), LAND_DELAY))
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

  // ΕΝΑΡΞΗ: μικρό thumbs-up καθώς φεύγει προς τα πάνω.
  useEffect(() => {
    if (!leaving) return
    const t = inputs.current.thumbsUp
    if (t && t.fire) t.fire()
  }, [leaving])

  return (
    <span className={`hero-rive ${className} ${leaving ? 'is-leaving' : ''}`}>
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
