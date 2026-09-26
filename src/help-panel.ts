import type { Shortcut } from './shortcuts';

// Custom properties inherit into shadow DOM, so HA's theme variables (light/dark) apply here.
const STYLE = `
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 0.4);
    font-family: var(--ha-font-family-body, Roboto, sans-serif);
  }
  .dialog {
    min-width: 320px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    overflow: auto;
    padding: 16px 24px;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    box-shadow: 0 8px 32px rgb(0 0 0 / 0.3);
  }
  h2 { margin: 0 0 12px; font-size: 20px; font-weight: 500; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 6px 0; }
  td:first-child { padding-right: 24px; white-space: nowrap; }
  kbd {
    display: inline-block;
    min-width: 1em;
    margin-right: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--secondary-background-color, #eee);
    font: 13px monospace;
    text-align: center;
  }
`;

let host: HTMLElement | undefined;

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeHelpPanel();
}

export function closeHelpPanel(): void {
  host?.remove();
  host = undefined;
  window.removeEventListener('keydown', onEscape, true);
}

export function toggleHelpPanel(shortcuts: Shortcut[]): void {
  if (host) {
    closeHelpPanel();
    return;
  }

  host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = STYLE;

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeHelpPanel();
  });

  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', 'Home Assistant Plus shortcuts');

  const heading = document.createElement('h2');
  heading.textContent = 'Keyboard shortcuts';

  const table = document.createElement('table');
  for (const shortcut of shortcuts) {
    const row = table.insertRow();
    const keysCell = row.insertCell();
    for (const key of shortcut.keys.split(' ')) {
      const kbd = document.createElement('kbd');
      kbd.textContent = key;
      keysCell.append(kbd);
    }
    row.insertCell().textContent = shortcut.description;
  }

  dialog.append(heading, table);
  backdrop.append(dialog);
  root.append(style, backdrop);
  document.body.append(host);
  window.addEventListener('keydown', onEscape, true);
}
