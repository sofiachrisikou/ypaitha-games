import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Ήρωας καλωσορίσματος (welcome) από το Rive του γραφίστα (Hero_Mascot_02.riv).
// Η state machine κάνει τα πάντα με triggers:
//   coming  -> μπαίνει πετώντας και προσγειώνεται σε idle (default: Idle)
//   leaving -> στο «Πάμε» πετάει και φεύγει από την οθόνη
const SRC = '/hh/rive/Hero_Mascot_02.riv'
const SM = 'Hero_StateMachine'

export default function HeroWelcomeRive({ className = '', leaving = false }) {
  const canvasRef = useRef(null)
  const inputs = useRef({})
  const imgRef = useRef(null)

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
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
          const t = inputs.current.coming
          if (t && t.fire) t.fire() // είσοδος
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
      window.removeEventListener('resize', onResize)
      try {
        rive && rive.cleanup()
      } catch {
        /* noop */
      }
    }
  }, [])

  // ΕΝΑΡΞΗ («Πάμε»): ο ήρωας πετάει και φεύγει.
  useEffect(() => {
    if (!leaving) return
    const t = inputs.current.leaving
    if (t && t.fire) t.fire()
  }, [leaving])

  return (
    <span className={`hero-rive ${className}`}>
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
