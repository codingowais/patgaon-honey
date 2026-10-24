// Real attractions. Each place has its own folder: src/assets/places/<id>/
// Every photo in that folder becomes part of the place's gallery, sorted by file name.
const files = import.meta.glob('../assets/places/**/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })

const galleryFor = (id) =>
  Object.keys(files)
    .filter((path) => path.includes(`/places/${id}/`))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((path) => files[path])

const raw = [
  { id: 'rangana-fort', name: 'Rangana Fort', distance: 'Kolhapur–Sindhudurg border', type: 'Fort',
    blurb: 'A majestic 12th-century hill fort set in dense forest, offering sweeping Sahyadri views and a rewarding trek.' },
  { id: 'patgaon-dam', name: 'Patgaon Dam', distance: 'In the village', type: 'Nature',
    blurb: 'An earthen dam on the Vedganga river with a calm reservoir — a peaceful spot for the backwaters and birdlife.' },
  { id: 'mauni-math', name: 'Mauni Maharaj Math', distance: 'In the village', type: 'Heritage',
    blurb: 'A historic math once visited by Chhatrapati Shivaji Maharaj during his southern campaigns; its grand gate still stands.' },
  { id: 'naikwadi-falls', name: 'Naikwadi Waterfall', distance: 'Near Patgaon', type: 'Waterfall',
    blurb: 'A tranquil monsoon waterfall tucked into the forest — ideal for a short hike and photography.' },
]

export const places = raw.map((p) => {
  const gallery = galleryFor(p.id)
  return { ...p, gallery, image: gallery[0] || null }
})