# Mohamed Irfan — Retro 3D Portfolio Terminal

An interactive portfolio built as a vintage 3D computer setup. The CRT monitor
boots up, shows a Windows 7–style login, and once you insert the floppy disk
into the tower the résumé loads — open it, print it, and watch a pair of cartoon
hands type on the keyboard.

Live experience: a beige CRT rig (monitor, tower, keyboard, wired ball mouse,
floppy disk, inkjet printer, hanging pull-string light, and a live digital
clock) that you can orbit, zoom, and interact with.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Three.js** via `@react-three/fiber` and `@react-three/drei`
- **Tailwind CSS v4** + **shadcn/ui**
- **Bun** as the runtime / package manager
- **Prisma** + SQLite scaffolding (not used by the current UI)

## Features

- 3D CRT monitor with live DOM screens (boot → Windows 7 login → desktop → Word document)
- Cartoon hands that type the correct finger per key on the login screen
- Wired ball mouse that follows the real cursor and drives navigation
- Floppy disk that animates into the tower's drive; the résumé only loads after it's inserted
- Clickable `Resume.docx` desktop icon and a Word-style résumé viewer
- Print button → printer dispenses the page → full-screen "held paper" close-up you can scroll
- Pull-string ceiling light that toggles the scene lighting
- Live digital desk clock synced to system time

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev        # starts the dev server on http://localhost:3000
```

> On Windows the default `dev` script pipes through `tee`, which may not exist.
> If `bun run dev` fails, run the server directly:
> ```bash
> bunx next dev -p 3000
> # or
> ./node_modules/.bin/next dev -p 3000
> ```

## Build

```bash
bun run build      # next build (produces a standalone server) + copies static assets
bun run start      # serves the standalone build
```

## Deploy

### Vercel (recommended)

1. Push this repo to GitHub.
2. Import it at [vercel.com](https://vercel.com) → **Add New Project**.
3. Framework auto-detects as Next.js. Set the **Build Command** to:
   ```
   next build
   ```
   (The repo's custom `build` script has extra `cp` steps for self-hosting that
   Vercel doesn't need.)
4. Deploy. If the build asks for `DATABASE_URL`, add any value in
   Project → Settings → Environment Variables (the UI doesn't use the DB).

### Self-host (standalone)

The project is configured with `output: "standalone"`, so on a Linux server:

```bash
bun install
bun run build
bun run start      # runs .next/standalone/server.js on port 3000
```

Put Nginx or the included `Caddyfile` in front for HTTPS.

## Customising the résumé

All résumé content lives in [`src/lib/resume-data.ts`](src/lib/resume-data.ts).
Edit that single file to make the portfolio your own.

## Project structure

```
src/
  app/
    page.tsx                  # top-level state machine (power, screen, floppy, light, print)
    layout.tsx                # metadata + fonts
  components/
    retro-computer-scene.tsx  # the entire Three.js scene
    computer-screen.tsx       # CRT screen states (boot/login/desktop/document)
    hands.tsx                 # cartoon typing hands
    held-paper.tsx            # printed-resume close-up overlay
  lib/
    resume-data.ts            # all résumé content
    input-state.ts            # shared keyboard/mouse signals for the 3D scene
```
