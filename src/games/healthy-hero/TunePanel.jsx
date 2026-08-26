// Κρυφό εργαλείο ρύθμισης μασκότ (μόνο με ?tune=1). Σέρνεις τα σκι και
// βλέπεις live· αντιγράφεις τους αριθμούς και μου τους δίνεις να τους κλειδώσω.
export default function TunePanel({ stage, pos, onChange }) {
  const set = (k, v) => onChange({ ...pos, [k]: Number(v) })
  const Row = ({ label, k, min, max, step = 1 }) => (
    <label className="tune__row">
      <span>
        {label}: <b>{pos[k]}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={pos[k]} onChange={(e) => set(k, e.target.value)} />
    </label>
  )
  return (
    <div className="tune">
      <div className="tune__title">Ρύθμιση μασκότ — {stage}</div>
      <Row label="Μέγεθος" k="w" min={300} max={1000} />
      <Row label="Δεξιά (right)" k="right" min={-300} max={150} />
      <Row label="Κάτω (bottom)" k="bottom" min={-400} max={500} />
      <Row label="Zoom" k="zoom" min={1} max={2.6} step={0.05} />
      <div className="tune__val">{`${stage}: { w: ${pos.w}, right: ${pos.right}, bottom: ${pos.bottom}, zoom: ${pos.zoom} }`}</div>
    </div>
  )
}
