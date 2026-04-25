import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, onAuthStateChange } from '../lib/supabase'

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (DEV_BYPASS) {
      // Sign in anonymously so supabase.auth.getUser() returns a real JWT
      // and RLS policies (auth.uid()) work correctly in the database
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setSession(session)
          setUser(session.user)
        } else {
          const { data, error } = await supabase.auth.signInAnonymously()
          if (!error) {
            setSession(data.session)
            setUser(data.user)
          }
        }
        setLoading(false)
      })
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
    isAuthenticated: !!session,
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
