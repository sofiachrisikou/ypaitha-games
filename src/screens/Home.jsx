import { useNavigate } from 'react-router-dom'

const H = '/home'

// Homepage: μπλε φόντο με τίτλο (baked-in) + δύο κάρτες-εικόνες.
// Card01 = Ευζούλης (Η Τάξη που Ηρεμεί), Card02 = Healthy Hero.
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="screen home2" style={{ backgroundImage: `url(${H}/Background.png)` }}>
      <button
        type="button"
        className="home2__card home2__card--top"
        onClick={() => navigate('/game/evzoulis')}
        aria-label="Η Τάξη που Ηρεμεί"
      >
        <img src={`${H}/Card01.png`} alt="Η Τάξη που Ηρεμεί" draggable="false" />
      </button>

      <button
        type="button"
        className="home2__card home2__card--bottom"
        onClick={() => navigate('/game/healthy-hero')}
        aria-label="Healthy Hero"
      >
        <img src={`${H}/Card02.png`} alt="Healthy Hero" draggable="false" />
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
