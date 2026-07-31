// Αποστολή 3 — Βρες τις διατροφικές παγίδες. Εικονογραφήσεις Αριστοτέλη (public/hh/m3).
// «Παγίδες» = healthy:false (πρέπει να τα εντοπίσει ο παίκτης).
const B = '/hh/m3'

export const TRAP_ITEMS = [
  { id: 'salad', name: 'Σαλάτα', healthy: true, img: `${B}/Salad.png` },
  { id: 'bread', name: 'Ψωμί', healthy: true, img: `${B}/Bread.png` },
  { id: 'rice', name: 'Ρύζι', healthy: true, img: `${B}/Rice.png` },
  { id: 'chicken', name: 'Κοτόπουλο', healthy: true, img: `${B}/Chicken.png` },
  { id: 'yoghurt', name: 'Γιαούρτι', healthy: true, img: `${B}/Yoghurt.png` },
  { id: 'chips', name: 'Πατατάκια', healthy: false, img: `${B}/Chips.png` },
  { id: 'cupcake', name: 'Κεκάκι', healthy: false, img: `${B}/Cup_Cake.png` },
  { id: 'banana', name: 'Μπανάνες', healthy: true, img: `${B}/Bananas.png` },
  { id: 'apple', name: 'Μήλο', healthy: true, img: `${B}/Apple.png` },
  { id: 'fish', name: 'Ψάρι', healthy: true, img: `${B}/Fish.png` },
  { id: 'cheese', name: 'Τυρί', healthy: true, img: `${B}/Cheese.png` },
  { id: 'sweets', name: 'Γλυκά', healthy: false, img: `${B}/Sweets.png` },
  { id: 'nuts', name: 'Ξηροί καρποί', healthy: true, img: `${B}/Nuts.png` },
  { id: 'pasta', name: 'Μακαρόνια', healthy: true, img: `${B}/Pasta.png` },
]

export const BG_IMG = `${B}/Background.png`
export const FONT_URL = `${B}/Font/Slackey-Regular.ttf`
export const TRAP_TIME = 40 // δευτερόλεπτα
export const TRAP_POINTS = 15
