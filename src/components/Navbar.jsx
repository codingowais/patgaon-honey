import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop & Info' },
  { to: '/places', label: 'Places to Visit' },
  { to: '/about', label: 'About & Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { count } = useCart()
  const { user, isAuthed, displayName, signOut } = useAuth()
  const navigate = useNavigate()

  // Check whether the logged-in user is listed in the admins table
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [user])

  const handleLogout = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">⬡</span>
          <span className="brand-text">
            Patgaon
            <small>The Honey Village</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}

          <Link to="/cart" className="nav-cart" onClick={() => setOpen(false)}>
            Cart <span className="cart-count">{count}</span>
          </Link>

          {isAdmin && (
            <Link to="/admin" className="nav-admin" onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}

          {isAuthed ? (
            <div className="nav-user">
              <span className="nav-hello">Hi, {displayName}</span>
              <button className="btn btn-ghost nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary nav-login" onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}