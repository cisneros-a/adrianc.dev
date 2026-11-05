"use client";

import {
  STATUS_LABELS,
  TASK_TYPE_LABELS,
  type Task,
  type TaskType,
} from "@/lib/tasks/model";
import { formatDeadline, isOverdue } from "@/lib/tasks/dates";
import { PriorityBadge } from "./PriorityBadge";
import { TypeIcon } from "./TypeIcon";

// A solid strip of the task type's color on the right of the card (TD17).
// Full class names so Tailwind can find them when building the CSS.
const TYPE_EDGE: Record<TaskType, string> = {
  work: "shadow-[4px_0_0_0_var(--color-type-work)]",
  personal: "shadow-[4px_0_0_0_var(--color-type-personal)]",
  school: "shadow-[4px_0_0_0_var(--color-type-school)]",
  errands: "shadow-[4px_0_0_0_var(--color-type-errands)]",
};

type TaskItemProps = {
  task: Task;
  today: string;
  onOpen: () => void;
  onToggleDone: () => void;
};

/**
 * One row: a checkbox to mark it done, and the rest of the row opens the detail panel (T3).
 * The type shows as an icon in the top-right corner (T30); its name stays as hidden text for screen readers (TD55).
 */
export function TaskItem({ task, today, onOpen, onToggleDone }: TaskItemProps) {
  const done = task.status === "done";
  const overdue =
    !done && task.deadline !== null && isOverdue(task.deadline, today);

  return (
    <li
      className={`relative flex items-stretch rounded-xl border border-border bg-surface ${TYPE_EDGE[task.type]}`}
    >
      <label className="flex shrink-0 cursor-pointer items-center px-4">
        <input
          type="checkbox"
          aria-label={`Mark “${task.title}” as done`}
          checked={done}
          onChange={onToggleDone}
          className="size-5 accent-accent"
        />
      </label>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-14 min-w-0 flex-1 flex-col items-start gap-1.5 py-3 pr-9 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          className={`w-full truncate text-base font-medium ${done ? "text-muted line-through" : ""}`}
        >
          {task.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <PriorityBadge priority={task.priority} />
          <span className="sr-only">{TASK_TYPE_LABELS[task.type]}</span>
          {task.status === "in_progress" && (
            <span>{STATUS_LABELS.in_progress}</span>
          )}
          {task.deadline && (
            <span className={overdue ? "font-semibold text-danger" : ""}>
              {overdue ? "Overdue · " : "Due "}
              {formatDeadline(task.deadline, today)}
            </span>
          )}
          {task.notes.trim() && <span aria-label="Has notes">📝</span>}
        </span>
      </button>
      {/* pointer-events-none: a tap on the icon opens the task like the rest of the card. */}
      <TypeIcon
        type={task.type}
        className="pointer-events-none absolute top-3 right-3"
      />
    </li>
  );
}
