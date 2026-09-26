import { GM_registerMenuCommand } from '$';
import { getHass, navigate, waitForHass } from './hass';
import { toggleHelpPanel } from './help-panel';
import { mountShortcutBar } from './shortcut-bar';
import { registerShortcuts, type Shortcut } from './shortcuts';

const go = (path: string) => () => navigate(path);

// Newer HA versions moved developer tools into Settings; older ones still have the standalone panel.
const goToDeveloperTools = () =>
  navigate(getHass()?.panels['developer-tools'] ? '/developer-tools/state' : '/config/tools/state');

// Descriptions double as chip labels in the shortcut bar, so keep them short.
const shortcuts: Shortcut[] = [
  { keys: 'g o', description: 'Overview', run: go('/lovelace') },
  { keys: 'g a', description: 'Automations', run: go('/config/automation/dashboard') },
  { keys: 'g s', description: 'Scripts', run: go('/config/script/dashboard') },
  { keys: 'g e', description: 'Entities', run: go('/config/entities') },
  { keys: 'g d', description: 'Developer tools', run: goToDeveloperTools },
  { keys: 'g h', description: 'History', run: go('/history') },
  { keys: 'g l', description: 'Logbook', run: go('/logbook') },
  { keys: 'g c', description: 'Settings', run: go('/config/dashboard') },
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
