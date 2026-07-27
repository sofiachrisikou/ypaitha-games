import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../services/votes.js'

const GAME_NAMES = {
  'healthy-hero': 'Healthy Hero',
  evzoulis: 'Ευζούλης',
}

// Κρυφή σελίδα στατιστικών: σύνολο ψήφων + μέσος όρος ανά παιχνίδι
// από τα τοπικά δεδομένα (IndexedDB).
export default function Stats() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(setStats).catch(() => setStats({ total: 0, perGame: {} }))
  }, [])

  return (
    <div className="screen stats">
      <h1 className="stats__title">Στατιστικά αξιολογήσεων</h1>

      {!stats ? (
        <p className="stats__loading">Φόρτωση…</p>
      ) : (
        <>
          <p className="stats__total">Σύνολο ψήφων: <strong>{stats.total}</strong></p>

          {Object.keys(stats.perGame).length === 0 ? (
            <p className="stats__empty">Δεν υπάρχουν ακόμη ψήφοι.</p>
          ) : (
            <div className="stats__grid">
              {Object.entries(stats.perGame).map(([game, g]) => (
                <div key={game} className="stats__card">
                  <h2 className="stats__game">{GAME_NAMES[game] || game}</h2>
                  <div className="stats__avg">{g.avg.toFixed(2)} / 4</div>
                  <div className="stats__count">{g.count} ψήφοι</div>
                  <div className="stats__breakdown">
                    <span>😣 {g.breakdown[0]}</span>
                    <span>😕 {g.breakdown[1]}</span>
                    <span>🙂 {g.breakdown[2]}</span>
                    <span>😄 {g.breakdown[3]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <button type="button" className="big-button big-button--neutral" onClick={() => navigate('/')}>
        ← Πίσω
      </button>
    </div>
  )
}
