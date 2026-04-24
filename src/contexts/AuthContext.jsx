import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, onAuthStateChange } from '../lib/supabase'

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

const DEV_USER = {
  id: 'dev-user-001',
  email: 'dev@trakka.local',
  user_metadata: { full_name: 'Dev Operator', avatar_url: null },
}

const DEV_SESSION = {
  access_token: 'dev-token',
  refresh_token: 'dev-refresh',
  expires_at: Date.now() / 1000 + 86400,
  user: DEV_USER,
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(DEV_BYPASS ? DEV_SESSION : null)
  const [user, setUser] = useState(DEV_BYPASS ? DEV_USER : null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (DEV_BYPASS) {
      setSession(DEV_SESSION)
      setUser(DEV_USER)
      setLoading(false)
      return
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setAuthError(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user,
    loading,
    authError,
    setAuthError,
    isAuthenticated: DEV_BYPASS || !!session,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
