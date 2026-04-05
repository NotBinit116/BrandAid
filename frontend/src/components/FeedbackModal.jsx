import { useEffect } from 'react'

const INTENT_COLORS = {
  'PR Issue':           'bg-orange-50 text-orange-700 border-orange-200',
  'Customer Complaint': 'bg-red-50 text-red-600 border-red-200',
  'Product Feedback':   'bg-blue-50 text-blue-600 border-blue-200',
  'Data Leak':          'bg-purple-50 text-purple-700 border-purple-200',
  'Legal Issue':        'bg-rose-50 text-rose-700 border-rose-200',
  'Praise':             'bg-emerald-50 text-emerald-600 border-emerald-200',
  'General Mention':    'bg-slate-100 text-slate-500 border-slate-200',
}

const INTENT_ICONS = {
  'PR Issue':           '📢',
  'Customer Complaint': '😤',
  'Product Feedback':   '💬',
  'Data Leak':          '🔓',
  'Legal Issue':        '⚖️',
  'Praise':             '🌟',
  'General Mention':    '📰',
}

export default function FeedbackModal({ post, onClose, onReport }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!post) return null

  const sentimentMap = {
    positive: { label: 'Positive', cls: 'badge-positive' },
    neutral:  { label: 'Neutral',  cls: 'badge-neutral'  },
    negative: { label: 'Negative', cls: 'badge-negative' },
  }
  const riskMap = {
    low:    { label: 'Low Risk',    cls: 'badge-risk-low'    },
    medium: { label: 'Medium Risk', cls: 'badge-risk-medium' },
    high:   { label: 'High Risk',   cls: 'badge-risk-high'   },
  }

  const s = sentimentMap[post.sentiment] || sentimentMap.neutral
  const r = riskMap[post.riskLevel]      || riskMap.low
  const intentColor = INTENT_COLORS[post.intent] || INTENT_COLORS['General Mention']
  const intentIcon  = INTENT_ICONS[post.intent]  || '📰'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Top accent */}
        <div className={`h-1 w-full ${
          post.sentiment === 'positive' ? 'bg-emerald-400' :
          post.sentiment === 'negative' ? 'bg-red-400' : 'bg-amber-400'
        }`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Mention Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">Full feedback analysis</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={s.cls}>{s.label}</span>
            <span className={r.cls}>{r.label}</span>
            {post.intent && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${intentColor}`}>
                {intentIcon} {post.intent}
                {post.intent_confidence && (
                  <span className="opacity-60 ml-0.5">({Math.round(post.intent_confidence * 100)}%)</span>
                )}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              📅 {post.date}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              🌐 {post.platform}
            </span>
          </div>

          {/* Author */}
          {post.author && (
            <p className="text-xs text-slate-400 mb-2">
              by <span className="font-medium text-slate-600">{post.author}</span>
            </p>
          )}

          {/* Post text */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-slate-700 leading-relaxed">{post.text}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { onReport && onReport(post); onClose() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v5M7 9v1M2 13h10a1 1 0 0 0 .9-1.4L7.9 2a1 1 0 0 0-1.8 0L1.1 11.6A1 1 0 0 0 2 13z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Report Post
            </button>
            <a
              href={post.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M8 1h5m0 0v5M13 1L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              View Source
            </a>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
