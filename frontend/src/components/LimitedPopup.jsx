import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function LimitedPopup({ onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L25 8V20L14 25L3 20V8L14 3Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="14" cy="14" r="4" fill="white" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl mb-1">Unlock Full Access</h2>
          <p className="text-brand-100 text-sm">You're viewing a limited preview</p>
        </div>

        <div className="p-6">
          <ul className="space-y-2 mb-6">
            {[
              'View unlimited brand mentions',
              'Advanced sentiment analytics',
              'Generate detailed reports',
              'Configure brand monitoring',
              'Real-time alerts',
            ].map(feat => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {feat}
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary flex-1"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary flex-1"
            >
              Register
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            Continue with preview
          </button>
        </div>
      </div>
    </div>
  )
}
