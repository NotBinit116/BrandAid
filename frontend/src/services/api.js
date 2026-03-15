import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach auth token ──────────────────
api.interceptors.request.use(config => {
  const user = localStorage.getItem('brandaid_user') || sessionStorage.getItem('brandaid_user')
  if (user) {
    const parsed = JSON.parse(user)
    config.headers.Authorization = `Bearer ${parsed.token || 'mock-token'}`
  }
  return config
})

// ── Mocked service calls ────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    // TODO: replace with real API call
    // return api.post('/auth/login', { email, password })
    await new Promise(r => setTimeout(r, 600))
    return { data: { user: { id: '1', email, name: email.split('@')[0] }, token: 'mock-token' } }
  },

  register: async (name, email, password) => {
    // TODO: return api.post('/auth/register', { name, email, password })
    await new Promise(r => setTimeout(r, 600))
    return { data: { success: true } }
  },

  logout: async () => {
    // TODO: return api.post('/auth/logout')
    return { data: { success: true } }
  },
}

export const sentimentService = {
  getSentimentData: async (brand, filters = {}) => {
    // TODO: return api.get('/sentiment', { params: { brand, ...filters } })
    await new Promise(r => setTimeout(r, 500))
    return { data: [] } // will be replaced with real data
  },

  searchBrand: async (query) => {
    // TODO: return api.get('/search', { params: { q: query } })
    await new Promise(r => setTimeout(r, 700))
    return { data: { query, posts: [] } }
  },
}

export const reportService = {
  getReports: async () => {
    // TODO: return api.get('/reports')
    await new Promise(r => setTimeout(r, 400))
    return { data: [] }
  },

  generateReport: async (params) => {
    // TODO: return api.post('/reports/generate', params)
    await new Promise(r => setTimeout(r, 1500))
    return { data: { id: Date.now(), status: 'generated', ...params } }
  },

  downloadReport: async (id) => {
    // TODO: return api.get(`/reports/${id}/download`, { responseType: 'blob' })
    return { data: null }
  },
}

export const configService = {
  getConfig: async () => {
    // TODO: return api.get('/config')
    await new Promise(r => setTimeout(r, 300))
    return { data: {} }
  },

  saveConfig: async (config) => {
    // TODO: return api.put('/config', config)
    await new Promise(r => setTimeout(r, 600))
    return { data: { success: true } }
  },
}

export default api
