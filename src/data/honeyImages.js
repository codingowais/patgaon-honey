// Each honey uses the photo named after its product id (e.g. jamun-honey.png).
// If a honey has no photo of its own, it falls back to the jamun jar,
// so every honey shows an image until you add its own.
const files = import.meta.glob('../assets/honey/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })

const nameOf = (path) => path.split('/').pop().replace(/\.[^.]+$/, '')

const FALLBACK_ID = 'jamun-honey'

export const honeyImage = (id) => {
  const exact = Object.entries(files).find(([path]) => nameOf(path) === id)
  if (exact) return exact[1]
  const fallback = Object.entries(files).find(([path]) => nameOf(path) === FALLBACK_ID)
  return fallback ? fallback[1] : null
}