# Agent notes: branches and deploy

This repo has **two live frontends**. Picking the wrong branch or host is the usual reason a change “doesn’t show up.”

## Production hosts

| Host | What serves it | Used by |
|------|----------------|---------|
| `https://shelterluv-animals-api.tallulah-kay.workers.dev` | Cloudflare Worker + static assets from **`vite-cloudflare-embed`** | **Jelly’s Place** (`jellysplace.org/dogs` iframe) and other embeds pointed at Workers |
| `https://sheltertech.github.io/shelterluv-animals-widget/` | GitHub Pages from **`main`** | Older / alternate embeds; README historically documented this URL |

Jelly’s Place does **not** load GitHub Pages. Its dogs page iframe looks like:

```text
https://shelterluv-animals-api.tallulah-kay.workers.dev/animals-widget.html?GID=24538&animalType=Dog&defaultSort=newest&customDetail=true
```

Pushing to `main` alone will **not** update Jelly’s Place.

## Branches

### `vite-cloudflare-embed` (production for Jelly’s Place)

- **Stack:** Vite multipage app + `@cloudflare/vite-plugin`, npm packages (Splide, Slim Select, PhotoSwipe, Handlebars, etc.).
- **Config:** `vite.config.js`, `wrangler.jsonc` (Worker name `shelterluv-animals-api`).
- **Worker:** `worker.js` proxies `GET /api/v1/animals/:id` to Shelterluv; static HTML/JS/CSS ship as Worker assets on the same origin.
- **Detail gallery:** Splide carousel + PhotoSwipe lightbox; mobile shows **one** full-width main photo; lightbox slide area is pinned toward the **top** of the tall (~1048px) embed iframe so it stays on-screen on phones.
- **Embed UX:** Fixed max height (`--embed-max-height`, typically 1048px), “see more,” filter/dropdown fixes, pagination without forcing scroll, etc.

**Local:**

```bash
git checkout vite-cloudflare-embed
npm install
npm start          # Vite; for API use .env / Worker or start:express as needed
```

**Deploy (required for Jelly’s Place / Workers URL):**

```bash
npm run deploy     # vite build && wrangler deploy
```

Needs Wrangler auth and `SHELTERLUV_API_TOKEN` configured for the Worker (e.g. `wrangler secret` / `.dev.vars` locally).

### `main` (GitHub Pages)

- **Stack:** Plain static files — no Vite. CDN scripts (Handlebars, Slim Select, PhotoSwipe UMD) in HTML; `main.js` / `detail.js` / `styles.css` as classic script tags.
- **Worker in repo:** Older `wrangler.toml` + `worker.js` oriented at API-only / Pages CORS (`sheltertech.github.io`). Not the same asset pipeline as the Vite branch.
- **Local:** `npm start` → Express on port 3000 (`server.js`) serving static files + API proxy; needs `.env` with `SHELTERLUV_API_TOKEN`.
- **Release:** Commit + push to `main`; GitHub Pages updates. No `npm run deploy` for the Pages site itself.

Lightbox / mobile one-photo behavior also exists on `main`, but implemented against the older non-Splide gallery. **Do not assume `main` and `vite-cloudflare-embed` share the same gallery code.**

## Which branch should I edit?

- **Jelly’s Place / Workers embed / production iframe** → work on **`vite-cloudflare-embed`**, then **`npm run deploy`**, and push that branch.
- **GitHub Pages URL only** → work on **`main`** and push.
- Features that both hosts need → port deliberately to both; there is no automatic sync.

## Quick checklist when a change “isn’t live”

1. Confirm which URL the site iframe actually loads (Workers vs `sheltertech.github.io`).
2. Confirm you’re on the matching branch.
3. For Workers: confirm you ran `npm run deploy` (push alone is not enough).
4. Hard-refresh; Worker assets are hashed (`/assets/animalDetail-….js`).

## Related query params

- `customDetail=true` — open the custom detail page (where the lightbox lives) instead of Shelterluv’s public page.
- `GID`, `animalType`, `defaultSort` — list widget filters/sort (see README on the branch you’re on; READMEs differ slightly per branch).
