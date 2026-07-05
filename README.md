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

## Running locally

> **WSL users:** run these commands inside your WSL/Linux terminal (e.g. the Ubuntu app or `wsl` in Windows Terminal), **not** from CMD.EXE or PowerShell.
> CMD.EXE does not support UNC paths (`\\wsl.localhost\...`) and will default to `C:\Windows`, causing a `Cannot find module` error.

1. `npm install`
2. `npm start`

Then open:

`http://localhost:3000/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE`
