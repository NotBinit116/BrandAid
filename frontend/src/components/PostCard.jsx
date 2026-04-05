const PLATFORM_ICONS = {
  Twitter:    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M.5 1h3.5l2.5 3.5L9 1h3L8 6.5 12.5 12H9L6.5 8.5 4 12H1L5.5 6.5.5 1z"/></svg>,
  Reddit:     <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><circle cx="6.5" cy="6.5" r="6"/><path d="M9.5 6.5a1 1 0 0 0-1-1 1 1 0 0 0-.7.3A4.5 4.5 0 0 0 6.5 5a4.5 4.5 0 0 0-1.3.2A1 1 0 1 0 3.5 6.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5z" fill="white"/></svg>,
  LinkedIn:   <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><rect x="1" y="4.5" width="2.5" height="7.5"/><circle cx="2.25" cy="2.25" r="1.25"/><path d="M5 4.5h2.3v1c.4-.7 1.2-1.2 2.2-1.2C11 4.3 12 5.5 12 7.3V12H9.5V7.7c0-.8-.6-1.2-1.2-1.2s-1.3.4-1.3 1.3V12H5V4.5z"/></svg>,
  Instagram:  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="11" height="11" rx="3"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="9.8" cy="3.2" r="0.5" fill="currentColor" stroke="none"/></svg>,
  Facebook:   <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M7.5 12V7h1.7l.3-2H7.5V3.7c0-.6.2-.9.9-.9H9.5V1c-.3 0-1.1-.1-1.9-.1-1.8 0-3 1.1-3 3.2V5H3v2h1.6v5h2.9z"/></svg>,
  YouTube:    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M12 4s-.1-1-.6-1.4c-.6-.6-1.3-.6-1.6-.7C8.2 1.8 6.5 1.8 6.5 1.8s-1.7 0-3.3.1c-.3 0-1 .1-1.6.7C1.1 3 1 4 1 4S.9 5.2.9 6.4v1.2C.9 8.8 1 10 1 10s.1 1 .6 1.4c.6.6 1.4.6 1.7.6 1.2.1 5.2.2 5.2.2s1.7 0 3.3-.2c.3 0 1-.1 1.6-.6.5-.5.6-1.4.6-1.4S14 8.8 14 7.6V6.4C14 5.2 12 4 12 4zm-7 4.5V4.5l4 2-4 2z"/></svg>,
  X:          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d=".5 1h3.5l2.5 3.5L9 1h3L8 6.5 12.5 12H9L6.5 8.5 4 12H1L5.5 6.5.5 1z"/></svg>,
  'Google News': <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M6.5 1a5.5 5.5 0 1 0 0 11A5.5 5.5 0 0 0 6.5 1zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm-1 2v5l4-2.5L5.5 4z"/></svg>,
  HackerNews: <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><rect width="13" height="13" rx="2" fill="#ff6600"/><path d="M3 3h1.5l2 3.5 2-3.5H10L7.5 7.5V10h-2V7.5L3 3z" fill="white"/></svg>,
  Trustpilot: <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M6.5 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6.5 9 4 10.5l.5-3.5L2 4.5l3.5-.5z" fill="#00b67a"/></svg>,
}

const PLATFORM_COLORS = {
  Twitter:      'text-sky-500 bg-sky-50',
  Reddit:       'text-orange-500 bg-orange-50',
  LinkedIn:     'text-blue-600 bg-blue-50',
  Instagram:    'text-pink-500 bg-pink-50',
  Facebook:     'text-indigo-600 bg-indigo-50',
  YouTube:      'text-red-500 bg-red-50',
  X:            'text-slate-900 bg-slate-100',
  'Google News':'text-blue-500 bg-blue-50',
  HackerNews:   'text-orange-600 bg-orange-50',
  Trustpilot:   'text-green-600 bg-green-50',
}

const INTENT_COLORS = {
  'PR Issue':           'bg-orange-50 text-orange-700',
  'Customer Complaint': 'bg-red-50 text-red-600',
  'Product Feedback':   'bg-blue-50 text-blue-600',
  'Data Leak':          'bg-purple-50 text-purple-700',
  'Legal Issue':        'bg-rose-50 text-rose-700',
  'Praise':             'bg-emerald-50 text-emerald-600',
  'General Mention':    'bg-slate-100 text-slate-500',
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

const RISK_BADGE = {
  low:    'badge-risk-low',
  medium: 'badge-risk-medium',
  high:   'badge-risk-high',
}

export default function PostCard({ post, onClick, compact = false }) {
  const platformColor = PLATFORM_COLORS[post.platform] || 'text-slate-500 bg-slate-100'
  const icon          = PLATFORM_ICONS[post.platform]
  const intentColor   = INTENT_COLORS[post.intent] || INTENT_COLORS['General Mention']
  const intentIcon    = INTENT_ICONS[post.intent]  || '📰'

  return (
    <button
      onClick={() => onClick && onClick(post)}
      className="w-full text-left bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 group active:scale-[0.99] cursor-pointer"
    >
      <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 mb-3 group-hover:text-slate-900 transition-colors">
        {post.text}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${platformColor}`}>
          {icon}
          {post.platform}
        </span>

        {!compact && post.intent && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${intentColor}`}>
            {intentIcon} {post.intent}
          </span>
        )}

        {!compact && (
          <span className={RISK_BADGE[post.riskLevel] || 'badge-risk-low'}>
            {post.riskLevel === 'high' ? '⚠ High' : post.riskLevel === 'medium' ? '⚡ Med' : '✓ Low'}
          </span>
        )}

        {!compact && (
          <span className="text-xs text-slate-400">{post.date}</span>
        )}
      </div>
    </button>
  )
}
