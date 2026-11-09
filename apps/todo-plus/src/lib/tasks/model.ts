// What a task is (TD2), and the fixed lists it draws from (TD8, TD9).

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_TYPES = ["work", "personal", "home", "errands"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const STATUSES = ["todo", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  work: "Work",
  personal: "Personal",
  home: "Home",
  errands: "Errands",
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

export const DEFAULT_TASK: Pick<
  Task,
  | "notes"
  | "priority"
  | "type"
  | "status"
  | "deadline"
  | "completedOn"
  | "subtasks"
> = {
  notes: "",
  priority: "medium",
  type: "personal",
  status: "todo",
  deadline: null,
  completedOn: null,
  subtasks: [],
};

export function isPriority(value: unknown): value is Priority {
  return PRIORITIES.includes(value as Priority);
}

export function isTaskType(value: unknown): value is TaskType {
  return TASK_TYPES.includes(value as TaskType);
}

export function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}
