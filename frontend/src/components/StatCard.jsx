export default function StatCard({ title, value, subtitle, icon, color = '#6366f1', trend }) {
    return (
        <div
            className="card animate-fade-in"
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* Background glow */}
            <div style={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                background: color, borderRadius: '50%', opacity: 0.08, filter: 'blur(10px)',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                        {title}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {value ?? '—'}
                    </p>
                    {subtitle && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <p style={{
                            fontSize: '0.75rem', fontWeight: 600, marginTop: '0.4rem',
                            color: trend >= 0 ? '#4ade80' : '#f87171',
                        }}>
                            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                </div>
            </div>
        </div>
    )
}
