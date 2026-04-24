import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function PublicRoute({ children }) {
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

  if (isAuthenticated) {
    // Redirect to where they came from, or dashboard
    const from = location.state?.from || '/'
    return <Navigate to={from} replace />
  }

  return children
}
