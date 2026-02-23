import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { downloadCleaned, downloadReport, fetchSummary } from '../services/api'
import QualityScore from '../components/QualityScore'
import { Download, FileText, FileSpreadsheet, AlertTriangle, ChevronRight, RefreshCw } from 'lucide-react'
import Loader from '../components/Loader'

export default function Export() {
    const navigate = useNavigate()
    const { sessionId, summary, setSummary, cleaningLog } = useApp()
    const [loading, setLoading] = useState(false)

    const refreshSummary = async () => {
        if (!sessionId) return
        setLoading(true)
        try {
            const res = await fetchSummary(sessionId)
            setSummary(res.data)
            toast.success('Summary refreshed.')
        } catch { toast.error('Failed to refresh summary.') } finally { setLoading(false) }
    }

    if (!sessionId) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p style={{ marginBottom: '1rem' }}>No dataset uploaded yet.</p>
                <button className="btn-primary" onClick={() => navigate('/upload')}>Upload a Dataset</button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {loading && <Loader message="Loading…" />}

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Export Results</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Download your cleaned dataset and quality report.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Download CSV */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileSpreadsheet size={26} color="#6366f1" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Cleaned CSV</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Comma-separated values format</p>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => { downloadCleaned(sessionId, 'csv'); toast.success('Downloading CSV…') }}>
                        <Download size={16} /> Download CSV
                    </button>
                </div>

                {/* Download XLSX */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileSpreadsheet size={26} color="#4ade80" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Cleaned Excel</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>XLSX format for Excel / Sheets</p>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)' }} onClick={() => { downloadCleaned(sessionId, 'xlsx'); toast.success('Downloading XLSX…') }}>
                        <Download size={16} /> Download XLSX
                    </button>
                </div>

                {/* Quality Report */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={26} color="#fbbf24" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Quality Report</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Text report with analysis & insights</p>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }} onClick={() => { downloadReport(sessionId); toast.success('Downloading report…') }}>
                        <Download size={16} /> Download Report
                    </button>
                </div>
            </div>

            {/* Quality score snapshot */}
            {summary?.quality && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '2rem' }}>
                    <div style={{ maxWidth: 220 }}>
                        <QualityScore score={summary.quality.score} grade={summary.quality.grade} />
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Current Dataset Health</h3>
                            <button className="btn-secondary" onClick={refreshSummary} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}><RefreshCw size={13} />Refresh</button>
                        </div>
                        {[
                            { label: 'Rows', value: summary.rows },
                            { label: 'Columns', value: summary.columns },
                            { label: 'Missing Values', value: summary.missing?.total_missing, danger: summary.missing?.total_missing > 0 },
                            { label: 'Duplicates', value: summary.duplicates?.duplicate_rows, danger: summary.duplicates?.duplicate_rows > 0 },
                            { label: 'Outliers', value: summary.outliers?.total_outliers, danger: summary.outliers?.total_outliers > 0 },
                        ].map(({ label, value, danger }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 700, color: danger ? '#f87171' : '#4ade80' }}>{value ?? '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cleaning log */}
            {cleaningLog.length > 0 && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🗒️ Cleaning History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto' }}>
                        {cleaningLog.map((log, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', background: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{log.time}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>{log.label}</span>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
