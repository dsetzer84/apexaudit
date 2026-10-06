# ApexAudit AI

Audit your website's SEO, speed, UX, and copy in seconds — then let AI rewrite the weak spots for you.

A single-page React application built with **Vite**. Paste any URL or landing-page copy and get a 360° audit covering SEO rankability, UX friction, conversion copy, and technical speed — plus 1-click AI code & copy fixes.

## Features

| View | Route (client-side) | Description |
| :--- | :--- | :--- |
| **Landing page** | `landing` | Hero, URL scan form, feature grid, live demo triggers. |
| **Audit Dashboard** | `app` | Real-time audit engine — accepts a URL or raw text, generates scores and interactive AI copy rewrites. |
| **Sample Scans** | `history` | Pre-seeded audit reports for baseline SaaS applications. |
| **Comparison Hub** | `compare-hub` | Lists competitor alternatives. |
| **Comparison Detail** | `compare-detail/<slug>` | Feature-by-feature matrix + FAQ for Surfer SEO, Ahrefs, Semrush, Clearscope and Sitechecker, with Schema.org JSON-LD (Product, FAQPage, BreadcrumbList) injected dynamically. |

## Tech stack

- **React 18** — UI
- **Vite 5** — dev server & production bundler (JSX compiled at build time)
- **Tailwind CSS 3** — compiled via PostCSS (no CDN)
- **lucide-react** — icon components (no global `lucide.createIcons()` DOM scan)

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
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx             # React root
    ├── App.jsx              # route state, audit engine, layout shell
    ├── index.css            # Tailwind directives + glass/glow utilities
    ├── icons.js             # lucide-react icon registry (keyed by legacy names)
    ├── components/
    │   ├── Icon.jsx         # <Icon name="sparkles" /> wrapper
    │   ├── Header.jsx
    │   ├── Footer.jsx
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
        └── CompareDetail.jsx
```

## Deployment

The repo ships a `vercel.json` configured for Vite (`outputDirectory: dist`, SPA rewrites). Push to `main` and import the repo into Vercel, or run `vercel` locally.

## Notes

- The audit engine uses a deterministic, seed-based scoring model for demonstration purposes. Wiring it to a live fetch + LLM backend is the next step toward a production audit service.
- Routing is client-side state (the original app used the same approach); the Vercel rewrite keeps deep links working.

## License

MIT
