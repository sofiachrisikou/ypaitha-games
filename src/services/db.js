// Απλός wrapper πάνω από IndexedDB για τοπική αποθήκευση ψήφων (offline-first).
const DB_NAME = 'ypaitha-games'
const DB_VERSION = 1
const STORE = 'votes'

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
        store.createIndex('game', 'game', { unique: false })
        store.createIndex('synced', 'synced', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const store = t.objectStore(STORE)
        const result = fn(store)
        t.oncomplete = () => resolve(result.value !== undefined ? result.value : result)
        t.onerror = () => reject(t.error)
        t.onabort = () => reject(t.error)
      }),
  )
}

export async function addVote(vote) {
  return tx('readwrite', (store) => {
    const req = store.add(vote)
    const holder = {}
    req.onsuccess = () => (holder.value = req.result)
    return holder
  })
}

export async function markSynced(id) {
  return tx('readwrite', (store) => {
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const v = getReq.result
      if (v) {
        v.synced = true
        store.put(v)
      }
    }
    return {}
  })
}

export async function getAllVotes() {
  return tx('readonly', (store) => {
    const req = store.getAll()
    const holder = {}
    req.onsuccess = () => (holder.value = req.result || [])
    return holder
  })
}

export async function getUnsynced() {
  const all = await getAllVotes()
  return all.filter((v) => !v.synced)
}
