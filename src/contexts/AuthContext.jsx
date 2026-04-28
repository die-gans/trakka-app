import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, onAuthStateChange } from '../lib/supabase'

const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (DEV_BYPASS) {
      // Dev bypass: prefer existing session, then anonymous, then password, then mock
      const DEV_EMAIL = import.meta.env.VITE_DEV_AUTH_EMAIL
      const DEV_PASSWORD = import.meta.env.VITE_DEV_AUTH_PASSWORD

      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setSession(session)
          setUser(session.user)
          setLoading(false)
          return
        }

        // Try anonymous first
        const anonResult = await supabase.auth.signInAnonymously()
        if (!anonResult.error) {
          setSession(anonResult.data.session)
          setUser(anonResult.data.user)
          setLoading(false)
          return
        }

        // Anonymous disabled — try password auth if credentials are configured
        if (DEV_EMAIL && DEV_PASSWORD) {
          const pwResult = await supabase.auth.signInWithPassword({
            email: DEV_EMAIL,
            password: DEV_PASSWORD,
          })
          if (!pwResult.error) {
            setSession(pwResult.data.session)
            setUser(pwResult.data.user)
            setLoading(false)
            return
          }
          console.warn('Dev bypass: Password sign-in failed, falling back to mock.', pwResult.error)
        } else {
          console.warn('Dev bypass: Anonymous sign-in failed. Set VITE_DEV_AUTH_EMAIL + VITE_DEV_AUTH_PASSWORD for password fallback, or enable anonymous users in Supabase.')
        }

        // Final fallback: mock user (RLS will block DB access, but UI loads)
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
        setLoading(false)
      })
      return
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession((prev) => {
        if (prev && !session) return prev // Don't overwrite active session with null
        return session
      })
      setUser((prev) => {
        if (prev && !session?.user) return prev
        return session?.user ?? null
      })
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      // Auth state change handled silently
      setSession(session)
      setUser(session?.user ?? null)
      setAuthError(null)
      setLoading(false)
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
