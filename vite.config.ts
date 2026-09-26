import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// name, version and description are read from package.json.
// @grant is filled in automatically from the GM_* APIs imported from '$' (build.autoGrant).
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Home Assistant Plus',
        namespace: 'homeassistant-plus',
        icon: 'https://brands.home-assistant.io/homeassistant/icon.png',
        // No port in a match pattern means "any port"; *:// covers http and https.
        match: [
          '*://homeassistant.local/*',
          '*://homeassistant.taild5e537.ts.net/*',
        ],
        'run-at': 'document-idle',
        noframes: true,
      },
    }),
  ],
});
