"use client";

// Holds the categories in memory and saves every change through storage.ts.
// Components read them with useCategories(), built on useSyncExternalStore.

import { useSyncExternalStore } from "react";
import { clearDefaultCategory } from "@/lib/settings/store";
import { reassignType as reassignTaskType } from "@/lib/tasks/store";
import { reassignType as reassignTemplateType } from "@/lib/templates/store";
import { categoryKey, MAX_CATEGORIES, NAME_MAX, type Category } from "./model";
import { CATEGORY_COLORS, type CategoryColor } from "./palette";
import {
  isCategoriesStorageKey,
  loadCategories,
  saveCategories,
} from "./storage";

let categories: Category[] | null = null; // null until first read in the browser
const listeners = new Set<() => void>();

/** The categories in order. A plain read for code outside React; only call it in the browser. */
export function getCategoryList(): Category[] {
  if (categories === null) categories = loadCategories();
  return categories;
}

function setCategories(next: Category[]): void {
  categories = next;
  saveCategories(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Another tab changed the categories: reload them so this tab stays in sync.
  function onStorage(event: StorageEvent) {
    if (!isCategoriesStorageKey(event.key)) return;
    categories = loadCategories();
    listener();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The page is built ahead of time, so the server snapshot is "not loaded yet". */
function getServerSnapshot(): Category[] | null {
  return null;
}

/** All categories in order, or null while the page is still loading them from the browser. */
export function useCategories(): Category[] | null {
  return useSyncExternalStore(subscribe, getCategoryList, getServerSnapshot);
}

type CategoryDetails = Pick<Category, "name" | "color" | "icon">;

/** True when another category already has this name, ignoring case and leading/trailing spaces. */
export function nameTaken(name: string, exceptId?: string): boolean {
  const key = categoryKey(name);
  return getCategoryList().some(
    (c) => c.id !== exceptId && categoryKey(c.name) === key,
  );
}

/** The first palette color no category uses yet; the 10-category cap means there is always one. */
export function firstUnusedColor(): CategoryColor {
  const used = new Set(getCategoryList().map((c) => c.color));
  return CATEGORY_COLORS.find((c) => !used.has(c)) ?? CATEGORY_COLORS[0];
}

/** True when a category other than `exceptId` already uses this color. */
export function colorTaken(color: CategoryColor, exceptId?: string): boolean {
  return getCategoryList().some((c) => c.id !== exceptId && c.color === color);
}

/** Adds a category at the end. Returns null (and saves nothing) when the name is empty, too long or taken, the color is used by another category, or there are already 10. */
export function addCategory(details: CategoryDetails): Category | null {
  const name = details.name.trim();
  if (name === "" || name.length > NAME_MAX || nameTaken(name)) return null;
  if (colorTaken(details.color)) return null;
  if (getCategoryList().length >= MAX_CATEGORIES) return null;
  const category: Category = {
    id: crypto.randomUUID(),
    name,
    color: details.color,
    icon: details.icon,
  };
  setCategories([...getCategoryList(), category]);
  return category;
}

/** Changes a category's name, color and icon. Returns false (and saves nothing) when the name is empty, too long or taken, or the color is used by another category. */
export function updateCategory(id: string, details: CategoryDetails): boolean {
  const name = details.name.trim();
  if (name === "" || name.length > NAME_MAX || nameTaken(name, id)) {
    return false;
  }
  if (colorTaken(details.color, id)) return false;
  setCategories(
    getCategoryList().map((c) =>
      c.id === id
        ? { ...c, name, color: details.color, icon: details.icon }
        : c,
    ),
  );
  return true;
}

export function moveCategory(id: string, direction: "up" | "down"): void {
  const list = [...getCategoryList()];
  const from = list.findIndex((c) => c.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
  setCategories(list);
}

/**
 * Deletes a category and moves its tasks and templates to `moveToId`. If it
 * was the default category, the default becomes None. The last remaining
 * category can't be deleted. Returns false when nothing was deleted.
 */
export function deleteCategory(id: string, moveToId: string | null): boolean {
  const list = getCategoryList();
  if (list.length <= 1 || !list.some((c) => c.id === id)) return false;
  if (moveToId !== null) {
    if (moveToId === id || !list.some((c) => c.id === moveToId)) return false;
    reassignTaskType(id, moveToId);
    reassignTemplateType(id, moveToId);
  }
  clearDefaultCategory(id);
  setCategories(list.filter((c) => c.id !== id));
  return true;
}
