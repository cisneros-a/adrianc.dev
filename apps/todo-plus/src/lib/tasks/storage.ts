// The only place tasks are read from or written to (TD5).
// Iteration 1 uses the browser's localStorage (TD6); iteration 2 replaces
// these two functions with database calls and nothing else changes.

import { isPriority, isStatus, isTaskType, type Task } from "./model";

/** Versioned so a future change to the task shape can migrate old data. */
const STORAGE_KEY = "todo-plus:tasks:v1";

export function loadTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(withCompletedOn).filter(isTask)
      : [];
  } catch {
    // Storage unavailable (e.g. blocked by the browser) or corrupted data.
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage full or unavailable: the tasks stay in memory for this visit.
  }
}

/** True when `key` is the storage entry this module owns. */
export function isTasksStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}

/** Data saved before `completedOn` existed: done tasks get their `updatedAt`, others null (TD25). */
function withCompletedOn(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  const t = value as Record<string, unknown>;
  if ("completedOn" in t) return value;
  return { ...t, completedOn: t.status === "done" ? t.updatedAt : null };
}

/** Saved data comes from outside the app, so check its shape before trusting it. */
function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.notes === "string" &&
    isPriority(t.priority) &&
    isTaskType(t.type) &&
    isStatus(t.status) &&
    (t.deadline === null || typeof t.deadline === "string") &&
    (t.completedOn === null || typeof t.completedOn === "string") &&
    typeof t.createdAt === "string" &&
    typeof t.updatedAt === "string"
  );
}
