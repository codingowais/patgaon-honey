import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { sendOrderEmails } from '../lib/notify.js'
import { honeyImage } from '../data/honeyImages.js'
import './Cart.css'

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
]

const EMPTY_ADDRESS = {
  street: '', area: '', landmark: '', village: '', state: 'Maharashtra', pincode: '',
}

export default function Cart() {
  const { items, total, updateQty, removeItem, clear } = useCart()
  const { isAuthed, user, displayName } = useAuth()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [addr, setAddr] = useState(EMPTY_ADDRESS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const setField = (field) => (e) => {
    setAddr({ ...addr, [field]: e.target.value })
    setError('')
  }

  const validate = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) return 'Enter a valid 10-digit phone number.'
    if (!addr.street.trim()) return 'Enter your house or flat number and street.'
    if (!addr.area.trim()) return 'Enter your area or locality.'
    if (!addr.village.trim()) return 'Enter your village or town.'
    if (!addr.state) return 'Select your state.'
    if (!/^\d{6}$/.test(addr.pincode.trim())) return 'Enter a valid 6-digit PIN code.'
    return ''
  }

  // One readable line, used in the confirmation email and the admin view
  const fullAddress = () =>
    [
      addr.street.trim(),
      addr.area.trim(),
      addr.landmark.trim() && `Near ${addr.landmark.trim()}`,
      addr.village.trim(),
      addr.state,
      `PIN ${addr.pincode.trim()}`,
    ].filter(Boolean).join(', ')

  const handleCheckout = async (e) => {
    e.preventDefault()
    setError('')
    const problem = validate()
    if (problem) return setError(problem)

    setBusy(true)
    const address = fullAddress()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items,
        total,
        customer_email: user.email,
        phone: phone.replace(/\D/g, ''),
        address,
        city: addr.village.trim(),
        district: addr.state,
        state: addr.state,
        pincode: addr.pincode.trim(),
      })
      .select()
      .single()

    if (error) {
      setBusy(false)
      return setError(error.message)
    }

    await sendOrderEmails({
      order: data,
      customerName: displayName,
      customerEmail: user.email,
      phone: phone.replace(/\D/g, ''),
      address,
    })

    setBusy(false)
    setOrder(data)
    clear()
  }

  // ===== Confirmation =====
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
  <span className="empty-icon" aria-hidden="true">🛒</span>
  <h2>Your cart is empty</h2>
  <p>Pick a honey from the shop and it will appear here.</p>
  <Link to="/shop" className="btn btn-primary">Browse the honey</Link>
</div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((i) => (
                <div className="cart-row" key={i.id}>
                  <div className="cart-row-photo">
                    {honeyImage(i.id) ? (
                      <img src={honeyImage(i.id)} alt={i.name} />
                    ) : (
                      <span aria-hidden="true">🍯</span>
                    )}
                  </div>
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
                <form className="checkout-form" onSubmit={handleCheckout} noValidate>
                  <p className="checkout-title">Delivery details</p>

                  <label>
                    Phone number
                    <input type="tel" inputMode="numeric" placeholder="98765 43210" value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError('') }} />
                  </label>

                  <label>
                    House / flat no. and street
                    <input type="text" placeholder="e.g. Flat 4, Shivaji Road" value={addr.street} onChange={setField('street')} />
                  </label>

                  <label>
                    Area / locality
                    <input type="text" placeholder="e.g. Near bus stand" value={addr.area} onChange={setField('area')} />
                  </label>

                  <label>
                    Landmark <span className="optional">(optional)</span>
                    <input type="text" placeholder="e.g. Opposite temple" value={addr.landmark} onChange={setField('landmark')} />
                  </label>

                  <label>
                    Village / town
                    <input type="text" placeholder="e.g. Patgaon" value={addr.village} onChange={setField('village')} />
                  </label>

                  <label>
                    State
                    <select value={addr.state} onChange={setField('state')}>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>

                  <label>
                    PIN code
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="6 digits" value={addr.pincode}
                      onChange={(e) => setField('pincode')({ target: { value: e.target.value.replace(/\D/g, '') } })} />
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