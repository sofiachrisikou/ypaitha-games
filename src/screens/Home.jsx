import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const H = '/home'

// Homepage: μπλε φόντο με τίτλο (baked-in) + δύο κάρτες-εικόνες.
// Card01 = Ευζούλης (Η Τάξη που Ηρεμεί), Card02 = Healthy Hero.
export default function Home() {
  const navigate = useNavigate()
  const [zoom, setZoom] = useState(null) // ποια κάρτα «μεγαλώνει» πριν το άνοιγμα

  const go = (card, to) => {
    if (zoom) return
    setZoom(card)
    setTimeout(() => navigate(to), 380)
  }

  const cls = (card) =>
    `home2__card home2__card--${card === 'evz' ? 'top' : 'bottom'}` +
    (zoom === card ? ' home2__card--zoom' : '') +
    (zoom && zoom !== card ? ' home2__card--dim' : '')

  return (
    <div className="screen home2" style={{ backgroundImage: `url(${H}/Background.png)` }}>
      <button type="button" className={cls('evz')} onClick={() => go('evz', '/game/evzoulis')} aria-label="Η Τάξη που Ηρεμεί">
        <img src={`${H}/Card01.png`} alt="Η Τάξη που Ηρεμεί" draggable="false" />
        <span className="home2__cta">ΠΑΙΞΕ!</span>
      </button>

      <button type="button" className={cls('hh')} onClick={() => go('hh', '/game/healthy-hero')} aria-label="Healthy Hero">
        <img src={`${H}/Card02.png`} alt="Healthy Hero" draggable="false" />
        <span className="home2__cta">ΠΑΙΞΕ!</span>
      </button>

      {/* Κρυφό hotspot για /stats (κάτω αριστερή γωνία). */}
      <button
        type="button"
        className="stats-hotspot"
        onClick={() => navigate('/stats')}
        aria-label="Στατιστικά"
      />
    </div>
  )
}
