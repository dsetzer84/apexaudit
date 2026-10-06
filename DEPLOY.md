# Deploying ApexAudit to Vercel

The app is a Vite + React SPA with a serverless audit backend at `api/audit.js`.
`vercel.json` already declares the correct config:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

The rewrite sends every non-`/api/*` path to `index.html` (SPA fallback for
`/app`, `/history`, `/compare`, `/compare/:slug`), while `/api/*` still reaches
the serverless function.

## Why https://apexaudit-ai.vercel.app returns 404

The domain resolves to Vercel's anycast IPs, so it is claimed by a Vercel
account — but **no project is serving it**. Vercel answers with its own
`NOT_FOUND` page. Two things must be true for the site to come up:

1. A Vercel project is linked to `dsetzer84/apexaudit`.
2. That project has a **production deployment**.

## Option A — Deploy from the Vercel dashboard (no CLI)

1. Go to <https://vercel.com/new> and **Import Git Repository** →
   `dsetzer84/apexaudit`.
2. Framework preset: **Vite** (auto-detected). Confirm:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Set the **Project Name** to exactly `apexaudit-ai` so the production URL is
   `https://apexaudit-ai.vercel.app`. If that name is taken by another project
   in your account, either rename that project or attach the domain under
   **Settings → Domains**.
4. Click **Deploy**.

## Option B — Deploy from the CLI

```bash
npm install --global vercel@latest
vercel login
vercel link            # choose the apexaudit project, name it apexaudit-ai
vercel --prod
```

## Option C — Automatic deploys from GitHub Actions (recommended)

`.github/workflows/build.yml` has a `deploy` job that runs **only after the
`build` job succeeds** and **only on `main`** (never on pull requests). It is
**inert until you add the secrets** — without them the job skips cleanly instead
of failing CI.

Add these under **Settings → Secrets and variables → Actions** (a repository
**variable** of the same name also works — the workflow reads
`secrets.X || vars.X`):

| Name | Required | Where to get it |
| --- | --- | --- |
| `VERCEL_TOKEN` | yes | <https://vercel.com/account/tokens> → Create Token |
| `VERCEL_ORG_ID` | for the prebuilt flow / team scope | Vercel dashboard → **Team Settings → Team ID**, or the `orgId` field in `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | for the prebuilt flow | Vercel dashboard → **Project Settings → General → Project ID**, or the `projectId` field in `.vercel/project.json` |

### Two deploy flows

The job picks the flow automatically:

- **Prebuilt flow (preferred)** — used when **both** `VERCEL_ORG_ID` and
  `VERCEL_PROJECT_ID` are set:
  ```bash
  vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
  vercel build --prod --token="$VERCEL_TOKEN"
  vercel deploy --prebuilt --prod --yes --token="$VERCEL_TOKEN"
  ```
  The build happens in CI and only the prebuilt output is uploaded, so the
  deployed artifact is exactly what CI verified.
- **Remote-build fallback** — used when the two IDs are absent: a remote build
  pinned to project `apexaudit-ai` (`vercel deploy --prod --yes --project
  apexaudit-ai`). The run emits a `::notice` telling you to add the two IDs to
  switch to the prebuilt flow.

Once `VERCEL_TOKEN` is present, the next push to `main` (or a manual
**Run workflow**) builds and deploys automatically. The deployment URL is
printed in the job log and in the run's **Summary**.

## Verify after deploying

```bash
for p in / /app /history /compare /compare/ahrefs; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' https://apexaudit-ai.vercel.app$p)"
done
# all should print 200

curl -s "https://apexaudit-ai.vercel.app/api/audit?url=https://example.com" | head -c 300
# should return a JSON audit result with "scores" and "issues"
```

A hard refresh on a deep link (e.g. `/compare/ahrefs`) must render the app, not
a 404 — that is what the `rewrites` rule above guarantees.
