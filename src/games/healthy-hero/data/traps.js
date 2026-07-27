// Τρόφιμα για την Αποστολή 3 — Βρες τις διατροφικές παγίδες.
// «Παγίδες» = τρόφιμα που δεν πρέπει να τρώμε συχνά (healthy: false).
// Ο παίκτης πρέπει να τα εντοπίσει (tap) μέσα στον χρόνο.
export const TRAP_ITEMS = [
  { id: 'broccoli', name: 'Μπρόκολο', healthy: true, image: '🥦' },
  { id: 'donut', name: 'Ντόνατ', healthy: false, image: '🍩' },
  { id: 'apple', name: 'Μήλο', healthy: true, image: '🍎' },
  { id: 'chips', name: 'Πατατάκια', healthy: false, image: '🍟' },
  { id: 'fish', name: 'Ψάρι', healthy: true, image: '🐟' },
  { id: 'soda', name: 'Αναψυκτικό', healthy: false, image: '🥤' },
  { id: 'carrot', name: 'Καρότο', healthy: true, image: '🥕' },
  { id: 'chocolate', name: 'Σοκολάτα', healthy: false, image: '🍫' },
  { id: 'bread', name: 'Ψωμί', healthy: true, image: '🍞' },
  { id: 'candy', name: 'Καραμέλα', healthy: false, image: '🍬' },
  { id: 'salad', name: 'Σαλάτα', healthy: true, image: '🥗' },
  { id: 'banana', name: 'Μπανάνα', healthy: true, image: '🍌' },
]

// Χρόνος αποστολής σε δευτερόλεπτα.
export const TRAP_TIME = 30
