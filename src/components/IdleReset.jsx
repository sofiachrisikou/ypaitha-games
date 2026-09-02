import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useIdleReset from '../hooks/useIdleReset.js'

// Καθολικό idle reset: μετά από αδράνεια γυρνάει στο homepage.
// Ανενεργό όταν είμαστε ήδη στο homepage.
// Ο χρόνος εξαρτάται από το παιχνίδι: Ευζούλης 30s, Healthy Hero (& λοιπά) 20s.
const IDLE_MS = {
  '/game/evzoulis': 30000,
}
const DEFAULT_IDLE_MS = 20000

export default function IdleReset() {
  const navigate = useNavigate()
  const location = useLocation()
  const onHome = location.pathname === '/'
  const timeout = IDLE_MS[location.pathname] ?? DEFAULT_IDLE_MS

  const goHome = useCallback(() => {
    if (!onHome) navigate('/')
  }, [onHome, navigate])

  useIdleReset(goHome, timeout, !onHome)
  return null
}
