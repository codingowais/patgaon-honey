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

  const signUp = ({ email, password, name }) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

  const signIn = ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password })

  const signInWithProvider = (provider) =>
    supabase.auth.signInWithOAuth({ provider })

  const signOut = () => supabase.auth.signOut()

  const user = session?.user ?? null
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

  return (
    <AuthContext.Provider
      value={{ user, session, loading, displayName, isAuthed: !!user, signUp, signIn, signInWithProvider, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)