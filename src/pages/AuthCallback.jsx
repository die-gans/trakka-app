import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForSession } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code from URL query params
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (!code) {
          // No code present — maybe we're using hash-based auth
          // Supabase client with detectSessionInUrl: true handles this automatically
          navigate('/')
          return
        }

        await exchangeCodeForSession(code)
        navigate('/')
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Failed to sign in')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="border border-critical bg-critical-soft p-6 text-center">
          <div className="text-[12px] font-bold text-critical">Sign-in failed</div>
          <div className="mt-2 text-[11px] text-text-secondary">{error}</div>
          <button
            onClick={() => window.location.href = '/'}
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
