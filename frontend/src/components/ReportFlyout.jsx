import { useState, useEffect } from 'react'
import { PLATFORMS } from '../data/dummyData'

export default function ReportFlyout({ open, onClose, onGenerate }) {
  const [form, setForm] = useState({
    dateFrom: '',
    dateTo: '',
    platform: 'All',
    sentiment: 'All',
    riskLevel: 'All',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) { setSuccess(false); setLoading(false) }
  }, [open])

  const handleGenerate = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    onGenerate && onGenerate(form)
    setTimeout(() => { onClose(); setSuccess(false) }, 2000)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Flyout Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">Generate Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">Configure and export brand data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Date range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={form.dateFrom}
                  onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))}
                  className="input-field text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={form.dateTo}
                  onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))}
                  className="input-field text-xs"
                />
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Platform</label>
            <select
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
              className="input-field"
            >
              <option value="All">All Platforms</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Sentiment */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sentiment</label>
            <div className="flex gap-2">
              {['All', 'Positive', 'Neutral', 'Negative'].map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, sentiment: s }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    form.sentiment === s
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Risk Level</label>
            <div className="flex gap-2">
              {['All', 'Low', 'Medium', 'High'].map(r => (
                <button
                  key={r}
                  onClick={() => setForm(f => ({ ...f, riskLevel: r }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    form.riskLevel === r
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Report Preview</p>
            <p className="text-xs text-slate-600">Platform: <span className="font-medium text-slate-800">{form.platform}</span></p>
            <p className="text-xs text-slate-600">Sentiment: <span className="font-medium text-slate-800">{form.sentiment}</span></p>
            <p className="text-xs text-slate-600">Risk: <span className="font-medium text-slate-800">{form.riskLevel}</span></p>
            {form.dateFrom && <p className="text-xs text-slate-600">From: <span className="font-medium text-slate-800">{form.dateFrom}</span></p>}
            {form.dateTo && <p className="text-xs text-slate-600">To: <span className="font-medium text-slate-800">{form.dateTo}</span></p>}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          {success ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Report generated successfully!
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v8M4 6l3 3 3-3M1 10v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
