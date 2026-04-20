import PostCard from './PostCard'

const COLUMN_CONFIG = {
  positive: {
    label: 'Positive', emoji: '😊',
    dotColor:   'bg-emerald-500',
    headerBg:   'bg-emerald-50 border-emerald-200',
    headerText: 'text-emerald-700',
    countBg:    'bg-emerald-100 text-emerald-700',
    emptyText:  'No positive mentions found.',
  },
  neutral: {
    label: 'Neutral', emoji: '😐',
    dotColor:   'bg-amber-400',
    headerBg:   'bg-amber-50 border-amber-200',
    headerText: 'text-amber-700',
    countBg:    'bg-amber-100 text-amber-700',
    emptyText:  'No neutral mentions found.',
  },
  negative: {
    label: 'Negative', emoji: '😞',
    dotColor:   'bg-red-500',
    headerBg:   'bg-red-50 border-red-200',
    headerText: 'text-red-700',
    countBg:    'bg-red-100 text-red-700',
    emptyText:  'No negative mentions found.',
  },
}

export default function SentimentColumn({
  sentiment,
  posts,         // already paginated — do NOT slice again
  totalCount,    // total unsliced count for header badge
  onPostClick,
  onViewMore,
  flaggedAuthors = [],
}) {
  const cfg = COLUMN_CONFIG[sentiment]

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${cfg.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
          <span className={`font-display font-semibold text-sm ${cfg.headerText}`}>
            {cfg.emoji} {cfg.label}
          </span>
        </div>
        {/* Show total count, not paginated count */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.countBg}`}>
          {totalCount ?? posts.length}
        </span>
      </div>

      {/* Cards — no slicing, Dashboard controls what arrives here */}
      <div className="flex flex-col gap-2.5">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            {cfg.emptyText}
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={onPostClick}
              flaggedAuthors={flaggedAuthors}
            />
          ))
        )}
      </div>

      {/* View More (guest preview only) */}
      {onViewMore && (
        <button
          onClick={onViewMore}
          className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition-all ${cfg.headerBg} ${cfg.headerText} hover:opacity-80 border-dashed`}
        >
          View more
        </button>
      )}
    </div>
  )
}
