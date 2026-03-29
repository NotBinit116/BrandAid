import { createContext, useContext, useState } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw =
        localStorage.getItem('brandaid_user') ||
        sessionStorage.getItem('brandaid_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const login = async (email, password, remember = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login(email, password)
      const { access_token, user: userData } = res.data

      const stored = { ...userData, token: access_token }
      setUser(stored)

      const storage = remember ? localStorage : sessionStorage
      storage.setItem('brandaid_user', JSON.stringify(stored))

      return { success: true }
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Login failed. Please try again.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      await authService.register(email, password)
      return { success: true }
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Registration failed. Please try again.'
      setError(msg)
      return { success: false, error: msg }
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
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
} 