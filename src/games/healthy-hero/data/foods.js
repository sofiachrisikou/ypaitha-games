// Αποστολή 1 — Γέμισε το σωστό πιάτο.
// Εικονογραφήσεις Αριστοτέλη (public/hh/m1). Κάθε υγιεινό έχει variant `ok`
// (_Green, με πράσινη λάμψη) και κάθε ανθυγιεινό variant `bad` (_red).
const B = '/hh/m1'

export const FOODS = [
  { id: 'chicken', name: 'Κοτόπουλο', healthy: true, img: `${B}/Chicken.png`, ok: `${B}/Chicken_Green.png` },
  { id: 'fish', name: 'Ψάρι', healthy: true, img: `${B}/Fish.png`, ok: `${B}/Fish_Green.png` },
  { id: 'cheese', name: 'Τυρί', healthy: true, img: `${B}/Cheese.png`, ok: `${B}/Cheese_Green.png` },
  { id: 'bread', name: 'Ψωμί', healthy: true, img: `${B}/Bread.png`, ok: `${B}/Bread_Green.png` },
  { id: 'pasta', name: 'Μακαρόνια', healthy: true, img: `${B}/Pasta.png`, ok: `${B}/Pasta_Green.png` },
  { id: 'rice', name: 'Ρύζι', healthy: true, img: `${B}/Rice.png`, ok: `${B}/Rice_Green.png` },
  { id: 'salad', name: 'Σαλάτα', healthy: true, img: `${B}/Salad.png`, ok: `${B}/Salad_Green.png` },
  { id: 'bananas', name: 'Μπανάνες', healthy: true, img: `${B}/Bananas.png`, ok: `${B}/Bananas_Green.png` },
  { id: 'apple', name: 'Μήλο', healthy: true, img: `${B}/Apple.png`, ok: `${B}/Apple_Green.png` },
  { id: 'soda', name: 'Αναψυκτικό', healthy: false, img: `${B}/Soda.png`, bad: `${B}/Soda_red.png` },
  { id: 'donut', name: 'Ντόνατ', healthy: false, img: `${B}/Donut.png`, bad: `${B}/Donut_red.png` },
  { id: 'sweets', name: 'Γλυκά', healthy: false, img: `${B}/Sweets.png`, bad: `${B}/Sweets_red.png` },
  { id: 'burger', name: 'Μπέργκερ', healthy: false, img: `${B}/Burger.png`, bad: `${B}/Burger_red.png` },
  { id: 'pizza', name: 'Πίτσα', healthy: false, img: `${B}/Pizza.png`, bad: `${B}/Pizza_red.png` },
  { id: 'hotdog', name: 'Χοτ ντογκ', healthy: false, img: `${B}/Hot_Dog.png`, bad: `${B}/Hot_Dog_red.png` },
]

export const PLATE_IMG = `${B}/Plate.png`
export const BG_IMG = `${B}/Background.png`
export const GOAL = 5
