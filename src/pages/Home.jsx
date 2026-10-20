import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import ImageSlider from '../components/ImageSlider.jsx'
import { homeSlides } from '../data/slides.js'
import './Home.css'

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(3)
      .then(({ data }) => { if (data) setFeatured(data) })
  }, [])

  return (
    <div className="home">
      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Kolhapur · Maharashtra</span>
            <h1>
              Pure forest honey<br />from the <em>Honey Village</em>
            </h1>
            <p>
              Nestled in the Sahyadri ranges, Patgaon is India's award-winning
              Honey Village — where five gram panchayats craft raw, natural honey
              the traditional way.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">Shop the honey</Link>
              <Link to="/about" className="btn btn-ghost">Our story</Link>
            </div>
          </div>
          <div className="hero-badge" aria-hidden="true">
            <span className="hex">⬡</span>
            <strong>National Bronze</strong>
            <small>Best Rural Tourism · 2023</small>
          </div>
        </div>
      </section>

      {/* ===== Story strip ===== */}
      <section className="strip shell">
        <div className="strip-item">
          <h3>100% raw &amp; natural</h3>
          <p>Harvested and bottled without processing or additives.</p>
        </div>
        <div className="strip-item">
          <h3>Five villages, one craft</h3>
          <p>A Farmer Producer initiative rooted in sustainable beekeeping.</p>
        </div>
        <div className="strip-item">
          <h3>From the Sahyadri</h3>
          <p>Wildflower nectar from forests at the Kolhapur–Konkan edge.</p>
        </div>
      </section>

      {/* ===== Featured + slider ===== */}
      <section className="featured shell">
        <div className="featured-head">
          <span className="eyebrow">From our hive</span>
          <div className="home-slider">
            <ImageSlider slides={homeSlides} />
          </div>
          <h2>Featured honey</h2>
        </div>

        <div className="featured-grid">
          {featured.map((p) => (
            <article className="fcard" key={p.id}>
              <div className="fcard-img" aria-hidden="true">🍯</div>
              <div className="fcard-body">
                <div className="fcard-top">
                  {p.tag && <span className="fcard-tag">{p.tag}</span>}
                  <span className={`stock-badge ${p.in_stock ? 'is-available' : 'is-out'}`}>
                    {p.in_stock ? 'Available' : 'Out of stock'}
                  </span>
                </div>
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                <div className="fcard-foot">
                  <span className="price">₹{p.price}</span>
                  <span className="weight">{p.weight}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="featured-more">
          <Link to="/shop" className="btn btn-ghost">See all products →</Link>
        </div>
      </section>
    </div>
  )
}