import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Creates the account and emails a 6-digit code
  const signUp = ({ email, password, name }) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })

  // Checks the code. On success the user is logged in directly.
  const verifySignup = (email, token) =>
    supabase.auth.verifyOtp({ email, token, type: 'signup' })

  const resendSignup = (email) =>
    supabase.auth.resend({ type: 'signup', email })

  const signIn = ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password })

  // Emails a link that opens the reset-password page
  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

  const updatePassword = (password) =>
    supabase.auth.updateUser({ password })

  const signInWithProvider = (provider) =>
    supabase.auth.signInWithOAuth({ provider })

  const signOut = () => supabase.auth.signOut()

  const user = session?.user ?? null
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

  return (
    <AuthContext.Provider
      value={{
        user, session, loading, displayName, isAuthed: !!user,
        signUp, verifySignup, resendSignup, signIn,
        resetPassword, updatePassword, signInWithProvider, signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)