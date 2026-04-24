import { useState, useEffect } from 'react'
import { supabase, onAuthStateChange, exchangeCodeForSession } from './lib/supabase'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Handle OAuth callback if present
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        try {
          await exchangeCodeForSession(code)
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.error('Auth callback failed:', err)
          setAuthError(err.message || 'Sign-in failed')
        }
      }
    }

    handleCallback()

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthError(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-info">
          Loading TRAKKA...
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="border border-critical bg-critical-soft p-6 text-center">
          <div className="text-[12px] font-bold text-critical">Sign-in failed</div>
          <div className="mt-2 text-[11px] text-text-secondary">{authError}</div>
          <button
            onClick={() => { setAuthError(null); window.location.href = '/'; }}
            className="mt-4 border border-border-default bg-bg-panel px-4 py-2 text-[11px] font-bold text-text-primary"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return <Dashboard />
}

export default App
