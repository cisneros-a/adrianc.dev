// What the user's settings are: the defaults for a new task. (The theme keeps
// its own storage in src/lib/theme.ts.)

import { addDays } from "@/lib/tasks/dates";
import { isPriority, type Priority } from "@/lib/tasks/model";

export const DEADLINE_DEFAULTS = ["none", "today", "tomorrow", "week"] as const;
export type DeadlineDefault = (typeof DEADLINE_DEFAULTS)[number];

export const DEADLINE_DEFAULT_LABELS: Record<DeadlineDefault, string> = {
  none: "None",
  today: "Today",
  tomorrow: "Tomorrow",
  week: "In a week",
};

/** What the add panel starts with. null means "None": nothing is selected. */
export type Defaults = {
  /** A category id, or null. */
  category: string | null;
  priority: Priority | null;
  deadline: DeadlineDefault;
};

/** Used when nothing is saved; the same as how the app behaved before defaults existed. */
export const STARTING_DEFAULTS: Defaults = {
  category: "personal",
  priority: "medium",
  deadline: "none",
};

export function isDeadlineDefault(value: unknown): value is DeadlineDefault {
  return DEADLINE_DEFAULTS.includes(value as DeadlineDefault);
}

/** Checks a saved value; a missing or invalid field falls back to its starting value. */
export function parseDefaults(value: unknown): Defaults {
  if (typeof value !== "object" || value === null) return STARTING_DEFAULTS;
  const d = value as Record<string, unknown>;
  return {
    category:
      d.category === null || typeof d.category === "string"
        ? (d.category as string | null)
        : STARTING_DEFAULTS.category,
    priority:
      d.priority === null || isPriority(d.priority)
        ? (d.priority as Priority | null)
        : STARTING_DEFAULTS.priority,
    deadline: isDeadlineDefault(d.deadline)
      ? d.deadline
      : STARTING_DEFAULTS.deadline,
  };
}

/** The real date a relative deadline default means today (local time), or null for None. */
export function defaultDeadlineDate(
  choice: DeadlineDefault,
  today: string,
): string | null {
  switch (choice) {
    case "none":
      return null;
    case "today":
      return today;
    case "tomorrow":
      return addDays(today, 1);
    case "week":
      return addDays(today, 7);
  }
}
