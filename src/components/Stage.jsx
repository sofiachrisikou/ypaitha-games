import { useEffect, useState } from 'react'

// Σταθερός καμβάς 1080x1920 (portrait) που κλιμακώνεται ώστε να χωράει
// στο viewport διατηρώντας τις αναλογίες. Ίδιο layout στο περίπτερο
// (1080x1920) και σε κάθε άλλη οθόνη (κινητό/desktop) με letterbox.
export const STAGE_W = 1080
export const STAGE_H = 1920

export default function Stage({ children }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => {
      // visualViewport = πιο αξιόπιστο σε κινητά (μπάρα διεύθυνσης).
      const vw = window.visualViewport?.width || window.innerWidth
      const vh = window.visualViewport?.height || window.innerHeight
      setScale(Math.min(vw / STAGE_W, vh / STAGE_H))
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    window.visualViewport?.addEventListener('resize', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
      window.visualViewport?.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div className="stage-viewport">
      {/* Ο scaler πιάνει στο layout το ΠΡΑΓΜΑΤΙΚΟ σμικρυμένο μέγεθος,
          ώστε να μην ξεχειλίζει σε κινητά. */}
      <div className="stage-scaler" style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
        <div className="stage" style={{ transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
