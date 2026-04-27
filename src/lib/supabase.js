import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'TRAKKA: Supabase credentials missing. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

/**
 * Sign in with Google OAuth
 * Uses PKCE flow — Supabase handles the code verifier internally
 */
export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google sign-in error:', error)
    throw error
  }

  return data
}

/**
 * Exchange auth code for session (after OAuth redirect)
 * Call this on your callback page when ?code=xxx is present
 */
export async function exchangeCodeForSession(code) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Code exchange error:', error)
    throw error
  }
  return data
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Get current user profile from public.users table
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error)
  }

  return data || { id: user.id, email: user.email, name: user.user_metadata?.full_name, avatar: user.user_metadata?.avatar_url }
}
