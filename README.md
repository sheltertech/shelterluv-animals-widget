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

### WSL on Windows

If your project lives in WSL (for example `/home/tallulah/shelterluv-animals-widget`) but you run `npm start` from **Windows CMD or PowerShell** using a UNC path like `\\wsl.localhost\Ubuntu\...`, Windows cannot use that path as the working directory. CMD falls back to `C:\Windows`, and Node then looks for `C:\Windows\server.js` and fails.

**Recommended:** run the app from inside WSL:

```bash
cd ~/shelterluv-animals-widget
npm install
npm start
```

In VS Code or Cursor, use **"Reopen Folder in WSL"** (or open the project from the WSL terminal) so the integrated terminal runs in Linux, not Windows.

**Alternatives:**
- Clone or copy the repo to a Windows path (for example `C:\Users\you\projects\shelterluv-animals-widget`) and run `npm start` there.
- From Windows CMD, map the UNC path first, then start the server:
  ```bat
  pushd \\wsl.localhost\Ubuntu\home\tallulah\shelterluv-animals-widget
  npm start
  ```
