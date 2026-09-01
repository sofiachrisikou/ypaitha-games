import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Ήρωας καλωσορίσματος (welcome) από το Rive του γραφίστα (Hero_Mascot_02.riv).
//   coming  -> μπαίνει πετώντας και προσγειώνεται
//   idle    -> ελαφρύ hover όσο περιμένει το «Πάμε» (CSS)
//   ΕΝΑΡΞΗ  -> φεύγει ευθεία διαγώνια εκτός οθόνης (CSS)
// Το slide (CSS) ΞΕΚΙΝΑΕΙ μόλις φορτώσει ο ήρωας (is-entering στο onLoad) ώστε να
// μη «ποπάρει» στη μέση, και περνά σε hover ΑΚΡΙΒΩΣ στο τέλος του (animationend).
const SRC = '/hh/rive/Hero_Mascot_02.riv'
const SM = 'Hero_StateMachine'

export default function HeroWelcomeRive({ className = '', leaving = false }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const inputs = useRef({})
  const imgRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    let alive = true
    let rive
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Μόλις τελειώσει το slide εισόδου -> ήρεμο hover (συγχρονισμένα).
    const goIdle = () => {
      if (host.classList.contains('is-entering') && !host.classList.contains('is-leaving')) {
        host.classList.remove('is-entering')
        host.classList.add('is-idle')
      }
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
          try {
            ;(rive.stateMachineInputs(SM) || []).forEach((i) => {
              inputs.current[i.name] = i
            })
          } catch {
            /* noop */
          }
          const fireComing = () => {
            const t = inputs.current.coming
            if (t && t.fire) t.fire()
          }
          if (reduce) {
            host.classList.add('is-idle')
            fireComing()
            return
          }
          // Βάλε τον καμβά στη θέση εκκίνησης (εκτός οθόνης) ΠΡΙΝ εμφανιστεί ο ήρωας,
          // μετά πυροδότησε «coming» -> ο ήρωας μπαίνει από την αρχή της διαδρομής.
          host.classList.add('is-entering')
          requestAnimationFrame(fireComing)
          // Fallback: αν χαθεί το animationend, πέρνα σε hover λίγο μετά το τέλος του slide.
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
    host.classList.remove('is-entering', 'is-idle')
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
