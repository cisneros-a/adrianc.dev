"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Priority,
  type Task,
  type Status,
  type TaskType,
} from "@/lib/tasks/model";
import {
  addSubtask,
  deleteTask,
  removeSubtask,
  toggleSubtask,
  updateTask,
} from "@/lib/tasks/store";
import { saveTemplate } from "@/lib/templates/store";
import { useCategories } from "@/lib/categories/store";
import { Chip } from "./Chip";
import { SubtasksField } from "./SubtasksField";
import { CategoryChip } from "./CategoryChip";
import { SECTION_LABEL } from "./styles";

type TaskPanelProps = {
  /** The task to show, or null when the panel is closed. */
  task: Task | null;
  onClose: () => void;
};

/**
 * Detail view (T3) as a centered modal with a blurred background (T32, TD58).
 * × or a tap outside closes it (T33, TD59, TD62); changes are kept only when
 * Save is tapped (T34, T35, TD60, TD64); closing with unsaved changes asks
 * first (T36, TD61); Delete asks for confirmation and applies right away
 * (TD63). "Save as template" saves the task as last saved (T51, TD81). Subtasks are the exception: adding, ticking and removing them save
 * right away, skip Save and don't count as unsaved changes (TD71). It fades and zooms in and out (TD65). Replaces TD3 (side panel / full
 * screen) and TD14 (save as you type).
 */
export function TaskPanel({ task, onClose }: TaskPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const headingId = useId();

  // Open or close the native <dialog> to match `task`.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (task && !dialog.open) dialog.showModal();
    if (!task && dialog.open) dialog.close();
  }, [task]);

  // App state decides whether the panel is open; the effect above makes the
  // <dialog> follow it. Save, Discard, the backdrop and delete call onClose
  // directly, because the browser's "close" event arrives late and isn't
  // always sent.
  function handleNativeClose() {
    // Safety net for any other way the browser closes the dialog. A late event
    // after another task has been opened finds the dialog open again: ignore it.
    if (dialogRef.current?.open) return;
    onClose();
  }

  // Every close that starts inside the modal: play the fade-out (TD65), then
  // close. With reduced motion there is no animation, so close right away.
  function closeAnimated() {
    const dialog = dialogRef.current;
    if (
      !dialog ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onClose();
      return;
    }
    if (closingRef.current) return;
    closingRef.current = true;
    dialog.dataset.closing = "";
    function finish() {
      if (!closingRef.current) return;
      closingRef.current = false;
      window.clearTimeout(timer);
      dialog?.removeEventListener("animationend", finish);
      delete dialog?.dataset.closing;
      onClose();
    }
    dialog.addEventListener("animationend", finish, { once: true });
    const timer = window.setTimeout(finish, 250);
  }

  // TaskDetails knows whether there are unsaved changes, so it replaces this
  // with its own dismiss handler on every render.
  const dismissRef = useRef<() => void>(closeAnimated);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onCancel={(event) => {
        // Escape key: works like the × button (TD62).
        event.preventDefault();
        dismissRef.current();
      }}
      onClose={handleNativeClose}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) dismissRef.current();
      }}
      className="task-modal m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl bg-background p-0 text-foreground shadow-xl backdrop:bg-scrim backdrop:backdrop-blur-[4px] open:flex open:flex-col"
    >
      {task && (
        // Keyed by id so the form resets when a different task is opened.
        <TaskDetails
          key={task.id}
          task={task}
          headingId={headingId}
          onClose={closeAnimated}
          dismissRef={dismissRef}
        />
      )}
    </dialog>
  );
}

