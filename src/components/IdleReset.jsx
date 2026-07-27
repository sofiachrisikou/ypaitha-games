import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useIdleReset from '../hooks/useIdleReset.js'

// Καθολικό idle reset: μετά από `timeout` αδράνειας γυρνάει στο homepage.
// Ανενεργό όταν είμαστε ήδη στο homepage.
export default function IdleReset({ timeout = 20000 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const onHome = location.pathname === '/'

  const goHome = useCallback(() => {
    if (!onHome) navigate('/')
  }, [onHome, navigate])

  useIdleReset(goHome, timeout, !onHome)
  return null
}
