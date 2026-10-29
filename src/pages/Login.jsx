import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

export default function Login() {
  const { signIn, signUp, verifySignup, resendSignup, resetPassword } = useAuth()
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
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return setError('An account with this email already exists. Please log in instead.')
    }
    if (data.session) {
      navigate('/')
      return
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

            <Link to="/" className="auth-back">← Back to home</Link>
          </div>
        </main>
      </div>
    </div>
  )
}