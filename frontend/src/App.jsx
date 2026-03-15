import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

// Pages
import LandingSearch  from './pages/LandingSearch'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import FeedbackDetail from './pages/FeedbackDetail'
import Configurations from './pages/Configurations'
import Reports        from './pages/Reports'

// Protected layout: requires auth
function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

// Public-only layout: redirect if already logged in (for login/register)
function PublicOnlyLayout() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingSearch />} />

      {/* Auth pages (redirect to dashboard if logged in) */}
      <Route element={<PublicOnlyLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected pages */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/feedback/:id"   element={<FeedbackDetail />} />
        <Route path="/configurations" element={<Configurations />} />
        <Route path="/reports"        element={<Reports />} />
      </Route>

      {/* Catch-all */}
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
