import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { dummyPosts, dummyMetrics } from '../data/dummyData'
import SentimentColumn from '../components/SentimentColumn'
import FeedbackModal from '../components/FeedbackModal'
import FilterBar from '../components/FilterBar'
import ReportFlyout from '../components/ReportFlyout'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const DEFAULT_FILTERS = { platform: 'All', sentiment: 'All', riskLevel: 'All', dateFrom: '', dateTo: '' }

const TREND_DATA = [
  { date: 'Dec 1',  positive: 30, neutral: 20, negative: 10 },
  { date: 'Dec 2',  positive: 45, neutral: 18, negative: 15 },
  { date: 'Dec 3',  positive: 38, neutral: 25, negative: 12 },
  { date: 'Dec 4',  positive: 55, neutral: 22, negative: 8  },
  { date: 'Dec 5',  positive: 42, neutral: 30, negative: 18 },
  { date: 'Dec 6',  positive: 60, neutral: 28, negative: 22 },
  { date: 'Dec 7',  positive: 50, neutral: 35, negative: 14 },
  { date: 'Dec 8',  positive: 68, neutral: 20, negative: 25 },
  { date: 'Dec 9',  positive: 72, neutral: 32, negative: 17 },
  { date: 'Dec 10', positive: 65, neutral: 28, negative: 20 },
]

const PIE_DATA = [
  { name: 'Positive', value: 621,  color: '#10b981' },
  { name: 'Neutral',  value: 389,  color: '#f59e0b' },
  { name: 'Negative', value: 274,  color: '#ef4444' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedPost, setSelectedPost] = useState(null)
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredPosts = useMemo(() => {
    return dummyPosts.filter(p => {
      if (filters.platform !== 'All' && p.platform !== filters.platform) return false
      if (filters.sentiment !== 'All' && p.sentiment !== filters.sentiment) return false
      if (filters.riskLevel !== 'All' && p.riskLevel !== filters.riskLevel) return false
      if (filters.dateFrom && p.date < filters.dateFrom) return false
      if (filters.dateTo   && p.date > filters.dateTo)   return false
      return true
    })
  }, [filters])

  const positivePosts = filteredPosts.filter(p => p.sentiment === 'positive')
  const neutralPosts  = filteredPosts.filter(p => p.sentiment === 'neutral')
  const negativePosts = filteredPosts.filter(p => p.sentiment === 'negative')

  const METRICS = [
    { label: 'Total Mentions',    value: dummyMetrics.totalMentions,    icon: '📊', color: 'from-brand-500 to-brand-600',    trend: '+12%' },
    { label: 'Positive',          value: dummyMetrics.positiveMentions, icon: '😊', color: 'from-emerald-400 to-emerald-600', trend: '+8%'  },
    { label: 'Neutral',           value: dummyMetrics.neutralMentions,  icon: '😐', color: 'from-amber-400 to-amber-500',     trend: '-2%'  },
    { label: 'Negative',          value: dummyMetrics.negativeMentions, icon: '😞', color: 'from-red-400 to-red-500',         trend: '+4%'  },
  ]

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700 capitalize">{user?.name}</span> · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setFlyoutOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M1 11v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Generate Report
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {METRICS.map(m => (
            <div key={m.label} className="card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{m.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  m.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}>
                  {m.trend}
                </span>
              </div>
              <p className="font-display font-bold text-3xl text-slate-900">{m.value.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Area Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-slate-900">Mention Trends</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Dec 1–10, 2024</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TREND_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  cursor={{ stroke: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fill="url(#colorPos)" name="Positive" />
                <Area type="monotone" dataKey="neutral"  stroke="#f59e0b" strokeWidth={2} fill="url(#colorNeu)" name="Neutral" />
                <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} fill="url(#colorNeg)" name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie */}
          <div className="card flex flex-col">
            <h2 className="font-display font-semibold text-slate-900 mb-4">Sentiment Split</h2>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: 11, color: '#64748b' }}>{val}</span>} />
                  <Tooltip formatter={(val) => [val.toLocaleString(), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        {/* Filter result count */}
        <div className="flex items-center gap-2 -mt-2">
          <span className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredPosts.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{dummyPosts.length}</span> mentions
          </span>
        </div>

        {/* Sentiment columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          <SentimentColumn sentiment="positive" posts={positivePosts} onPostClick={setSelectedPost} />
          <SentimentColumn sentiment="neutral"  posts={neutralPosts}  onPostClick={setSelectedPost} />
          <SentimentColumn sentiment="negative" posts={negativePosts} onPostClick={setSelectedPost} />
        </div>

      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <FeedbackModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onReport={(p) => showToast(`"${p.platform}" post reported successfully.`)}
        />
      )}

      {/* Report flyout */}
      <ReportFlyout
        open={flyoutOpen}
        onClose={() => setFlyoutOpen(false)}
        onGenerate={() => showToast('Report generated and saved!')}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
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
