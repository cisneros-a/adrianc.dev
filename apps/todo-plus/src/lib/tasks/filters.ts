// Filtering (T2) and default ordering (TD15). Pure functions: no storage, no React.

import {
  PRIORITIES,
  type Priority,
  type Status,
  type Task,
  type TaskType,
} from "./model";

/** An empty list in a group means "no filter" for that group. */
export type Filters = {
  priorities: Priority[];
  types: TaskType[];
  statuses: Status[];
};

export const NO_FILTERS: Filters = { priorities: [], types: [], statuses: [] };

export function countActiveFilters(filters: Filters): number {
  return (
    filters.priorities.length + filters.types.length + filters.statuses.length
  );
}

/** Within a group a task matches ANY selected option; across groups it must match ALL. */
export function filterTasks(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter(
    (task) =>
      matches(filters.priorities, task.priority) &&
      matches(filters.types, task.type) &&
      matches(filters.statuses, task.status),
  );
}

function matches<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

/** Unfinished first, then soonest deadline (none last), then highest priority, then oldest. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      Number(a.status === "done") - Number(b.status === "done") ||
      compareDeadlines(a.deadline, b.deadline) ||
      PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority) ||
      a.createdAt.localeCompare(b.createdAt),
  );
}

function compareDeadlines(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b); // "YYYY-MM-DD" sorts correctly as text
}
