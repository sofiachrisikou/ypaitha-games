import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Ήρωας καλωσορίσματος (welcome) από το Rive του γραφίστα (Hero_Mascot_01.riv).
// Οδηγούμε τη state machine: fire «flying» -> ο ήρωας πετάει/αιωρείται (smooth loop)
// ως idle καλωσορίσματος. Η CSS φέρνει τον καμβά από κάτω-δεξιά, και στην ΕΝΑΡΞΗ
// (leaving) φεύγει πάνω-αριστερά + thumbs-up.
const SRC = '/hh/rive/Hero_Mascot_01.riv'
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
    const fire = (n) => {
      const t = inputs.current[n]
      if (t && t.fire) t.fire()
    }
    try {
      rive = new Rive({
        src: SRC,
        canvas,
        autoplay: true,
        autoBind: true, // δέσε το ViewModel (αλλιώς ζωγραφίζει κενό)
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
          fire('flying') // ο ήρωας πετάει/αιωρείται (welcome idle)
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

  // ΕΝΑΡΞΗ: thumbs-up καθώς φεύγει πάνω-αριστερά (η κίνηση γίνεται με CSS).
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
