import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Ήρωας καλωσορίσματος (welcome) από το Rive του γραφίστα (Hero_Mascot_02.riv).
// Για να ΜΗΝ υπάρχει glitch, ο ήρωας μένει στο default Idle και η ΜΙΑ κίνηση της
// εισόδου γίνεται καθαρά με CSS (ολίσθηση από κάτω-αριστερά), μετά ελαφρύ hover.
// Στο «Πάμε» φεύγει ευθεία διαγώνια εκτός οθόνης (CSS).
const SRC = '/hh/rive/Hero_Mascot_02.riv'
const SM = 'Hero_StateMachine'

export default function HeroWelcomeRive({ className = '', leaving = false }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    let alive = true
    let rive

    // Μόλις τελειώσει η ολίσθηση εισόδου -> ήρεμο hover.
    const goIdle = () => {
      if (!host.classList.contains('is-leaving')) host.classList.add('is-idle')
    }
    const onEnd = (e) => {
      if (e.animationName === 'hero-rive-in') goIdle()
    }
    canvas.addEventListener('animationend', onEnd)

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
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            goIdle()
            return
          }
          // Fallback αν χαθεί το animationend (π.χ. κρυφή καρτέλα).
          timers.current.push(setTimeout(goIdle, 2100))
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
      canvas.removeEventListener('animationend', onEnd)
      window.removeEventListener('resize', onResize)
      try {
        rive && rive.cleanup()
      } catch {
        /* noop */
      }
    }
  }, [])

  // ΕΝΑΡΞΗ («Πάμε»): φεύγει εκτός οθόνης.
  useEffect(() => {
    const host = hostRef.current
    if (!host || !leaving) return
    host.classList.remove('is-idle')
    host.classList.add('is-leaving')
  }, [leaving])

  return (
    <span ref={hostRef} className={`hero-rive ${className}`}>
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
