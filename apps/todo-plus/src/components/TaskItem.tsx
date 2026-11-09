"use client";

import { Check, ChevronDown, FileText, ListChecks } from "lucide-react";
import { useId, useState } from "react";
import {
  STATUS_LABELS,
  TASK_TYPE_LABELS,
  type Task,
  type TaskType,
} from "@/lib/tasks/model";
import { toggleSubtask } from "@/lib/tasks/store";
import { formatDeadline, isOverdue } from "@/lib/tasks/dates";
import { PriorityBadge } from "./PriorityBadge";
import { TypeIcon } from "./TypeIcon";

// A solid strip of the task type's color on the right of the card (TD17).
// Full class names so Tailwind can find them when building the CSS.
const TYPE_EDGE: Record<TaskType, string> = {
  work: "shadow-[4px_0_0_0_var(--color-type-work)]",
  personal: "shadow-[4px_0_0_0_var(--color-type-personal)]",
  home: "shadow-[4px_0_0_0_var(--color-type-home)]",
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
 * With subtasks, a counter at the bottom right opens or closes their list on the card (T40, TD72);
 * ticking one saves right away, with no Undo toast (T41, TD73). Adding and removing happen in the modal (T42).
 */
export function TaskItem({ task, today, onOpen, onToggleDone }: TaskItemProps) {
  const done = task.status === "done";
  const overdue =
    !done && task.deadline !== null && isOverdue(task.deadline, today);
  const [open, setOpen] = useState(false); // not saved (TD72)
  const listId = useId();
  const total = task.subtasks.length;
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const allDone = total > 0 && doneCount === total;

  return (
    <li
      className={`relative flex flex-col rounded-xl border border-border bg-surface ${TYPE_EDGE[task.type]}`}
    >
      <div className="relative flex items-stretch">
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
          className={`flex min-h-14 min-w-0 flex-1 flex-col items-start gap-1.5 py-3 ${total > 0 ? "pr-20" : "pr-10"} text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
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
            {task.notes.trim() && (
              <span className="flex items-center">
                <FileText className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Has notes</span>
              </span>
            )}
          </span>
        </button>
        {/* pointer-events-none: a tap on the icon opens the task like the rest of the card. */}
        <TypeIcon
          type={task.type}
          className="pointer-events-none absolute top-3 right-3"
        />
        {total > 0 && (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`Subtasks, ${doneCount} of ${total} done`}
            className={`absolute right-2 bottom-2 flex h-8 items-center gap-1 rounded-full px-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${allDone ? "text-success" : "text-muted"}`}
          >
            {allDone ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <ListChecks className="size-3.5" aria-hidden="true" />
            )}
            {doneCount}/{total}
            <ChevronDown
              className={`size-3.5 motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {open && total > 0 && (
        <ul id={listId} className="pr-4 pb-3 pl-[52px]">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id}>
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={subtask.done}
                  onChange={() => toggleSubtask(task.id, subtask.id)}
                  className="size-4 accent-accent"
                />
                <span className={subtask.done ? "text-muted line-through" : ""}>
                  {subtask.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
