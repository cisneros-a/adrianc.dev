// The only place categories are read from or written to, like tasks (TD5).

import { isCategory, SEED_CATEGORIES, type Category } from "./model";

/** Versioned so a future change to the category shape can migrate old data. */
const STORAGE_KEY = "todo-plus:categories:v1";

/** The saved categories in order, or the starting four when nothing valid is saved. */
export function loadCategories(): Category[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_CATEGORIES;
    const parsed: unknown = JSON.parse(raw);
    const valid = Array.isArray(parsed) ? parsed.filter(isCategory) : [];
    return valid.length > 0 ? valid : SEED_CATEGORIES;
  } catch {
    // Storage unavailable (e.g. blocked by the browser) or corrupted data.
    return SEED_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // Storage full or unavailable: the categories stay in memory for this visit.
  }
}

/** True when `key` is the storage entry this module owns. */
export function isCategoriesStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}
