/** Key-cap styling for renderKeys(); include it in any shadow root that shows shortcuts. */
export const KEY_STYLE = `
  kbd {
    display: inline-block;
    min-width: 1em;
    padding: 0 4px;
    border: 1px solid var(--divider-color, rgb(0 0 0 / 0.12));
    border-radius: 4px;
    background: var(--secondary-background-color, #eee);
    font: 11px/1.5 monospace;
    text-align: center;
  }
  kbd + kbd { margin-left: 2px; }
`;

/** One <kbd> per key in a sequence like "g a". */
export function renderKeys(keys: string): HTMLElement[] {
  return keys.split(' ').map((key) => {
    const kbd = document.createElement('kbd');
    kbd.textContent = key;
    return kbd;
  });
}
