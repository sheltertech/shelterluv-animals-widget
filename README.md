# shelterluv-animals-widget

## Embed the widget

This project serves a standalone page at `animals-widget.html` and reads two query params:

- `GID` - your Shelterluv Group ID
- `animalType` - animal type to show (for example `Dog`, `Cat`, etc.)

### 1) Use the GitHub Pages URL

This widget is hosted on GitHub Pages for this repository.

Hosted URL:

`https://sheltertech.github.io/shelterluv-animals-widget/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE`

Replace:
- `YOUR_GID` with your Shelterluv Group ID (example: `A1234`)
- `animalType` with one of: `Dog`, `Cat`, `Bird`, `Barnyard`, `Small Mammal`

For multi-word animal types, URL-encode spaces:
- `Small Mammal` -> `Small%20Mammal`

Where to find your `GID` in Shelterluv:
- Open Shelterluv's **Generate iFrame** tool.
- Generate an iframe snippet for your adoptable animals.
- In the generated URL/snippet, copy the value used for `GID` (for example, `GID=A1234`).

Example:

`https://sheltertech.github.io/shelterluv-animals-widget/animals-widget.html?GID=A1234&animalType=ANIMAL_TYPE`

### 2) Embed with an iframe

Paste this on your site:

```html
<iframe
  src="https://sheltertech.github.io/shelterluv-animals-widget/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE"
  title="Adoptable animals"
  width="100%"
  height="900"
  style="border:0;"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

### 3) Optional: responsive wrapper

```html
<div style="max-width:1200px;margin:0 auto;">
  <iframe
    src="https://sheltertech.github.io/shelterluv-animals-widget/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE"
    title="Adoptable animals"
    width="100%"
    height="900"
    style="border:0;"
    loading="lazy"
  ></iframe>
</div>
```

## Custom adoption detail page (feature flag)

By default, clicking an animal opens the Shelterluv public page. To try the custom detail page, add `customDetail=true`:

`https://sheltertech.github.io/shelterluv-animals-widget/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE&customDetail=true`

The detail page shows , key facts, attributes, and description. The **Apply for Adoption** button links to the Shelterluv MatchMe application for that animal.

On GitHub Pages, rich detail data comes from a Cloudflare Worker proxy (see below). Without the Worker, the page falls back to the public list feed / `sessionStorage`.

## Running locally

1. `npm install`
2. Copy `.env.example` to `.env` and set your Shelterluv API token:

```bash
cp .env.example .env
```

The token is used server-side only via `Authorization: Bearer ...` and is never exposed to the browser.

3. `npm start`

Then open:

`http://localhost:3000/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE&customDetail=true`

Locally, the detail page loads full animal data through the Express proxy at `/api/v1/animals/:id`.

## Cloudflare Worker (production detail API)

The Worker proxies `GET /api/v1/animals/:id` to Shelterluv with your API token. CORS allows only `https://sheltertech.github.io`.

1. Deploy:

```bash
npm run deploy:worker
```

2. Set the secret:

```bash
npx wrangler secret put SHELTERLUV_API_TOKEN
```

3. Copy the Worker URL from the deploy output (or the Cloudflare dashboard) into `CLOUDFLARE_DETAIL_API_BASE` at the top of `detail.js`, for example:

```js
const CLOUDFLARE_DETAIL_API_BASE = 'https://shelterluv-animals-api.YOUR_SUBDOMAIN.workers.dev';
```

## Shelterluv API

This project uses two Shelterluv endpoints:

- Public list feed (widget): `GET /api/v3/available-animals/{GID}?animalType=...`
- Authenticated animal details (detail page, via local Express or Cloudflare Worker):
  - `GET /api/v1/animals/{id}` — single animal details

Authenticated requests require:

```bash
Authorization: Bearer YOUR_SECRET_TOKEN
```
