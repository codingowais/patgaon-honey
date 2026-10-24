import './PlaceCard.css'

// Icon shown only when a place has no photo yet
const typeIcon = {
  Fort: '🏰',
  Nature: '🌊',
  Heritage: '🛕',
  Waterfall: '💧',
  Viewpoint: '⛰️',
}

export default function PlaceCard({ place, onOpen }) {
  const count = place.gallery?.length || 0
  const open = () => onOpen(place)

  return (
    <article
      className="place-card"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      aria-label={`View photos of ${place.name}`}
    >
      <div className="place-card-media">
        {place.image ? (
          <img src={place.image} alt={place.name} loading="lazy" />
        ) : (
          <span className="place-icon" aria-hidden="true">{typeIcon[place.type] || '⬡'}</span>
        )}
        <span className="place-type">{place.type}</span>
        {count > 1 && <span className="place-count">{count} photos</span>}
      </div>
      <div className="place-card-body">
        <h3>{place.name}</h3>
        <p className="place-distance">
          <span aria-hidden="true">📍</span> {place.distance}
        </p>
        <p className="place-blurb">{place.blurb}</p>
        <span className="place-view">View photos →</span>
      </div>
    </article>
  )
}