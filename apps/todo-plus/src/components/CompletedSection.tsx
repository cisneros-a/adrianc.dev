"use client";

import type { Task } from "@/lib/tasks/model";
import { SECTION_LABEL } from "./styles";
import { TaskItem } from "./TaskItem";

type CompletedSectionProps = {
  /** Already filtered and sorted. */
  tasks: Task[];
  today: string;
  open: boolean;
  onToggleOpen: () => void;
  onOpenTask: (id: string) => void;
  onToggleDone: (task: Task) => void;
};

/** Done tasks below the open list; collapsed until the header is tapped (T9, T10, TD24). */
export function CompletedSection({
  tasks,
  today,
  open,
  onToggleOpen,
  onOpenTask,
  onToggleDone,
}: CompletedSectionProps) {
  return (
    <section aria-labelledby="completed-heading" className="flex flex-col">
      <h2 id="completed-heading">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          aria-controls="completed-list"
          className={`${SECTION_LABEL} flex min-h-11 w-full items-center justify-start gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
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
          Completed · {tasks.length}
        </button>
      </h2>
      {open && (
        <ul id="completed-list" className="flex flex-col gap-2.5">
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
      )}
    </section>
  );
}
