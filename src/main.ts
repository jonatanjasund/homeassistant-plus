import { GM_registerMenuCommand } from '$';
import { navigate, waitForHass } from './hass';
import { toggleHelpPanel } from './help-panel';
import { registerShortcuts, type Shortcut } from './shortcuts';

const go = (path: string) => () => navigate(path);

const shortcuts: Shortcut[] = [
  { keys: 'g o', description: 'Overview dashboard', run: go('/lovelace') },
  { keys: 'g a', description: 'Automations', run: go('/config/automation/dashboard') },
  { keys: 'g s', description: 'Scripts', run: go('/config/script/dashboard') },
  { keys: 'g e', description: 'Entities', run: go('/config/entities') },
  { keys: 'g d', description: 'Developer tools', run: go('/developer-tools/state') },
  { keys: 'g h', description: 'History', run: go('/history') },
  { keys: 'g l', description: 'Logbook', run: go('/logbook') },
  { keys: 'g c', description: 'Settings', run: go('/config/dashboard') },
  { keys: '?', description: 'Show this help', run: () => toggleHelpPanel(shortcuts) },
];

async function main() {
  // Stay inactive on the login page; start once the frontend is connected.
  await waitForHass();
  registerShortcuts(shortcuts);
  GM_registerMenuCommand('Keyboard shortcuts', () => toggleHelpPanel(shortcuts));
}

void main();
