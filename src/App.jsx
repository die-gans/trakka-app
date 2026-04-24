import { useState, useEffect } from 'react'
import { supabase, onAuthStateChange } from './lib/supabase'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session)
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

  if (!session) {
    return <Login />
  }

  return <Dashboard />
}

export default App
