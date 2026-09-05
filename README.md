# shelterluv-animals-widget

Vite multipage widget + Cloudflare Worker (static assets and `/api` on the same deploy).

**Production host:** `https://shelterluv-animals-api.tallulah-kay.workers.dev`

## Embed the widget

The widget page is `animals-widget.html` and reads:

- `GID` — Shelterluv Group ID
- `animalType` — e.g. `Dog`, `Cat`, `Bird`, `Barnyard`, `Small Mammal` (URL-encode spaces)

### Embed URL

```
https://shelterluv-animals-api.tallulah-kay.workers.dev/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE
```

```html
<iframe
  src="https://shelterluv-animals-api.tallulah-kay.workers.dev/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE"
  title="Adoptable animals"
  width="100%"
  height="900"
  style="border:0;"
  loading="lazy"
></iframe>
```

Replace:
- `YOUR_GID` with your Shelterluv Group ID (example: `A1234`)
- `ANIMAL_TYPE` with `Dog`, `Cat`, etc. (`Small Mammal` → `Small%20Mammal`)

Where to find `GID` in Shelterluv: **Generate iFrame** → copy `GID` from the generated snippet.

### Optional: responsive wrapper

```html
<div style="max-width:1200px;margin:0 auto;">
  <iframe
    src="https://shelterluv-animals-api.tallulah-kay.workers.dev/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE"
    title="Adoptable animals"
    width="100%"
    height="900"
    style="border:0;"
    loading="lazy"
  ></iframe>
</div>
```

### Custom detail page

Add `customDetail=true` to open the in-app detail page:

```
https://shelterluv-animals-api.tallulah-kay.workers.dev/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE&customDetail=true
```

## Local development

1. `npm install`
2. Put your Shelterluv API token in `.dev.vars` (or `.env`):

```bash
cp .dev.vars.example .dev.vars
```

3. `npm run dev`

Open:

`http://localhost:5173/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE&customDetail=true`

### Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Vite + Cloudflare Worker locally |
| `npm run build` | Production client + Worker build |
| `npm run preview` | Preview the build in workerd |
| `npm run deploy` | Build and deploy to Cloudflare |

## Deploy

```bash
npx wrangler secret put SHELTERLUV_API_TOKEN
npm run deploy
```

UI and API ship together on the Worker URL above.

## Shelterluv API

- Public list (browser): `GET /api/v3/available-animals/{GID}?animalType=...`
- Authenticated detail (via Worker): `GET /api/v1/animals/{id}` with `Authorization: Bearer ...`
