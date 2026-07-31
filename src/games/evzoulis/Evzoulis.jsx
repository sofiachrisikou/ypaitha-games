import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RatingScreen from '../../components/RatingScreen.jsx'

// Ο Ευζούλης είναι φτιαγμένος σε Phaser (χωρίς build tools) και ζει
// αυτούσιος στο public/evzoulis/. Εδώ απλώς τον φορτώνουμε σε iframe,
// ώστε ο Άλεξ να δουλεύει με τον δικό του τρόπο, πλήρως απομονωμένος
// από το React/Vite.
export default function Evzoulis() {
  const navigate = useNavigate()
  const iframeRef = useRef(null)
  const [done, setDone] = useState(false)

  // Το Phaser στέλνει μήνυμα όταν τελειώσει το παιχνίδι:
  //   window.parent.postMessage({ type: 'evzoulis:done' }, '*')
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data && e.data.type === 'evzoulis:done') setDone(true)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Γέφυρα idle: το iframe είναι same-origin, οπότε προωθούμε τα αγγίγματα
  // μέσα στο παιχνίδι προς το parent, ώστε να μη γυρίζει στο homepage
  // (idle 20s) ενώ το παιδί παίζει.
  const onLoad = () => {
    try {
      const win = iframeRef.current.contentWindow
      const bump = () => window.dispatchEvent(new Event('pointerdown'))
      ;['pointerdown', 'pointermove', 'touchstart', 'touchmove'].forEach((ev) =>
        win.addEventListener(ev, bump, { passive: true }),
      )
    } catch {
      // αν ποτέ γίνει cross-origin, απλώς αγνόησέ το
    }
  }

  if (done) {
    return <RatingScreen game="evzoulis" onDone={() => navigate('/')} />
  }

  return (
    <div className="screen evzoulis-frame">
      <iframe
        ref={iframeRef}
        title="Ευζούλης"
        src="/evzoulis/index.html"
        onLoad={onLoad}
        className="evzoulis-iframe"
      />
    </div>
  )
}
