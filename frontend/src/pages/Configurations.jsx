import { useState } from 'react'
import { defaultConfig, PLATFORMS } from '../data/dummyData'

export default function Configurations() {
  const [config, setConfig] = useState(defaultConfig)
  const [newKeyword, setNewKeyword] = useState('')
  const [newRiskKw, setNewRiskKw] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !config.keywords.includes(newKeyword.trim())) {
      setConfig(c => ({ ...c, keywords: [...c.keywords, newKeyword.trim()] }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (kw) => setConfig(c => ({ ...c, keywords: c.keywords.filter(k => k !== kw) }))

  const addRiskKw = () => {
    if (newRiskKw.trim() && !config.riskKeywords.includes(newRiskKw.trim())) {
      setConfig(c => ({ ...c, riskKeywords: [...c.riskKeywords, newRiskKw.trim()] }))
      setNewRiskKw('')
    }
  }

  const removeRiskKw = (kw) => setConfig(c => ({ ...c, riskKeywords: c.riskKeywords.filter(k => k !== kw) }))

  const togglePlatform = (p) => {
    setConfig(c => ({
      ...c,
      platforms: c.platforms.includes(p)
        ? c.platforms.filter(x => x !== p)
        : [...c.platforms, p]
    }))
  }

  const SectionTitle = ({ children, desc }) => (
    <div className="mb-5">
      <h2 className="font-display font-semibold text-lg text-slate-900">{children}</h2>
      {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">

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

        {/* Brand Identity */}
        <div className="card">
          <SectionTitle desc="Your primary brand information">Brand Identity</SectionTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={e => setConfig(c => ({ ...c, brandName: e.target.value }))}
                className="input-field"
                placeholder="e.g. BrandAid"
              />
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="card">
          <SectionTitle desc="Terms to monitor across platforms">Monitor Keywords</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            {config.keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors ml-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKeyword()}
              placeholder="Add a keyword…"
              className="input-field flex-1"
            />
            <button onClick={addKeyword} className="btn-primary px-4 text-sm">Add</button>
          </div>
        </div>

        {/* Social Handles */}
        <div className="card">
          <SectionTitle desc="Your brand's social media handles">Social Media Handles</SectionTitle>
          <div className="space-y-3">
            {[
              { key: 'twitter', label: 'Twitter / X', placeholder: '@handle' },
              { key: 'instagram', label: 'Instagram', placeholder: '@handle' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'Company name or URL' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={config.socialHandles[field.key] || ''}
                  onChange={e => setConfig(c => ({ ...c, socialHandles: { ...c.socialHandles, [field.key]: e.target.value } }))}
                  placeholder={field.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="card">
          <SectionTitle desc="Choose which platforms to monitor">Platforms to Monitor</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  config.platforms.includes(p)
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Keywords */}
        <div className="card">
          <SectionTitle desc="Posts containing these words will be flagged as high risk">Risk Keywords</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            {config.riskKeywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                ⚠ {kw}
                <button onClick={() => removeRiskKw(kw)} className="hover:text-red-900 transition-colors ml-0.5">
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
              onKeyDown={e => e.key === 'Enter' && addRiskKw()}
              placeholder="Add a risk keyword…"
              className="input-field flex-1"
            />
            <button onClick={addRiskKw} className="btn-danger px-4 text-sm">Add</button>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3 pb-4">
          <button
            onClick={() => setConfig(defaultConfig)}
            className="btn-secondary"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Saving…</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="white" strokeWidth="1.4"/><path d="M4 2v3h5V2M4 7h6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
