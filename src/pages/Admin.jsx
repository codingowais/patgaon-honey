import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Admin.css'

const STATUSES = ['placed', 'packed', 'shipped', 'delivered']
const EMPTY = { id: '', name: '', weight: '', price: '', tag: '', blurb: '', details: '', sort_order: 0 }

const makeId = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)

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
  const [msg, setMsg] = useState('')

  // Check whether this user is in the admins table
  useEffect(() => {
    if (loading) return
    if (!user) { setChecking(false); return }
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data)
        setChecking(false)
      })
  }, [user, loading])

  const loadAll = async () => {
    const [p, o] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ])
    if (p.data) setProducts(p.data)
    if (o.data) setOrders(o.data)
  }

  useEffect(() => {
    if (isAdmin) loadAll()
  }, [isAdmin])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  const stats = useMemo(() => ({
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    products: products.length,
    pending: orders.filter((o) => o.status === 'placed').length,
  }), [orders, products])

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
      ;({ error } = await supabase.from('products').update(payload).eq('id', form.id))
    } else {
      ;({ error } = await supabase.from('products').insert({ ...payload, id: makeId(form.name) }))
    }
    setBusy(false)
    if (error) return flash('Error: ' + error.message)
    flash(editing ? 'Product updated' : 'Product added')
    setForm(EMPTY)
    setEditing(false)
    loadAll()
  }

  const startEdit = (p) => {
    setForm({
      ...p,
      price: String(p.price),
      tag: p.tag || '',
      sort_order: p.sort_order ?? 0,
    })
    setEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setForm(EMPTY)
    setEditing(false)
  }

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return flash('Error: ' + error.message)
    flash('Product deleted')
    loadAll()
  }

  // ----- order actions -----
  const setStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return flash('Error: ' + error.message)
    flash('Order status updated')
    loadAll()
  }

  // ----- gates -----
  if (loading || checking) return <div className="adm-state">Checking access…</div>
  if (!user) return <div className="adm-state">Please <Link to="/login">log in</Link> first.</div>
  if (!isAdmin) return <div className="adm-state">You do not have admin access.</div>

  return (
    <div className="adm">
      <header className="adm-head">
        <div className="shell adm-head-inner">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Dashboard</h1>
          </div>
          <Link to="/" className="btn btn-ghost">Back to site</Link>
        </div>
      </header>

      <div className="shell adm-body">
        {msg && <div className="adm-toast">{msg}</div>}

        <nav className="adm-tabs">
          {['overview', 'products', 'orders'].map((t) => (
            <button
              key={t}
              className={`adm-tab ${tab === t ? 'is-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>

        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && (
          <section className="adm-stats">
            <div className="stat-card"><span>Total orders</span><strong>{stats.orders}</strong></div>
            <div className="stat-card"><span>Revenue</span><strong>₹{stats.revenue}</strong></div>
            <div className="stat-card"><span>Products</span><strong>{stats.products}</strong></div>
            <div className="stat-card"><span>Awaiting packing</span><strong>{stats.pending}</strong></div>
          </section>
        )}

        {/* ===== PRODUCTS ===== */}
        {tab === 'products' && (
          <section className="adm-panel">
            <h2>{editing ? 'Edit product' : 'Add a product'}</h2>
            <form className="adm-form" onSubmit={saveProduct}>
              <label>Name
                <input required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>Weight
                <input required placeholder="e.g. 500 g" value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </label>
              <label>Price (₹)
                <input required type="number" min="1" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </label>
              <label>Tag (optional)
                <input placeholder="Bestseller, New, Gift…" value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })} />
              </label>
              <label>Sort order
                <input type="number" value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </label>
              <label className="full">Short description
                <input required value={form.blurb}
                  onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
              </label>
              <label className="full">Full details
                <textarea required rows="4" value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })} />
              </label>
              <div className="adm-form-actions full">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
                </button>
                {editing && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
              </div>
            </form>

            <h2 className="adm-subhead">All products</h2>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr><th>Name</th><th>Weight</th><th>Price</th><th>Tag</th><th></th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.weight}</td>
                      <td>₹{p.price}</td>
                      <td>{p.tag || '—'}</td>
                      <td className="adm-actions">
                        <button className="adm-link" onClick={() => startEdit(p)}>Edit</button>
                        <button className="adm-link danger" onClick={() => removeProduct(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ===== ORDERS ===== */}
        {tab === 'orders' && (
          <section className="adm-panel">
            <h2>Orders</h2>
            {orders.length === 0 ? (
              <p className="adm-empty">No orders yet.</p>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="mono">{o.id.slice(0, 8)}</td>
                        <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          {(o.items || []).map((i) => `${i.name} × ${i.qty}`).join(', ')}
                        </td>
                        <td>₹{o.total}</td>
                        <td>
                          <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}