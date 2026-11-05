"use client";

import { useId } from "react";
import type { Task } from "@/lib/tasks/model";
import { SECTION_LABEL_TYPE } from "./styles";
import { TaskItem } from "./TaskItem";

type TaskSectionProps = {
  label: string;
  /** Already filtered and sorted. */
  tasks: Task[];
  today: string;
  open: boolean;
  onToggleOpen: () => void;
  onOpenTask: (id: string) => void;
  onToggleDone: (task: Task) => void;
  /** Colors the heading red; used for Overdue (TD46). */
  tone?: "danger";
};

/** A headed list of tasks that opens and closes when the heading is tapped; used for the due groups and Completed (T27, T28, TD45, TD46, TD48, TD50). */
export function TaskSection({
  label,
  tasks,
  today,
  open,
  onToggleOpen,
  onOpenTask,
  onToggleDone,
  tone,
}: TaskSectionProps) {
  const id = useId();
  const headingId = `${id}-heading`;
  const listId = `${id}-list`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col">
      <h2 id={headingId}>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          aria-controls={listId}
          className={`${SECTION_LABEL_TYPE} ${tone === "danger" ? "text-danger" : "text-muted"} flex min-h-11 w-full items-center justify-start gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`size-4 shrink-0 motion-safe:transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3l5 5-5 5" />
          </svg>
          {label} · {tasks.length}
        </button>
      </h2>
      {/* Always rendered so it can slide open and closed: the row height
          animates from 0 to its content (TD51). `inert` takes it out of tab
          order and screen readers while closed. */}
      <div
        inert={!open}
        className={`grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-250 motion-safe:ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* -m-1 p-1 leaves room so focus rings and the type strip on each
            card's right edge aren't clipped. */}
        <div className="-m-1 min-h-0 overflow-hidden p-1">
          <ul id={listId} className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                today={today}
                onOpen={() => onOpenTask(task.id)}
                onToggleDone={() => onToggleDone(task)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
