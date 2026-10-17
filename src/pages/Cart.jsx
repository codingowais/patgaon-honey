import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import './Cart.css'

export default function Cart() {
  const { items, total, updateQty, removeItem, clear } = useCart()
  const { isAuthed, user } = useAuth()
  const navigate = useNavigate()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(null)

  const handleCheckout = async () => {
    setError('')
    setBusy(true)
    const { data, error } = await supabase
      .from('orders')
      .insert({ user_id: user.id, items, total })
      .select()
      .single()
    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }
    setOrderId(data.id)
    clear()
  }

  // ===== Success screen =====
  if (orderId) {
    return (
      <div className="cart-page">
        <div className="shell">
          <div className="order-success">
            <span className="success-mark" aria-hidden="true">✓</span>
            <h1>Order placed!</h1>
            <p>Thank you for supporting the Honey Village. 🍯</p>
            <p className="order-ref">Order ID: <strong>{orderId.slice(0, 8)}</strong></p>
            <div className="order-success-actions">
              <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
              <Link to="/" className="btn btn-ghost">Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <header className="cart-head">
        <div className="shell">
          <span className="eyebrow">Your Cart</span>
          <h1>Review your order</h1>
        </div>
      </header>

      <section className="shell cart-body">
        {items.length === 0 ? (
          <div className="cart-empty-state">
            <span aria-hidden="true">🛒</span>
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary">Browse the honey</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              {items.map((i) => (
                <div className="cart-row" key={i.id}>
                  <div className="cart-row-photo" aria-hidden="true">🍯</div>
                  <div className="cart-row-info">
                    <span className="cart-row-name">{i.name}</span>
                    <span className="cart-row-sub">{i.weight} · ₹{i.price}</span>
                  </div>
                  <div className="qty small">
                    <button onClick={() => updateQty(i.id, i.qty - 1)} aria-label="Decrease">−</button>
                    <span className="qty-value">{i.qty}</span>
                    <button onClick={() => updateQty(i.id, i.qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <span className="cart-row-total">₹{i.price * i.qty}</span>
                  <button className="cart-row-remove" onClick={() => removeItem(i.id)} aria-label="Remove">×</button>
                </div>
              ))}
              <button className="cart-clear-all" onClick={clear}>Clear cart</button>
            </div>

            {/* Summary */}
            <aside className="cart-summary">
              <h3>Summary</h3>
              <div className="summary-line">
                <span>Items</span>
                <span>{items.reduce((n, i) => n + i.qty, 0)}</span>
              </div>
              <div className="summary-line">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>

              {error && <p className="cart-error">{error}</p>}

              {isAuthed ? (
                <button className="btn btn-primary cart-checkout-btn" onClick={handleCheckout} disabled={busy}>
                  {busy ? 'Placing order…' : 'Place order'}
                </button>
              ) : (
                <div className="cart-login-note">
                  <p>Please log in to place your order.</p>
                  <button className="btn btn-primary cart-checkout-btn" onClick={() => navigate('/login')}>
                    Log in to checkout
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </div>
  )
}