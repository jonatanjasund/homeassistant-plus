import { KEY_STYLE, renderKeys } from './keys';
import type { Shortcut } from './shortcuts';

const BAR_HEIGHT = '32px';

// HA offsets its header, sidebar and page heights by --safe-area-inset-top (meant for phone notches),
// which reads --app-safe-area-inset-top first. Growing that inset makes HA lay itself out below the
// bar; pushing <home-assistant> down instead would overflow, since HA sizes against 100vh/fixed.
const PAGE_STYLE = `
  html { --app-safe-area-inset-top: calc(env(safe-area-inset-top, 0px) + ${BAR_HEIGHT}); }
`;

const BAR_STYLE = `
  ${KEY_STYLE}
  :host {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 7;
    box-sizing: border-box;
    height: calc(env(safe-area-inset-top, 0px) + ${BAR_HEIGHT});
    padding: env(safe-area-inset-top, 0px) 8px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    background: var(--sidebar-background-color, var(--card-background-color, #fff));
    border-bottom: 1px solid var(--divider-color, rgb(0 0 0 / 0.12));
    font-family: var(--ha-font-family-body, Roboto, sans-serif);
  }
  button {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    padding: 0 4px 0 10px;
    border: 1px solid var(--divider-color, rgb(0 0 0 / 0.12));
    border-radius: 11px;
    background: none;
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  /* Auto margins center the chips but collapse to 0 on overflow, so the bar still scrolls from the
     first chip. justify-content: center would push the overflow off the unscrollable left edge. */
  button:first-of-type { margin-left: auto; }
  button:last-of-type { margin-right: auto; }
  button:hover { background: var(--secondary-background-color, #eee); }
  button[aria-current='page'] {
    border-color: var(--primary-color, #03a9f4);
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
  }
  button:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  :host(.compact) .keys { display: none; }
  @media (pointer: coarse) {
    .keys { display: none; }
  }
`;

export function mountShortcutBar(shortcuts: Shortcut[]): void {
  const pageStyle = document.createElement('style');
  pageStyle.textContent = PAGE_STYLE;
  document.head.append(pageStyle);

  const host = document.createElement('div');
  host.setAttribute('role', 'toolbar');
  host.setAttribute('aria-label', 'Home Assistant Plus shortcuts');
  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = BAR_STYLE;
  root.append(style);

  const chips = shortcuts.map((shortcut) => {
    const keys = document.createElement('span');
    keys.className = 'keys';
    keys.append(...renderKeys(shortcut.keys));

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.title = `${shortcut.description} (${shortcut.keys})`;
    chip.append(shortcut.description, keys);
    chip.addEventListener('click', shortcut.run);
    return chip;
  });
  root.append(...chips);
  document.body.prepend(host);

  const markActivePage = () => {
    shortcuts.forEach((shortcut, i) => {
      const chip = chips[i];
      if (shortcut.isActive?.(location.pathname)) {
        chip.setAttribute('aria-current', 'page');
        // Only matters when the bar overflows (phones): keeps the active chip centered, neighbors peeking in.
        chip.scrollIntoView({ block: 'nearest', inline: 'center' });
      } else {
        chip.removeAttribute('aria-current');
      }
    });
  };
  // HA fires location-changed for every in-app navigation (as does our navigate()); popstate covers back/forward.
  window.addEventListener('location-changed', markActivePage);
  window.addEventListener('popstate', markActivePage);
  markActivePage();

  // Measure instead of using a fixed breakpoint, so it adapts to label lengths and added shortcuts.
  // When full chips overflow, drop the key caps (still shown in tooltips and the help panel).
  const fit = () => {
    host.classList.remove('compact');
    host.classList.toggle('compact', host.scrollWidth > host.clientWidth);
  };
  new ResizeObserver(fit).observe(host);
}
