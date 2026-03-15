import { PLATFORMS } from '../data/dummyData'

export default function FilterBar({ filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = filters.platform !== 'All' || filters.sentiment !== 'All' || filters.riskLevel !== 'All' || filters.dateFrom || filters.dateTo

  return (
    <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 shrink-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Filters
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={e => handleChange('dateFrom', e.target.value)}
          className="input-field text-xs py-2 w-36"
          placeholder="From"
        />
        <span className="text-slate-400 text-xs">—</span>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={e => handleChange('dateTo', e.target.value)}
          className="input-field text-xs py-2 w-36"
          placeholder="To"
        />
      </div>

      {/* Platform */}
      <select
        value={filters.platform || 'All'}
        onChange={e => handleChange('platform', e.target.value)}
        className="input-field text-xs py-2 w-auto min-w-[140px]"
      >
        <option value="All">All Platforms</option>
        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Sentiment */}
      <select
        value={filters.sentiment || 'All'}
        onChange={e => handleChange('sentiment', e.target.value)}
        className="input-field text-xs py-2 w-auto"
      >
        <option value="All">All Sentiments</option>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </select>

      {/* Risk */}
      <select
        value={filters.riskLevel || 'All'}
        onChange={e => handleChange('riskLevel', e.target.value)}
        className="input-field text-xs py-2 w-auto"
      >
        <option value="All">All Risk Levels</option>
        <option value="low">Low Risk</option>
        <option value="medium">Medium Risk</option>
        <option value="high">High Risk</option>
      </select>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Reset
        </button>
      )}
    </div>
  )
}
