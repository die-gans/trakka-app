import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, authError } = useAuth()
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    // If the user is authenticated, redirect them to the dashboard
    if (isAuthenticated) {
      // Auth successful, navigating home
      navigate('/', { replace: true })
      return
    }

    // Check if there's an error in the URL (e.g., from an OAuth failure)
    const params = new URLSearchParams(location.search)
    const errorDescription = params.get('error_description')
    if (errorDescription) {
      requestAnimationFrame(() => setLocalError(errorDescription))
      return
    }

    // We rely on AuthContext's getSession() to automatically process the URL
    // due to detectSessionInUrl: true in supabase.js.
    // We just set a timeout in case it fails silently or no session is found
    const timeoutId = setTimeout(() => {
      // After 4 seconds, if still not authenticated, kick back to login
      if (!isAuthenticated) {
        // Timeout waiting for session, redirecting to login
        navigate('/login', { replace: true })
      }
    }, 4000)

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, navigate, location])

  const displayError = authError || localError

  if (displayError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="border border-critical bg-critical-soft p-6 text-center">
          <div className="text-[12px] font-bold text-critical">Sign-in failed</div>
          <div className="mt-2 text-[11px] text-text-secondary">{displayError}</div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 border border-border-default bg-bg-panel px-4 py-2 text-[11px] font-bold text-text-primary"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
      <div className="text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-info">
          Authenticating...
        </div>
        <div className="mt-2 text-[11px] text-text-secondary">
          Establishing secure session
        </div>
      </div>
    </div>
  )
}
