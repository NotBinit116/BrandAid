import { PLATFORMS } from '../data/dummyData'

const INTENTS = [
  'PR Issue',
  'Customer Complaint',
  'Product Feedback',
  'Data Leak',
  'Legal Issue',
  'Praise',
  'General Mention',
]

const INTENT_COLORS = {
  'PR Issue':           'bg-orange-50 text-orange-700 border-orange-200',
  'Customer Complaint': 'bg-red-50 text-red-700 border-red-200',
  'Product Feedback':   'bg-blue-50 text-blue-700 border-blue-200',
  'Data Leak':          'bg-purple-50 text-purple-700 border-purple-200',
  'Legal Issue':        'bg-rose-50 text-rose-700 border-rose-200',
  'Praise':             'bg-emerald-50 text-emerald-700 border-emerald-200',
  'General Mention':    'bg-slate-50 text-slate-600 border-slate-200',
}

export default function FilterBar({ filters, onChange, onReset }) {
  const handleChange = (key, value) => onChange({ ...filters, [key]: value })

  const hasActiveFilters =
    filters.platform !== 'All' ||
    filters.sentiment !== 'All' ||
    filters.riskLevel !== 'All' ||
    filters.intent    !== 'All' ||
    filters.dateFrom  ||
    filters.dateTo

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Reset all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={e => handleChange('dateFrom', e.target.value)}
            className="input-field text-xs py-2 w-36"
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={e => handleChange('dateTo', e.target.value)}
            className="input-field text-xs py-2 w-36"
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

        {/* Intent */}
        <select
          value={filters.intent || 'All'}
          onChange={e => handleChange('intent', e.target.value)}
          className="input-field text-xs py-2 w-auto min-w-[160px]"
        >
          <option value="All">All Intents</option>
          {INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Active intent badge */}
      {filters.intent && filters.intent !== 'All' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtering by intent:</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${INTENT_COLORS[filters.intent] || 'bg-slate-100 text-slate-600'}`}>
            {filters.intent}
            <button onClick={() => handleChange('intent', 'All')} className="hover:opacity-70">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
