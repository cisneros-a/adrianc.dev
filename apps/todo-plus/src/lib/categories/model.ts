// What a category is: a user-defined kind of task (replaces the fixed task
// types, TD8). Tasks and templates refer to one by id, in their `type` field.

import { isCategoryColor, type CategoryColor } from "./palette";
import { isCategoryIcon, type CategoryIcon } from "./icons";

export type Category = {
  id: string;
  /** 1 to NAME_MAX characters, trimmed. */
  name: string;
  color: CategoryColor;
  icon: CategoryIcon;
};

export const MAX_CATEGORIES = 10;
export const NAME_MAX = 20;

/** Categories with the same key count as the same name: ignores case and leading/trailing spaces. */
export function categoryKey(name: string): string {
  return name.trim().toLowerCase();
}

/** What a new user starts with, in order. They match the four old fixed types, so saved tasks keep their look. */
export const SEED_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "blue", icon: "briefcase" },
  { id: "personal", name: "Personal", color: "magenta", icon: "user" },
  { id: "home", name: "Home", color: "teal", icon: "house" },
  { id: "errands", name: "Errands", color: "yellow", icon: "shopping-cart" },
];

/** Saved data comes from outside the app, so check its shape before trusting it. */
export function isCategory(value: unknown): value is Category {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    c.id !== "" &&
    typeof c.name === "string" &&
    c.name.trim() !== "" &&
    c.name.length <= NAME_MAX &&
    isCategoryColor(c.color) &&
    isCategoryIcon(c.icon)
  );
}

/** What cards, chips and screen readers say for a task whose category id doesn't exist (e.g. corrupted data). */
export const NO_CATEGORY_LABEL = "No category";

/** The category with this id, or undefined when there isn't one. */
export function findCategory(
  categories: Category[] | null,
  id: string | null,
): Category | undefined {
  return categories?.find((c) => c.id === id);
}
