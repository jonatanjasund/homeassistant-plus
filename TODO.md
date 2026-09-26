# TODO

## Visual bugs

- [ ] **Chips without keys have less right padding than left.**
      Chip padding is `0 4px 0 10px` in `src/shortcut-bar.ts`, sized for trailing key caps. When the caps are hidden (`:host(.compact)` or `pointer: coarse`), the 4px right padding is left over. Give chips symmetric padding in those modes.
- [ ] **Chips are vertically cramped, especially with keys.**
      Chips are a fixed `height: 22px`; key caps are ~19px tall (11px font, 1.5 line-height, borders). Taller chips may also need a larger `BAR_HEIGHT` (currently 32px), which HA picks up automatically through the inset.

## Features

- [ ] **Add, remove and create shortcuts in the bar.**
      Shortcuts are currently hard-coded in `src/main.ts`. Needs:
  - Persisted user config via `GM_getValue`/`GM_setValue` (grants are added automatically by `autoGrant`).
  - An edit UI: pick which shortcuts appear in the bar, and create new ones (label, path, key sequence).
  - Validation: no sequence may be a prefix of another, and avoid HA's own single-letter keys (`e`, `c`, `a`, `m`, …).
- [ ] **Command palette for shortcuts: Ctrl+Space (Cmd+Space on Mac) lists all shortcuts with search.**
  - `registerShortcuts()` currently ignores any key with Ctrl/Meta/Alt held, so it needs modifier support.
  - Cmd+Space is Spotlight on macOS and Ctrl+Space switches input method on some systems; the OS takes these before the browser sees them. Pick a fallback (or make the key configurable).
  - [ ] Later: integrate with HA's own Ctrl+K search.
