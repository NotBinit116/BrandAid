import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import SentimentColumn from '../components/SentimentColumn'
import LimitedPopup from '../components/LimitedPopup'
import { publicService } from '../services/api'

export default function LandingSearch() {
  const [searched, setSearched]     = useState(false)
  const [query, setQuery]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [showPopup, setShowPopup]   = useState(false)
  const [results, setResults]       = useState(null)
  const [error, setError]           = useState('')

  const handleSearch = async (q) => {
    setLoading(true)
    setQuery(q)
    setError('')
    setResults(null)
    try {
      const res = await publicService.search(q)
      setResults(res.data)
      setSearched(true)
    } catch (err) {
      setError('Search failed. Please try again.')
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const positivePosts = results?.posts?.filter(p => p.sentiment === 'positive') || []
  const neutralPosts  = results?.posts?.filter(p => p.sentiment === 'neutral')  || []
  const negativePosts = results?.posts?.filter(p => p.sentiment === 'negative') || []
  const metrics       = results?.metrics

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      {/* Top nav */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="8" cy="8" r="2" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              Brand<span className="text-brand-500">Aid</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`transition-all duration-500 ${searched ? 'py-8' : 'py-24'}`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          {!searched && (
            <div className="animate-fade-in mb-8">
              <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                Brand Monitoring & Sentiment Analysis
              </div>
              <h1 className="font-display font-bold text-5xl text-slate-900 leading-tight mb-4">
                Know what the world<br/>says about your <span className="text-brand-500">brand</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto">
                Search any brand to instantly see sentiment across social media, forums, and news. Free preview — no account needed.
              </p>
            </div>
          )}

          {searched && results?.found && (
            <div className="mb-4 animate-fade-in">
              <h2 className="font-display font-semibold text-xl text-slate-800">
                Results for <span className="text-brand-600">"{results.brand_name}"</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {results.message}{' '}
                <button onClick={() => setShowPopup(true)} className="text-brand-500 font-semibold hover:underline">
                  Login for full access
                </button>
              </p>
            </div>
          )}

          {searched && !results?.found && !error && (
            <div className="mb-4 animate-fade-in">
              <h2 className="font-display font-semibold text-xl text-slate-800">
                No results for <span className="text-brand-600">"{query}"</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                This brand hasn't been monitored yet.{' '}
                <Link to="/register" className="text-brand-500 font-semibold hover:underline">
                  Sign up to start monitoring it
                </Link>
              </p>
            </div>
          )}

          <div className="max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder="Search a brand e.g. Apple, Tesla, Itonics…"
            />
          </div>
        </div>
      </section>

      {/* Results */}
      {searched && !loading && results?.found && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 animate-fade-in">
          {/* Stats strip */}
          {metrics && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Positive', count: metrics.positive_mentions, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                { label: 'Neutral',  count: metrics.neutral_mentions,  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200'   },
                { label: 'Negative', count: metrics.negative_mentions, color: 'text-red-600',      bg: 'bg-red-50 border-red-200'       },
              ].map(s => (
                <div key={s.label} className={`card border text-center py-4 ${s.bg}`}>
                  <p className={`font-display font-bold text-2xl ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label} mentions</p>
                  {metrics.total_mentions > s.count && (
                    <p className="text-xs text-slate-400 mt-0.5">of {metrics.total_mentions} total</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            <SentimentColumn
              sentiment="positive"
              posts={positivePosts}
              maxVisible={5}
              onViewMore={() => setShowPopup(true)}
            />
            <SentimentColumn
              sentiment="neutral"
              posts={neutralPosts}
              maxVisible={5}
              onViewMore={() => setShowPopup(true)}
            />
            <SentimentColumn
              sentiment="negative"
              posts={negativePosts}
              maxVisible={5}
              onViewMore={() => setShowPopup(true)}
            />
          </div>

          {/* CTA Banner */}
          <div className="mt-8 bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 text-white text-center">
            <h3 className="font-display font-bold text-2xl mb-2">Unlock the full picture</h3>
            <p className="text-brand-100 text-sm mb-5 max-w-md mx-auto">
              See all {metrics?.total_mentions} mentions, generate AI reports, configure alerts, and track brand health over time.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-sm">
                Start for Free
              </Link>
              <Link to="/login" className="border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Not found state */}
      {searched && !loading && !results?.found && !error && (
        <section className="max-w-2xl mx-auto px-4 pb-16">
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-display font-semibold text-slate-800 mb-2">Brand not found</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
              "{query}" hasn't been monitored yet. Sign up to add it and start tracking mentions across the web.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="btn-primary">Start Monitoring</Link>
              <Link to="/login"    className="btn-secondary">Sign In</Link>
            </div>
          </div>
        </section>
      )}

      {/* Features when not searched */}
      {!searched && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
            {[
              { icon: '🔍', title: 'Real-time Monitoring',  desc: 'Track brand mentions as they happen across YouTube, Google News, HackerNews, Trustpilot and more.' },
              { icon: '📊', title: 'Sentiment Analysis',    desc: 'AI-powered classification of positive, neutral, and negative sentiment across all mentions.' },
              { icon: '📋', title: 'AI-Generated Reports',  desc: 'Export comprehensive AI-summarised PDF reports for stakeholders and strategy sessions.' },
            ].map(f => (
              <div key={f.title} className="card text-center hover:shadow-card-hover transition-all duration-200">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {showPopup && <LimitedPopup onClose={() => setShowPopup(false)} />}
    </div>
  )
}
