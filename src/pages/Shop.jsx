import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useCart } from '../context/CartContext.jsx'
import './Shop.css'

export default function Shop() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
      if (!alive) return
      if (error) setError(error.message)
      else {
        setProducts(data)
        setActiveId(data[0]?.id ?? null)
      }
      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  const active = products.find((p) => p.id === activeId) || null
  const inStock = active ? active.in_stock !== false : false

  const select = (id) => {
    setActiveId(id)
    setQty(1)
    setAdded(false)
  }

  const payload = () => ({
    id: active.id,
    name: active.name,
    price: active.price,
    weight: active.weight,
  })

  const handleAdd = () => {
    if (!inStock) return
    addItem(payload(), qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1300)
  }

  const handleBuy = () => {
    if (!inStock) return
    addItem(payload(), qty)
    navigate('/cart')
  }

  return (
    <div className="shop">
      <header className="shop-banner">
        <div className="shell shop-banner-inner">
          <div>
            <span className="eyebrow">Shop &amp; Info</span>
            <h1>The honey collection</h1>
            <p>Pick a honey on the left to explore it. Raw, pure, from Patgaon.</p>
          </div>
          <span className="shop-banner-hex" aria-hidden="true">⬡</span>
        </div>
      </header>

      <section className="shell shop-picker-wrap">
        {loading && (
          <div className="shop-state">
            <span className="shop-spinner" aria-hidden="true">⬡</span>
            <p>Loading our honey…</p>
          </div>
        )}

        {error && !loading && (
          <div className="shop-state shop-state-error">
            <p>Couldn't load products: {error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="shop-state">
            <p>No honey available right now. Please check back soon.</p>
          </div>
        )}

        {!loading && !error && active && (
          <div className="shop-picker">
            {/* Left: honey list */}
            <div className="honey-list">
              {products.map((p) => {
                const available = p.in_stock !== false
                return (
                  <button
                    key={p.id}
                    className={`honey-item ${p.id === activeId ? 'is-active' : ''}`}
                    onClick={() => select(p.id)}
                  >
                    <span className="honey-item-name">{p.name}</span>
                    <span className="honey-item-meta">
                      <span className={`stock-dot ${available ? 'is-available' : 'is-out'}`} aria-label={available ? 'Available' : 'Out of stock'} />
                      <span className="honey-item-price">₹{p.price}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Right: detail panel */}
            <div className="honey-detail" key={active.id}>
              <div className="detail-photo" aria-hidden="true">
                <span>🍯</span>
              </div>

              <div className="detail-info">
                <div className="detail-top">
                  {active.tag && <span className="detail-tag">{active.tag}</span>}
                  <span className={`stock-badge ${inStock ? 'is-available' : 'is-out'}`}>
                    {inStock ? 'Available' : 'Out of stock'}
                  </span>
                </div>
                <h2>{active.name}</h2>
                <div className="detail-meta">
                  <span className="detail-price">₹{active.price}</span>
                  <span className="detail-weight">{active.weight}</span>
                </div>
                <p className="detail-text">{active.details}</p>

                <div className="detail-buy">
                  <div className="qty">
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" disabled={!inStock}>−</button>
                    <span className="qty-value">{qty}</span>
                    <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase" disabled={!inStock}>+</button>
                  </div>

                  <div className="detail-actions">
                    <button className={`btn btn-primary ${added ? 'is-added' : ''}`} onClick={handleAdd} disabled={!inStock}>
                      {!inStock ? 'Out of stock' : added ? '✓ Added to cart' : 'Add to cart'}
                    </button>
                    <button className="btn btn-ghost" onClick={handleBuy} disabled={!inStock}>
                      Buy now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="shell shop-info">
        <div className="shop-info-head">
          <span className="eyebrow">Good to know</span>
          <h2>About our honey</h2>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <span className="info-icon" aria-hidden="true">🌼</span>
            <h3>Types of honey</h3>
            <p>Wild guava, jamun, sonvale and karvand. Each jar captures a different season in the Sahyadri forest.</p>
          </div>
          <div className="info-card">
            <span className="info-icon" aria-hidden="true">💛</span>
            <h3>Health benefits</h3>
            <p>Raw, unheated honey keeps its natural enzymes and antioxidants, a gentle sweetener that soothes and nourishes.</p>
          </div>
          <div className="info-card">
            <span className="info-icon" aria-hidden="true">🐝</span>
            <h3>Traditional beekeeping</h3>
            <p>Native bees, sustainable hives, and only surplus honey harvested, so the colonies and the forest stay healthy.</p>
          </div>
        </div>
      </section>
    </div>
  )
}