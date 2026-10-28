import { useState } from 'react'
import './About.css'

const cards = [
  { value: '5', label: 'Gram panchayats' },
  { value: '2023', label: 'National tourism award' },
  { value: '~85 km', label: 'From Kolhapur city' },
  { value: '100%', label: 'Raw & natural honey' },
  { value: '1', label: 'Farmer Producer initiative' },
]

export default function About() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.')
      return
    }
    // No backend for the form yet, so just show the confirmation
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="about">
      <div className="shell about-wrap">
        {/* ===== Header card ===== */}
        <header className="about-head">
          <span className="eyebrow">About &amp; Contact</span>
          <h1>The story of the Honey Village</h1>
          <p>
            Tucked into the Sahyadri ranges at the edge of Kolhapur and the Konkan,
            Patgaon has turned honey into a way of life, and put a small village on
            India's tourism map.
          </p>
           
        </header>

        {/* ===== Main frame ===== */}
        <div className="about-frame">
          {/* Five square cards */}
          <div className="about-cards">
            {cards.map((c) => (
              <div className="about-card" key={c.label}>
                <span className="about-card-value">{c.value}</span>
                <span className="about-card-label">{c.label}</span>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="about-story">
            <div>
              <h2>Five villages, one hive</h2>
              <p>
                Patgaon's honey is a shared effort. Five neighbouring gram panchayats
                came together under a Farmer Producer initiative, backed by the
                Maharashtra State Khadi &amp; Village Industries Board, to harvest and
                bottle pure forest honey using sustainable beekeeping.
              </p>
            </div>
            <div>
              <h2>Recognised nationally</h2>
              <p>
                In 2023, Patgaon was awarded the National Bronze in the "Best Rural
                Tourism Village" category, chosen from over 750 villages across India.
                Visitors come for Rangana Fort, forest waterfalls, and a heritage tied to
                Chhatrapati Shivaji Maharaj.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="about-contact">
            <div className="contact-info">
              <span className="eyebrow">Get in touch</span>
              <h2>Visit us or say hello</h2>
              <p>
                Planning a trip, a bulk honey order, or just curious? Send us a note
                and we'll get back to you.
              </p>
              <ul className="contact-list">
                <li><strong>Address</strong>Patgaon, Bhudargad Taluka, Kolhapur District, Maharashtra</li>
                <li><strong>Email</strong>Patgaon.legal@gmail.com</li>
                <li><strong>Phone</strong>+91 9372491265</li>
              </ul>
            </div>

            <div className="contact-form-wrap">
              {sent ? (
                <div className="contact-success">
                  <span className="success-mark" aria-hidden="true">✓</span>
                  <h3>Thanks for reaching out!</h3>
                  <p>We've received your message and will reply soon.</p>
                  <button className="btn btn-ghost" onClick={() => setSent(false)}>
                    Send another
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <label>
                    Name
                    <input type="text" value={form.name} onChange={update('name')} placeholder="Your name" />
                  </label>
                  <label>
                    Email
                    <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
                  </label>
                  <label>
                    Message
                    <textarea rows="5" value={form.message} onChange={update('message')} placeholder="How can we help?" />
                  </label>
                  {error && <p className="form-error">{error}</p>}
                  <button type="submit" className="btn btn-primary">Send message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}