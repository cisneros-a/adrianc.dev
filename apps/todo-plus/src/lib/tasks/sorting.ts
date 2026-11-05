// How tasks are sorted and grouped (T23-T26, TD43, TD44). A sort is a named definition: an optional
// grouping plus an ordered list of comparison rules. Pure functions: no storage, no React.

import { daysBetween } from "./dates";
import { PRIORITIES, type Task } from "./model";

/** Compares two tasks for sorting: negative puts `a` first. */
export type Comparator = (a: Task, b: Task) => number;

/** Urgent first. */
export const byPriority: Comparator = (a, b) =>
  PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
/** Soonest deadline first, no deadline last. */
export const byDeadline: Comparator = (a, b) =>
  compareDeadlines(a.deadline, b.deadline);
/** Oldest created first. */
export const byCreated: Comparator = (a, b) =>
  a.createdAt.localeCompare(b.createdAt);

/** How a sort splits tasks into headed groups (TD44). */
export type Grouping = {
  /** Group ids in display order. */
  order: readonly string[];
  labels: Record<string, string>;
  groupOf: (task: Task, today: string) => string;
};

export type SortDefinition = {
  id: string;
  label: string;
  /** Null shows one plain list. */
  grouping: Grouping | null;
  /** Applied in order; the first rule that doesn't tie decides. */
  rules: Comparator[];
};

export type TaskGroup = { id: string; label: string; tasks: Task[] };

function compareDeadlines(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b); // "YYYY-MM-DD" sorts correctly as text
}

/** Overdue, Today, Tomorrow, then everything else, including tasks with no deadline (T23, TD45). */
const DUE_GROUPING: Grouping = {
  order: ["overdue", "today", "tomorrow", "other"],
  labels: {
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow",
    other: "Other",
  },
  groupOf: (task, today) => {
    if (task.deadline === null) return "other";
    const days = daysBetween(today, task.deadline);
    if (days < 0) return "overdue";
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    return "other";
  },
};

/** Priority, then deadline, then oldest created, inside each due group (TD43). */
export const DEFAULT_SORT: SortDefinition = {
  id: "default",
  label: "Default",
  grouping: DUE_GROUPING,
  rules: [byPriority, byDeadline, byCreated],
};

/** Returns a sorted copy; for each pair the first rule that doesn't tie decides. */
export function sortTasks(tasks: Task[], rules: Comparator[]): Task[] {
  return [...tasks].sort((a, b) => {
    for (const rule of rules) {
      const result = rule(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/** Splits tasks into headed groups in the sort's order; empty groups are left out (TD44, TD45). */
export function groupTasks(
  tasks: Task[],
  sort: SortDefinition,
  today: string,
): TaskGroup[] {
  const { grouping, rules } = sort;
  if (grouping === null) {
    return tasks.length === 0
      ? []
      : [{ id: "all", label: "Tasks", tasks: sortTasks(tasks, rules) }];
  }
  return grouping.order
    .map((id) => ({
      id,
      label: grouping.labels[id],
      tasks: sortTasks(
        tasks.filter((task) => grouping.groupOf(task, today) === id),
        rules,
      ),
    }))
    .filter((group) => group.tasks.length > 0);
}

/** Completed tasks: most recently completed first (TD26), then newest created. */
export function sortCompletedTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      (b.completedOn ?? "").localeCompare(a.completedOn ?? "") ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
