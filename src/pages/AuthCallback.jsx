import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForSession } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setAuthError, isAuthenticated } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    // If we're already authenticated, or just became authenticated, go home
    if (isAuthenticated) {
      console.log('AuthCallback: Authenticated, navigating home')
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code from URL query params
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (!code) {
          console.warn('AuthCallback: No code in URL')
          // No code present — redirect to login
          navigate('/login', { replace: true })
          return
        }

        console.log('AuthCallback: Exchanging code for session...')
        await exchangeCodeForSession(code)
        console.log('AuthCallback: Code exchange complete. Waiting for AuthContext...')
        // Success — we don't navigate immediately here.
        // We let the useEffect(isAuthenticated) handle the navigation 
        // to ensure the rest of the app "sees" the login.
      } catch (err) {
        console.error('AuthCallback error:', err)
        const message = err.message || 'Failed to sign in'
        setError(message)
        setAuthError(message)
      }
    }

    // Only run if not already authenticated
    if (!isAuthenticated) {
      handleCallback()
    }
  }, [navigate, setAuthError, isAuthenticated])

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="border border-critical bg-critical-soft p-6 text-center">
          <div className="text-[12px] font-bold text-critical">Sign-in failed</div>
          <div className="mt-2 text-[11px] text-text-secondary">{error}</div>
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
          Exchanging credentials with command
        </div>
      </div>
    </div>
  )
}
