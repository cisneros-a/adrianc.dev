// What a template is (TD75): a saved starting point for a new task.

import type { Priority, TaskType } from "@/lib/tasks/model";

/**
 * Holds a task's title, priority, type, notes and subtask titles, never a
 * deadline; subtasks start unticked when it's used (TD75). Independent of the
 * task it came from (TD76).
 */
export type Template = {
  id: string;
  title: string;
  priority: Priority;
  type: TaskType;
  notes: string;
  /** Subtask titles only. */
  subtasks: string[];
  createdAt: string;
  updatedAt: string;
};

/** Templates with the same key count as the same template: ignores case and leading/trailing spaces (T53, TD83). */
export function templateKey(title: string): string {
  return title.trim().toLowerCase();
}
