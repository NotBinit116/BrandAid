import { useState, useEffect } from 'react'
import { brandService, configService } from '../services/api'
import { PLATFORMS } from '../data/dummyData'

export default function Configurations() {
  // ── State ──────────────────────────────────────────────────
  const [brands, setBrands]           = useState([])
  const [activeBrand, setActiveBrand] = useState(null)
  const [keywords, setKeywords]       = useState([])
  const [handles, setHandles]         = useState([])
  const [platforms, setPlatforms]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [toast, setToast]             = useState(null)

  // New brand form
  const [newBrandName, setNewBrandName] = useState('')
  const [addingBrand, setAddingBrand]   = useState(false)
  const [showNewBrand, setShowNewBrand] = useState(false)

  // New keyword inputs
  const [newMonitorKw, setNewMonitorKw] = useState('')
  const [newRiskKw, setNewRiskKw]       = useState('')

  // New handle input
  const [newHandle, setNewHandle]       = useState('')
  const [newHandlePlatform, setNewHandlePlatform] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load brands + platforms on mount ───────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [brandsRes, platformsRes] = await Promise.all([
          brandService.getAll(),
          configService.getPlatforms(),
        ])
        setBrands(brandsRes.data)
        setPlatforms(platformsRes.data)
        if (brandsRes.data.length > 0) {
          setActiveBrand(brandsRes.data[0])
        }
      } catch (err) {
        showToast('Failed to load configuration', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Load keywords + handles when brand changes ─────────────
  useEffect(() => {
    if (!activeBrand) return
    const load = async () => {
      try {
        const [kwRes, handleRes] = await Promise.all([
          configService.getKeywords(activeBrand.id),
          configService.getHandles(activeBrand.id),
        ])
        setKeywords(kwRes.data)
        setHandles(handleRes.data)
      } catch {
        showToast('Failed to load brand config', 'error')
      }
    }
    load()
  }, [activeBrand])

  // ── Create brand ───────────────────────────────────────────
  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return
    setAddingBrand(true)
    try {
      const res = await brandService.create(newBrandName.trim())
      setBrands(b => [...b, res.data])
      setActiveBrand(res.data)
      setNewBrandName('')
      setShowNewBrand(false)
      showToast(`Brand "${res.data.brand_name}" created!`)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create brand', 'error')
    } finally {
      setAddingBrand(false)
    }
  }

  // ── Delete brand ───────────────────────────────────────────
  const handleDeleteBrand = async (brand) => {
    if (!confirm(`Delete brand "${brand.brand_name}"? This cannot be undone.`)) return
    try {
      await brandService.delete(brand.id)
      const remaining = brands.filter(b => b.id !== brand.id)
      setBrands(remaining)
      setActiveBrand(remaining.length > 0 ? remaining[0] : null)
      showToast(`Brand deleted`)
    } catch {
      showToast('Failed to delete brand', 'error')
    }
  }

  // ── Add keyword ────────────────────────────────────────────
  const handleAddKeyword = async (keyword, type) => {
    if (!keyword.trim() || !activeBrand) return
    try {
      const res = await configService.addKeyword(activeBrand.id, keyword.trim(), type)
      setKeywords(k => [...k, res.data])
      if (type === 'monitor') setNewMonitorKw('')
      else setNewRiskKw('')
      showToast('Keyword added')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to add keyword', 'error')
    }
  }

  // ── Delete keyword ─────────────────────────────────────────
  const handleDeleteKeyword = async (kw) => {
    try {
      await configService.deleteKeyword(activeBrand.id, kw.id)
      setKeywords(k => k.filter(x => x.id !== kw.id))
    } catch {
      showToast('Failed to delete keyword', 'error')
    }
  }

  // ── Add handle ─────────────────────────────────────────────
  const handleAddHandle = async () => {
    if (!newHandle.trim() || !newHandlePlatform || !activeBrand) return
    try {
      const res = await configService.addHandle(activeBrand.id, Number(newHandlePlatform), newHandle.trim())
      setHandles(h => {
        const existing = h.findIndex(x => x.platform_id === Number(newHandlePlatform))
        if (existing >= 0) {
          const updated = [...h]
          updated[existing] = res.data
          return updated
        }
        return [...h, res.data]
      })
      setNewHandle('')
      setNewHandlePlatform('')
      showToast('Handle saved')
    } catch {
      showToast('Failed to save handle', 'error')
    }
  }

  // ── Delete handle ──────────────────────────────────────────
  const handleDeleteHandle = async (handle) => {
    try {
      await configService.deleteHandle(activeBrand.id, handle.id)
      setHandles(h => h.filter(x => x.id !== handle.id))
    } catch {
      showToast('Failed to delete handle', 'error')
    }
  }

  const monitorKeywords = keywords.filter(k => k.keyword_type === 'monitor')
  const riskKeywords    = keywords.filter(k => k.keyword_type === 'risk')

  const getPlatformName = (platform_id) => {
    const p = platforms.find(p => p.id === platform_id)
    return p ? p.name : `Platform ${platform_id}`
  }

  const SectionTitle = ({ children, desc }) => (
    <div className="mb-5">
      <h2 className="font-display font-semibold text-lg text-slate-900">{children}</h2>
      {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#eef1f6] flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Configurations</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your brand monitoring settings</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 animate-fade-in">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Saved!
            </div>
          )}
        </div>

        {/* Brand selector */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle desc="Select or create a brand to configure">Active Brand</SectionTitle>
            <button
              onClick={() => setShowNewBrand(s => !s)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
              New Brand
            </button>
          </div>

          {/* New brand form */}
          {showNewBrand && (
            <div className="flex gap-2 mb-4 animate-fade-in">
              <input
                type="text"
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateBrand()}
                placeholder="Brand name e.g. Itonics"
                className="input-field flex-1"
                autoFocus
              />
              <button
                onClick={handleCreateBrand}
                disabled={addingBrand || !newBrandName.trim()}
                className="btn-primary px-4 text-sm disabled:opacity-60"
              >
                {addingBrand ? 'Creating…' : 'Create'}
              </button>
              <button onClick={() => setShowNewBrand(false)} className="btn-secondary px-3 text-sm">Cancel</button>
            </div>
          )}

          {/* Brand list */}
          {brands.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No brands yet — create your first one above.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {brands.map(b => (
                <div
                  key={b.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                    activeBrand?.id === b.id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                  onClick={() => setActiveBrand(b)}
                >
                  {b.brand_name}
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteBrand(b) }}
                    className={`ml-1 hover:text-red-400 transition-colors ${activeBrand?.id === b.id ? 'text-white/70' : 'text-slate-400'}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeBrand && (
          <>
            {/* Monitor Keywords */}
            <div className="card">
              <SectionTitle desc="Terms to search for across platforms">Monitor Keywords</SectionTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                {monitorKeywords.length === 0 && (
                  <p className="text-slate-400 text-xs">No monitor keywords yet.</p>
                )}
                {monitorKeywords.map(kw => (
                  <span key={kw.id} className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {kw.keyword}
                    <button onClick={() => handleDeleteKeyword(kw)} className="hover:text-red-500 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMonitorKw}
                  onChange={e => setNewMonitorKw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddKeyword(newMonitorKw, 'monitor')}
                  placeholder="Add a keyword…"
                  className="input-field flex-1"
                />
                <button onClick={() => handleAddKeyword(newMonitorKw, 'monitor')} className="btn-primary px-4 text-sm">Add</button>
              </div>
            </div>

            {/* Risk Keywords */}
            <div className="card">
              <SectionTitle desc="Posts containing these words will be flagged as high risk">Risk Keywords</SectionTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                {riskKeywords.length === 0 && (
                  <p className="text-slate-400 text-xs">No risk keywords yet.</p>
                )}
                {riskKeywords.map(kw => (
                  <span key={kw.id} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    ⚠ {kw.keyword}
                    <button onClick={() => handleDeleteKeyword(kw)} className="hover:text-red-900 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRiskKw}
                  onChange={e => setNewRiskKw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddKeyword(newRiskKw, 'risk')}
                  placeholder="Add a risk keyword…"
                  className="input-field flex-1"
                />
                <button onClick={() => handleAddKeyword(newRiskKw, 'risk')} className="btn-danger px-4 text-sm">Add</button>
              </div>
            </div>

            {/* Social Handles */}
            <div className="card">
              <SectionTitle desc="Your brand's social media handles">Social Media Handles</SectionTitle>

              {/* Existing handles */}
              {handles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {handles.map(h => (
                    <span key={h.id} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {getPlatformName(h.platform_id)}: {h.handle}
                      <button onClick={() => handleDeleteHandle(h)} className="hover:text-red-500 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add handle */}
              <div className="flex gap-2">
                <select
                  value={newHandlePlatform}
                  onChange={e => setNewHandlePlatform(e.target.value)}
                  className="input-field w-auto min-w-[140px] text-sm"
                >
                  <option value="">Platform…</option>
                  {platforms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newHandle}
                  onChange={e => setNewHandle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddHandle()}
                  placeholder="@handle or URL"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddHandle}
                  disabled={!newHandle.trim() || !newHandlePlatform}
                  className="btn-primary px-4 text-sm disabled:opacity-60"
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        } text-white`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {toast.msg}
        </div>
      )}
    </div>
  )
}