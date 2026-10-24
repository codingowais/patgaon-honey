// Slider photos are read from src/assets/slides/ in file-name order:
// slide-1.jpg, slide-2.jpg, slide-3.jpg
// Captions below are matched to the photos in the same order.

const files = import.meta.glob('../assets/slides/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })

const images = Object.keys(files)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((path) => files[path])

const captions = [
  {
    eyebrow: 'Pure forest honey',
    title: 'From the Sahyadri hills',
    text: 'Wildflower honey gathered by the village beekeepers of Patgaon.',
    fallback: 'linear-gradient(135deg, #E9A319 0%, #B5651D 100%)',
  },
  {
    eyebrow: 'Our community',
    title: 'Five villages, one craft',
    text: 'A Farmer Producer initiative rooted in sustainable beekeeping.',
    fallback: 'linear-gradient(135deg, #3B6D11 0%, #27500A 100%)',
  },
  {
    eyebrow: 'Recognised nationally',
    title: 'The Honey Village',
    text: 'National Bronze for Best Rural Tourism Village, 2023.',
    fallback: 'linear-gradient(135deg, #B5651D 0%, #2C2C2A 100%)',
  },
]

export const homeSlides = captions.map((c, i) => ({
  eyebrow: c.eyebrow,
  title: c.title,
  text: c.text,
  image: images[i] || null,
  bg: c.fallback,
}))