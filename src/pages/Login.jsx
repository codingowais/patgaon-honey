import { useEffect, useState } from 'react'
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
  const { signIn, signUp, verifySignup, resendSignup, resetPassword, signInWithProvider } = useAuth()
  const navigate = useNavigate()

  // view: 'login' | 'signup' | 'verify' | 'forgot' | 'forgot-sent'
  const [view, setView] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const email = form.email.trim().toLowerCase()
  const validEmail = /^\S+@\S+\.\S+$/.test(email)

  const clear = () => { setError(''); setNotice('') }
  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    clear()
  }
  const switchView = (v) => { setView(v); setOtp(''); clear() }

  // ----- log in -----
  const handleLogin = async (e) => {
    e.preventDefault()
    clear()
    if (!validEmail) return setError('Enter a valid email address.')
    if (!form.password) return setError('Enter your password.')
    setBusy(true)
    const { error } = await signIn({ email, password: form.password })
    setBusy(false)
    if (error) {
      // Account exists but was never verified: send them to the code step
      if (/not confirmed/i.test(error.message)) {
        setPendingEmail(email)
        setView('verify')
        setCooldown(30)
        return setNotice('Your email is not verified yet. Enter the code we sent you.')
      }
      return setError('Wrong email or password.')
    }
    navigate('/')
  }

  // ----- sign up -----
  const handleSignup = async (e) => {
    e.preventDefault()
    clear()
    if (!form.name.trim()) return setError('Please enter your name.')
    if (!validEmail) return setError('Enter a valid email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setBusy(true)
    const { data, error } = await signUp({ email, password: form.password, name: form.name.trim() })
    setBusy(false)
    if (error) return setError(error.message)
    // Supabase returns no identities when this email is already registered
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return setError('An account with this email already exists. Please log in instead.')
    }
    setPendingEmail(email)
    setView('verify')
    setCooldown(30)
    setNotice(`We sent a 6-digit code to ${email}.`)
  }

  // ----- verify the sign-up code -----
  const handleVerify = async (e) => {
    e.preventDefault()
    clear()
    if (otp.length !== 6) return setError('Enter the 6-digit code.')
    setBusy(true)
    const { error } = await verifySignup(pendingEmail, otp)
    setBusy(false)
    if (error) return setError('That code is wrong or has expired. Request a new one.')
    navigate('/')
  }

  const resendCode = async () => {
    if (cooldown > 0) return
    clear()
    setBusy(true)
    const { error } = await resendSignup(pendingEmail)
    setBusy(false)
    if (error) return setError(error.message)
    setCooldown(30)
    setNotice('A new code was sent.')
  }

  // ----- forgot password -----
  const handleForgot = async (e) => {
    e.preventDefault()
    clear()
    if (!validEmail) return setError('Enter your email address.')
    setBusy(true)
    const { error } = await resetPassword(email)
    setBusy(false)
    if (error) return setError(error.message)
    setPendingEmail(email)
    setView('forgot-sent')
  }

  const handleSocial = async (provider) => {
    clear()
    const { error } = await signInWithProvider(provider)
    if (error) setError(error.message)
  }

  const titles = {
    login: ['Welcome back', 'Log in to your account.'],
    signup: ['Create account', 'Join the Honey Village.'],
    verify: ['Verify your email', 'Enter the 6-digit code we sent you.'],
    forgot: ['Forgot password', 'We will email you a reset link.'],
    'forgot-sent': ['Check your email', 'Open the link we sent to reset your password.'],
  }

  return (
    <div className="auth">
      <div className="auth-box">
        <aside className="auth-brand">
          <span className="hex hex-1" aria-hidden="true">⬡</span>
          <span className="hex hex-2" aria-hidden="true">⬡</span>
          <span className="hex hex-3" aria-hidden="true">⬡</span>
          <div className="auth-brand-inner">
            <div className="auth-logo"><span className="brand-mark" aria-hidden="true">⬡</span>Patgaon</div>
            <h2>The Honey Village</h2>
            <p>Pure forest honey from the Sahyadri hills of Kolhapur. Sign in to shop, track orders, and taste the wild.</p>
          </div>
        </aside>

        <main className="auth-form-panel">
          <div className="auth-form-inner">
            <h1>{titles[view][0]}</h1>
            <p className="auth-hint">{titles[view][1]}</p>

            {/* ===== LOG IN ===== */}
            {view === 'login' && (
              <>
                <form className="auth-form" onSubmit={handleLogin} noValidate>
                  <label>Email
                    <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" />
                  </label>
                  <label>Password
                    <div className="pass-wrap">
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Enter your password" autoComplete="current-password" />
                      <button type="button" className="pass-toggle" onClick={() => setShowPass((v) => !v)}>{showPass ? 'Hide' : 'Show'}</button>
                    </div>
                  </label>
                  <div className="forgot-row">
                    <button type="button" className="auth-link-btn" onClick={() => switchView('forgot')}>Forgot password?</button>
                  </div>
                  {error && <p className="auth-error">{error}</p>}
                  <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                    {busy ? 'Please wait…' : 'Log in'}
                  </button>
                </form>
                <p className="auth-toggle">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchView('signup')}>Sign up</button>
                </p>
              </>
            )}

            {/* ===== SIGN UP ===== */}
            {view === 'signup' && (
              <>
                <form className="auth-form" onSubmit={handleSignup} noValidate>
                  <label>Name
                    <input type="text" value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" />
                  </label>
                  <label>Email
                    <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" />
                  </label>
                  <label>Password
                    <div className="pass-wrap">
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="At least 6 characters" autoComplete="new-password" />
                      <button type="button" className="pass-toggle" onClick={() => setShowPass((v) => !v)}>{showPass ? 'Hide' : 'Show'}</button>
                    </div>
                  </label>
                  {error && <p className="auth-error">{error}</p>}
                  <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                    {busy ? 'Please wait…' : 'Create account'}
                  </button>
                </form>
                <p className="auth-toggle">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchView('login')}>Log in</button>
                </p>
              </>
            )}

            {/* ===== VERIFY CODE (sign-up) ===== */}
            {view === 'verify' && (
              <>
                <form className="auth-form" onSubmit={handleVerify} noValidate>
                  <label>6-digit code
                    <input
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); clear() }}
                      placeholder="• • • • • •"
                      autoComplete="one-time-code"
                    />
                  </label>
                  {error && <p className="auth-error">{error}</p>}
                  {notice && <p className="auth-notice">{notice}</p>}
                  <button type="submit" className="btn btn-primary auth-submit" disabled={busy || otp.length !== 6}>
                    {busy ? 'Verifying…' : 'Verify and continue'}
                  </button>
                </form>
                <div className="otp-actions">
                  <button type="button" className="auth-link-btn" onClick={() => switchView('signup')}>Change email</button>
                  <button type="button" className="auth-link-btn" onClick={resendCode} disabled={cooldown > 0 || busy}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>
              </>
            )}

            {/* ===== FORGOT PASSWORD ===== */}
            {view === 'forgot' && (
              <>
                <form className="auth-form" onSubmit={handleForgot} noValidate>
                  <label>Email
                    <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" />
                  </label>
                  {error && <p className="auth-error">{error}</p>}
                  <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                    {busy ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
                <p className="auth-toggle">
                  <button type="button" onClick={() => switchView('login')}>Back to log in</button>
                </p>
              </>
            )}

            {view === 'forgot-sent' && (
              <>
                <p className="auth-notice">A reset link was sent to <strong>{pendingEmail}</strong>. It may take a minute.</p>
                <p className="auth-toggle">
                  <button type="button" onClick={() => switchView('login')}>Back to log in</button>
                </p>
              </>
            )}

            {/* ===== Social (login and sign-up only) ===== */}
            {(view === 'login' || view === 'signup') && (
              <>
                <div className="divider"><span>or</span></div>
                <div className="social-buttons">
                  <button type="button" className="social-btn" onClick={() => handleSocial('google')}><GoogleIcon /> Continue with Google</button>
                  <button type="button" className="social-btn social-apple" onClick={() => handleSocial('apple')}><AppleIcon /> Continue with Apple</button>
                </div>
              </>
            )}

            <Link to="/" className="auth-back">← Back to home</Link>
          </div>
        </main>
      </div>
    </div>
  )
}