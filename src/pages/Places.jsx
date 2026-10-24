import { useMemo, useState } from 'react'
import { places } from '../data/places.js'
import PlaceCard from '../components/PlaceCard.jsx'
import PlaceModal from '../components/PlaceModal.jsx'
import './Places.css'

export default function Places() {
  const categories = useMemo(() => ['All', ...new Set(places.map((p) => p.type))], [])
  const [active, setActive] = useState('All')
  const [selected, setSelected] = useState(null)

  const visible = active === 'All' ? places : places.filter((p) => p.type === active)

  return (
    <div className="places">
      <header className="places-head">
        <div className="shell">
          <span className="eyebrow">Places to Visit</span>
          <h1>Explore around Patgaon</h1>
          <p>
            Beyond the honey, Patgaon sits in the heart of the Sahyadri ranges —
            ringed by ancient forts, forest waterfalls, and heritage that dates back
            to Chhatrapati Shivaji Maharaj. Here's where to wander.
          </p>
        </div>
      </header>

      <section className="shell places-body">
        <div className="filter-bar" role="tablist" aria-label="Filter places by type">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              className={`chip ${active === cat ? 'is-active' : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="places-grid">
          {visible.map((place) => (
            <PlaceCard key={place.id} place={place} onOpen={setSelected} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="places-empty">No places in this category yet.</p>
        )}
      </section>

      {selected && <PlaceModal place={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}