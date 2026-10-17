import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">⬡</span>
          <h3>Patgaon</h3>
          <p>
            Pure forest honey from five gram panchayats in the Sahyadri ranges of
            Kolhapur, Maharashtra — India's award-winning Honey Village.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/shop">Shop &amp; Info</Link>
          <Link to="/places">Places to Visit</Link>
          <Link to="/about">About &amp; Contact</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer-col">
          <h4>Visit us</h4>
          <p>Patgaon, Bhudargad Taluka</p>
          <p>Kolhapur District, Maharashtra</p>
          <p>~85 km from Kolhapur city</p>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Patgaon Honey Village</span>
        <span>Best Rural Tourism — National Bronze Award, 2023</span>
      </div>
    </footer>
  )
}
