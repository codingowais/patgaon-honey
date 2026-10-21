import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // true while a reset link is open and the new password is not saved yet
  const [recovering, setRecovering] = useState(
    () => typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (event === 'SIGNED_OUT') setRecovering(false)
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = ({ email, password, name }) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })

  const verifySignup = (email, token) =>
    supabase.auth.verifyOtp({ email, token, type: 'signup' })

  const resendSignup = (email) =>
    supabase.auth.resend({ type: 'signup', email })

  const signIn = ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password })

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

  const updatePassword = (password) =>
    supabase.auth.updateUser({ password })

  // Ends the temporary reset session. The user must log in with the new password.
  const finishRecovery = async () => {
    setRecovering(false)
    await supabase.auth.signOut()
  }

  const signInWithProvider = (provider) =>
    supabase.auth.signInWithOAuth({ provider })

  const signOut = () => supabase.auth.signOut()

  // While a reset is pending, nobody counts as logged in
  const user = recovering ? null : session?.user ?? null
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

  return (
    <AuthContext.Provider
      value={{
        user, session, loading, displayName, isAuthed: !!user, recovering,
        signUp, verifySignup, resendSignup, signIn,
        resetPassword, updatePassword, finishRecovery,
        signInWithProvider, signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)