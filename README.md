# ApexAudit AI

Audit your website's SEO, speed, UX and copy in seconds — then let AI rewrite the weak spots.

A self-contained, static single-page app (React 18 + Babel-standalone + Tailwind CDN + Lucide icons loaded
from `<script>` tags). No build step is required to run it — it is a single `index.html`.

## What's in the app

| Route | Screen |
| --- | --- |
| `/` | Marketing landing page with live demo triggers |
| `/app` | Real-time audit engine (score gauges, severity badges, AI copy rewrites) |
| `/history` | Sample-scans dashboard, pre-seeded with realistic SaaS audits |
| `/compare` | SEO comparison funnel hub |
| `/compare/surfer-seo` · `/compare/ahrefs` · `/compare/semrush` · `/compare/clearscope` · `/compare/sitechecker` | Competitor comparison pages, with dynamic JSON-LD (`Product`, `FAQPage`, `BreadcrumbList`) |

The client router is in-memory, so `/app`, `/history` and `/compare/*` are reached via
rewrites to `index.html` rather than by real static pages.

## Local development

```bash
npm install      # no runtime dependencies; installs nothing but pins the tree
npm run build    # validates the deployable site (fails fast if index.html is broken)
npm start        # serves on http://localhost:3000 with SPA fallback
```

`npm run build` does not transpile anything — the app is already deployable. It validates that
`index.html`, `vercel.json`, `package.json` and `404.html` are present and internally consistent,
so a broken push fails CI and Vercel instead of shipping a blank page.

## Deploying to Vercel

The repo ships a `vercel.json`, so the project needs no manual build configuration:

- **Framework preset:** Other
- **Build command:** `npm run build` (declared in `vercel.json`)
- **Output directory:** `.` (declared in `vercel.json`)
- **Install command:** `npm install` (declared in `vercel.json`)

`vercel.json` also sets:

- `cleanUrls: true` / `trailingSlash: false`
- an SPA rewrite — `/((?!.*\.).*)` → `/index.html` — so `/app`, `/history` and `/compare/*` resolve
- security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)

### First-time setup

1. In the Vercel dashboard, **Add New → Project → Import Git Repository** and pick `dsetzer84/apexaudit`.
2. Leave the framework preset on **Other** — Vercel reads `vercel.json`, so build/output settings are already correct.
3. Deploy. The production URL must be `apexaudit-ai.vercel.app`; if Vercel assigns a different slug,
   either rename the project under **Settings → General → Project Name**, or update the `homepage` and the
   URLs in `robots.txt` / `sitemap.xml` to match the assigned domain.
4. Under **Settings → Domains**, confirm `apexaudit-ai.vercel.app` is attached to Production.

## Notes

- The audit engine currently uses seeded/derived sample data (`PRESET_SITES`) — plugging in a real
  fetch-and-analyse backend is the next step toward a production product.
- CDN scripts are pinned to React 18 and Tailwind's play CDN. Tailwind's play CDN is intended for
  prototyping; a compiled Tailwind stylesheet is the recommended follow-up for production.
