import { useEffect, useState } from 'react'

// Σταθερός καμβάς 1080x1920 (portrait) που κλιμακώνεται ώστε να χωράει
// στο viewport διατηρώντας τις αναλογίες. Έτσι το layout είναι ίδιο στο
// περίπτερο (1080x1920) και στην οθόνη ανάπτυξης.
export const STAGE_W = 1080
export const STAGE_H = 1920

export default function Stage({ children }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
      setScale(s)
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
    }
  }, [])

  return (
    <div className="stage-viewport">
      <div className="stage" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
