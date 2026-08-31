// Φωνητικά επιφωνήματα της μασκότ (Healthy Hero) — επίσημο script HH-01..HH-30.
// Παίζει /hh/voice/<κωδικός>.mp3 αν υπάρχει· αλλιώς Ελληνικό TTS του browser.
// Έτσι, μόλις μπουν τα ηχογραφημένα mp3 (με ονόματα HH-01.mp3 κ.λπ.), ακούγεται
// η κανονική φωνή χωρίς αλλαγή κώδικα.
import { isMuted } from './sound.js'

const BASE = '/hh/voice'

// Κωδικός -> ατάκα VO (όπως στο εγκεκριμένο script).
export const CLIPS = {
  // A. Έναρξη
  'HH-01': 'Γεια σου! Είμαι ο Σούπερ Ήρωας της Υγιεινής Διατροφής. Είσαι έτοιμος;',
  'HH-02': 'Πάμε να γίνεις κι εσύ ήρωας!',
  // B. Αποστολή 1 — Το πιάτο
  'HH-03': 'Αποστολή πρώτη: σύρε πέντε υγιεινά τρόφιμα μέσα στο πιάτο!',
  'HH-04': 'Πάμε!',
  'HH-05': 'Τέλεια επιλογή!',
  'HH-06': 'Αυτό μας δίνει δύναμη!',
  'HH-07': 'Ναι! Κι άλλο ένα!',
  'HH-08': 'Ωπ! Αυτό το κρατάμε για σπάνιες φορές.',
  'HH-09': 'Δοκίμασε κάτι πιο θρεπτικό!',
  'HH-10': 'Αυτό δεν μας δυναμώνει — ψάξε ξανά!',
  'HH-11': 'Άλλα δύο και το πιάτο είναι έτοιμο!',
  'HH-12': 'Μπράβο, ήρωα! Γέμισες το πιάτο σωστά.',
  // Γ. Αποστολή 2 — Το κολατσιό
  'HH-13': 'Αποστολή δεύτερη: γέμισε το κουτί με υγιεινές επιλογές για το κολατσιό!',
  'HH-14': 'Ωραίο κολατσιό!',
  'HH-15': 'Αυτό θα σου δώσει ενέργεια στο σχολείο!',
  'HH-16': 'Αυτό το αφήνουμε για γιορτές!',
  'HH-17': 'Διάλεξε κάτι πιο θρεπτικό για το κουτί σου.',
  'HH-18': 'Το κολατσιό σου είναι έτοιμο — μπράβο!',
  // Δ. Αποστολή 3 — Όσα δεν τρώμε συχνά
  'HH-19': 'Αποστολή τρίτη: άγγιξε όσα δεν τρώμε συχνά, πριν τελειώσει ο χρόνος!',
  'HH-20': 'Σωστά! Αυτό το τρώμε πού και πού.',
  'HH-21': 'Μπράβο! Το εντόπισες!',
  'HH-22': 'Ωπ! Αυτό το τρώμε κάθε μέρα.',
  'HH-23': 'Όχι αυτό — κοίτα καλύτερα!',
  'HH-24': 'Γρήγορα! Ο χρόνος τελειώνει!',
  'HH-25': 'Τα κατάφερες! Τα ξεχώρισες όλα!',
  // Ε. Κλείσιμο & αξιολόγηση
  'HH-26': 'Συγχαρητήρια! Έγινες Super Healthy Hero!',
  'HH-27': 'Δες πόσους πόντους μάζεψες!',
  'HH-28': 'Πάμε παρακάτω!',
  'HH-29': 'Πες μας πώς σου φάνηκε το παιχνίδι!',
  'HH-30': 'Σ’ ευχαριστώ, ήρωα! Τα λέμε!',
}

function ttsFallback(text, onEnd) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return onEnd && onEnd()
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'el-GR'
    u.rate = 1.0
    u.pitch = 1.15
    if (onEnd) {
      u.onend = () => onEnd()
      u.onerror = () => onEnd()
    }
    synth.speak(u)
  } catch {
    onEnd && onEnd()
  }
}

