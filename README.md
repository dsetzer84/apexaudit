# ApexAudit AI

Audit your website's SEO, speed, UX, and copy in seconds — then let AI rewrite the weak spots for you.

A single-page React application built with **Vite**. Paste any URL or landing-page copy and get a 360° audit covering SEO rankability, UX friction, conversion copy, and technical speed — plus 1-click AI code & copy fixes.

## Features

| View | Route (URL) | Description |
| :--- | :--- | :--- |
| **Landing page** | `/` | Hero, URL scan form, feature grid, live demo triggers. |
| **Audit Dashboard** | `/app` | Live audit engine — sends the URL to the `/api/audit` backend, which fetches and analyses the real page, then renders scores and interactive AI copy rewrites. |
| **Sample Scans** | `/history` | Pre-seeded audit reports for baseline SaaS applications. |
| **Comparison Hub** | `/compare` | Lists competitor alternatives. |
| **Comparison Detail** | `/compare/:slug` | Feature-by-feature matrix + FAQ for Surfer SEO, Ahrefs, Semrush, Clearscope and Sitechecker, with Schema.org JSON-LD (Product, FAQPage, BreadcrumbList) injected dynamically. |
| **Not found** | `*` | Catch-all 404 page. |

## Tech stack

- **React 18** — UI
- **Vite 5** — dev server & production bundler (JSX compiled at build time)
- **Tailwind CSS 3** — compiled via PostCSS (no CDN)
- **lucide-react** — icon components (no global `lucide.createIcons()` DOM scan)
- **react-router-dom 6** — real URL routing (`/app`, `/history`, `/compare/:slug`)
- **Vercel serverless function** — `api/audit.js` fetches and analyses the target page server-side

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # serve the production build locally (http://localhost:4173)
```

## Project structure

```
.
├── index.html               # Vite entry (loads /src/main.jsx as a module)
├── vite.config.js           # Vite + @vitejs/plugin-react
├── tailwind.config.js       # brand/accent palette, Inter font
├── postcss.config.js        # tailwindcss + autoprefixer
├── vercel.json              # Vercel deploy config (framework: vite, SPA rewrites)
├── api/
│   └── audit.js             # serverless audit endpoint (fetch + parse + score)
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx             # React root (BrowserRouter)
    ├── App.jsx              # <Routes> table, audit orchestration, layout shell
    ├── index.css            # Tailwind directives + glass/glow utilities
    ├── icons.js             # lucide-react icon registry (keyed by legacy names)
    ├── lib/
    │   └── auditClient.js   # calls /api/audit; seeded demo fallback
    ├── components/
    │   ├── Icon.jsx         # <Icon name="sparkles" /> wrapper
    │   ├── Header.jsx       # NavLink navigation
    │   ├── Footer.jsx
    │   ├── ScrollToTop.jsx  # scroll-to-top on route change
    │   └── AiFixModal.jsx
    ├── hooks/
    │   └── useSchema.js     # JSON-LD structured data injection
    ├── data/
    │   ├── presetSites.js   # seeded demo audits (stripe.com, linear.app)
    │   └── competitors.js   # comparison funnel data
    └── pages/
        ├── LandingPage.jsx
        ├── AuditDashboard.jsx
        ├── HistoryDashboard.jsx
        ├── CompareHub.jsx
        ├── CompareDetail.jsx
        └── NotFound.jsx     # catch-all 404
```

## Deployment

The repo ships a `vercel.json` configured for Vite (`outputDirectory: dist`, SPA rewrites). Push to `main` and import the repo into Vercel, or run `vercel` locally.

## Audit backend (`/api/audit`)

A Vercel Node.js serverless function that performs a **real** audit of a live page.

```
GET  /api/audit?url=https://example.com
POST /api/audit   { "url": "https://example.com" }
```

It fetches the page server-side (following redirects, with a 12 s timeout and a
3 MB cap) and computes genuine signals:

- **SEO** — `<title>` presence/length, meta description presence/length, H1 count,
  heading structure, canonical link, Open Graph + Twitter card tags, JSON-LD,
  `<html lang>`.
- **Speed** — server response time (TTFB), HTML payload size, gzip/brotli
  compression, `<script>` / stylesheet counts.
- **UX** — viewport meta, image alt-text coverage, `lang`, favicon, H1 anchor.
- **Copy** — word count, H1 headline quality, meta-description presence.

Each category is scored 0–100 and combined into an overall score; findings are
returned as `issues[]` (`critical` / `warning` / `passed`) in the exact shape the
UI already renders. Errors are explicit: `400` invalid/blocked URL, `502`
unreachable or non-2xx target, `504` timeout, `415` non-HTML response, `413`
page too large.

> **Limitation:** this is a static-HTML analyser. Signals that need a headless
> browser (LCP/CLS/INP, JS bundle weight, rendered DOM) are not measured —
> "speed" is derived from response time, payload size and request counts.

## Notes

- The frontend calls `/api/audit` for every real URL. The original deterministic,
  seed-based engine is preserved in `src/lib/auditClient.js` as an offline
  fallback (used when the backend is unreachable, e.g. plain `vite dev`), and the
  seeded `stripe.com` / `linear.app` presets remain available as demo data.
- Routing uses **react-router-dom** (`BrowserRouter`), so `/app`, `/history` and
  `/compare/:slug` are real, shareable deep links. The Vercel rewrite serves
  `index.html` for any non-`/api/*` path, so a hard refresh on a deep link works.

## License

MIT
