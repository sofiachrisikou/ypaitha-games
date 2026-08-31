import { useMemo } from 'react'

// Κομφετί που πέφτει γύρω από τα pop-up νίκης.
const COLORS = ['#34c759', '#ff9f2e', '#2ec4f1', '#e5442e', '#ffd23f', '#ffffff']

export default function Confetti({ count = 28 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.round((i / count) * 100 + ((i * 41) % 9)),
        color: COLORS[i % COLORS.length],
        dur: 2.6 + (i % 5) * 0.45,
        delay: -((i % 8) * 0.4),
        tilt: ((i * 53) % 40) - 20,
      })),
    [count],
  )
  return (
    <div className="confetti confetti--win" aria-hidden="true">
      {pieces.map((c, i) => (
        <i
          key={i}
          style={{
            left: `${c.left}%`,
            background: c.color,
            transform: `rotate(${c.tilt}deg)`,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
