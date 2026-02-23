export default function QualityScore({ score, grade }) {
    const getColor = (s) => {
        if (s >= 90) return '#4ade80'
        if (s >= 75) return '#a78bfa'
        if (s >= 60) return '#fbbf24'
        if (s >= 40) return '#f97316'
        return '#f87171'
    }

    const color = getColor(score)
    const radius = 56
    const circumference = 2 * Math.PI * radius
    const progress = (score / 100) * circumference

    return (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Data Quality Score
            </p>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={140} height={140} viewBox="0 0 140 140">
                    <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--border)" strokeWidth={10} />
                    <circle
                        cx={70} cy={70} r={radius} fill="none"
                        stroke={color} strokeWidth={10}
                        strokeDasharray={`${progress} ${circumference}`}
                        strokeLinecap="round"
                        transform="rotate(-90 70 70)"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</div>
                </div>
            </div>
            <div style={{
                marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 800,
                background: `linear-gradient(135deg, ${color}, #6366f1)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
                Grade: {grade}
            </div>
        </div>
    )
}
