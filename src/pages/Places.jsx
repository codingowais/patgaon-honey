import { useState } from 'react'
import { places } from '../data/places.js'
import PlaceCard from '../components/PlaceCard.jsx'
import PlaceModal from '../components/PlaceModal.jsx'
import './Places.css'

export default function Places() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="places">
      <header className="places-head">
        <div className="shell">
          <span className="eyebrow">Places to Visit</span>
          <h1>Explore around Patgaon</h1>
          <p>
            Beyond the honey, Patgaon sits in the heart of the Sahyadri ranges,
            ringed by ancient forts, forest waterfalls, and heritage that dates back
            to Chhatrapati Shivaji Maharaj. Here's where to wander.
          </p>
        </div>
      </header>

      <section className="shell places-body">
        <div className="places-grid">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onOpen={setSelected} />
          ))}
        </div>

        {places.length === 0 && (
          <p className="places-empty">No places to show yet.</p>
        )}
      </section>

      {selected && <PlaceModal place={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}