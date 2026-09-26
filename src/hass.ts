import { unsafeWindow } from '$';

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

/** The parts of Home Assistant's frontend `hass` object this script uses. Extend as needed. */
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  /** Sidebar panels available on this install, keyed by URL path. */
  panels: Record<string, { url_path: string; title: string | null }>;
  user?: { id: string; name: string; is_admin: boolean };
  language: string;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: { entity_id?: string | string[]; device_id?: string | string[]; area_id?: string | string[] },
  ): Promise<unknown>;
  callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T>;
}

type HomeAssistantElement = HTMLElement & { hass?: HomeAssistant };

/**
 * The live `hass` object from the page's <home-assistant> root element.
 * HA replaces this object on every state change, so call this each time instead of caching the result.
 */
export function getHass(): HomeAssistant | undefined {
  // Read through unsafeWindow: the page's own JS properties are hidden from the userscript sandbox otherwise.
  return unsafeWindow.document.querySelector<HomeAssistantElement>('home-assistant')?.hass;
}

/** Resolves once the frontend has connected. Never resolves on the login page, which has no <home-assistant>. */
export function waitForHass(pollMs = 250): Promise<HomeAssistant> {
  return new Promise((resolve) => {
    const poll = () => {
      const hass = getHass();
      if (hass) resolve(hass);
      else setTimeout(poll, pollMs);
    };
    poll();
  });
}

/** Client-side navigation, done the same way as HA's own links (no page reload). */
export function navigate(path: string, replace = false): void {
  const { history } = unsafeWindow;
  if (replace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);
  unsafeWindow.dispatchEvent(new CustomEvent('location-changed', { detail: { replace } }));
}
