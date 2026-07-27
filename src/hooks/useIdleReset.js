import { useEffect, useRef } from 'react'

// Καλεί το onIdle όταν δεν υπάρχει καμία αλληλεπίδραση για `timeout` ms.
// Κάθε άγγιγμα/κίνηση μηδενίζει το χρονόμετρο.
export default function useIdleReset(onIdle, timeout = 20000, enabled = true) {
  const cbRef = useRef(onIdle)
  cbRef.current = onIdle

  useEffect(() => {
    if (!enabled) return
    let timer

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => cbRef.current && cbRef.current(), timeout)
    }

    const events = ['pointerdown', 'pointermove', 'touchstart', 'touchmove', 'keydown', 'click']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [timeout, enabled])
}
