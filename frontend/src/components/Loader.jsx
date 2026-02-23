export default function Loader({ message = 'Processing…' }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(4px)', zIndex: 999,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
        }}>
            {/* Spinner */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '3px solid rgba(99,102,241,0.2)',
                    borderTopColor: '#6366f1',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <div style={{
                    position: 'absolute', inset: 10, borderRadius: '50%',
                    border: '3px solid rgba(34,211,238,0.2)',
                    borderBottomColor: '#22d3ee',
                    animation: 'spin 1.2s linear infinite reverse',
                }} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>{message}</p>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
