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

You need [Node.js](https://nodejs.org/) installed.

1. `npm install`
2. `npm start`

Then open:

`http://localhost:3000/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE`

## Troubleshooting

### `UNC paths are not supported` / `Cannot find module 'C:\Windows\server.js'`

If you see an error like this when running `npm start`:

```
'\\wsl.localhost\Ubuntu\home\<you>\shelterluv-animals-widget'
CMD.EXE was started with the above path as the current directory.
UNC paths are not supported.  Defaulting to Windows directory.
...
Error: Cannot find module 'C:\Windows\server.js'
```

this is an environment problem, not a bug in the widget. It means a **Windows**
copy of Node.js is being run against the project while the project lives in the
**WSL (Linux) filesystem** (a path like `\\wsl.localhost\Ubuntu\...`). Windows
`CMD.EXE` cannot use a `\\wsl.localhost\...` UNC path as its working directory,
so it silently switches to `C:\Windows` and then fails to find `server.js`.

There are two common ways to hit this:

1. **You ran `npm start` from a Windows Command Prompt / PowerShell** that was
   opened inside the WSL share (`\\wsl.localhost\Ubuntu\...`).
2. **You ran `npm start` from inside WSL, but `node`/`npm` resolve to the
   Windows binaries.** By default WSL appends the Windows `PATH`, so if Node.js
   is not installed inside Linux, `node`/`npm` fall through to the Windows
   `node.exe`, which then hits the same UNC-path problem.

**How to check (run inside your WSL/Ubuntu terminal):**

```bash
which node
which npm
```

If either prints a path under `/mnt/c/...` (for example
`/mnt/c/Program Files/nodejs/node`), you are using the Windows Node.js from
inside WSL, which causes this error.

**Fix: install and use Node.js natively inside WSL.** From your Ubuntu (WSL)
terminal:

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload your shell so nvm is available
source ~/.bashrc

# Install and use the latest LTS Node.js (Linux-native)
nvm install --lts
nvm use --lts
```

Then verify `node`/`npm` now point to a Linux path (under your home
directory, not `/mnt/c/...`):

```bash
which node   # e.g. /home/<you>/.nvm/versions/node/vXX.X.X/bin/node
node -v
```

Now, from the project directory **inside WSL**, run:

```bash
cd ~/shelterluv-animals-widget
npm install
npm start
```

Then open `http://localhost:3000/animals-widget.html?GID=YOUR_GID&animalType=ANIMAL_TYPE`.

> Tip: Keep the project in the Linux filesystem (e.g. `~/shelterluv-animals-widget`)
> and run all commands from the WSL/Ubuntu terminal. Avoid running `npm` from a
> Windows Command Prompt opened on a `\\wsl.localhost\...` path.
