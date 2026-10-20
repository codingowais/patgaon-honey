import { useEffect, useState } from 'react'
import './ImageSlider.css'

export default function ImageSlider({ slides, interval = 4500 }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Auto-advance every few seconds; pause on hover; respect reduced-motion
  useEffect(() => {
    if (paused || reduceMotion || count < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => clearInterval(id)
  }, [paused, reduceMotion, count, interval])

  if (!count) return null
  const go = (i) => setIndex((i + count) % count)

  return (
    <div
      className="slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => (
        <div key={i} className={`slide ${i === index ? 'is-active' : ''}`} aria-hidden={i !== index}>
          {s.image ? (
            <img src={s.image} alt={s.title} />
          ) : (
            <div className="slide-bg" style={{ background: s.bg }} />
          )}
          <div className="slide-caption">
            <span className="slide-eyebrow">{s.eyebrow}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        </div>
      ))}

      <button className="slider-arrow prev" onClick={() => go(index - 1)} aria-label="Previous slide">‹</button>
      <button className="slider-arrow next" onClick={() => go(index + 1)} aria-label="Next slide">›</button>

      <div className="slider-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`slider-dot ${i === index ? 'is-active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}