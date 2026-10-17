import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import './ProductCard.css'

export default function ProductCard({ product, onBuyNow }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const dec = () => setQty((q) => Math.max(1, q - 1))
  const inc = () => setQty((q) => Math.min(99, q + 1))

  const cartPayload = {
    id: product.id,
    name: product.name,
    price: product.price,
    weight: product.weight,
  }

  const handleAdd = () => {
    addItem(cartPayload, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const handleBuy = () => {
    addItem(cartPayload, qty)
    onBuyNow?.()
  }

  return (
    <article className="product">
      <div className="product-info">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <h3>{product.name}</h3>
        <p className="product-blurb">{product.blurb}</p>

        <div className="product-meta">
          <span className="product-price">₹{product.price}</span>
          <span className="product-weight">{product.weight}</span>
        </div>

        <div className="qty">
          <button type="button" onClick={dec} aria-label="Decrease quantity">−</button>
          <span className="qty-value">{qty}</span>
          <button type="button" onClick={inc} aria-label="Increase quantity">+</button>
        </div>

        <div className="product-actions">
          <button
            type="button"
            className={`btn btn-primary ${added ? 'is-added' : ''}`}
            onClick={handleAdd}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleBuy}>
            Buy Now
          </button>
        </div>
      </div>

      <div className="product-photo" aria-hidden="true">
        <span>🍯</span>
      </div>
    </article>
  )
}