import { useNavigate } from 'react-router-dom'

// Homepage: δύο μεγάλες κάρτες-κουμπιά, μία για κάθε παιχνίδι.
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="screen home">
      <header className="home__header">
        <h1 className="home__title">Διάλεξε παιχνίδι</h1>
        <p className="home__subtitle">Άγγιξε μια κάρτα για να ξεκινήσεις!</p>
      </header>

      <div className="home__cards">
        <button
          type="button"
          className="game-card game-card--hero"
          onClick={() => navigate('/game/healthy-hero')}
        >
          <span className="game-card__emoji">🥦</span>
          <span className="game-card__title">Healthy Hero</span>
          <span className="game-card__desc">Γίνε ήρωας της υγιεινής διατροφής!</span>
          <span className="game-card__cta">Παίξε ▶</span>
        </button>

        <button
          type="button"
          className="game-card game-card--evzoulis"
          onClick={() => navigate('/game/evzoulis')}
        >
          <span className="game-card__emoji">🎖️</span>
          <span className="game-card__title">Ευζούλης</span>
          <span className="game-card__desc">Η περιπέτεια ξεκινά σύντομα…</span>
          <span className="game-card__cta game-card__cta--soon">Σύντομα</span>
        </button>
      </div>

      {/* Κρυφό κουμπί για τη σελίδα στατιστικών (γωνία). */}
      <button
        type="button"
        className="stats-hotspot"
        onClick={() => navigate('/stats')}
        aria-label="Στατιστικά"
      />
    </div>
  )
}
