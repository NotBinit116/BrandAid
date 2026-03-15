import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('brandaid_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password, remember = false) => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 800))
      const userData = { id: '1', email, name: email.split('@')[0], role: 'user' }
      setUser(userData)
      if (remember) {
        localStorage.setItem('brandaid_user', JSON.stringify(userData))
      } else {
        sessionStorage.setItem('brandaid_user', JSON.stringify(userData))
      }
      return { success: true }
    } catch (err) {
      setError('Login failed. Please try again.')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 800))
      return { success: true }
    } catch {
      setError('Registration failed. Please try again.')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('brandaid_user')
    sessionStorage.removeItem('brandaid_user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
