export interface Shortcut {
  /** Space-separated key sequence matched against `KeyboardEvent.key`, e.g. "g a" or "?". */
  keys: string;
  description: string;
  run: () => void;
}

const SEQUENCE_TIMEOUT_MS = 1000;

function isTyping(event: KeyboardEvent): boolean {
  // composedPath()[0] is the real focused element, even inside HA's nested shadow roots.
  const target = event.composedPath()[0] as Partial<HTMLElement>;
  return Boolean(target.isContentEditable) || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName ?? '');
}

export function registerShortcuts(shortcuts: Shortcut[]): void {
  let pending: string[] = [];
  let resetTimer: number | undefined;

  const isPrefix = (sequence: string[]) => {
    const typed = sequence.join(' ');
    return shortcuts.some((s) => s.keys === typed || s.keys.startsWith(`${typed} `));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || isTyping(event)) return;

    window.clearTimeout(resetTimer);
    const extended = [...pending, event.key];
    pending = isPrefix(extended) ? extended : isPrefix([event.key]) ? [event.key] : [];
    if (pending.length === 0) return;

    // HA has its own single-letter shortcuts (e, c, a, m, ...). Swallow every key that
    // belongs to one of our sequences so "g e" does not also open HA's entity search.
    event.preventDefault();
    event.stopImmediatePropagation();

    const match = shortcuts.find((s) => s.keys === pending.join(' '));
    if (match) {
      pending = [];
      match.run();
    } else {
      resetTimer = window.setTimeout(() => (pending = []), SEQUENCE_TIMEOUT_MS);
    }
  };

  // Capture phase on window runs before HA's own window-level shortcut listeners.
  window.addEventListener('keydown', onKeyDown, true);
}
