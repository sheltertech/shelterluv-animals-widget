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

### Troubleshooting: WSL + Windows "UNC paths are not supported" error

If you're running this project from a WSL folder (a path like
`\\wsl.localhost\Ubuntu\home\...` or `\\wsl$\Ubuntu\home\...`) and see an error like:

```
'\\wsl.localhost\Ubuntu\home\<user>\shelterluv-animals-widget'
CMD.EXE was started with the above path as the current directory.
UNC paths are not supported.  Defaulting to Windows directory.

Error: Cannot find module 'C:\Windows\server.js'
```

this isn't a bug in this project. It means `npm`/`node` are actually being launched using the
**Windows** installation of Node instead of the one installed inside your WSL distro. Windows'
`cmd.exe` can't use a UNC path (`\\wsl.localhost\...`) as its working directory, so it silently
falls back to `C:\Windows`, and `node` then fails to find `server.js` there.

To fix it:

1. Open a **WSL terminal** (e.g. launch `Ubuntu` from the Start menu, or use the WSL terminal
   profile in Windows Terminal / VS Code) instead of a Windows Command Prompt or PowerShell
   window that merely has its path set to a `\\wsl.localhost\...` or `\\wsl$\...` folder.
2. Confirm you're using the Linux versions of Node/npm from inside that WSL terminal:
   ```bash
   which node
   which npm
   ```
   These should print paths like `/usr/bin/node` or `~/.nvm/versions/node/...`, **not**
   `/mnt/c/...`. If they point into `/mnt/c/...`, Node/npm are installed on the Windows side and
   are being picked up by your WSL `PATH`.
3. If Node isn't installed inside WSL yet (or is resolving to the Windows copy), install it
   directly in your Linux distro, for example with
   [nvm](https://github.com/nvm-sh/nvm):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   nvm install --lts
   ```
4. Re-run `npm install` and `npm start` from within the WSL terminal, in the project directory
   (e.g. `cd ~/shelterluv-animals-widget`).

If you're using VS Code, make sure you connect with the **Remote - WSL** extension (or run
`code .` from inside your WSL shell) so its integrated terminal runs commands inside WSL rather
than on Windows.
