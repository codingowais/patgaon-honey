# Patgaon — The Honey Village 🍯

A React website for Patgaon, the award-winning "Honey Village" in Kolhapur, Maharashtra.
Final-year project. Built with **Vite + React + React Router**.

## Run it

You need [Node.js](https://nodejs.org) (v18 or newer) installed. Then, in this folder:

```bash
npm install     # first time only — downloads dependencies
npm run dev     # starts the dev server
```

Open the URL it prints (usually http://localhost:5173).

Other commands:

```bash
npm run build     # production build into /dist
npm run preview   # preview the production build
```

## What's here (Week 1 shell)

- ✅ Five routes wired up: Home, Shop & Info, Places, About & Contact, Login
- ✅ Honey theme (colors + Fraunces/DM Sans fonts) in `src/index.css`
- ✅ Sticky Navbar + Footer, both responsive with a mobile menu
- ✅ Home page fully designed (hero, story strip, featured products)
- ✅ Cart + Auth contexts stubbed and ready to expand
- ✅ Seed data for products and places

## Project structure

```
src/
├── components/   Navbar, Footer (reusable across pages)
├── pages/        Home, Shop, Places, About, Login (one per route)
├── context/      CartContext (cart state), AuthContext (login state)
├── data/         products.js, places.js — edit these to change content
├── App.jsx       route definitions
├── main.jsx      app entry (providers + router)
└── index.css     theme tokens + shared styles
```

## Roadmap

| Week | Focus |
|------|-------|
| 1 | ✅ Shell — routing, theme, navbar/footer, Home page |
| 2 | Places page + About/Contact + Shop info section |
| 3 | Shop product grid, cart logic, Login + auth |
| 4 | Responsive polish, testing, deploy (Vercel/Netlify) |

## Tips

- To add a honey product, add one object to `src/data/products.js`.
- To add an attraction, add one object to `src/data/places.js`.
- Replace the ⬡ placeholder graphics with real photos in `src/assets/`.
- Login is **simulated** (no backend) — fine for a demo. See `AuthContext.jsx`.
