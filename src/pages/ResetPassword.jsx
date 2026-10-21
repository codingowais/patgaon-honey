import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

export default function ResetPassword() {
  const { updatePassword, finishRecovery } = useAuth()
  const navigate = useNavigate()
  const [valid, setValid] = useState(null) // null = checking, true/false after
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const finished = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValid(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setValid(true)
    })
    const timer = setTimeout(() => setValid((v) => (v === null ? false : v)), 2500)

    return () => {
      mounted.current = false
      sub.subscription.unsubscribe()
      clearTimeout(timer)
      // If the user leaves this page without setting a password, end the temporary session.
      // The short delay stops React's development double-mount from signing out by mistake.
      setTimeout(() => {
        if (!mounted.current && !finished.current) {
          supabase.auth.signOut()
        }
      }, 300)
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    if (pw !== pw2) return setError('The two passwords do not match.')

    setBusy(true)
    const { error } = await updatePassword(pw)
    if (error) {
      setBusy(false)
      return setError(error.message)
    }

    finished.current = true
    await finishRecovery()
    setDone(true)
    setBusy(false)
    setTimeout(() => navigate('/login'), 2000)
  }

  return (
    <div className="auth">
      <div className="auth-box reset-box">
        <main className="auth-form-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="auth-form-inner">
            {valid === null && <p className="auth-hint">Checking your link…</p>}

            {valid === false && (
              <>
                <h1>Link expired</h1>
                <p className="auth-hint">This reset link is invalid or has expired. Request a new one.</p>
                <Link to="/login" className="btn btn-primary auth-submit">Back to log in</Link>
              </>
            )}

            {valid === true && !done && (
              <>
                <h1>Set a new password</h1>
                <p className="auth-hint">You must set a new password before you can use your account.</p>
                <form className="auth-form" onSubmit={submit} noValidate>
                  <label>New password
                    <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setError('') }} placeholder="At least 6 characters" autoComplete="new-password" />
                  </label>
                  <label>Confirm new password
                    <input type="password" value={pw2} onChange={(e) => { setPw2(e.target.value); setError('') }} placeholder="Type it again" autoComplete="new-password" />
                  </label>
                  {error && <p className="auth-error">{error}</p>}
                  <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                    {busy ? 'Saving…' : 'Update password'}
                  </button>
                </form>
              </>
            )}

            {done && (
              <>
                <h1>Password updated</h1>
                <p className="auth-notice">Log in with your new password. Taking you to the login page…</p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}