# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Tampermonkey userscript that adds keyboard shortcuts and extra UI to the Home Assistant web frontend. Vanilla TypeScript bundled by Vite with `vite-plugin-monkey` (no framework — Vue was deliberately removed from the scaffold).

## Commands

- `pnpm dev` — Vite dev server on `localhost:5173`; opens the install page for a `server:Home Assistant Plus` stub script that loads `src/` live from the dev server.
- `pnpm build` — `tsc -b` type-check, then bundle to `dist/homeassistant-plus.user.js`. This is the only verification step: there is no test runner or linter.

Windows machine; node comes from `fnm` and pnpm from winget. Shells spawned by Claude don't load `$PROFILE`, so neither is on PATH by default. Prefix PowerShell commands with:

```powershell
fnm env --shell powershell | Out-String | Invoke-Expression; fnm use default *> $null; $env:Path = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\pnpm.pnpm_Microsoft.Winget.Source_8wekyb3d8bbwe;$env:Path"
```

## Userscript metadata

The `==UserScript==` header is generated from the `userscript` block in `vite.config.ts` plus `name`/`version`/`description` in `package.json`. Do not hand-write `@grant`: `build.autoGrant` adds a grant for every `GM_*`/`unsafeWindow` import it finds in the bundle. Header changes require reinstalling the script in Tampermonkey (in dev mode the plugin reopens the install page); code changes in `src/` do not.

`@match` patterns omit the port on purpose (no port = any port, so `:8123` matches) and use `*://` to cover http and https. Hosts: `homeassistant.local` and `homeassistant.taild5e537.ts.net` (Tailscale).

## Architecture

- **GM APIs come from the `'$'` module alias** (`import { GM_registerMenuCommand, unsafeWindow } from '$'`), not globals. Types are provided via `src/vite-env.d.ts`.
- **Reach into the page through `unsafeWindow`** (`src/hass.ts`). Home Assistant's JS state lives as properties on custom elements; the userscript sandbox (notably Firefox Xray wrappers) hides page-set properties unless accessed via `unsafeWindow.document`.
- **The `hass` object** is read from the `<home-assistant>` root element (`getHass()`). HA replaces it immutably on every state change — always call `getHass()` fresh; never cache it. The `HomeAssistant` interface in `hass.ts` is a hand-written subset; extend it when new fields are needed.
- **Startup is gated on `waitForHass()`** in `main.ts`, so nothing activates on the login page (which has no `<home-assistant>` element). It never resolves there by design.
- **Navigation** (`navigate()`) mimics HA's own router: `history.pushState` then dispatch a `location-changed` event on the page window. Assigning `location.href` would force a full reload.
- **Shortcuts** (`src/shortcuts.ts`) are space-separated key sequences (`"g a"`) matched on `KeyboardEvent.key`. The listener is registered on `window` in the **capture phase** and calls `stopImmediatePropagation()` on any key that advances one of our sequences — this is what prevents HA's own single-letter shortcuts (`e`, `c`, `a`, `m`, …) from also firing. Typing detection uses `event.composedPath()[0]` because HA's inputs live inside nested shadow roots. Avoid defining a sequence that is also a prefix of another (exact match wins).
- **Injected UI** (`src/help-panel.ts`) lives inside its own shadow root to isolate styles from HA. It styles itself with HA's theme custom properties (`--card-background-color`, `--primary-text-color`, …), which inherit through shadow boundaries, so it follows light/dark themes automatically. Build DOM with `textContent`, not `innerHTML`.
- **Shortcut bar** (`src/shortcut-bar.ts`) is a `position: fixed` strip at the top. It makes room by setting `--app-safe-area-inset-top` on `html`: HA's `--safe-area-inset-top` (its phone-notch inset) reads that variable first, and HA's header, sidebar and subpage heights all offset by it. Don't try to push `<home-assistant>` down instead — HA's sidebar is `position: fixed; height: 100%` and some app bars are `height: 100vh`, so it would overflow the viewport.
- The shortcut list itself is data in `src/main.ts`; adding a shortcut is one entry there. `description` doubles as the chip label in the bar, so keep it short. Key caps are rendered by `src/keys.ts`, shared by the bar and the help panel.
- **HA routes move between versions**: developer tools moved from `/developer-tools/*` to `/config/tools/*` (frontend 20260826). Prefer checking `hass.panels` over hard-coding a route when a panel may have moved. `demo.home-assistant.io` is useful for layout experiments (no login; root element is `<ha-demo>`, a `<home-assistant>` subclass), but its panels are mocks.

## Dev vs. built script

`pnpm dev` installs a separate `server:`-prefixed script. When both it and the built script are enabled in Tampermonkey, both register keydown listeners and the first one swallows the keys — disable the built copy while developing.
