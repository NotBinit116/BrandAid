import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { brandService, contentService } from '../services/api'
import SentimentColumn from '../components/SentimentColumn'
import FeedbackModal from '../components/FeedbackModal'
import FilterBar from '../components/FilterBar'
import ReportFlyout from '../components/ReportFlyout'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts'

const DEFAULT_FILTERS = { platform: 'All', sentiment: 'All', riskLevel: 'All', dateFrom: '', dateTo: '' }
const POSTS_PER_PAGE = 10

export default function Dashboard() {
  const { user } = useAuth()
  const [brands, setBrands]             = useState([])
  const [activeBrand, setActiveBrand]   = useState(null)
  const [posts, setPosts]               = useState([])
  const [metrics, setMetrics]           = useState(null)
  const [filters, setFilters]           = useState(DEFAULT_FILTERS)
  const [selectedPost, setSelectedPost] = useState(null)
  const [flyoutOpen, setFlyoutOpen]     = useState(false)
  const [toast, setToast]               = useState(null)
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingPosts, setLoadingPosts]   = useState(false)
  const [crawling, setCrawling]           = useState(false)
  const [page, setPage]                   = useState({ positive: 1, neutral: 1, negative: 1 })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const load = async () => {
      setLoadingBrands(true)
      try {
        const res = await brandService.getAll()
        setBrands(res.data)
        if (res.data.length > 0) setActiveBrand(res.data[0])
      } catch { showToast('Failed to load brands', 'error') }
      finally { setLoadingBrands(false) }
    }
    load()
  }, [])

  const loadPosts = useCallback(async () => {
    if (!activeBrand) return
    setPage({ positive: 1, neutral: 1, negative: 1 })
    setLoadingPosts(true)
    try {
      const [postsRes, metricsRes] = await Promise.all([
        contentService.getFeed(activeBrand.id, filters),
        contentService.getMetrics(activeBrand.id),
      ])
      setPosts(postsRes.data.map(p => ({
        id:                String(p.id),
        text:              p.text,
        platform:          p.platform,
        date:              p.date,
        sentiment:         p.sentiment,
        riskLevel:         p.risk_level,
        source:            p.source_url,
        author:            p.author,
        score:             p.score,
        intent:            p.intent,
        intent_confidence: p.intent_confidence,
      })))
      setMetrics(metricsRes.data)
    } catch { showToast('Failed to load posts', 'error') }
    finally { setLoadingPosts(false) }
  }, [activeBrand, filters])

  useEffect(() => { loadPosts() }, [loadPosts])

  const handleCrawl = async () => {
    if (!activeBrand) return
    setCrawling(true)
    try {
      const raw = localStorage.getItem('brandaid_user') || sessionStorage.getItem('brandaid_user')
      const token = raw ? JSON.parse(raw).token : ''
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/crawler/run/${activeBrand.id}/sync`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      showToast(`Crawl complete — ${data.total_saved || 0} new mentions saved`)
      loadPosts()
    } catch { showToast('Crawl failed', 'error') }
    finally { setCrawling(false) }
  }

  const positivePosts = posts.filter(p => p.sentiment === 'positive')
  const neutralPosts  = posts.filter(p => p.sentiment === 'neutral')
  const negativePosts = posts.filter(p => p.sentiment === 'negative')

  const PIE_DATA = metrics ? [
    { name: 'Positive', value: metrics.positive_mentions, color: '#10b981' },
    { name: 'Neutral',  value: metrics.neutral_mentions,  color: '#f59e0b' },
    { name: 'Negative', value: metrics.negative_mentions, color: '#ef4444' },
  ] : []

  const score = metrics && metrics.total_mentions > 0
    ? Math.round((metrics.positive_mentions / metrics.total_mentions) * 100)
    : 0

  if (!loadingBrands && brands.length === 0) {
    return (
      <div className="min-h-screen bg-[#eef1f6] flex items-center justify-center">
        <div className="card text-center max-w-md">
          <div className="text-4xl mb-3">🏷️</div>
          <h2 className="font-display font-bold text-xl text-slate-900 mb-2">No brands yet</h2>
          <p className="text-slate-500 text-sm mb-5">Go to Configurations to add your first brand and keywords.</p>
          <a href="/configurations" className="btn-primary inline-block">Go to Configurations</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700 capitalize">{user?.email?.split('@')[0]}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {brands.length > 1 && (
              <select
                value={activeBrand?.id || ''}
                onChange={e => setActiveBrand(brands.find(b => b.id === Number(e.target.value)))}
                className="input-field text-sm py-2 w-auto"
              >
                {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
              </select>
            )}
            <button onClick={handleCrawl} disabled={crawling || !activeBrand} className="btn-secondary flex items-center gap-2 disabled:opacity-60">
              {crawling ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Fetching…</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1v4H9M1 13V9H5M13 5A6 6 0 0 1 2.1 9.5M1 9a6 6 0 0 1 10.9-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Fetch Mentions</>
              )}
            </button>
            <button onClick={() => setFlyoutOpen(true)} className="btn-primary flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M1 11v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Generate Report
            </button>
          </div>
        </div>

        {loadingBrands && (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {!loadingBrands && activeBrand && (
          <>
            {/* Metrics */}
            {metrics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: 'Total Mentions', value: metrics.total_mentions,    icon: '📊' },
                  { label: 'Positive',        value: metrics.positive_mentions, icon: '😊' },
                  { label: 'Neutral',         value: metrics.neutral_mentions,  icon: '😐' },
                  { label: 'Negative',        value: metrics.negative_mentions, icon: '😞' },
                ].map(m => (
                  <div key={m.label} className="card hover:shadow-card-hover transition-all duration-200">
                    <span className="text-2xl">{m.icon}</span>
                    <p className="font-display font-bold text-3xl text-slate-900 mt-2">{m.value.toLocaleString()}</p>
                    <p className="text-sm text-slate-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {metrics && metrics.total_mentions > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 card">
                  <h2 className="font-display font-semibold text-slate-900 mb-4">Sentiment Split</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                      <Tooltip formatter={v => [v.toLocaleString(), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card flex flex-col justify-center gap-3">
                  <h2 className="font-display font-semibold text-slate-900">Brand Health</h2>
                  <div className="text-center py-4">
                    <p className={`font-display font-bold text-5xl ${score >= 60 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                      {score}%
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Positive sentiment rate</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${score >= 60 ? 'bg-emerald-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">{metrics.total_mentions.toLocaleString()} total mentions</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

            <div className="flex items-center gap-2 -mt-2">
              <span className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{posts.length}</span> mentions for{' '}
                <span className="font-semibold text-slate-700">{activeBrand.brand_name}</span>
              </span>
              {loadingPosts && (
                <svg className="animate-spin w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </div>

            {/* Empty state */}
            {!loadingPosts && posts.length === 0 && (
              <div className="card text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-display font-semibold text-slate-800 mb-2">No mentions found</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Click "Fetch Mentions" to crawl for brand mentions, or adjust your filters.
                </p>
                <button onClick={handleCrawl} disabled={crawling} className="btn-primary">
                  {crawling ? 'Fetching…' : 'Fetch Mentions Now'}
                </button>
              </div>
            )}

            {/* Sentiment columns with pagination */}
            {posts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
                {[
                  { key: 'positive', colPosts: positivePosts },
                  { key: 'neutral',  colPosts: neutralPosts  },
                  { key: 'negative', colPosts: negativePosts },
                ].map(({ key, colPosts }) => {
                  const currentPage = page[key]
                  const totalPages  = Math.ceil(colPosts.length / POSTS_PER_PAGE)
                  const paginated   = colPosts.slice(
                    (currentPage - 1) * POSTS_PER_PAGE,
                    currentPage * POSTS_PER_PAGE
                  )
                  return (
                    <div key={key} className="flex flex-col gap-3">
                      <SentimentColumn
                        sentiment={key}
                        posts={paginated}
                        onPostClick={setSelectedPost}
                      />
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-1">
                          <button
                            onClick={() => setPage(p => ({ ...p, [key]: Math.max(1, p[key] - 1) }))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Prev
                          </button>
                          <span className="text-xs text-slate-400">
                            {currentPage} / {totalPages}
                            <span className="ml-1 text-slate-300">({colPosts.length})</span>
                          </span>
                          <button
                            onClick={() => setPage(p => ({ ...p, [key]: Math.min(totalPages, p[key] + 1) }))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
                          >
                            Next
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {selectedPost && (
        <FeedbackModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onReport={() => showToast('Post reported successfully')}
        />
      )}

      <ReportFlyout
        open={flyoutOpen}
        onClose={() => setFlyoutOpen(false)}
        onGenerate={() => showToast('Report generated and saved!')}
        brands={brands}
        brandId={activeBrand?.id}
      />

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.4"/>
            <path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
