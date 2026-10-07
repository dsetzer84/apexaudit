# Vercel deploy troubleshooting

The `deploy` job in `.github/workflows/build.yml` publishes a
`.deploy-status.json` file back into the repo whenever it fails, so the
failure can be diagnosed without dashboard access to the Actions logs.

Read it with:

```bash
curl -s "https://api.github.com/repos/dsetzer84/apexaudit/contents/.deploy-status.json?ref=main" \
  | python3 -c "import json,sys,base64; print(base64.b64decode(json.load(sys.stdin)['content']).decode())"
```

## Telling the two failures apart

Look at **which step** failed in the `deploy` job:

| Symptom in the run | Meaning | Fix |
| --- | --- | --- |
| `Check for Vercel credentials` ran, every step after it is `skipped` | The secret is **not visible** to the job | Re-add it as a **repository** secret (not an environment secret, not a variable) with the exact name `VERCEL_TOKEN` |
| `Check for Vercel credentials` = success, `Deploy to production` = **failure** | The secret is **visible but rejected** | The stored **value** is wrong — see below |

## `Error: The token provided via --token argument is not valid`

Published in `.deploy-status.json` under `whoami`, usually alongside
`"deploy": "... Error: Not authorized"`.

This means the value stored in `VERCEL_TOKEN` is not accepted by Vercel. Causes,
in order of likelihood:

1. **Stray whitespace / truncation** from copy-paste. Delete and re-add the
   secret rather than editing it.
2. The token was **revoked, expired or regenerated** in the Vercel dashboard.
3. The token belongs to a **different Vercel account** than the one owning the
   project.

Fix: create a fresh token at <https://vercel.com/account/tokens> and **replace**
(delete then re-add) the `VERCEL_TOKEN` repository secret.

Sanity-check locally before touching CI:

```bash
npx vercel@latest whoami --token=<the-token-you-pasted>
```

If that prints `Error: The token provided ... is not valid`, the token value is
the problem — not the workflow YAML.

## `also_present: { VERCEL_ORG_ID: false, VERCEL_PROJECT_ID: false }`

The job could not see the two IDs, so it used the **remote-build fallback**
(`vercel deploy --prod --project apexaudit-ai`) instead of the prebuilt flow.

Add both as repository secrets/variables:

- `VERCEL_ORG_ID` — Vercel dashboard → **Team Settings → Team ID**, or the
  `orgId` field in `.vercel/project.json` after running `vercel link`
- `VERCEL_PROJECT_ID` — Vercel dashboard → **Project Settings → General →
  Project ID**, or the `projectId` field in `.vercel/project.json`

The quickest way to get both at once is to run `vercel link` in a local
checkout and read `.vercel/project.json`:

```json
{ "orgId": "...", "projectId": "..." }
```

Once both are set, the job switches to the prebuilt flow automatically —
no workflow change needed.

## The site returns 404 on every route

Authentication succeeded but no production deployment exists. Check the
`deploy` job actually reached `Deploy to production` (not `skipped`), then
re-run `Actions → build → Run workflow`. The `smoke` job that follows asserts
`/`, `/app`, `/history`, `/compare`, `/compare/ahrefs` and
`/api/audit?url=https://example.com` all return HTTP 200 and fails the run on
any non-200, so a green run proves production is actually serving.
