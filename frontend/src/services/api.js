import axios from 'axios'

// In production (Vercel): VITE_API_URL is unset → uses relative /api
// In local dev: set VITE_API_URL=http://localhost:5000/api in .env.local
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
})

// ── Upload ──────────────────────────────────────────────────────────────────
export const uploadFile = (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
            if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
        },
    })
}

// ── Preview ─────────────────────────────────────────────────────────────────
export const fetchPreview = (sessionId, n = 50) =>
    api.get('/preview', { params: { session_id: sessionId, n } })

// ── Summary ─────────────────────────────────────────────────────────────────
export const fetchSummary = (sessionId) =>
    api.get('/summary', { params: { session_id: sessionId } })

// ── Cleaning ─────────────────────────────────────────────────────────────────
export const cleanMissing = (sessionId, strategy = 'mean') =>
    api.post('/clean/missing', { strategy }, { params: { session_id: sessionId } })

export const cleanDuplicates = (sessionId) =>
    api.post('/clean/duplicates', {}, { params: { session_id: sessionId } })

export const cleanOutliers = (sessionId) =>
    api.post('/clean/outliers', {}, { params: { session_id: sessionId } })

export const cleanNormalize = (sessionId) =>
    api.post('/clean/normalize', {}, { params: { session_id: sessionId } })

export const cleanStandardize = (sessionId) =>
    api.post('/clean/standardize', {}, { params: { session_id: sessionId } })

// ── Visualize ────────────────────────────────────────────────────────────────
export const fetchVisualize = (sessionId) =>
    api.get('/visualize', { params: { session_id: sessionId } })

// ── Download ─────────────────────────────────────────────────────────────────
export const downloadCleaned = (sessionId, format = 'csv') => {
    window.location.href = `${BASE_URL}/download?session_id=${sessionId}&format=${format}`
}

export const downloadReport = (sessionId) => {
    window.location.href = `${BASE_URL}/report?session_id=${sessionId}`
}

// ── Reset ────────────────────────────────────────────────────────────────────
export const resetDataset = (sessionId) =>
    api.post('/reset', {}, { params: { session_id: sessionId } })

export default api
