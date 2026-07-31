// Αποστολή 3 — Βρες τις διατροφικές παγίδες. Εικονογραφήσεις Αριστοτέλη.
// «Παγίδες» = healthy:false (πρέπει να τα εντοπίσει ο παίκτης). Στόχος: 5 παγίδες.
// Μερικές εικόνες έρχονται από άλλους φακέλους (public/hh/m1, m2).
const B = '/hh/m3'

export const TRAP_ITEMS = [
  // Καλά (9)
  { id: 'salad', name: 'Σαλάτα', healthy: true, img: `${B}/Salad.png` },
  { id: 'bread', name: 'Ψωμί', healthy: true, img: `${B}/Bread.png` },
  { id: 'rice', name: 'Ρύζι', healthy: true, img: `${B}/Rice.png` },
  { id: 'chicken', name: 'Κοτόπουλο', healthy: true, img: `${B}/Chicken.png` },
  { id: 'yoghurt', name: 'Γιαούρτι', healthy: true, img: `${B}/Yoghurt.png` },
  { id: 'banana', name: 'Μπανάνες', healthy: true, img: `${B}/Bananas.png` },
  { id: 'apple', name: 'Μήλο', healthy: true, img: `${B}/Apple.png` },
  { id: 'fish', name: 'Ψάρι', healthy: true, img: `${B}/Fish.png` },
  { id: 'cheese', name: 'Τυρί', healthy: true, img: `${B}/Cheese.png` },
  // Παγίδες (5)
  { id: 'chips', name: 'Πατατάκια', healthy: false, img: `${B}/Chips.png` },
  { id: 'burger', name: 'Μπέργκερ', healthy: false, img: '/hh/m1/Burger.png' },
  { id: 'pizza', name: 'Πίτσα', healthy: false, img: '/hh/m1/Pizza.png' },
  { id: 'chocomilk', name: 'Σοκολατούχο', healthy: false, img: '/hh/m2/Choco_Milk.png' },
  { id: 'oreo', name: 'Κουλουράκι', healthy: false, img: '/hh/m2/Oreo.png' },
]

export const BG_IMG = `${B}/Background.png`
export const FONT_URL = `${B}/Font/Slackey-Regular.ttf`
export const TRAP_TIME = 40 // δευτερόλεπτα
export const TRAP_POINTS = 15
