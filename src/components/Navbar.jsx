import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/places', label: 'Places' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { count } = useCart()
  const { user, isAuthed, displayName, signOut } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [user])

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const close = () => { setOpen(false); setMenu(false) }

  const logout = async () => {
    close()
    await signOut()
    navigate('/')
  }

  const initial = (displayName || 'U').charAt(0).toUpperCase()

  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">⬡</span>
          <span className="brand-text">
            Patgaon
            <small>The Honey Village</small>
          </span>
        </Link>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={close}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="nav-cart" aria-label={`Cart, ${count} items`} onClick={close}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>

          {isAuthed ? (
            <div className="nav-account" ref={menuRef}>
              <button
                className="avatar"
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                aria-label="Account menu"
              >
                {initial}
              </button>

              {menu && (
                <div className="account-menu">
                  <div className="am-head">
                    <strong>{displayName}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/orders" onClick={close}>My orders</Link>
                  {isAdmin && <Link to="/admin" onClick={close}>Admin dashboard</Link>}
                  <button className="am-logout" onClick={logout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary nav-login" onClick={close}>
              Log in
            </Link>
          )}

          <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Open menu">
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}