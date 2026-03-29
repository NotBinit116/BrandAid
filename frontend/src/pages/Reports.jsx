import { useState, useEffect } from 'react'
import { reportService, brandService } from '../services/api'
import ReportFlyout from '../components/ReportFlyout'

export default function Reports() {
  const [reports, setReports]   = useState([])
  const [brands, setBrands]     = useState([])
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState(null)
  const [search, setSearch]     = useState('')
  const [downloading, setDownloading] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [reportsRes, brandsRes] = await Promise.all([
          reportService.getAll(),
          brandService.getAll(),
        ])
        setReports(reportsRes.data)
        setBrands(brandsRes.data)
      } catch {
        showToast('Failed to load reports', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleGenerate = (newReport) => {
    setReports(r => [newReport, ...r])
    showToast('Report generated successfully!')
  }

  const handleDownload = async (report) => {
    setDownloading(report.id)
    try {
      const raw = localStorage.getItem('brandaid_user') || sessionStorage.getItem('brandaid_user')
      const token = raw ? JSON.parse(raw).token : ''

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reports/${report.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${report.report_name}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('Download started')
    } catch {
      showToast('Download failed', 'error')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (report) => {
    if (!confirm(`Delete "${report.report_name}"?`)) return
    try {
      await reportService.delete(report.id)
      setReports(r => r.filter(x => x.id !== report.id))
      showToast('Report deleted')
    } catch {
      showToast('Failed to delete report', 'error')
    }
  }

  const getBrandName = (brand_id) => {
    const b = brands.find(b => b.id === brand_id)
    return b ? b.brand_name : `Brand ${brand_id}`
  }

  const filtered = reports.filter(r =>
    r.report_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500 mt-0.5">AI-generated brand analysis reports</p>
          </div>
          <button onClick={() => setFlyoutOpen(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M1 11v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Generate New Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Reports', value: reports.length, icon: '📋' },
            { label: 'This Month',    value: reports.filter(r => r.created_at?.startsWith(new Date().toISOString().slice(0,7))).length, icon: '📅' },
            { label: 'Brands',        value: brands.length, icon: '🏷️' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-display font-bold text-2xl text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 9l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports…"
            className="input-field pl-9"
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide">Report Name</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide hidden sm:table-cell">Brand</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide hidden md:table-cell">Filters</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                        No reports yet.{' '}
                        <button onClick={() => setFlyoutOpen(true)} className="text-brand-500 font-semibold hover:underline">Generate one?</button>
                      </td>
                    </tr>
                  ) : filtered.map(report => (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 4h4M5 7h4M5 10h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{report.report_name}</p>
                            <p className="text-xs text-slate-400 sm:hidden">{report.created_at?.slice(0,10)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-slate-600">{getBrandName(report.brand_id)}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-slate-600">{report.created_at?.slice(0,10)}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {[report.filter_platform, report.filter_sentiment, report.filter_risk_level]
                            .filter(v => v && v !== 'All')
                            .map((v, i) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{v}</span>
                            ))}
                          {[report.filter_platform, report.filter_sentiment, report.filter_risk_level].every(v => !v || v === 'All') && (
                            <span className="text-xs text-slate-400">All data</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(report)}
                            disabled={downloading === report.id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-all border border-brand-200 disabled:opacity-60"
                          >
                            {downloading === report.id ? (
                              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            )}
                            PDF
                          </button>
                          <button
                            onClick={() => handleDelete(report)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all border border-red-200"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M4 3V2h4v1M5 5v4M7 5v4M2 3l.5 7.5a1 1 0 0 0 1 .5h5a1 1 0 0 0 1-.5L10 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ReportFlyout
        open={flyoutOpen}
        onClose={() => setFlyoutOpen(false)}
        onGenerate={handleGenerate}
        brands={brands}
      />

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
