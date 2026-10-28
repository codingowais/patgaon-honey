import { useEffect, useState } from 'react'
import './PlaceModal.css'

export default function PlaceModal({ place, onClose }) {
  const photos = place.gallery || []
  const count = photos.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const hasInfo = Boolean(place.bestTime || place.visitTime || place.hours)
  const tips = place.tips || []

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && count) setIndex((i) => (i - 1 + count) % count)
      if (e.key === 'ArrowRight' && count) setIndex((i) => (i + 1) % count)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [count, onClose])

  useEffect(() => {
    if (paused || count < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(id)
  }, [paused, count])

  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  return (
    <div className="pm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={place.name}>
      <div className="pm-panel" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Close">×</button>

        <div
          className="pm-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {count === 0 && <div className="pm-empty">Photos for this place are coming soon.</div>}

          {photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${place.name}, photo ${i + 1}`}
              className={`pm-slide ${i === index ? 'is-active' : ''}`}
            />
          ))}

          {count > 1 && (
            <>
              <button className="pm-arrow prev" onClick={prev} aria-label="Previous photo">‹</button>
              <button className="pm-arrow next" onClick={next} aria-label="Next photo">›</button>
              <span className="pm-counter">{index + 1} / {count}</span>
            </>
          )}
        </div>

        <div className="pm-info">
          <span className="pm-type">{place.type}</span>
          <h2>{place.name}</h2>
          <p className="pm-distance">📍 {place.distance}</p>
          <p className="pm-blurb">{place.blurb}</p>
        </div>

        {hasInfo && (
          <div className="pm-facts">
            {place.bestTime && (
              <div>
                <span>Best time</span>
                <strong>{place.bestTime}</strong>
              </div>
            )}
            {place.visitTime && (
              <div>
                <span>Time needed</span>
                <strong>{place.visitTime}</strong>
              </div>
            )}
            {place.hours && (
              <div>
                <span>Open</span>
                <strong>{place.hours}</strong>
              </div>
            )}
          </div>
        )}

        {tips.length > 0 && (
          <div className="pm-tips">
            <h3>Visitor tips</h3>
            <ul>
              {tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {count > 1 && (
          <div className="pm-thumbs">
            {photos.map((src, i) => (
              <button
                key={src}
                className={`pm-thumb ${i === index ? 'is-active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}