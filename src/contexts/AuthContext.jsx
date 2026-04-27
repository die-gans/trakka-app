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
          } else {
            console.warn('Dev bypass: Anonymous sign-in failed, falling back to local mock.', error)
            // Local mock user for development
            const mockUser = {
              id: '00000000-0000-0000-0000-000000000000',
              email: 'dev@trakka.app',
              user_metadata: { full_name: 'Dev User' },
              role: 'authenticated'
            }
            const mockSession = {
              user: mockUser,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
            setSession(mockSession)
            setUser(mockUser)
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
