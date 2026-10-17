import './PlaceCard.css'

const typeIcon = {
  Fort: '🏰',
  Nature: '🌊',
  Heritage: '🛕',
  Waterfall: '💧',
  Viewpoint: '⛰️',
}

export default function PlaceCard({ place }) {
  return (
    <article className="place-card">
      <div className="place-card-media" aria-hidden="true">
        <span className="place-icon">{typeIcon[place.type] || '⬡'}</span>
        <span className="place-type">{place.type}</span>
      </div>
      <div className="place-card-body">
        <h3>{place.name}</h3>
        <p className="place-distance">
          <span aria-hidden="true">📍</span> {place.distance}
        </p>
        <p className="place-blurb">{place.blurb}</p>
      </div>
    </article>
  )
}