// Firebase Firestore — προαιρετικό. Αν λείπουν τα env vars, το app
// συνεχίζει offline-first μόνο με IndexedDB (χωρίς σφάλματα).
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId)

let db = null
function getDb() {
  if (!firebaseEnabled) return null
  if (!db) db = getFirestore(initializeApp(config))
  return db
}

// Ανεβάζει μία ψήφο στο Firestore. Επιστρέφει true σε επιτυχία.
export async function pushVote(vote) {
  const d = getDb()
  if (!d) return false
  await addDoc(collection(d, 'votes'), vote)
  return true
}

// Διαβάζει ΟΛΕΣ τις ψήφους από το Firestore (όλες οι οθόνες μαζί) — για export.
// Επιστρέφει null αν το Firebase δεν είναι ενεργό ή αν οι κανόνες δεν επιτρέπουν ανάγνωση.
export async function fetchAllVotes() {
  const d = getDb()
  if (!d) return null
  try {
    const snap = await getDocs(collection(d, 'votes'))
    return snap.docs.map((doc) => doc.data())
  } catch {
    return null
  }
}
