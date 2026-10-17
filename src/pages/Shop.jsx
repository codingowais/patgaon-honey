import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useCart } from '../context/CartContext.jsx'
import './Shop.css'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeId, setActiveId] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const navigate = useNavigate()

  // Fetch products from Supabase on load
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!alive) return
      if (error) {
        setError(error.message)
      } else {
        setProducts(data)
        setActiveId(data[0]?.id ?? null)
      }
      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  const active = products.find((p) => p.id === activeId) || null

  const select = (id) => {
    setActiveId(id)
    setQty(1)
    setAdded(false)
  }

  const handleAdd = () => {
    addItem({ id: active.id, name: active.name, price: active.price, weight: active.weight }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1300)
  }

    const handleBuy = () => {
    addItem({ id: active.id, name: active.name, price: active.price, weight: active.weight }, qty)
    navigate('/cart')
  }

  return (
    <div className="shop">
      {/* ===== Banner ===== */}
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

      {/* ===== Selector + detail ===== */}
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
            <p>No products yet. Add some in your Supabase dashboard!</p>
          </div>
        )}

        {!loading && !error && active && (
          <div className="shop-picker">
            {/* Left: honey list */}
            <div className="honey-list">
              {products.map((p) => (
                <button
                  key={p.id}
                  className={`honey-item ${p.id === activeId ? 'is-active' : ''}`}
                  onClick={() => select(p.id)}
                >
                  <span className="honey-item-name">{p.name}</span>
                  <span className="honey-item-price">₹{p.price}</span>
                </button>
              ))}
            </div>

            {/* Right: detail panel (re-animates on change via key) */}
            <div className="honey-detail" key={active.id}>
              <div className="detail-photo" aria-hidden="true">
                <span>🍯</span>
              </div>

              <div className="detail-info">
                {active.tag && <span className="detail-tag">{active.tag}</span>}
                <h2>{active.name}</h2>
                <div className="detail-meta">
                  <span className="detail-price">₹{active.price}</span>
                  <span className="detail-weight">{active.weight}</span>
                </div>
                <p className="detail-text">{active.details}</p>

                <div className="detail-buy">
                  <div className="qty">
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                    <span className="qty-value">{qty}</span>
                    <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase">+</button>
                  </div>

                  <div className="detail-actions">
                    <button className={`btn btn-primary ${added ? 'is-added' : ''}`} onClick={handleAdd}>
                      {added ? '✓ Added to cart' : 'Add to cart'}
                    </button>
                    <button className="btn btn-ghost" onClick={handleBuy}>Buy now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== Info cards ===== */}
      <section className="shell shop-info">
        <div className="shop-info-head">
          <span className="eyebrow">Good to know</span>
          <h2>About our honey</h2>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <span className="info-icon" aria-hidden="true">🌼</span>
            <h3>Types of honey</h3>
            <p>Wild multiflora, single-origin Jamun and Karvand — each jar captures a different season in the Sahyadri forest.</p>
          </div>
          <div className="info-card">
            <span className="info-icon" aria-hidden="true">💛</span>
            <h3>Health benefits</h3>
            <p>Raw, unheated honey keeps its natural enzymes and antioxidants — a gentle sweetener that soothes and nourishes.</p>
          </div>
          <div className="info-card">
            <span className="info-icon" aria-hidden="true">🐝</span>
            <h3>Traditional beekeeping</h3>
            <p>Native bees, sustainable hives, and only surplus honey harvested — so the colonies and the forest stay healthy.</p>
          </div>
        </div>
      </section>
    </div>
  )
}