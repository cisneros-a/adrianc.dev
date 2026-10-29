"use client";

// Light/dark choice (TD12). "system" means no data-theme on <html>,
// so globals.css follows the device setting.

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

export const THEME_CHOICES = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export const THEME_LABELS: Record<ThemeChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const listeners = new Set<() => void>();

/** The attribute on <html> is the source of truth: set by the head script or the toggle. */
function readChoice(): ThemeChoice {
  const value = document.documentElement.getAttribute("data-theme");
  return value === "light" || value === "dark" ? value : "system";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, readChoice, () => "system");
}

export function setThemeChoice(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
  try {
    if (choice === "system") {
      window.localStorage.removeItem(THEME_KEY);
    } else {
      window.localStorage.setItem(THEME_KEY, choice);
    }
  } catch {
    // Storage unavailable: the choice still applies until the page reloads.
  }
  listeners.forEach((listener) => listener());
}
