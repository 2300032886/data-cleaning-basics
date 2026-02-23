import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [sessionId, setSessionId] = useState(null)
    const [filename, setFilename] = useState(null)
    const [summary, setSummary] = useState(null)
    const [cleaningLog, setCleaningLog] = useState([])
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light')
        } else {
            document.documentElement.classList.remove('light')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

    const setDataset = (sid, fname) => {
        setSessionId(sid)
        setFilename(fname)
        setSummary(null)
        setCleaningLog([])
    }

    const addCleaningLog = (entry) =>
        setCleaningLog((prev) => [{ ...entry, time: new Date().toLocaleTimeString() }, ...prev])

    return (
        <AppContext.Provider
            value={{
                sessionId, setSessionId,
                filename, setFilename,
                summary, setSummary,
                cleaningLog, addCleaningLog,
                theme, toggleTheme,
                setDataset,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within AppProvider')
    return ctx
}
