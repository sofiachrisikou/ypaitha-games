import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../services/votes.js'
import { fetchAllVotes } from '../services/firebase.js'
import { getAllVotes } from '../services/db.js'

const GAME_NAMES = {
  'healthy-hero': 'Healthy Hero',
  evzoulis: 'Ευζούλης',
}

// Κρυφή σελίδα στατιστικών: σύνολο ψήφων + μέσος όρος ανά παιχνίδι
// από τα τοπικά δεδομένα (IndexedDB).
export default function Stats() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    getStats().then(setStats).catch(() => setStats({ total: 0, perGame: {} }))
  }, [])

  const handleExport = async () => {
    setExporting(true)
    setNote('')
    try {
      // Προτίμησε το Firestore (ΟΛΕΣ οι οθόνες)· fallback στα τοπικά αυτής της συσκευής.
      let votes = await fetchAllVotes()
      let source = 'όλες οι οθόνες'
      if (!votes) {
        votes = await getAllVotes()
        source = 'μόνο αυτή η συσκευή'
      }
      if (!votes || votes.length === 0) {
        setNote('Δεν υπάρχουν ψήφοι για εξαγωγή.')
        return
      }
      votes.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

      const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const rows = [['Παιχνίδι', 'Βαθμολογία (1-4)', 'Ημερομηνία', 'Ώρα']]
      for (const v of votes) {
        const d = v.timestamp ? new Date(v.timestamp) : null
        rows.push([
          GAME_NAMES[v.game] || v.game || '',
          v.rating ?? '',
          d ? d.toLocaleDateString('el-GR') : '',
          d ? d.toLocaleTimeString('el-GR') : '',
        ])
      }
      // BOM + sep hint ώστε το Excel να ανοίξει σωστά (ελληνικά + διαχωριστικό).
      const csv = '﻿' + 'sep=,\r\n' + rows.map((r) => r.map(q).join(',')).join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const today = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `ypaitha-votes-${today}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNote(`Έγινε εξαγωγή ${votes.length} ψήφων (${source}).`)
    } catch {
      setNote('Η εξαγωγή απέτυχε. Δοκίμασε από υπολογιστή (όχι kiosk).')
    } finally {
      setExporting(false)
    }
  }

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

      <button type="button" className="big-button" onClick={handleExport} disabled={exporting}>
        {exporting ? 'Εξαγωγή…' : '⬇️ Εξαγωγή σε Excel'}
      </button>
      {note && <p className="stats__note">{note}</p>}

      <button type="button" className="big-button big-button--neutral" onClick={() => navigate('/')}>
        ← Πίσω
      </button>
    </div>
  )
}
