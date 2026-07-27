// Μπάρα σκορ στο πάνω μέρος της οθόνης.
export default function ScoreBar({ score = 0, progress, goal, title }) {
  return (
    <div className="score-bar">
      <div className="score-bar__title">{title}</div>
      <div className="score-bar__right">
        {progress != null && goal != null && (
          <div className="score-bar__progress">🍽️ {progress}/{goal}</div>
        )}
        <div className="score-bar__score">⭐ {score}</div>
      </div>
    </div>
  )
}
