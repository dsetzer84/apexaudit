# ApexAudit AI

Audit your website's SEO, speed, UX, and copy in seconds — then let AI rewrite the weak spots for you.

A single-page React application built with **Vite** and **react-router**. Paste any URL or landing-page copy and get a 360° audit covering SEO rankability, UX friction, conversion copy, and technical speed — plus 1-click AI code & copy fixes.

## Features

| View | Route | Description |
| :--- | :--- | :--- |
| **Landing page** | `/` | Hero, URL scan form, feature grid, live demo triggers. |
| **Audit Dashboard** | `/app` | Real-time audit engine — accepts a URL or raw text, generates scores and interactive AI copy rewrites. |
| **Sample Scans** | `/history` | Pre-seeded audit reports for baseline SaaS applications. |
| **Comparison Hub** | `/compare` | Lists competitor alternatives. |
| **Comparison Detail** | `/compare/:slug` | Feature-by-feature matrix + FAQ for Surfer SEO, Ahrefs, Semrush, Clearscope and Sitechecker, with Schema.org JSON-LD (Product, FAQPage, BreadcrumbList) injected dynamically. |
| **Not found** | `*` | Catch-all 404 page. |

Every view is a real, shareable deep link — the browser Back/Forward buttons work, and the Vercel SPA rewrite serves `index.html` for any path so a hard refresh on `/compare/ahrefs` resolves correctly.

## Tech stack

- **React 18** — UI
- **react-router-dom 6** — client-side routing (`BrowserRouter`, `Routes`, `Link`/`NavLink`, `useParams`)
- **Vite 5** — dev server & production bundler (JSX compiled at build time)
- **Tailwind CSS 3** — compiled via PostCSS (no CDN)
- **lucide-react** — icon components (no global `lucide.createIcons()` DOM scan)

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # serve the production build locally (http://localhost:4173)
npm run verify     # validate the dist/ build output (run after build)
```

## Project structure

```
.
├── index.html               # Vite entry (loads /src/main.jsx as a module)
├── vite.config.js           # Vite + @vitejs/plugin-react
├── tailwind.config.js       # brand/accent palette, Inter font
├── postcss.config.js        # tailwindcss + autoprefixer
├── vercel.json              # Vercel deploy config (framework: vite, SPA rewrites)
├── 404.html                 # static 404 for non-SPA hosts
├── public/
│   └── favicon.svg
├── scripts/
│   ├── build.mjs            # post-build validation (npm run verify)
│   └── serve.mjs            # local preview server with SPA fallback
└── src/
    ├── main.jsx             # React root + BrowserRouter
    ├── App.jsx              # <Routes> table, audit engine, layout shell
    ├── index.css            # Tailwind directives + glass/glow utilities
    ├── icons.js             # lucide-react icon registry (keyed by legacy names)
    ├── components/
    │   ├── Icon.jsx         # <Icon name="sparkles" /> wrapper
    │   ├── Header.jsx       # NavLink navigation
    │   ├── Footer.jsx       # Link navigation
    │   ├── AiFixModal.jsx
    │   └── ScrollToTop.jsx  # scroll-to-top on route change
    ├── hooks/
    │   └── useSchema.js     # JSON-LD structured data injection (route-aware)
    ├── data/
    │   ├── presetSites.js   # seeded demo audits (stripe.com, linear.app)
    │   └── competitors.js   # comparison funnel data
    └── pages/
        ├── LandingPage.jsx
        ├── AuditDashboard.jsx
        ├── HistoryDashboard.jsx
        ├── CompareHub.jsx
        ├── CompareDetail.jsx
        └── NotFound.jsx
```

## Deployment

The repo ships a `vercel.json` configured for Vite (`outputDirectory: dist`, SPA rewrites). Push to `main` and import the repo into Vercel, or run `vercel` locally.

## Notes

- The audit engine uses a deterministic, seed-based scoring model for demonstration purposes. Wiring it to a live fetch + LLM backend is the next step toward a production audit service.
- Routing is handled by react-router; the Vercel rewrite keeps deep links working on a static host.

## License

MIT
