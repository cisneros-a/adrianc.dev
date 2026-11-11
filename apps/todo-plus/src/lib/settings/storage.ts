// The only place the settings are read from or written to, like tasks (TD5).

import { parseDefaults, STARTING_DEFAULTS, type Defaults } from "./model";

/** Versioned so a future change to the settings shape can migrate old data. */
const STORAGE_KEY = "todo-plus:settings:v1";

export function loadDefaults(): Defaults {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTING_DEFAULTS;
    return parseDefaults(JSON.parse(raw));
  } catch {
    // Storage unavailable (e.g. blocked by the browser) or corrupted data.
    return STARTING_DEFAULTS;
  }
}

export function saveDefaults(defaults: Defaults): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    // Storage full or unavailable: the defaults stay in memory for this visit.
  }
}

/** True when `key` is the storage entry this module owns. */
export function isSettingsStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}
