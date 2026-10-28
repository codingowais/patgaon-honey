import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Orders.css'

const STEPS = ['placed', 'packed', 'shipped', 'delivered']
const LABEL = { placed: 'Order placed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const dateText = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function Orders() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user) return
    let alive = true
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return
        if (error) {
          setErrorMsg(error.message)
          setStatus('error')
          return
        }
        setOrders(data || [])
        setStatus('ready')
      })
    return () => { alive = false }
  }, [user])

  const cancelOrder = async (order) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return
    setBusyId(order.id)
    setNotice('')
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id)
      .eq('user_id', user.id)
    setBusyId(null)
    if (error) {
      setNotice(`Could not cancel: ${error.message}`)
      return
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o)))
    setNotice('Your order has been cancelled.')
  }

  if (loading) return <div className="ord-state">Loading…</div>

  if (!user) {
    return (
      <div className="ord-state">
        Please <Link to="/login">log in</Link> to see your orders.
      </div>
    )
  }

  return (
    <div className="ord">
      <div className="shell">
        <header className="ord-head">
          <span className="eyebrow">My Account</span>
          <h1>My orders</h1>
          <p>Track every honey order you have placed with Patgaon Honey.</p>
        </header>

        {notice && <div className="ord-notice">{notice}</div>}

        <section className="ord-body">
          {status === 'loading' && <p className="ord-state-inline">Loading your orders…</p>}

          {status === 'error' && (
            <p className="ord-error">Couldn't load your orders: {errorMsg}</p>
          )}
{status === 'ready' && orders.length === 0 && (
  <div className="ord-empty">
    <span className="empty-icon" aria-hidden="true">📦</span>
    <h2>No orders yet</h2>
    <p>Once you place an order, you can track it here.</p>
    <Link to="/shop" className="btn btn-primary">Browse the honey</Link>
  </div>
)}

          {status === 'ready' &&
            orders.map((o) => {
              const s = o.status || 'placed'
              const idx = STEPS.indexOf(s)
              const cancelled = s === 'cancelled'
              const canCancel = s === 'placed'

              return (
                <article className="ord-card" key={o.id}>
                  <div className="ord-card-top">
                    <div>
                      <span className="ord-label">Order</span>
                      <strong className="mono">#{o.id.slice(0, 8).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="ord-label">Placed on</span>
                      <strong>{dateText(o.created_at)}</strong>
                    </div>
                    <div>
                      <span className="ord-label">Total</span>
                      <strong>{money(o.total)}</strong>
                    </div>
                    <span className={`pill is-${s}`}>{LABEL[s] || s}</span>
                  </div>

                  {cancelled ? (
                    <div className="ord-cancelled">This order was cancelled.</div>
                  ) : (
                    <ol className="tracker">
                      {STEPS.map((step, i) => (
                        <li key={step} className={i <= idx ? 'done' : ''}>
                          <span className="dot" />
                          <span className="step-name">{LABEL[step]}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="ord-grid">
                    <div>
                      <span className="ord-label">Items</span>
                      <ul className="ord-items">
                        {(o.items || []).map((item, n) => (
                          <li key={n}>
                            <span>
                              {item.name} <span className="muted">× {item.qty}</span>
                            </span>
                            <span>{money(item.price * item.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="ord-label">Delivery to</span>
                      <p>{o.address || '—'}</p>
                      <span className="ord-label">Phone</span>
                      <p>{o.phone || '—'}</p>
                    </div>
                  </div>

                  {canCancel && (
                    <div className="ord-actions">
                      <button
                        className="btn btn-ghost ord-cancel-btn"
                        onClick={() => cancelOrder(o)}
                        disabled={busyId === o.id}
                      >
                        {busyId === o.id ? 'Cancelling…' : 'Cancel order'}
                      </button>
                    </div>
                  )}

                  {!canCancel && !cancelled && s !== 'delivered' && (
                    <p className="ord-hint">
                      This order is already being packed or shipped, so it can no longer be cancelled.
                    </p>
                  )}
                </article>
              )
            })}
        </section>
      </div>
    </div>
  )
}