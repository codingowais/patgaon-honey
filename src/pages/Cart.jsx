import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { sendOrderEmails } from '../lib/notify.js'
import './Cart.css'

export default function Cart() {
  const { items, total, updateQty, removeItem, clear } = useCart()
  const { isAuthed, user, displayName } = useAuth()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const handleCheckout = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone.trim() || !address.trim()) {
      setError('Please enter your phone number and delivery address.')
      return
    }
    setBusy(true)
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items,
        total,
        customer_email: user.email,
        phone: phone.trim(),
        address: address.trim(),
      })
      .select()
      .single()

    if (error) {
      setBusy(false)
      setError(error.message)
      return
    }

    // Emails are sent after the order is saved. A failed email won't cancel the order.
    await sendOrderEmails({
      order: data,
      customerName: displayName,
      customerEmail: user.email,
      phone: phone.trim(),
      address: address.trim(),
    })

    setBusy(false)
    setOrder(data)
    clear()
  }

  // ===== Confirmation screen =====
  if (order) {
    return (
      <div className="cart-page">
        <div className="shell">
          <div className="order-success">
            <span className="success-mark" aria-hidden="true">✓</span>
            <h1>Order confirmed</h1>
            <p>Thank you for supporting the Honey Village. 🍯</p>
            <p>A confirmation has been sent to <strong>{user.email}</strong>.</p>
            <p className="order-ref">Order ID: <strong>{order.id.slice(0, 8).toUpperCase()}</strong></p>
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

              {isAuthed ? (
                <form className="checkout-form" onSubmit={handleCheckout}>
                  <label>
                    Phone number
                    <input
                      type="tel"
                      placeholder="e.g. 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>
                  <label>
                    Delivery address
                    <textarea
                      rows="3"
                      placeholder="House no., street, area, city, PIN"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </label>
                  {error && <p className="cart-error">{error}</p>}
                  <button type="submit" className="btn btn-primary cart-checkout-btn" disabled={busy}>
                    {busy ? 'Placing order…' : 'Place order'}
                  </button>
                </form>
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