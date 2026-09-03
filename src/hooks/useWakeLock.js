import { useEffect } from 'react'

// Κρατάει την οθόνη ΞΥΠΝΙΑ (kiosk) όσο τρέχει το app, μέσω Screen Wake Lock API.
// Το lock απελευθερώνεται αυτόματα όταν κρύβεται η καρτέλα — το ξαναζητάμε μόλις
// επανέλθει, και επίσης με το πρώτο άγγιγμα (κάποιοι browsers θέλουν gesture).
// Αν ο browser δεν το υποστηρίζει (παλιά συσκευή), απλώς δεν κάνει τίποτα.
export default function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock = null
    let released = false

    const acquire = async () => {
      if (released || document.visibilityState !== 'visible') return
      try {
        lock = await navigator.wakeLock.request('screen')
        lock.addEventListener('release', () => {
          lock = null
        })
      } catch {
        // π.χ. χαμηλή μπαταρία / χωρίς gesture — προσπαθούμε ξανά σε επόμενο event
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisible)
    // Fallback: ξαναζήτα με το πρώτο άγγιγμα, αν χρειάστηκε gesture.
    window.addEventListener('pointerdown', acquire, { once: false, passive: true })

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pointerdown', acquire)
      if (lock) lock.release().catch(() => {})
    }
  }, [])
}