function TaskDetails({
  task,
  headingId,
  onClose,
  dismissRef,
}: {
  task: Task;
  headingId: string;
  onClose: () => void;
  dismissRef: React.RefObject<() => void>;
}) {
  // Edits live in a draft until Save is tapped (T34).
  const [draft, setDraft] = useState<{
    title: string;
    status: Status;
    priority: Priority;
    type: TaskType;
    deadline: string | null;
    notes: string;
  }>({
    title: task.title,
    status: task.status,
    priority: task.priority,
    type: task.type,
    deadline: task.deadline,
    notes: task.notes,
  });
  const categories = useCategories() ?? [];
  const [confirming, setConfirming] = useState(false);
  // What the "Save as template" link says for 3 seconds after saving (TD82).
  const [templateResult, setTemplateResult] = useState<
    "saved" | "replaced" | null
  >(null);
  const templateTimer = useRef<number | undefined>(undefined);
  const titleId = useId();
  const notesId = useId();
  const deadlineId = useId();

  const trimmedTitle = draft.title.trim();
  const dirty =
    trimmedTitle !== task.title ||
    draft.status !== task.status ||
    draft.priority !== task.priority ||
    draft.type !== task.type ||
    draft.deadline !== task.deadline ||
    draft.notes !== task.notes;
  const titleRef = useRef<HTMLInputElement>(null);

  function update(changes: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  // ×, tapping outside and Escape all come here (T33, T36, TD61, TD62).
  function requestDismiss() {
    if (dirty) setConfirming(true);
    else onClose();
  }

  // Keep the shell's dismiss handler pointing at the latest `dirty`.
  useEffect(() => {
    dismissRef.current = requestDismiss;
  });

  // Save is always enabled (TD60). An empty title isn't saved: focus it, where
  // the "required" message already shows. With no changes it just closes.
  function handleSave() {
    if (trimmedTitle === "") {
      titleRef.current?.focus();
      return;
    }
    if (!dirty) {
      onClose();
      return;
    }
    updateTask(task.id, {
      title: trimmedTitle,
      status: draft.status,
      priority: draft.priority,
      type: draft.type,
      deadline: draft.deadline,
      notes: draft.notes,
    });
    onClose();
  }

  useEffect(() => () => window.clearTimeout(templateTimer.current), []);

  // Uses the task as last saved, not unsaved edits on screen (T51, TD81). The
  // link text confirms instead of the flag, which the open modal would hide (TD82).
  function handleSaveTemplate() {
    const result = saveTemplate({
      title: task.title,
      priority: task.priority,
      type: task.type,
      notes: task.notes,
      subtasks: task.subtasks.map((s) => s.title),
    });
    setTemplateResult(result);
    window.clearTimeout(templateTimer.current);
    templateTimer.current = window.setTimeout(
      () => setTemplateResult(null),
      3000,
    );
  }

  function handleDelete() {
    if (window.confirm(`Delete “${task.title}”? This can't be undone.`)) {
      deleteTask(task.id);
      onClose();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative flex items-center justify-center border-b border-border px-14 py-3">
        <button
          type="button"
          aria-label="Close"
          onClick={requestDismiss}
          className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <h2 id={headingId} className="text-lg font-semibold">
          Task details
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={titleId} className={SECTION_LABEL}>
            Title
          </label>
          <input
            ref={titleRef}
            id={titleId}
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
            autoComplete="off"
            className="min-h-12 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
          />
          {trimmedTitle === "" && (
            <p className="text-sm text-danger">A title is required to save.</p>
          )}
        </div>

        <ChoiceGroup label="Status">
          {STATUSES.map((status) => (
            <Chip
              key={status}
              label={STATUS_LABELS[status]}
              selected={draft.status === status}
              onClick={() => update({ status })}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Priority">
          {PRIORITIES.map((priority) => (
            <Chip
              key={priority}
              label={PRIORITY_LABELS[priority]}
              selected={draft.priority === priority}
              onClick={() => update({ priority })}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Category">
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              selected={draft.type === category.id}
              onClick={() => update({ type: category.id })}
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
              value={draft.deadline ?? ""}
              onChange={(event) =>
                update({ deadline: event.target.value || null })
              }
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
            />
            {draft.deadline && (
              <button
                type="button"
                onClick={() => update({ deadline: null })}
                className="min-h-12 rounded-xl border border-border px-4 text-sm font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Subtasks save right away, not with Save (TD70, TD71). The new-subtask text lives in SubtasksField and isn't part of `dirty`. */}
        <SubtasksField
          label={
            task.subtasks.length === 0
              ? "Subtasks"
              : `Subtasks · ${task.subtasks.filter((s) => s.done).length}/${task.subtasks.length}`
          }
          items={task.subtasks.map((s) => ({
            key: s.id,
            title: s.title,
            done: s.done,
          }))}
          onToggle={(key) => toggleSubtask(task.id, key)}
          onRemove={(key) => removeSubtask(task.id, key)}
          onAdd={(title) => addSubtask(task.id, title)}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor={notesId} className={SECTION_LABEL}>
            Notes
          </label>
          <textarea
            id={notesId}
            value={draft.notes}
            onChange={(event) => update({ notes: event.target.value })}
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
      </div>

      <footer className="flex flex-col items-center gap-3 border-t border-border px-4 pt-3 pb-4">
        {confirming && (
          <div
            role="status"
            className="flex w-full flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span>You have unsaved changes.</span>
            <span className="flex gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 rounded-full border border-danger px-4 text-sm font-medium text-danger hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                Discard
              </button>
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="min-h-12 w-full rounded-xl bg-accent px-4 font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Save
        </button>
        <div aria-live="polite">
          <button
            type="button"
            onClick={handleSaveTemplate}
            className="min-h-11 px-2 text-sm font-medium text-muted underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          >
            {templateResult === "saved"
              ? "Template saved ✓"
              : templateResult === "replaced"
                ? "Template replaced ✓"
                : "Save as template"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="min-h-11 px-2 text-sm font-medium text-danger underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-danger"
        >
          Delete task
        </button>
      </footer>
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
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
