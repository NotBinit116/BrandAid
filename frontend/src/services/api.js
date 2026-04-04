import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const raw = localStorage.getItem('brandaid_user') || sessionStorage.getItem('brandaid_user')
  if (raw) {
    const parsed = JSON.parse(raw)
    if (parsed.token) config.headers.Authorization = `Bearer ${parsed.token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('brandaid_user')
      sessionStorage.removeItem('brandaid_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login:    (email, password) => api.post('/auth/login', { email, password }),
  me:       ()                => api.get('/auth/me'),
}

export const brandService = {
  getAll: ()                    => api.get('/brands/'),
  create: (brand_name)          => api.post('/brands/', { brand_name }),
  update: (brand_id, brand_name)=> api.put(`/brands/${brand_id}`, { brand_name }),
  delete: (brand_id)            => api.delete(`/brands/${brand_id}`),
}

export const contentService = {
  getFeed: (brand_id, filters = {}) =>
    api.get('/content/', {
      params: {
        brand_id,
        platform:   filters.platform  !== 'All' ? filters.platform  : undefined,
        sentiment:  filters.sentiment !== 'All' ? filters.sentiment : undefined,
        risk_level: filters.riskLevel !== 'All' ? filters.riskLevel : undefined,
        date_from:  filters.dateFrom  || undefined,
        date_to:    filters.dateTo    || undefined,
      }
    }),
  getMetrics: (brand_id) => api.get('/content/metrics', { params: { brand_id } }),
}

export const configService = {
  getPlatforms:  ()                              => api.get('/config/platforms'),
  getKeywords:   (brand_id)                      => api.get(`/config/${brand_id}/keywords`),
  addKeyword:    (brand_id, keyword, keyword_type = 'monitor') => api.post(`/config/${brand_id}/keywords`, { keyword, keyword_type }),
  deleteKeyword: (brand_id, keyword_id)          => api.delete(`/config/${brand_id}/keywords/${keyword_id}`),
  getHandles:    (brand_id)                      => api.get(`/config/${brand_id}/handles`),
  addHandle:     (brand_id, platform_id, handle) => api.post(`/config/${brand_id}/handles`, { platform_id, handle }),
  deleteHandle:  (brand_id, handle_id)           => api.delete(`/config/${brand_id}/handles/${handle_id}`),
}

export const reportService = {
  getAll:  ()      => api.get('/reports/'),
  create:  (data)  => api.post('/reports/', data),
  delete:  (id)    => api.delete(`/reports/${id}`),
}

export const publicService = {
  search: (query) => api.get('/public/search', { params: { q: query } }),
}

export default api
