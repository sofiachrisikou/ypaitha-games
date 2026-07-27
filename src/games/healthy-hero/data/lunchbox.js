// Επιλογές για την Αποστολή 2 — Ετοίμασε το Lunch Box.
// Στόχος: να μπουν στο κουτί μόνο υγιεινές επιλογές.
// image = emoji προς το παρόν (θα γίνει SVG αργότερα).
export const LUNCHBOX_ITEMS = [
  { id: 'apple', name: 'Μήλο', healthy: true, image: '🍎' },
  { id: 'banana', name: 'Μπανάνα', healthy: true, image: '🍌' },
  { id: 'toast', name: 'Τοστ', healthy: true, image: '🥪' },
  { id: 'yogurt', name: 'Γιαούρτι', healthy: true, image: '🥛' },
  { id: 'nuts', name: 'Ξηροί καρποί', healthy: true, image: '🥜' },
  { id: 'water', name: 'Νερό', healthy: true, image: '💧' },
  { id: 'chocolate', name: 'Σοκολάτα', healthy: false, image: '🍫' },
  { id: 'candy', name: 'Καραμέλα', healthy: false, image: '🍬' },
  { id: 'chips', name: 'Πατατάκια', healthy: false, image: '🍟' },
  { id: 'soda', name: 'Αναψυκτικό', healthy: false, image: '🥤' },
]

// Πόσες σωστές επιλογές χρειάζονται για να «κλείσει» το lunch box.
export const LUNCHBOX_GOAL = 4
