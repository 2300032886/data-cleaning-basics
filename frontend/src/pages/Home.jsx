import { useNavigate } from 'react-router-dom'
import { Upload, Zap, BarChart2, Download, Shield, TrendingUp, ArrowRight, Star } from 'lucide-react'

const features = [
    { icon: '📤', title: 'Upload Any Dataset', desc: 'Drag & drop CSV or Excel files up to 50 MB. Instant preview upon upload.', color: '#6366f1' },
    { icon: '🧹', title: 'Auto-Clean Data', desc: 'Handle nulls, duplicates, and outliers automatically with one click.', color: '#22d3ee' },
    { icon: '📊', title: 'Interactive Charts', desc: 'Bar charts, histograms, box plots, and correlation heatmaps rendered instantly.', color: '#4ade80' },
    { icon: '🎯', title: 'Quality Score', desc: 'Get a composite data quality score (0–100) with letter grade and insights.', color: '#fbbf24' },
    { icon: '🤖', title: 'AI-Style Insights', desc: 'Automatic issue detection with actionable recommendations for your dataset.', color: '#f87171' },
    { icon: '💾', title: 'Export Results', desc: 'Download your cleaned dataset as CSV or XLSX + a full quality report.', color: '#a78bfa' },
]

const steps = [
    { n: '01', label: 'Upload Dataset', icon: Upload },
    { n: '02', label: 'Auto-Clean', icon: Zap },
    { n: '03', label: 'Explore Charts', icon: BarChart2 },
    { n: '04', label: 'Download Results', icon: Download },
]

export default function Home() {
    const navigate = useNavigate()

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Hero */}
            <div
                className="animate-fade-in"
                style={{
                    textAlign: 'center', padding: '5rem 2rem 4rem',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)',
                    borderRadius: '1.5rem', marginBottom: '4rem',
                    border: '1px solid var(--border)',
                }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.5rem',
                }}>
                    <Star size={13} color="#818cf8" />
                    <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>Professional Data Cleaning Platform</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.15,
                    marginBottom: '1.25rem', color: 'var(--text-primary)',
                }}>
                    Clean Your Data.{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Trust Your Analysis.
                    </span>
                </h1>

                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                    Upload your messy CSV or Excel dataset, let our intelligent engine detect and fix data quality issues, then explore rich interactive visualizations.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => navigate('/upload')} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
                        <Upload size={18} /> Get Started Free
                        <ArrowRight size={16} />
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/visualize')} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
                        <BarChart2 size={18} /> View Demo
                    </button>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
                    {[['10+', 'Clean Operations'], ['5', 'Chart Types'], ['0–100', 'Quality Score'], ['50MB', 'Max File Size']].map(([v, l]) => (
                        <div key={l} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366f1' }}>{v}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                    How It Works
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {steps.map(({ n, label, icon: Icon }, i) => (
                        <div
                            key={n}
                            className="card animate-fade-in"
                            style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}
                        >
                            <div style={{
                                fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                                color: '#6366f1', marginBottom: '0.75rem',
                            }}>
                                STEP {n}
                            </div>
                            <div style={{
                                width: 56, height: 56, borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 0.75rem',
                            }}>
                                <Icon size={24} color="#6366f1" />
                            </div>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div>
                <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                    Everything You Need
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {features.map(({ icon, title, desc, color }, i) => (
                        <div
                            key={title}
                            className="card animate-fade-in"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    fontSize: '1.75rem', width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                                    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {icon}
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA section */}
            <div style={{
                marginTop: '4rem', textAlign: 'center', padding: '3rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: '1.5rem',
            }}>
                <TrendingUp size={40} color="#6366f1" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Ready to clean your data?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Upload your first dataset and get a quality report in seconds.
                </p>
                <button className="btn-primary" onClick={() => navigate('/upload')} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
                    <Upload size={18} /> Upload Dataset <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}
