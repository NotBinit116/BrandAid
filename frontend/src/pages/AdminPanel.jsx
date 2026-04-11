import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminPanel() {
  const [users, setUsers]   = useState([])
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast]   = useState(null)
  const [tab, setTab]       = useState('users')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
        ])
        setUsers(usersRes.data)
        setStats(statsRes.data)
      } catch (err) {
        if (err.response?.status === 403) {
          showToast('Admin access required', 'error')
        } else {
          showToast('Failed to load admin data', 'error')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`)
      setUsers(u => u.map(user => user.id === userId ? { ...user, role: newRole } : user))
      showToast('Role updated')
    } catch {
      showToast('Failed to update role', 'error')
    }
  }

  const handleDelete = async (userId, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(u => u.filter(user => user.id !== userId))
      showToast('User deleted')
    } catch {
      showToast('Failed to delete user', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">System management and user administration</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {[
              { label: 'Total Users',   value: stats.total_users,   icon: '👥' },
              { label: 'Total Brands',  value: stats.total_brands,  icon: '🏷️' },
              { label: 'Total Mentions',value: stats.total_content, icon: '📊' },
              { label: 'Positive Rate',
                value: stats.total_content > 0
                  ? `${Math.round(stats.sentiment.positive / stats.total_content * 100)}%`
                  : '0%',
                icon: '😊'
              },
            ].map(m => (
              <div key={m.label} className="card">
                <span className="text-2xl">{m.icon}</span>
                <p className="font-display font-bold text-3xl text-slate-900 mt-2">{m.value}</p>
                <p className="text-sm text-slate-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sentiment breakdown */}
        {stats && (
          <div className="card">
            <h2 className="font-display font-semibold text-slate-900 mb-4">System Sentiment Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Positive', value: stats.sentiment.positive, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Neutral',  value: stats.sentiment.neutral,  color: 'text-amber-600',   bg: 'bg-amber-50'   },
                { label: 'Negative', value: stats.sentiment.negative, color: 'text-red-600',      bg: 'bg-red-50'     },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                  <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Intent breakdown */}
            {stats.intents && Object.keys(stats.intents).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-600 mb-2">Intent Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.intents)
                    .sort((a, b) => b[1] - a[1])
                    .map(([intent, count]) => (
                      <span key={intent} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                        {intent}: <span className="font-bold">{count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users table */}
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-900">User Management</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{users.length} users</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['ID', 'Email', 'Role', 'Brands', 'Mentions', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-slate-400">#{user.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-800">{user.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer ${
                            user.role === 'admin'
                              ? 'bg-brand-50 text-brand-700 border-brand-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{user.brand_count}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{user.content_count?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{user.created_at?.slice(0,10)}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all border border-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
