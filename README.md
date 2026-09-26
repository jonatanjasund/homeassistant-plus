# Home Assistant Plus

Tampermonkey userscript that adds keyboard shortcuts and extra UI to the Home Assistant frontend.
Built with TypeScript and [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey).

## Develop

```bash
pnpm dev
```

Opens the install page for `server:Home Assistant Plus`. Install it in Tampermonkey once and
disable any built copy of the script. The installed stub loads modules from the Vite dev server,
so your edits appear when you reload the Home Assistant tab.

## Build

```bash
pnpm build
```

Writes `dist/homeassistant-plus.user.js`. Drag it into the browser (or open it) to install.

## Shortcuts

Press `?` in Home Assistant to see the list. Shortcuts are defined in `src/main.ts`.
