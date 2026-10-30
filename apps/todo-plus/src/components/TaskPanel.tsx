"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  TASK_TYPES,
  TASK_TYPE_LABELS,
  type Task,
} from "@/lib/tasks/model";
import { deleteTask, updateTask } from "@/lib/tasks/store";
import { Chip } from "./Chip";
import { SECTION_LABEL } from "./styles";

type TaskPanelProps = {
  /** The task to show, or null when the panel is closed. */
  task: Task | null;
  onClose: () => void;
};

/**
 * Detail view (T3): full screen on phones, a side panel on wider screens (TD3).
 * Changes save as you type (TD14).
 */
export function TaskPanel({ task, onClose }: TaskPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  // Open or close the native <dialog> to match `task`.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (task && !dialog.open) dialog.showModal();
    if (!task && dialog.open) dialog.close();
  }, [task]);

  // App state decides whether the panel is open; the effect above makes the
  // <dialog> follow it. Done, the backdrop and delete call onClose directly,
  // because the browser's "close" event arrives late and isn't always sent.
  function handleNativeClose() {
    // Safety net for any other way the browser closes the dialog. A late event
    // after another task has been opened finds the dialog open again: ignore it.
    if (dialogRef.current?.open) return;
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onCancel={(event) => {
        // Escape key: close through app state, like the Done button.
        event.preventDefault();
        onClose();
      }}
      onClose={handleNativeClose}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-background text-foreground backdrop:bg-black/50 open:flex sm:left-auto sm:w-[28rem] sm:border-l sm:border-border"
    >
      {task && (
        // Keyed by id so the form resets when a different task is opened.
        <TaskDetails
          key={task.id}
          task={task}
          headingId={headingId}
          onClose={onClose}
        />
      )}
    </dialog>
  );
}

function TaskDetails({
  task,
  headingId,
  onClose,
}: {
  task: Task;
  headingId: string;
  onClose: () => void;
}) {
  // The title is edited locally so it can be briefly empty while retyping;
  // only non-empty titles are saved.
  const [title, setTitle] = useState(task.title);
  const titleId = useId();
  const notesId = useId();
  const deadlineId = useId();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (value.trim()) updateTask(task.id, { title: value.trim() });
  }

  function handleDelete() {
    if (window.confirm(`Delete “${task.title}”? This can't be undone.`)) {
      deleteTask(task.id);
      onClose();
    }
  }

  return (
    <div className="flex w-full flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id={headingId} className="text-lg font-semibold">
          Task details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-full px-4 text-sm font-medium text-accent hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
        >
          Done
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={titleId} className={SECTION_LABEL}>
            Title
          </label>
          <input
            id={titleId}
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            autoComplete="off"
            className="min-h-12 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
          />
          {!title.trim() && (
            <p className="text-sm text-danger">
              A title is required. The last title is kept until you type a new
              one.
            </p>
          )}
        </div>

        <ChoiceGroup label="Status">
          {STATUSES.map((status) => (
            <Chip
              key={status}
              label={STATUS_LABELS[status]}
              selected={task.status === status}
              onClick={() => updateTask(task.id, { status })}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Priority">
          {PRIORITIES.map((priority) => (
            <Chip
              key={priority}
              label={PRIORITY_LABELS[priority]}
              selected={task.priority === priority}
              onClick={() => updateTask(task.id, { priority })}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Type">
          {TASK_TYPES.map((type) => (
            <Chip
              key={type}
              label={TASK_TYPE_LABELS[type]}
              selected={task.type === type}
              onClick={() => updateTask(task.id, { type })}
            />
          ))}
        </ChoiceGroup>

        <div className="flex flex-col gap-2">
          <label htmlFor={deadlineId} className={SECTION_LABEL}>
            Deadline
          </label>
          <div className="flex gap-2">
            <input
              id={deadlineId}
              type="date"
              value={task.deadline ?? ""}
              onChange={(event) =>
                updateTask(task.id, { deadline: event.target.value || null })
              }
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
            />
            {task.deadline && (
              <button
                type="button"
                onClick={() => updateTask(task.id, { deadline: null })}
                className="min-h-12 rounded-xl border border-border px-4 text-sm font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={notesId} className={SECTION_LABEL}>
            Notes
          </label>
          <textarea
            id={notesId}
            value={task.notes}
            onChange={(event) =>
              updateTask(task.id, { notes: event.target.value })
            }
            placeholder="Add details, links, steps…"
            rows={6}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-base placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
          />
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-muted">
          <dt>Created</dt>
          <dd>{formatTimestamp(task.createdAt)}</dd>
          <dt>Updated</dt>
          <dd>{formatTimestamp(task.updatedAt)}</dd>
        </dl>

        <button
          type="button"
          onClick={handleDelete}
          className="min-h-12 rounded-xl border border-danger px-4 font-semibold text-danger hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-danger"
        >
          Delete task
        </button>
      </div>
    </div>
  );
}

function ChoiceGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={`mb-2 ${SECTION_LABEL}`}>{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
