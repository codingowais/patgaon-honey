import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Admin.css'

const STATUSES = ['placed', 'packed', 'shipped', 'delivered']
const EMPTY = { id: '', name: '', weight: '', price: '', tag: '', blurb: '', details: '', sort_order: 0 }

const makeId = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const shortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function Admin() {
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  // ----- access check -----
  useEffect(() => {
    if (loading) return
    if (!user) { setChecking(false); return }
    supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setIsAdmin(!!data); setChecking(false) })
  }, [user, loading])

  const loadAll = async () => {
    const [p, o] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ])
    if (p.data) setProducts(p.data)
    if (o.data) setOrders(o.data)
  }

  useEffect(() => { if (isAdmin) loadAll() }, [isAdmin])

  const notify = (text, type = 'ok') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 2600)
  }

  // ----- derived data -----
  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0)
    const counts = Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => (o.status || 'placed') === s).length]))
    return {
      orders: orders.length,
      revenue,
      products: products.length,
      pending: counts.placed,
      average: orders.length ? Math.round(revenue / orders.length) : 0,
      counts,
    }
  }, [orders, products])

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim()
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q))
  }, [products, productSearch])

  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase().trim()
    return orders.filter((o) => {
      const status = o.status || 'placed'
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (!q) return true
      const items = (o.items || []).map((i) => i.name).join(' ').toLowerCase()
      return o.id.toLowerCase().startsWith(q) || items.includes(q)
    })
  }, [orders, orderSearch, statusFilter])

  // ----- product actions -----
  const saveProduct = async (e) => {
    e.preventDefault()
    setBusy(true)
    const payload = {
      name: form.name.trim(),
      weight: form.weight.trim(),
      price: Number(form.price),
      tag: form.tag.trim() || null,
      blurb: form.blurb.trim(),
      details: form.details.trim(),
      sort_order: Number(form.sort_order) || 0,
    }
    let error
    if (editing) {
      ; ({ error } = await supabase.from('products').update(payload).eq('id', form.id))
    } else {
      ; ({ error } = await supabase.from('products').insert({ ...payload, id: makeId(form.name) }))
    }
    setBusy(false)
    if (error) return notify(error.message, 'error')
    notify(editing ? 'Product updated' : 'Product added')
    setForm(EMPTY); setEditing(false); loadAll()
  }

  const startEdit = (p) => {
    setForm({ ...p, price: String(p.price), tag: p.tag || '', sort_order: p.sort_order ?? 0 })
    setEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => { setForm(EMPTY); setEditing(false) }

  const toggleStock = async (p) => {
    const next = !(p.in_stock !== false)
    const { error } = await supabase.from('products').update({ in_stock: next }).eq('id', p.id)
    if (error) return notify(error.message, 'error')
    notify(`${p.name} is now ${next ? 'available' : 'out of stock'}`)
    loadAll()
  }
  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return notify(error.message, 'error')
    notify('Product deleted'); loadAll()
  }

  // ----- order actions -----
  const setStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return notify(error.message, 'error')
    notify('Order status updated'); loadAll()
  }

  const exportCSV = () => {
    const header = ['Order ID', 'Date', 'Items', 'Total (INR)', 'Status']
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.created_at).toISOString().slice(0, 10),
      (o.items || []).map((i) => `${i.name} x${i.qty}`).join('; '),
      o.total,
      o.status || 'placed',
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `patgaon-orders-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ----- gates -----
  if (loading || checking) return <div className="adm-state">Checking access…</div>
  if (!user) return <div className="adm-state">Please <Link to="/login">log in</Link> first.</div>
  if (!isAdmin) return <div className="adm-state">You do not have admin access.</div>

  const nav = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products', count: products.length },
    { id: 'orders', label: 'Orders', count: stats.pending, alert: stats.pending > 0 },
  ]

  return (
    <div className="adm">
      <div className="shell adm-layout">
        {/* ===== Sidebar ===== */}
        <aside className="adm-side">
          <div className="adm-side-title">Dashboard</div>
          <nav className="adm-nav">
            {nav.map((n) => (
              <button key={n.id} className={`adm-nav-item ${tab === n.id ? 'is-active' : ''}`} onClick={() => setTab(n.id)}>
                <span>{n.label}</span>
                {n.count !== undefined && (
                  <span className={`adm-badge ${n.alert ? 'is-alert' : ''}`}>{n.count}</span>
                )}
              </button>
            ))}
          </nav>
          <Link to="/" className="adm-back">← Back to site</Link>
        </aside>

        {/* ===== Main ===== */}
        <main className="adm-main">
          {toast && <div className={`adm-toast ${toast.type === 'error' ? 'is-error' : ''}`}>{toast.text}</div>}

          {/* ---------- OVERVIEW ---------- */}
          {tab === 'overview' && (
            <>
              <header className="adm-head">
                <span className="eyebrow">Overview</span>
                <h1>Welcome back</h1>
                <p>Here is how the store is doing today.</p>
              </header>

              <section className="adm-kpis">
                <div className="kpi"><span>Total orders</span><strong>{stats.orders}</strong></div>
                <div className="kpi"><span>Revenue</span><strong>{money(stats.revenue)}</strong></div>
                <div className="kpi"><span>Average order</span><strong>{money(stats.average)}</strong></div>
                <div className="kpi"><span>Awaiting packing</span><strong>{stats.pending}</strong></div>
              </section>

              <div className="adm-grid-2">
                <section className="adm-card">
                  <div className="adm-card-head">
                    <h2>Recent orders</h2>
                    <button className="adm-link" onClick={() => setTab('orders')}>View all</button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="adm-empty">No orders yet.</p>
                  ) : (
                    <ul className="adm-list">
                      {orders.slice(0, 5).map((o) => (
                        <li key={o.id}>
                          <div>
                            <strong className="mono">#{o.id.slice(0, 8)}</strong>
                            <span className="muted"> · {shortDate(o.created_at)}</span>
                          </div>
                          <div className="adm-list-right">
                            <span className="muted">{money(o.total)}</span>
                            <StatusPill status={o.status || 'placed'} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="adm-card">
                  <div className="adm-card-head"><h2>Order status</h2></div>
                  <ul className="adm-bars">
                    {STATUSES.map((s) => {
                      const pct = stats.orders ? Math.round((stats.counts[s] / stats.orders) * 100) : 0
                      return (
                        <li key={s}>
                          <div className="adm-bar-label">
                            <span className="cap">{s}</span>
                            <span className="muted">{stats.counts[s]}</span>
                          </div>
                          <div className="adm-bar-track"><div className={`adm-bar-fill is-${s}`} style={{ width: `${pct}%` }} /></div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              </div>
            </>
          )}

          {/* ---------- PRODUCTS ---------- */}
          {tab === 'products' && (
            <>
              <header className="adm-head">
                <span className="eyebrow">Catalogue</span>
                <h1>Products</h1>
                <p>{products.length} honey products on the shop page.</p>
              </header>

              <section className="adm-card">
                <div className="adm-card-head">
                  <h2>{editing ? `Edit “${form.name}”` : 'Add a new product'}</h2>
                  {editing && <button className="adm-link" onClick={cancelEdit}>Cancel edit</button>}
                </div>
                <form className="adm-form" onSubmit={saveProduct}>
                  <label>Name
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label>Weight
                    <input required placeholder="e.g. 500 g" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                  </label>
                  <label>Price (₹)
                    <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </label>
                  <label>Tag
                    <input placeholder="Bestseller, New, Gift…" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                  </label>
                  <label>Display order
                    <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                  </label>
                  <label className="full">Short description
                    <input required value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
                  </label>
                  <label className="full">Full details
                    <textarea required rows="3" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
                  </label>
                  <div className="full adm-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                      {busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="adm-card">
                <div className="adm-card-head">
                  <h2>All products</h2>
                  <input className="adm-search" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                </div>
                {filteredProducts.length === 0 ? (
                  <p className="adm-empty">No products match your search.</p>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>Product</th><th>Weight</th><th>Price</th><th>Tag</th><th>Order</th><th></th></tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div className="prod-cell">
                                <span className="prod-avatar">{p.name[0]}</span>
                                <span className="prod-name">{p.name}</span>
                              </div>
                            </td>
                            <td>{p.weight}</td>
                            <td>{money(p.price)}</td>
                            <td>{p.tag ? <span className="tag">{p.tag}</span> : <span className="muted">—</span>}</td>
                            <td className="muted">{p.sort_order}</td>
                            <td className="adm-actions">
                              <button className="adm-link" onClick={() => toggleStock(p)}>
                                {p.in_stock !== false ? 'Mark out of stock' : 'Mark available'}
                              </button>
                              <button className="adm-link" onClick={() => startEdit(p)}>Edit</button>
                              <button className="adm-link danger" onClick={() => removeProduct(p.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ---------- ORDERS ---------- */}
          {tab === 'orders' && (
            <>
              <header className="adm-head">
                <span className="eyebrow">Transactions</span>
                <h1>Orders</h1>
                <p>{orders.length} orders in total · {money(stats.revenue)} revenue</p>
              </header>

              <section className="adm-card">
                <div className="adm-toolbar">
                  <div className="chips">
                    {['all', ...STATUSES].map((s) => (
                      <button key={s} className={`chip ${statusFilter === s ? 'is-active' : ''}`} onClick={() => setStatusFilter(s)}>
                        <span className="cap">{s}</span>
                        <span className="chip-count">{s === 'all' ? orders.length : stats.counts[s]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="adm-toolbar-right">
                    <input className="adm-search" placeholder="Search by order ID or item…" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
                    <button className="btn btn-ghost adm-export" onClick={exportCSV} disabled={filteredOrders.length === 0}>Export CSV</button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="adm-empty">No orders match these filters.</p>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => {
                          const status = o.status || 'placed'
                          const open = expanded === o.id
                          return (
                            <>
                              <tr key={o.id} className="order-row" onClick={() => setExpanded(open ? null : o.id)}>
                                <td className="mono">#{o.id.slice(0, 8)}</td>
                                <td>{shortDate(o.created_at)}</td>
                                <td className="muted">{(o.items || []).length} item(s)</td>
                                <td><strong>{money(o.total)}</strong></td>
                                <td onClick={(e) => e.stopPropagation()}>
                                  <div className="status-cell">
                                    <StatusPill status={status} />
                                    <select value={status} onChange={(e) => setStatus(o.id, e.target.value)}>
                                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                </td>
                              </tr>
                              {open && (
                                <tr key={`${o.id}-d`} className="order-detail">
                                  <td colSpan="5">
                                    <div className="detail-grid">
                                      <div>
                                        <span className="muted">Full order ID</span>
                                        <p className="mono">{o.id}</p>
                                      </div>
                                      <div>
                                        <span className="muted">Customer ID</span>
                                        <p className="mono">{o.user_id}</p>
                                      </div>
                                      <div className="full-span">
                                        <span className="muted">Items</span>
                                        <ul className="item-list">
                                          {(o.items || []).map((i, idx) => (
                                            <li key={idx}>
                                              <span>{i.name} <span className="muted">× {i.qty}</span></span>
                                              <span>{money(i.price * i.qty)}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  return <span className={`pill is-${status}`}>{status}</span>
}