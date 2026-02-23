import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { uploadFile, fetchPreview, fetchSummary } from '../services/api'
import DataTable from '../components/DataTable'
import Loader from '../components/Loader'
import { CloudUpload, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

const MAX_MB = 50
const ALLOWED = ['.csv', '.xlsx', '.xls']

export default function Upload() {
    const navigate = useNavigate()
    const { setDataset, setSummary } = useApp()

    const [file, setFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState(null)
    const [sessionDone, setSessionDone] = useState(null)

    const onDrop = useCallback((accepted, rejected) => {
        if (rejected.length > 0) {
            toast.error('Only CSV and XLSX files are supported.')
            return
        }
        const f = accepted[0]
        if (f.size > MAX_MB * 1024 * 1024) {
            toast.error(`File too large. Max size is ${MAX_MB} MB.`)
            return
        }
        setFile(f)
        setPreview(null)
        setSessionDone(null)
        setUploadProgress(0)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
        multiple: false,
    })

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        try {
            const res = await uploadFile(file, setUploadProgress)
            const { session_id, filename, rows, columns } = res.data
            setDataset(session_id, filename)
            setSessionDone({ session_id, rows, columns })

            // Fetch preview & summary
            const [prevRes, sumRes] = await Promise.all([
                fetchPreview(session_id, 50),
                fetchSummary(session_id),
            ])
            setPreview(prevRes.data)
            setSummary(sumRes.data)

            toast.success(`✅ Uploaded "${filename}" — ${rows} rows, ${columns} columns`)
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Upload failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / 1048576).toFixed(1) + ' MB'
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {loading && <Loader message="Uploading and analyzing dataset…" />}

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Upload Dataset
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Upload a CSV or Excel file to begin data cleaning. Supports files up to 50 MB.
            </p>

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                style={{
                    border: `2px dashed ${isDragActive ? '#6366f1' : 'var(--border)'}`,
                    borderRadius: '1.25rem',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragActive ? 'rgba(99,102,241,0.06)' : 'var(--bg-card)',
                    transition: 'all 0.2s ease',
                    marginBottom: '1.5rem',
                }}
            >
                <input {...getInputProps()} />
                <div style={{
                    width: 72, height: 72, borderRadius: 18,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
                }}>
                    <CloudUpload size={32} color="#6366f1" />
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {isDragActive ? 'Drop your file here!' : 'Drag & drop your dataset here'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    or <span style={{ color: '#6366f1', fontWeight: 600 }}>click to browse</span> — CSV, XLSX (max 50 MB)
                </p>
            </div>

            {/* Selected file */}
            {file && (
                <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} color="#6366f1" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div style={{ flex: 1 }}>
                            <div className="progress-bar-wrap">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{uploadProgress}%</p>
                        </div>
                    )}
                    {sessionDone && <CheckCircle size={20} color="#4ade80" />}
                    <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setSessionDone(null) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button className="btn-primary" onClick={handleUpload} disabled={!file || loading || !!sessionDone}>
                    <CloudUpload size={17} />
                    {sessionDone ? 'Uploaded ✓' : 'Upload & Analyze'}
                </button>
                {sessionDone && (
                    <button className="btn-secondary" onClick={() => navigate('/clean')}>
                        Go to Clean Dashboard →
                    </button>
                )}
            </div>

            {/* Dataset details */}
            {sessionDone && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Rows', value: sessionDone.rows, icon: '📋' },
                        { label: 'Total Columns', value: sessionDone.columns, icon: '📊' },
                        { label: 'File Size', value: formatSize(file.size), icon: '💾' },
                        { label: 'Format', value: file.name.split('.').pop().toUpperCase(), icon: '📁' },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="card animate-fade-in" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview table */}
            {preview && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Dataset Preview <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>(first 50 rows)</span>
                        </h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {preview.total_rows} rows × {preview.total_columns} columns
                        </span>
                    </div>
                    <DataTable columns={preview.columns} rows={preview.rows} />
                </div>
            )}
        </div>
    )
}
