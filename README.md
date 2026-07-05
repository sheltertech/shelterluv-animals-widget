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
1. `npm install`
2. `npm start`

Then open:

`http://localhost:3000/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE`

### Windows + WSL troubleshooting

If you see an error like:

- `CMD.EXE was started with the above path as the current directory`
- `UNC paths are not supported`
- `Error: Cannot find module 'C:\\Windows\\server.js'`

you launched Node from **Windows cmd.exe** while your project lives in a WSL path (`\\wsl.localhost\...`). `cmd` falls back to `C:\\Windows`, so `node server.js` looks for `C:\\Windows\\server.js`.

Use one of these options instead:

1. Run from WSL (recommended):

```bash
cd ~/shelterluv-animals-widget
npm install
npm start
```

2. Or start the command through WSL from Windows terminal:

```powershell
wsl -d Ubuntu bash -lc "cd ~/shelterluv-animals-widget && npm install && npm start"
```

3. If you must use Windows `cmd`, move/clone the repo to a Windows path (for example `C:\dev\...`) and run it there.
