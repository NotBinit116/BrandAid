import { useParams, useNavigate } from 'react-router-dom'
import { dummyPosts } from '../data/dummyData'

export default function FeedbackDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const post = dummyPosts.find(p => p.id === id)

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-500 text-lg mb-4">Post not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
      </div>
    </div>
  )

  const sentimentMap = { positive: { label: 'Positive', cls: 'badge-positive' }, neutral: { label: 'Neutral', cls: 'badge-neutral' }, negative: { label: 'Negative', cls: 'badge-negative' } }
  const riskMap = { low: { label: 'Low Risk', cls: 'badge-risk-low' }, medium: { label: 'Medium Risk', cls: 'badge-risk-medium' }, high: { label: 'High Risk', cls: 'badge-risk-high' } }
  const s = sentimentMap[post.sentiment]
  const r = riskMap[post.riskLevel]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 2L3 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </button>
      <div className="card">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={s.cls}>{s.label}</span>
          <span className={r.cls}>{r.label}</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{post.platform}</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{post.date}</span>
        </div>
        {post.author && <p className="text-xs text-slate-400 mb-3">by <span className="font-medium text-slate-600">{post.author}</span></p>}
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <p className="text-slate-700 leading-relaxed">{post.text}</p>
        </div>
        <div className="flex gap-3">
          <a href={post.source} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm flex items-center gap-2">
            View Source
          </a>
          <button onClick={() => navigate(-1)} className="btn-secondary text-sm">Back</button>
        </div>
      </div>
    </div>
  )
}
