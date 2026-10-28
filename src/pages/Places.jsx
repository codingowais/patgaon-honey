import { useEffect, useMemo, useState } from 'react'
import { places as basePlaces } from '../data/places.js'
import { supabase } from '../lib/supabase.js'
import PlaceCard from '../components/PlaceCard.jsx'
import PlaceModal from '../components/PlaceModal.jsx'
import './Places.css'

export default function Places() {
  const [info, setInfo] = useState({})
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [selected, setSelected] = useState(null)

  // Load the visitor info (best time, tips, distance) from the database
  useEffect(() => {
    supabase
      .from('place_info')
      .select('*')
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach((r) => { map[r.id] = r })
        setInfo(map)
      })
  }, [])

  // Merge the database info into each place
  const all = useMemo(
    () =>
      basePlaces.map((p) => {
        const i = info[p.id]
        if (!i) return p
        return {
          ...p,
          bestTime: i.best_time,
          visitTime: i.visit_time,
          hours: i.opening_hours,
          distanceKm: i.distance_km,
          tips: i.tips || [],
        }
      }),
    [info]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = all.filter((p) => !q || p.name.toLowerCase().includes(q))
    if (sort === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
    if (sort === 'near') {
      list = [...list].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    }
    return list
  }, [all, query, sort])

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
        <div className="places-tools">
          <input
            className="places-search"
            type="search"
            placeholder="Search places…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search places"
          />
          <select
            className="places-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort places"
          >
            <option value="featured">Featured</option>
            <option value="az">A to Z</option>
            <option value="near">Nearest first</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <p className="places-empty">No places match “{query}”.</p>
        ) : (
          <div className="places-grid">
            {visible.map((place) => (
              <PlaceCard key={place.id} place={place} onOpen={setSelected} />
            ))}
          </div>
        )}
      </section>

      {selected && <PlaceModal place={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}