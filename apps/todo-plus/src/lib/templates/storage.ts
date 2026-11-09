// The only place templates are read from or written to (TD78), like tasks (TD5).

import { isPriority, isTaskType } from "@/lib/tasks/model";
import type { Template } from "./model";

/** Versioned so a future change to the template shape can migrate old data. */
const STORAGE_KEY = "todo-plus:templates:v1";

export function loadTemplates(): Template[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTemplate) : [];
  } catch {
    // Storage unavailable (e.g. blocked by the browser) or corrupted data.
    return [];
  }
}

export function saveTemplates(templates: Template[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Storage full or unavailable: the templates stay in memory for this visit.
  }
}

/** True when `key` is the storage entry this module owns. */
export function isTemplatesStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}

/** Saved data comes from outside the app, so check its shape before trusting it. */
function isTemplate(value: unknown): value is Template {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.notes === "string" &&
    isPriority(t.priority) &&
    isTaskType(t.type) &&
    Array.isArray(t.subtasks) &&
    t.subtasks.every((s) => typeof s === "string") &&
    typeof t.createdAt === "string" &&
    typeof t.updatedAt === "string"
  );
}
