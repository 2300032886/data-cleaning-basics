import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import CleanDashboard from './pages/CleanDashboard'
import Visualize from './pages/Visualize'
import Export from './pages/Export'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/clean" element={<CleanDashboard />} />
              <Route path="/visualize" element={<Visualize />} />
              <Route path="/export" element={<Export />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontWeight: 600,
              fontSize: '0.88rem',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: 'white' } },
            error: { iconTheme: { primary: '#f87171', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  )
}
