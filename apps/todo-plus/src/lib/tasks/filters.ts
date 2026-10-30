// Filtering (T2) and default ordering (TD15). Pure functions: no storage, no React.

import {
  PRIORITIES,
  type Priority,
  type Status,
  type Task,
  type TaskType,
} from "./model";
import { daysBetween } from "./dates";

export const DEADLINE_RANGES = [
  "overdue",
  "today",
  "tomorrow",
  "next7",
  "next30",
] as const;
export type DeadlineRange = (typeof DEADLINE_RANGES)[number];

export const DEADLINE_RANGE_LABELS: Record<DeadlineRange, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  next7: "Next 7 days",
  next30: "Next 30 days",
};

/** An empty list in a group means "no filter" for that group. */
export type Filters = {
  priorities: Priority[];
  types: TaskType[];
  statuses: Status[];
  deadlines: DeadlineRange[];
};

export const NO_FILTERS: Filters = {
  priorities: [],
  types: [],
  statuses: [],
  deadlines: [],
};

export function countActiveFilters(filters: Filters): number {
  return (
    filters.priorities.length +
    filters.types.length +
    filters.statuses.length +
    filters.deadlines.length
  );
}

/** Within a group a task matches ANY selected option; across groups it must match ALL. */
export function filterTasks(
  tasks: Task[],
  filters: Filters,
  today: string,
): Task[] {
  return tasks.filter(
    (task) =>
      matches(filters.priorities, task.priority) &&
      matches(filters.types, task.type) &&
      matches(filters.statuses, task.status) &&
      matchesDeadline(filters.deadlines, task, today),
  );
}

function matches<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

/**
 * Deadline ranges are rolling and include today. Tasks with no deadline match none of them.
 * "Overdue" skips done tasks, like the Overdue label on cards.
 */
function matchesDeadline(
  selected: DeadlineRange[],
  task: Task,
  today: string,
): boolean {
  if (selected.length === 0) return true;
  if (task.deadline === null) return false;
  const days = daysBetween(today, task.deadline);
  return selected.some((range) => {
    switch (range) {
      case "overdue":
        return days < 0 && task.status !== "done";
      case "today":
        return days === 0;
      case "tomorrow":
        return days === 1;
      case "next7":
        return days >= 0 && days <= 7;
      case "next30":
        return days >= 0 && days <= 30;
    }
  });
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
