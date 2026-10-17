import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.6 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.4z"/>
      <path fill="#FBBC05" d="M10.4 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6.1C1 15.9 0 19.8 0 24s1 8.1 2.6 11.4l7.8-6.1z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.3-5.7c-2 1.4-4.7 2.3-8 2.3-6.4 0-11.7-3.8-13.6-9.3l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.9c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.2-.9-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.2 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.9zM14.3 4.8c.7-.8 1.1-2 1-3.1-1 0-2.2.6-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/>
    </svg>
  )
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const auth = useAuth()
  const navigate = useNavigate()
  const isSignup = mode === 'signup'

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (error) setError('')
    if (notice) setNotice('')
  }

  const handleSocial = async (provider) => {
    setError('')
    if (!auth?.signInWithProvider) {
      setError('Auth not ready — check the console.')
      return
    }
    const { error } = await auth.signInWithProvider(provider)
    if (error) setError(error.message)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!auth?.signIn || !auth?.signUp) {
      setError('Auth is not connected. Check the browser console.')
      return
    }
    if (isSignup && !form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.email.trim() || !form.password.trim()) { setError('Please enter your email and password.'); return }
    if (form.password.length < 6) { setError('Password should be at least 6 characters.'); return }

    setBusy(true)
    try {
      if (isSignup) {
        const { data, error } = await auth.signUp({ email: form.email, password: form.password, name: form.name })
        if (error) { setError(error.message); return }
        if (!data.session) { setNotice('Account created! Check your email to confirm, then log in.'); setMode('login'); return }
        navigate('/')
      } else {
        const { error } = await auth.signIn({ email: form.email, password: form.password })
        if (error) { setError(error.message); return }
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-box">
        <aside className="auth-brand">
          <span className="hex hex-1" aria-hidden="true">⬡</span>
          <span className="hex hex-2" aria-hidden="true">⬡</span>
          <span className="hex hex-3" aria-hidden="true">⬡</span>
          <div className="auth-brand-inner">
            <div className="auth-logo"><span className="brand-mark" aria-hidden="true">⬡</span> Patgaon</div>
            <h2>The Honey Village</h2>
            <p>Pure forest honey from the Sahyadri hills of Kolhapur. Sign in to shop, track orders, and taste the wild.</p>
          </div>
        </aside>

        <main className="auth-form-panel">
          <div className="auth-form-inner">
            <h1>{isSignup ? 'Create account' : 'Welcome back'}</h1>
            <p className="auth-hint">{isSignup ? 'Join the Honey Village.' : 'Log in to your account.'}</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {isSignup && (
                <label>Name
                  <input type="text" value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" />
                </label>
              )}
              <label>Email
                <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" />
              </label>
              <label>Password
                <div className="pass-wrap">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Enter your password" autoComplete={isSignup ? 'new-password' : 'current-password'} />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass((v) => !v)}>{showPass ? 'Hide' : 'Show'}</button>
                </div>
              </label>

              {error && <p className="auth-error">{error}</p>}
              {notice && <p className="auth-notice">{notice}</p>}

              <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
              </button>
            </form>

            <div className="divider"><span>or</span></div>

            <div className="social-buttons">
              <button type="button" className="social-btn" onClick={() => handleSocial('google')}><GoogleIcon /> Continue with Google</button>
              <button type="button" className="social-btn social-apple" onClick={() => handleSocial('apple')}><AppleIcon /> Continue with Apple</button>
            </div>

            <p className="auth-toggle">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); setNotice('') }}>
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>

            <Link to="/" className="auth-back">← Back to home</Link>
          </div>
        </main>
      </div>
    </div>
  )
}