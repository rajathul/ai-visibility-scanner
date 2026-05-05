export function ScoreRing({ score, size = 80, delay = 0.3 }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#6ee7b7'
    : score >= 40 ? '#fbbf24'
    : '#f87171'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          className="score-ring"
          style={{
            '--target-offset': offset,
            '--delay': `${delay}s`,
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-text" style={{ fontSize: size * 0.22 }}>
          {score}
        </span>
        <span className="text-subtle" style={{ fontSize: size * 0.1 }}>/ 100</span>
      </div>
    </div>
  )
}
