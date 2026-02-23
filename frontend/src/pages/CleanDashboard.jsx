import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import {
    fetchSummary, cleanMissing, cleanDuplicates,
    cleanOutliers, cleanNormalize, cleanStandardize, resetDataset,
} from '../services/api'
import StatCard from '../components/StatCard'
import QualityScore from '../components/QualityScore'
import Loader from '../components/Loader'
import {
    Trash2, RefreshCw, TrendingDown, Layers, AlertTriangle,
    CheckCircle, RotateCcw, BarChart2, Zap, ChevronRight,
} from 'lucide-react'

const STRATEGIES = ['mean', 'median', 'mode', 'drop']

export default function CleanDashboard() {
    const navigate = useNavigate()
    const { sessionId, summary, setSummary, addCleaningLog } = useApp()
    const [loading, setLoading] = useState(false)
    const [loadingMsg, setLoadingMsg] = useState('')
    const [missingStrategy, setMissingStrategy] = useState('mean')
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (sessionId && !summary) loadSummary()
    }, [sessionId])

    const loadSummary = async () => {
        if (!sessionId) return
        setLoading(true); setLoadingMsg('Loading summary…')
        try {
            const res = await fetchSummary(sessionId)
            setSummary(res.data)
        } catch {
            toast.error('Failed to load summary.')
        } finally { setLoading(false) }
    }

    const runAction = async (label, fn) => {
        setLoading(true); setLoadingMsg(`${label}…`)
        try {
            const res = await fn()
            addCleaningLog({ label, before: res.data.before, after: res.data.after, message: res.data.message })
            toast.success(res.data.message)
            await loadSummary()
        } catch (err) {
            toast.error(err?.response?.data?.error || `${label} failed.`)
        } finally { setLoading(false) }
    }

    const handleReset = async () => {
        if (!window.confirm('Reset all cleaning and go back to original data?')) return
        setLoading(true); setLoadingMsg('Resetting…')
        try {
            await resetDataset(sessionId)
            await loadSummary()
            toast.success('Dataset reset to original.')
        } catch { toast.error('Reset failed.') } finally { setLoading(false) }
    }

    if (!sessionId) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No dataset uploaded yet.</p>
                <button className="btn-primary" onClick={() => navigate('/upload')}>Upload a Dataset</button>
            </div>
        )
    }

    const s = summary

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {loading && <Loader message={loadingMsg} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Clean Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{s ? `${s.rows} rows × ${s.columns} columns` : 'Loading…'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn-secondary" onClick={loadSummary}><RefreshCw size={15} />Refresh</button>
                    <button className="btn-secondary" onClick={handleReset}><RotateCcw size={15} />Reset</button>
                    <button className="btn-primary" onClick={() => navigate('/visualize')}><BarChart2 size={15} />Visualize <ChevronRight size={14} /></button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.35rem', borderRadius: '0.75rem', border: '1px solid var(--border)', width: 'fit-content' }}>
                {['overview', 'insights', 'types'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.45rem 1.1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                            fontSize: '0.85rem', textTransform: 'capitalize',
                            background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            transition: 'all 0.15s',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {s && activeTab === 'overview' && (
                <>
                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <StatCard title="Missing Values" value={s.missing?.total_missing} subtitle={`across ${s.columns} columns`} icon="❓" color="#f87171" />
                        <StatCard title="Duplicate Rows" value={s.duplicates?.duplicate_rows} subtitle="exact row matches" icon="🔁" color="#fbbf24" />
                        <StatCard title="Total Outliers" value={s.outliers?.total_outliers} subtitle="IQR-detected" icon="📊" color="#f97316" />
                        <StatCard title="Total Rows" value={s.rows} subtitle="current dataset" icon="📋" color="#4ade80" />
                        <StatCard title="Columns" value={s.columns} icon="📂" color="#22d3ee" />
                    </div>

                    {/* Quality score + actions side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
                        <QualityScore score={s.quality?.score} grade={s.quality?.grade} />

                        {/* Cleaning Actions */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>⚡ Cleaning Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Missing values */}
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select
                                        value={missingStrategy}
                                        onChange={(e) => setMissingStrategy(e.target.value)}
                                        style={{
                                            padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.85rem',
                                            border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer',
                                        }}
                                    >
                                        {STRATEGIES.map((s) => <option key={s} value={s}>{s === 'drop' ? 'Drop rows with nulls' : `Fill nulls with ${s}`}</option>)}
                                    </select>
                                    <button className="btn-primary" onClick={() => runAction('Fill Missing Values', () => cleanMissing(sessionId, missingStrategy))}>
                                        <Zap size={15} /> Apply to Missing
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginTop: '0.25rem' }}>
                                    {[
                                        { label: 'Remove Duplicates', fn: () => cleanDuplicates(sessionId), icon: <Layers size={15} />, color: '#fbbf24' },
                                        { label: 'Remove Outliers', fn: () => cleanOutliers(sessionId), icon: <TrendingDown size={15} />, color: '#f97316' },
                                        { label: 'Normalize (0–1)', fn: () => cleanNormalize(sessionId), icon: <RefreshCw size={15} />, color: '#6366f1' },
                                        { label: 'Standardize (Z)', fn: () => cleanStandardize(sessionId), icon: <RefreshCw size={15} />, color: '#22d3ee' },
                                    ].map(({ label, fn, icon, color }) => (
                                        <button
                                            key={label}
                                            onClick={() => runAction(label, fn)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.6rem 1rem', borderRadius: '0.6rem', border: `1px solid ${color}40`,
                                                background: `${color}10`, color, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions */}
                    {s.suggestions?.length > 0 && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                                💡 Suggested Actions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {s.suggestions.map((sug) => (
                                    <div key={sug.action} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.65rem 1rem', borderRadius: '0.6rem',
                                        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                                    }}>
                                        <CheckCircle size={16} color="#6366f1" />
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{sug.label}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: 'auto' }}>{sug.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing per-column table */}
                    {s.missing && (
                        <div className="card">
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Missing Values by Column</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {Object.entries(s.missing.missing_per_column).map(([col, info]) => (
                                    <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
                                        <div className="progress-bar-wrap" style={{ flex: 1 }}>
                                            <div className="progress-bar-fill" style={{ width: `${Math.max(info.pct, info.count > 0 ? 3 : 0)}%`, background: info.count > 0 ? 'linear-gradient(90deg,#f87171,#ef4444)' : '#4ade80' }} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: info.count > 0 ? '#f87171' : '#4ade80', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                                            {info.count} ({info.pct}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {s && activeTab === 'insights' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {s.insights?.map((ins, i) => (
                        <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            {ins}
                        </div>
                    ))}
                </div>
            )}

            {s && activeTab === 'types' && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Column Data Types</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        {Object.entries(s.data_types || {}).map(([col, info]) => (
                            <div key={col} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.65rem', background: 'var(--bg-input)', borderRadius: '0.6rem', border: '1px solid var(--border)' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{info.dtype} · {info.unique} unique</div>
                                </div>
                                <span className={`badge badge-${info.kind}`}>{info.kind}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
