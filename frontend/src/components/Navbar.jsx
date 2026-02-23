import { NavLink } from 'react-router-dom'
import {
    Home, Upload, Wand2, BarChart2, Download, Sun, Moon, Database, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

const links = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/upload', label: 'Upload', icon: Upload },
    { to: '/clean', label: 'Clean', icon: Wand2 },
    { to: '/visualize', label: 'Visualize', icon: BarChart2 },
    { to: '/export', label: 'Export', icon: Download },
]

export default function Navbar() {
    const { theme, toggleTheme, filename, sessionId } = useApp()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <nav
            style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}
        >
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 64 }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'linear-gradient(135deg,#6366f1,#22d3ee)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Database size={20} color="white" />
                    </div>
                    <div>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                            Data<span style={{ color: '#6366f1' }}>Clean</span>
                        </span>
                        {filename && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                                📁 {filename.length > 22 ? filename.slice(0, 22) + '…' : filename}
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop links */}
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
                    {links.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.45rem 0.9rem', borderRadius: '0.5rem',
                                fontSize: '0.88rem', fontWeight: 600,
                                textDecoration: 'none',
                                color: isActive ? '#6366f1' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                transition: 'all 0.15s',
                            })}
                        >
                            <Icon size={15} />
                            {label}
                        </NavLink>
                    ))}
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        marginLeft: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem',
                        background: 'var(--bg-input)', padding: '0.45rem', cursor: 'pointer',
                        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                    }}
                    title="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen((o) => !o)}
                    style={{
                        marginLeft: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem',
                        background: 'var(--bg-input)', padding: '0.45rem', cursor: 'pointer',
                        color: 'var(--text-secondary)', display: 'none',
                    }}
                    className="mobile-menu-btn"
                >
                    {mobileOpen ? <X size={17} /> : <Menu size={17} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{ padding: '0.75rem 1.5rem 1rem', borderTop: '1px solid var(--border)' }}>
                    {links.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setMobileOpen(false)}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.65rem 0.9rem', borderRadius: '0.5rem',
                                fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
                                color: isActive ? '#6366f1' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                marginBottom: '0.25rem',
                            })}
                        >
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </div>
            )}

            <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </nav>
    )
}
