// Ηχητικά εφέ με Web Audio (χωρίς αρχεία). Το AudioContext ξεκινά/ξυπνά
// με το πρώτο άγγιγμα (policy autoplay), που πάντα υπάρχει στο παιχνίδι.
let ctx = null

// Σίγαση (με μνήμη στο localStorage).
let muted = false
try {
  muted = localStorage.getItem('hh-muted') === '1'
} catch {
  muted = false
}
export function isMuted() {
  return muted
}
export function setMuted(v) {
  muted = Boolean(v)
  try {
    localStorage.setItem('hh-muted', muted ? '1' : '0')
  } catch {
    // αγνόησε
  }
}
export function toggleMute() {
  setMuted(!muted)
  return muted
}

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// «Ξεκλείδωμα» ήχου: σε κινητά (ειδικά iOS) το Web Audio απαιτεί το AudioContext
// να ξεκινήσει/ξυπνήσει ΜΕΣΑ σε άγγιγμα, αλλιώς οι ήχοι δεν ακούγονται.
// Το τρέχουμε στο πρώτο κάθε αγγίγματος.
let unlocked = false
export function unlockAudio() {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume()
  if (unlocked) return
  try {
    const buf = c.createBuffer(1, 1, 22050)
    const src = c.createBufferSource()
    src.buffer = buf
    src.connect(c.destination)
    src.start(0)
    unlocked = true
  } catch {
    // αγνόησε
  }
}

if (typeof window !== 'undefined') {
  const onFirstTouch = () => unlockAudio()
  window.addEventListener('pointerdown', onFirstTouch, { passive: true })
  window.addEventListener('touchstart', onFirstTouch, { passive: true })
  window.addEventListener('click', onFirstTouch, { passive: true })
}

function tone(freq, start, dur, type = 'triangle', gain = 0.22) {
  if (muted) return
  const c = getCtx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  o.connect(g)
  g.connect(c.destination)
  const t0 = c.currentTime + start
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.start(t0)
  o.stop(t0 + dur + 0.03)
}

// Σωστή επιλογή: χαρούμενο arpeggio (ντο–μι–σολ)
export function playCorrect() {
  tone(523.25, 0, 0.16, 'triangle', 0.24)
  tone(659.25, 0.08, 0.16, 'triangle', 0.24)
  tone(783.99, 0.16, 0.2, 'triangle', 0.24)
}

// Λάθος επιλογή: χαμηλό «μπζζ» που κατεβαίνει
export function playWrong() {
  tone(200, 0, 0.16, 'sawtooth', 0.16)
  tone(150, 0.12, 0.2, 'sawtooth', 0.16)
}

// Νίκη: μικρή φανφάρα (ντο–μι–σολ–ντο ψηλό)
export function playWin() {
  tone(523.25, 0, 0.16, 'triangle', 0.28)
  tone(659.25, 0.14, 0.16, 'triangle', 0.28)
  tone(783.99, 0.28, 0.16, 'triangle', 0.28)
  tone(1046.5, 0.42, 0.42, 'triangle', 0.3)
}

// Μικρό «ποπ» (προαιρετικό)
export function playPop() {
  tone(880, 0, 0.08, 'square', 0.12)
}
