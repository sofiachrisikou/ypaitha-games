// Ενιαία υπηρεσία ψήφων: γράφει τοπικά (IndexedDB) και συγχρονίζει με
// Firebase όταν υπάρχει σύνδεση (offline-first).
import { addVote, getAllVotes, getUnsynced, markSynced } from './db.js'
import { firebaseEnabled, pushVote } from './firebase.js'

// Αποθηκεύει μία ψήφο. game: string, rating: 1-4.
export async function saveVote({ game, rating }) {
  const vote = { game, rating, timestamp: Date.now(), synced: false }
  const id = await addVote(vote)
  // Δεν μπλοκάρουμε το UI· ο συγχρονισμός τρέχει στο παρασκήνιο.
  trySync()
  return id
}

// Προσπαθεί να ανεβάσει όσες ψήφους δεν έχουν συγχρονιστεί.
export async function trySync() {
  if (!firebaseEnabled || !navigator.onLine) return
  let pending
  try {
    pending = await getUnsynced()
  } catch {
    return
  }
  for (const v of pending) {
    try {
      const ok = await pushVote({ game: v.game, rating: v.rating, timestamp: v.timestamp })
      if (ok) await markSynced(v.id)
    } catch {
      // Αποτυχία δικτύου -> θα ξαναδοκιμάσει την επόμενη φορά.
      break
    }
  }
}

// Συγκεντρωτικά στατιστικά από τα τοπικά δεδομένα.
export async function getStats() {
  const all = await getAllVotes()
  const perGame = {}
  for (const v of all) {
    const g = (perGame[v.game] = perGame[v.game] || {
      count: 0,
      sum: 0,
      breakdown: [0, 0, 0, 0],
    })
    g.count += 1
    g.sum += v.rating
    if (v.rating >= 1 && v.rating <= 4) g.breakdown[v.rating - 1] += 1
  }
  for (const g of Object.values(perGame)) {
    g.avg = g.count ? g.sum / g.count : 0
  }
  return { total: all.length, perGame }
}

// Ξεκίνα συγχρονισμό όταν επανέλθει η σύνδεση.
if (typeof window !== 'undefined') {
  window.addEventListener('online', trySync)
}
