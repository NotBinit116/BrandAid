import { useEffect, useState } from 'react'

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

const PLATFORM_REPORT_INSTRUCTIONS = {
  YouTube: {
    icon: '▶️',
    color: 'bg-red-50 border-red-200',
    steps: [
      'Click the three-dot menu (⋮) below the video or comment',
      'Select "Report"',
      'Choose the most appropriate reason',
      'Add details if prompted and submit',
    ],
    tip: 'For comments, hover over the comment first to see the ⋮ menu',
  },
  Reddit: {
    icon: '🤖',
    color: 'bg-orange-50 border-orange-200',
    steps: [
      'Click the three-dot menu (•••) below the post or comment',
      'Select "Report"',
      'Choose a report category',
      'Submit your report',
    ],
    tip: 'Reddit moderators review all reports within 24-48 hours',
  },
  Twitter: {
    icon: '🐦',
    color: 'bg-sky-50 border-sky-200',
    steps: [
      'Click the three-dot menu (•••) on the tweet',
      'Select "Report Tweet"',
      'Choose the reason that best applies',
      'Follow the prompts to complete',
    ],
    tip: 'You can also block the account after reporting',
  },
  X: {
    icon: '✖️',
    color: 'bg-slate-50 border-slate-200',
    steps: [
      'Click the three-dot menu (•••) on the post',
      'Select "Report post"',
      'Choose the reason that best applies',
      'Follow the prompts to complete',
    ],
    tip: 'You can also block the account after reporting',
  },
  'Google News': {
    icon: '📰',
    color: 'bg-blue-50 border-blue-200',
    steps: [
      'Click the three-dot menu (⋮) next to the article',
      'Select "Report a problem with this article"',
      'Choose the issue type',
      'Submit your feedback',
    ],
    tip: 'Google News reports help improve article recommendations',
  },
  HackerNews: {
    icon: '🟧',
    color: 'bg-orange-50 border-orange-200',
    steps: [
      'Click the "flag" link below the post or comment',
      'If no flag link is visible, you need more karma on HN',
      'Alternatively, email hn@ycombinator.com with the URL',
    ],
    tip: 'Flag link appears when you have 30+ HN karma points',
  },
  Trustpilot: {
    icon: '⭐',
    color: 'bg-green-50 border-green-200',
    steps: [
      'Click "Report review" below the review',
      'Select the reason for reporting',
      'Provide additional details if needed',
      'Click "Submit report"',
    ],
    tip: 'Trustpilot investigates all reports within 7 business days',
  },
  LinkedIn: {
    icon: '💼',
    color: 'bg-blue-50 border-blue-200',
    steps: [
      'Click the three-dot menu (•••) on the post',
      'Select "Report post"',
      'Choose the most relevant reason',
      'Submit the report',
    ],
    tip: 'LinkedIn reviews all reports within 3-5 business days',
  },
  Facebook: {
    icon: '👤',
    color: 'bg-indigo-50 border-indigo-200',
    steps: [
      'Click the three-dot menu (•••) on the post',
      'Select "Find support or report post"',
      'Choose the issue category',
      'Follow the on-screen instructions',
    ],
    tip: 'Facebook may ask for additional context about your report',
  },
}

const DEFAULT_INSTRUCTIONS = {
  icon: '🌐',
  color: 'bg-slate-50 border-slate-200',
  steps: [
    'Open the source link in a new tab',
    'Look for a "Report", "Flag" or three-dot (⋮) menu',
    'Select the most appropriate reason',
    'Submit your report',
  ],
  tip: 'Most platforms have a report option in the post menu',
}

export default function FeedbackModal({ post, onClose, onReport }) {
  const [showReportPanel, setShowReportPanel] = useState(false)
  const [opened, setOpened]                   = useState(false)

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

  const s           = sentimentMap[post.sentiment] || sentimentMap.neutral
  const r           = riskMap[post.riskLevel]      || riskMap.low
  const intentColor = INTENT_COLORS[post.intent]   || INTENT_COLORS['General Mention']
  const intentIcon  = INTENT_ICONS[post.intent]    || '📰'
  const isHighRisk  = post.riskLevel === 'high'
  const instructions = PLATFORM_REPORT_INSTRUCTIONS[post.platform] || DEFAULT_INSTRUCTIONS

  const handleOpenReport = () => {
    // Open source in new tab
    if (post.source) {
      window.open(post.source, '_blank', 'noopener,noreferrer')
    }
    setOpened(true)
    setShowReportPanel(true)
    onReport && onReport(post)
  }

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

          {/* High risk banner */}
          {isHighRisk && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fade-in">
              <span className="text-red-500 text-lg">⚠</span>
              <div>
                <p className="text-sm font-semibold text-red-700">High Risk Post</p>
                <p className="text-xs text-red-500">This post has been flagged as potentially harmful to brand reputation.</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                {showReportPanel ? 'How to Report This Post' : 'Mention Details'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {showReportPanel ? `Instructions for ${post.platform}` : 'Full feedback analysis'}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* ── Detail view ─────────────────────────────────── */}
          {!showReportPanel && (
            <>
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
                  onClick={handleOpenReport}
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
            </>
          )}

          {/* ── Report instructions panel ────────────────────── */}
          {showReportPanel && (
            <div className="animate-fade-in">
              {/* Opened confirmation */}
              {opened && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-700 font-medium">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Source opened in a new tab
                </div>
              )}

              {/* Platform instructions */}
              <div className={`border rounded-xl p-4 mb-4 ${instructions.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{instructions.icon}</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    Steps to report on {post.platform}:
                  </span>
                </div>
                <ol className="space-y-2">
                  {instructions.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                {instructions.tip && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-500">
                    <span>💡</span>
                    <span>{instructions.tip}</span>
                  </div>
                )}
              </div>

              {/* Post reference */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-slate-400 mb-1">Post being reported:</p>
                <p className="text-xs text-slate-600 line-clamp-2">{post.text}</p>
                {post.author && (
                  <p className="text-xs text-slate-400 mt-1">by {post.author}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={post.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M8 1h5m0 0v5M13 1L6 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Go to {post.platform} to Report
                </a>
                <button
                  onClick={() => setShowReportPanel(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
