import { GM_registerMenuCommand } from '$';
import { getHass, navigate, waitForHass } from './hass';
import { toggleHelpPanel } from './help-panel';
import { mountShortcutBar } from './shortcut-bar';
import { registerShortcuts, type Shortcut } from './shortcuts';

/** Matches paths at or below any prefix, by whole segment ("/config/script" doesn't match "/config/scripts"). */
const under =
  (...prefixes: string[]) =>
  (path: string) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const page = (keys: string, description: string, path: string, isActive = under(path)): Shortcut => ({
  keys,
  description,
  isActive,
  run: () => navigate(path),
});

// Newer HA versions moved developer tools into Settings; older ones still have the standalone panel.
const goToDeveloperTools = () =>
  navigate(getHass()?.panels['developer-tools'] ? '/developer-tools/state' : '/config/tools/state');

// Descriptions double as chip labels in the shortcut bar, so keep them short.
const shortcuts: Shortcut[] = [
  page('g o', 'Overview', '/lovelace'),
  page('g a', 'Automations', '/config/automation/dashboard', under('/config/automation')),
  page('g s', 'Scripts', '/config/script/dashboard', under('/config/script')),
  page('g e', 'Entities', '/config/entities'),
  {
    keys: 'g d',
    description: 'Developer tools',
    run: goToDeveloperTools,
    isActive: under('/config/tools', '/developer-tools'),
  },
  page('g h', 'History', '/history'),
  page('g l', 'Logbook', '/logbook'),
  page('g c', 'Settings', '/config/dashboard'),
  { keys: '?', description: 'Help', run: () => toggleHelpPanel(shortcuts) },
];

async function main() {
  // Stay inactive on the login page; start once the frontend is connected.
  await waitForHass();
  registerShortcuts(shortcuts);
  mountShortcutBar(shortcuts);
  GM_registerMenuCommand('Keyboard shortcuts', () => toggleHelpPanel(shortcuts));
}

void main();
