"use client";

// Holds the defaults in memory and saves every change through storage.ts.
// Components read them with useDefaults(), built on useSyncExternalStore.

import { useSyncExternalStore } from "react";
import type { Defaults } from "./model";
import { isSettingsStorageKey, loadDefaults, saveDefaults } from "./storage";

let defaults: Defaults | null = null; // null until first read in the browser
const listeners = new Set<() => void>();

/** A plain read for code outside React. Only call it in the browser. */
export function getDefaults(): Defaults {
  if (defaults === null) defaults = loadDefaults();
  return defaults;
}

function setAll(next: Defaults): void {
  defaults = next;
  saveDefaults(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Another tab changed the settings: reload them so this tab stays in sync.
  function onStorage(event: StorageEvent) {
    if (!isSettingsStorageKey(event.key)) return;
    defaults = loadDefaults();
    listener();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The page is built ahead of time, so the server snapshot is "not loaded yet". */
function getServerSnapshot(): Defaults | null {
  return null;
}

/** The defaults for new tasks, or null while the page is still loading them from the browser. */
export function useDefaults(): Defaults | null {
  return useSyncExternalStore(subscribe, getDefaults, getServerSnapshot);
}

/** Changes some of the defaults and saves right away. */
export function setDefaults(partial: Partial<Defaults>): void {
  setAll({ ...getDefaults(), ...partial });
}

/** Called when a category is deleted: if it was the default category, the default becomes None. */
export function clearDefaultCategory(id: string): void {
  if (getDefaults().category === id) setDefaults({ category: null });
}