// Δοκιμάζει μια λίστα από URLs με τη σειρά· αν αποτύχουν όλα -> onFail().
// onEnd() καλείται όταν τελειώσει το VO (για συγχρονισμό, π.χ. μετάβαση οθόνης).
function playFirst(urls, onFail, onEnd, onRealPlay) {
  let i = 0
  const tryNext = () => {
    if (i >= urls.length) return onFail()
    const url = urls[i++]
    let advanced = false
    const next = () => {
      if (advanced) return
      advanced = true
      tryNext()
    }
    try {
      const a = new Audio(url)
      a.volume = 0.95
      a.addEventListener('playing', () => {
        advanced = true // παίζει κανονικό αρχείο -> τέλος
        onRealPlay && onRealPlay() // ακύρωσε το safety timeout — περιμένουμε το 'ended'
      })
      a.addEventListener('ended', () => onEnd && onEnd())
      a.addEventListener('error', next)
      const p = a.play()
      if (p && typeof p.catch === 'function') p.catch(next)
    } catch {
      next()
    }
  }
  tryNext()
}

// «Ξεκλείδωμα» φωνής σε κινητά: το HTML Audio ΚΑΙ το speechSynthesis (TTS)
// απαιτούν να ξεκινήσουν μία φορά ΜΕΣΑ σε άγγιγμα, αλλιώς δεν ακούγονται.
// Το τρέχουμε στο πρώτο άγγιγμα (σιωπηλά).
let voiceUnlocked = false
export function unlockVoice() {
  if (voiceUnlocked) return
  voiceUnlocked = true
  // 1) Ξεκλείδωμα HTML Audio με σιωπηλό clip
  try {
    const silence =
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YQAAAAA='
    const a = new Audio(silence)
    a.volume = 0
    const p = a.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch {
    // αγνόησε
  }
  // 2) Priming του TTS με άδεια, αθόρυβη εκφώνηση
  try {
    const synth = window.speechSynthesis
    if (synth) {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      synth.speak(u)
    }
  } catch {
    // αγνόησε
  }
}

if (typeof window !== 'undefined') {
  const onFirst = () => unlockVoice()
  window.addEventListener('pointerdown', onFirst, { passive: true })
  window.addEventListener('touchstart', onFirst, { passive: true })
  window.addEventListener('click', onFirst, { passive: true })
}

// Παίζει μια ατάκα με βάση τον κωδικό HH-XX. Δέχεται mp3 Ή wav·
// αλλιώς πέφτει σε Ελληνικό TTS του browser.
// Προαιρετικό onEnd: καλείται όταν τελειώσει η ατάκα (ή αμέσως αν είναι muted/κενή).
export function speak(key, onEnd) {
  if (isMuted()) return onEnd && onEnd()
  const text = CLIPS[key]
  if (!text) return onEnd && onEnd()

  // Το onEnd πρέπει να κληθεί ΠΑΝΤΑ (μία φορά). Σε iPhone/κινητά που δεν υπάρχει
  // ηχογραφημένο VO ΚΑΙ το TTS του browser δεν παίζει/δεν τελειώνει, χωρίς αυτό
  // η ροή θα κολλούσε (π.χ. δεν ολοκληρώνεται το στάδιο μετά το τελευταίο τρόφιμο).
  let done = false
  const finish = () => {
    if (done) return
    done = true
    clearTimeout(safety)
    onEnd && onEnd()
  }
  // Ασφαλές όριο ανάλογο του μήκους της ατάκας· ακυρώνεται αν παίξει πραγματικό αρχείο.
  const est = Math.min(4500, Math.max(1200, text.length * 70))
  const safety = setTimeout(finish, est)

  playFirst(
    [`${BASE}/${key}.mp3`, `${BASE}/${key}.wav`],
    () => ttsFallback(text, finish),
    finish,
    () => clearTimeout(safety),
  )
}
