const PLATFORM_ICONS = {
  Twitter: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <path d="M.5 1h3.5l2.5 3.5L9 1h3L8 6.5 12.5 12H9L6.5 8.5 4 12H1L5.5 6.5.5 1z" />
    </svg>
  ),
  Reddit: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <circle cx="6.5" cy="6.5" r="6" />
      <path d="M9.5 6.5a1 1 0 0 0-1-1 1 1 0 0 0-.7.3A4.5 4.5 0 0 0 6.5 5a4.5 4.5 0 0 0-1.3.2A1 1 0 1 0 3.5 6.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5z" fill="white" />
    </svg>
  ),
  LinkedIn: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <rect x="1" y="4.5" width="2.5" height="7.5" />
      <circle cx="2.25" cy="2.25" r="1.25" />
      <path d="M5 4.5h2.3v1c.4-.7 1.2-1.2 2.2-1.2C11 4.3 12 5.5 12 7.3V12H9.5V7.7c0-.8-.6-1.2-1.2-1.2s-1.3.4-1.3 1.3V12H5V4.5z" />
    </svg>
  ),
  Instagram: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1" y="1" width="11" height="11" rx="3" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="9.8" cy="3.2" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Facebook: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <path d="M7.5 12V7h1.7l.3-2H7.5V3.7c0-.6.2-.9.9-.9H9.5V1c-.3 0-1.1-.1-1.9-.1-1.8 0-3 1.1-3 3.2V5H3v2h1.6v5h2.9z" />
    </svg>
  ),
  YouTube: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <path d="M12 4s-.1-1-.6-1.4c-.6-.6-1.3-.6-1.6-.7C8.2 1.8 6.5 1.8 6.5 1.8s-1.7 0-3.3.1c-.3 0-1 .1-1.6.7C1.1 3 1 4 1 4S.9 5.2.9 6.4v1.2C.9 8.8 1 10 1 10s.1 1 .6 1.4c.6.6 1.4.6 1.7.6 1.2.1 5.2.2 5.2.2s1.7 0 3.3-.2c.3 0 1-.1 1.6-.6.5-.5.6-1.4.6-1.4S14 8.8 14 7.6V6.4C14 5.2 12 4 12 4zm-7 4.5V4.5l4 2-4 2z" />
    </svg>
  ),
  TikTok: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <path d="M9 1c.2 1.5 1 2.5 2 2.8v2a5 5 0 0 1-2-.5v4a4 4 0 1 1-3-3.9V7.6a1.5 1.5 0 1 0 1 1.4V1h2z" />
    </svg>
  ),
}

const PLATFORM_COLORS = {
  Twitter: 'text-sky-500 bg-sky-50',
  Reddit: 'text-orange-500 bg-orange-50',
  LinkedIn: 'text-blue-600 bg-blue-50',
  Instagram: 'text-pink-500 bg-pink-50',
  Facebook: 'text-indigo-600 bg-indigo-50',
  YouTube: 'text-red-500 bg-red-50',
  TikTok: 'text-slate-900 bg-slate-100',
}

const RISK_BADGE = {
  low: 'badge-risk-low',
  medium: 'badge-risk-medium',
  high: 'badge-risk-high',
}

export default function PostCard({ post, onClick, compact = false }) {
  const platformColor = PLATFORM_COLORS[post.platform] || 'text-slate-500 bg-slate-100'
  const icon = PLATFORM_ICONS[post.platform]

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
        {!compact && (
          <span className={RISK_BADGE[post.riskLevel] || 'badge-risk-low'}>
            {post.riskLevel === 'high' ? '⚠ High Risk' : post.riskLevel === 'medium' ? '⚡ Medium' : '✓ Low Risk'}
          </span>
        )}
        {!compact && (
          <span className="text-xs text-slate-400">{post.date}</span>
        )}
      </div>
    </button>
  )
}
