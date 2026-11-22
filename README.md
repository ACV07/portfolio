# Portfolio

Next.js 16 · Tailwind CSS 4 · GSAP (ScrollTrigger) · Three.js

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Make it yours

Almost everything is in **`src/data/site.ts`**: name, role, city, bio, skills,
services, timeline, social links and CV.

- **Photos** go in `/public`, then set `portrait` (Home page, tall 3:5 photo) and
  `cutout` (About spotlight, a PNG with the background removed) in `site.ts`.
- **CV**: put `cv.pdf` in `/public` and set `cvUrl: "/cv.pdf"`.
- **Colours** live at the top of `src/app/globals.css` (`@theme`).

## What's where

| File | What it does |
| --- | --- |
| `src/components/HomeHero.tsx` | Name wall (GSAP marquee + pointer drift), portrait reveal, intro cards |
| `src/components/AboutReveal.tsx` | About opening: pinned scroll timeline — card grows, title splits, spotlight on, story in |
| `src/components/SwirlSky.tsx` | Three.js fragment shader for the swirling night sky |
| `src/components/Skyline.tsx` | Black hills and spires (SVG) |
| `src/components/Timeline.tsx` | "Origin & foundations" with scroll-in animation |
| `src/components/Nav.tsx` / `Footer.tsx` | Site navigation and footer |
| `src/components/ComingSoon.tsx` | Placeholder used by Experience, Projects, Landing pages, Services, Contact |

All animations switch off for visitors who set "reduce motion" on their device.

## Put it online (free)

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com → **Add New → Project** → import the repo → **Deploy**.

## Scripts

- `npm run dev`: local development
- `npm run build`: production build
- `npm run start`: serve the production build
- `npm run lint`: lint
