import { useEffect } from 'react'

// Kiosk: με το ΠΡΩΤΟ άγγιγμα ζητάμε fullscreen ώστε να κρυφτούν οι μπάρες
// του browser (tabs / διεύθυνση). Χρειάζεται user gesture, γι' αυτό στο pointerdown.
// Αν ο browser δεν το υποστηρίζει (ή το μπλοκάρει), απλώς δεν κάνει τίποτα.
export default function useFullscreen() {
  useEffect(() => {
    const el = document.documentElement
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
    if (!req) return

    const go = () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) return
      try {
        const p = req.call(el)
        if (p && p.catch) p.catch(() => {})
      } catch {
        // αγνόησε — π.χ. μπλοκαρισμένο από policy
      }
    }

    window.addEventListener('pointerdown', go, { passive: true })
    return () => window.removeEventListener('pointerdown', go)
  }, [])
}
