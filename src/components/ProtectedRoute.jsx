import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-info">
          Loading TRAKKA...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login, but save where they were going
    console.log('ProtectedRoute: Access denied to', location.pathname, '- Redirecting to /login')
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
