// Φωνητικά επιφωνήματα της μασκότ.
// Παίζει αρχείο /hh/voice/<key>.mp3 αν υπάρχει· αλλιώς πέφτει σε φωνή του
// browser (Ελληνικά TTS). Έτσι δουλεύει ΤΩΡΑ, και μόλις μπουν τα ηχογραφημένα
// mp3 ακούγεται η κανονική φωνή χωρίς αλλαγή κώδικα.
import { isMuted } from './sound.js'

const BASE = '/hh/voice'

// key -> κείμενο (χρησιμοποιείται ως fallback TTS και ως το «σενάριο» των mp3)
export const CLIPS = {
  // Οδηγίες αποστολών
  m1_intro: 'Σύρε πέντε υγιεινά τρόφιμα στο πιάτο!',
  m2_intro: 'Βάλε υγιεινές επιλογές στο κουτί για το κολατσιό!',
  m3_intro: 'Άγγιξε τα τρόφιμα που δεν τρώμε συχνά, πριν τελειώσει ο χρόνος!',
  // Επιβράβευση
  bravo: 'Μπράβο!',
  poly_kala: 'Πολύ καλά!',
  ta_kataferes: 'Τα κατάφερες!',
  sinexise: 'Συνέχισε έτσι!',
  // Ενθάρρυνση
  dokimase: 'Δοκίμασε κάτι πιο θρεπτικό!',
  oxi_afto: 'Όχι αυτό, προσπάθησε ξανά!',
  ligo_akoma: 'Προσπάθησε λίγο ακόμη!',
  // Τέλος
  super_hero: 'Τα κατάφερες! Έγινες Σούπερ Ήρωας!',
}

function ttsFallback(text) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'el-GR'
    u.rate = 1.0
    u.pitch = 1.15
    synth.speak(u)
  } catch {
    // αγνόησε
  }
}

// Παίζει μια φράση με βάση το key.
export function speak(key) {
  if (isMuted()) return
  const text = CLIPS[key]
  if (!text) return
  let done = false
  const fallback = () => {
    if (done) return
    done = true
    ttsFallback(text)
  }
  try {
    const audio = new Audio(`${BASE}/${key}.mp3`)
    audio.volume = 0.95
    audio.addEventListener('playing', () => {
      done = true // υπάρχει πραγματικό mp3 -> χωρίς fallback
    })
    audio.addEventListener('error', fallback)
    const p = audio.play()
    if (p && typeof p.catch === 'function') p.catch(fallback)
  } catch {
    fallback()
  }
}

// Εναλλασσόμενη επιβράβευση / ενθάρρυνση (για ποικιλία).
const PRAISE = ['bravo', 'poly_kala', 'ta_kataferes', 'sinexise']
const ENCOURAGE = ['dokimase', 'oxi_afto', 'ligo_akoma']
let pIdx = 0
let eIdx = 0
export function praise() {
  speak(PRAISE[pIdx++ % PRAISE.length])
}
export function encourage() {
  speak(ENCOURAGE[eIdx++ % ENCOURAGE.length])
}
