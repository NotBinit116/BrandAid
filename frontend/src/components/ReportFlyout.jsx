import { useState, useEffect } from 'react'
import { reportService } from '../services/api'

export default function ReportFlyout({ open, onClose, onGenerate, brands = [], brandId = null }) {
  const [form, setForm] = useState({
    brand_id:          '',
    report_name:       '',
    dateFrom:          '',
    dateTo:            '',
    filter_platform:   'All',
    filter_sentiment:  'All',
    filter_risk_level: 'All',
  })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!open) { setSuccess(false); setLoading(false); setError('') }
    // Pre-select brand if passed from dashboard
    if (brandId) setForm(f => ({ ...f, brand_id: String(brandId) }))
  }, [open, brandId])

  // Auto set report name
  useEffect(() => {
    if (form.brand_id && brands.length > 0) {
      const brand = brands.find(b => String(b.id) === String(form.brand_id))
      if (brand) {
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        setForm(f => ({ ...f, report_name: `${brand.brand_name} Report — ${date}` }))
      }
    }
  }, [form.brand_id, brands])

  const handleGenerate = async () => {
    if (!form.brand_id) { setError('Please select a brand'); return }
    if (!form.report_name.trim()) { setError('Please enter a report name'); return }

    setLoading(true)
    setError('')
    try {
      const payload = {
        brand_id:          Number(form.brand_id),
        report_name:       form.report_name.trim(),
        date_from:         form.dateFrom || null,
        date_to:           form.dateTo   || null,
        filter_platform:   form.filter_platform,
        filter_sentiment:  form.filter_sentiment,
        filter_risk_level: form.filter_risk_level,
      }
      const res = await reportService.create(payload)
      setSuccess(true)
      onGenerate && onGenerate(res.data)
      setTimeout(() => { onClose(); setSuccess(false) }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">Generate Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">AI-powered brand analysis PDF</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
            <select
              value={form.brand_id}
              onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Select a brand…</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
            </select>
          </div>

          {/* Report name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Report Name</label>
            <input
              type="text"
              value={form.report_name}
              onChange={e => setForm(f => ({ ...f, report_name: e.target.value }))}
              placeholder="e.g. Itonics Monthly Report"
              className="input-field"
            />
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range (optional)</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">From</label>
                <input type="date" value={form.dateFrom} onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))} className="input-field text-xs" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">To</label>
                <input type="date" value={form.dateTo} onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))} className="input-field text-xs" />
              </div>
            </div>
          </div>

          {/* Sentiment filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sentiment</label>
            <div className="flex gap-2">
              {['All', 'Positive', 'Neutral', 'Negative'].map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, filter_sentiment: s }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${form.filter_sentiment === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Risk filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Risk Level</label>
            <div className="flex gap-2">
              {['All', 'Low', 'Medium', 'High'].map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, filter_risk_level: r }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${form.filter_risk_level === r ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Report will include:</p>
            <ul className="space-y-1">
              {['Sentiment overview metrics', 'AI executive summary', 'Top negative/risk posts', 'Top positive posts'].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          {success ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Report generated!
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Generating AI Report…</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M1 10v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Generate Report</>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
