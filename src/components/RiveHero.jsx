import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

// Παίζει ένα Rive animation (.riv) σε canvas. Αν αποτύχει η φόρτωση,
// (προαιρετικά) δείχνει fallback εικόνα ώστε να μη μείνει κενό.
export default function RiveHero({ src, className, width = 700, height = 860, fallback }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let rive
    let alive = true

    try {
      rive = new Rive({
        src,
        canvas,
        autoplay: true,
        autoBind: true, // σύνδεση με το default ViewModel (data binding)
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        onLoad: () => {
          if (!alive) return
          try {
            rive.resizeDrawingSurfaceToCanvas()
          } catch {
            /* noop */
          }
          // Αν το αρχείο έχει state machine, παίξ' την· αλλιώς παίζει το default.
          try {
            const sms = rive.stateMachineNames
            if (sms && sms.length) rive.play(sms[0])
          } catch {
            /* noop */
          }
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
  }, [src])

  return (
    <span className={className}>
      <canvas ref={canvasRef} width={width} height={height} className="rive-canvas" />
      {fallback && (
        <img ref={imgRef} src={fallback} alt="" className="rive-fallback" draggable="false" style={{ display: 'none' }} />
      )}
    </span>
  )
}
