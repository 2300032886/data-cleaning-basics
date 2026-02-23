import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, Cell, LineChart, Line, Legend,
} from 'recharts'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { fetchVisualize } from '../services/api'
import Loader from '../components/Loader'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const COLORS = ['#6366f1', '#22d3ee', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#fb923c']
const corrColor = (v) => {
    if (v === null) return '#1e293b'
    const abs = Math.abs(v)
    if (v > 0) return `rgba(99,102,241,${0.15 + abs * 0.85})`
    return `rgba(248,113,113,${0.15 + abs * 0.85})`
}

const ChartCard = ({ title, children }) => (
    <div className="card animate-fade-in" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>{title}</h3>
        {children}
    </div>
)

export default function Visualize() {
    const navigate = useNavigate()
    const { sessionId } = useApp()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (sessionId) loadData()
    }, [sessionId])

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await fetchVisualize(sessionId)
            setData(res.data)
        } catch {
            toast.error('Failed to load visualizations.')
        } finally { setLoading(false) }
    }

    if (!sessionId) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p style={{ marginBottom: '1rem' }}>Upload a dataset first to see visualizations.</p>
                <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Dataset</button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {loading && <Loader message="Generating charts…" />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Visualizations</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Interactive charts for your dataset</p>
                </div>
                <button className="btn-secondary" onClick={loadData}><RefreshCw size={15} />Refresh</button>
            </div>

            {data && (
                <>
                    {/* Before vs After */}
                    {data.before_after?.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                                📊 Before vs After Comparison
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {data.before_after.map((chart) => (
                                    <ChartCard key={chart.title} title={chart.title}>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={chart.data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey={chart.xKey} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                                <Bar dataKey={chart.yKey} radius={[4, 4, 0, 0]}>
                                                    {chart.data.map((_, i) => <Cell key={i} fill={i === 0 ? '#f87171' : '#4ade80'} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bar charts */}
                    {data.bar_charts?.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>📊 Bar Charts</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {data.bar_charts.map((chart, ci) => (
                                    <ChartCard key={chart.title} title={chart.title}>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={chart.data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey={chart.xKey} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                                <Bar dataKey={chart.yKey} radius={[4, 4, 0, 0]}>
                                                    {chart.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Histograms */}
                    {data.histograms?.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>📈 Distributions (Histograms)</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {data.histograms.map((chart, ci) => (
                                    <ChartCard key={chart.title} title={chart.title}>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={chart.data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey={chart.xKey} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-30} textAnchor="end" height={55} />
                                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                                <Bar dataKey={chart.yKey} fill={COLORS[ci % COLORS.length]} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Box plots (simplified with 5-number summary) */}
                    {data.boxplots?.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>📦 Box Plot Summary</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {data.boxplots.map((bp, i) => (
                                    <div key={bp.column} className="card animate-fade-in">
                                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{bp.column}</h4>
                                        {[
                                            { label: 'Max', v: bp.max, c: '#f87171' },
                                            { label: 'Q3 (75%)', v: bp.Q3, c: '#fbbf24' },
                                            { label: 'Median', v: bp.median, c: '#4ade80' },
                                            { label: 'Q1 (25%)', v: bp.Q1, c: '#fbbf24' },
                                            { label: 'Min', v: bp.min, c: '#60a5fa' },
                                        ].map(({ label, v, c }) => (
                                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                                <span style={{ fontWeight: 700, color: c }}>{v?.toFixed(2) ?? '—'}</span>
                                            </div>
                                        ))}
                                        {bp.outliers?.length > 0 && (
                                            <p style={{ fontSize: '0.75rem', color: '#f97316', marginTop: '0.5rem' }}>
                                                ⚠ {bp.outliers.length} outlier{bp.outliers.length > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Correlation heatmap */}
                    {data.correlation?.columns?.length > 1 && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🔥 Correlation Matrix</h2>
                            <div className="card" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                                <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, background: 'transparent' }} />
                                            {data.correlation.columns.map((c) => (
                                                <th key={c} style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, background: 'transparent', whiteSpace: 'nowrap', textAlign: 'center' }}>{c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.correlation.matrix.map((row) => (
                                            <tr key={row.column}>
                                                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', border: 'none', background: 'transparent' }}>
                                                    {row.column}
                                                </td>
                                                {data.correlation.columns.map((col) => {
                                                    const v = row.values[col]
                                                    return (
                                                        <td key={col} title={v !== null ? v.toFixed(4) : 'N/A'} style={{
                                                            padding: '0.4rem 0.6rem', background: corrColor(v),
                                                            borderRadius: 6, textAlign: 'center', fontSize: '0.78rem',
                                                            fontWeight: 700, color: Math.abs(v ?? 0) > 0.4 ? 'white' : 'var(--text-primary)',
                                                            transition: 'all 0.15s', cursor: 'default', border: 'none',
                                                        }}>
                                                            {v !== null ? v.toFixed(2) : '—'}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
