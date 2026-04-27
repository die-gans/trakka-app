import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForSession, supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setAuthError } = useAuth()
  const [error, setError] = useState(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        // If no code in URL, check if we already have a session (e.g. page refresh after exchange)
        if (!code) {
          console.log('AuthCallback: No code in URL, checking existing session...')
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            console.log('AuthCallback: Existing session found, navigating home')
            navigate('/', { replace: true })
          } else {
            console.warn('AuthCallback: No code and no session — redirecting to login')
            navigate('/login', { replace: true })
          }
          return
        }

        console.log('AuthCallback: Exchanging code for session...')
        await exchangeCodeForSession(code)

        // Verify the session was actually established
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('AuthCallback: Session confirmed, navigating home')
          navigate('/', { replace: true })
        } else {
          console.error('AuthCallback: Code exchanged but no session found')
          throw new Error('Authentication succeeded but session was not established. Please try again.')
        }
      } catch (err) {
        console.error('AuthCallback error:', err)
        const message = err.message || 'Failed to sign in'
        setError(message)
        setAuthError(message)
      }
    }

    handleCallback()
  }, [navigate, setAuthError])

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
