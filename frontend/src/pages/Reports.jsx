import { useState } from 'react'
import { dummyReports } from '../data/dummyData'
import ReportFlyout from '../components/ReportFlyout'

export default function Reports() {
  const [reports, setReports] = useState(dummyReports)
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = (form) => {
    const newReport = {
      id: `r${Date.now()}`,
      name: `Brand Analysis — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      dateGenerated: new Date().toISOString().slice(0, 10),
      filters: {
        platform: form.platform,
        sentiment: form.sentiment,
        riskLevel: form.riskLevel,
        dateRange: form.dateFrom && form.dateTo ? `${form.dateFrom} – ${form.dateTo}` : 'All dates',
      },
      downloadUrl: '#',
    }
    setReports(r => [newReport, ...r])
    showToast('Report generated successfully!')
  }

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500 mt-0.5">View and download your brand analysis reports</p>
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
            { label: 'This Month', value: reports.filter(r => r.dateGenerated.startsWith('2024-12')).length, icon: '📅' },
            { label: 'Downloads', value: 0, icon: '⬇️' },
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide">Report Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide hidden md:table-cell">Filters Used</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                      No reports found.{' '}
                      <button onClick={() => setFlyoutOpen(true)} className="text-brand-500 font-semibold hover:underline">Generate one?</button>
                    </td>
                  </tr>
                ) : filtered.map((report, idx) => (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition-colors" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 4h4M5 7h4M5 10h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{report.name}</p>
                          <p className="text-xs text-slate-400 sm:hidden">{report.dateGenerated}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{report.dateGenerated}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(report.filters).map(([k, v]) => (
                          v && v !== 'All' && v !== 'All dates' ? (
                            <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {v}
                            </span>
                          ) : null
                        ))}
                        {Object.values(report.filters).every(v => !v || v === 'All' || v === 'All dates') && (
                          <span className="text-xs text-slate-400">No filters</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => showToast(`Downloading "${report.name}"…`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-all border border-brand-200"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ReportFlyout open={flyoutOpen} onClose={() => setFlyoutOpen(false)} onGenerate={handleGenerate} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {toast}
        </div>
      )}
    </div>
  )
}
