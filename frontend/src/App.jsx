import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

import LandingSearch  from './pages/LandingSearch'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import FeedbackDetail from './pages/FeedbackDetail'
import Configurations from './pages/Configurations'
import Reports        from './pages/Reports'
import AdminPanel     from './pages/AdminPanel'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <><Navbar /><Outlet /></>
}

function AdminLayout() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <><Navbar /><Outlet /></>
}

function PublicOnlyLayout() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingSearch />} />

      <Route element={<PublicOnlyLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/feedback/:id"   element={<FeedbackDetail />} />
        <Route path="/configurations" element={<Configurations />} />
        <Route path="/reports"        element={<Reports />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
