// What a task is (TD2), and the fixed lists it draws from (TD8, TD9).

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** The id of a category (see src/lib/categories). Saved tasks keep the field name `type`. */
export type TaskType = string;

export const STATUSES = ["todo", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

/** A checklist item inside a task: a title and a done checkbox, nothing else (T38, TD68). */
export type Subtask = { id: string; title: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  /** Free-form extra context, shown in the detail panel (T3). */
  notes: string;
  priority: Priority;
  type: TaskType;
  status: Status;
  /** Calendar date as "YYYY-MM-DD" in the user's local time, or null for no deadline. */
  deadline: string | null;
  /** ISO timestamp of when the task was last marked done, or null when it isn't done. Managed by the store. */
  completedOn: string | null;
  /** Checklist items, in the order added; one level deep (T38, T39, T47). Changed only through the store's subtask functions. */
  subtasks: Subtask[];
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
};

/** The fields a user can change; everything else is managed by the store. */
export type TaskChanges = Partial<
  Pick<Task, "title" | "notes" | "priority" | "type" | "status" | "deadline">
>;

/** What a new task gets for the fields the caller doesn't give. Priority and category have no fixed default: they come from the user's defaults (Settings). */
export const DEFAULT_TASK: Pick<
  Task,
  "notes" | "status" | "deadline" | "completedOn" | "subtasks"
> = {
  notes: "",
  status: "todo",
  deadline: null,
  completedOn: null,
  subtasks: [],
};

export function isPriority(value: unknown): value is Priority {
  return PRIORITIES.includes(value as Priority);
}

export function isTaskType(value: unknown): value is TaskType {
  return typeof value === "string" && value !== "";
}

export function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}
