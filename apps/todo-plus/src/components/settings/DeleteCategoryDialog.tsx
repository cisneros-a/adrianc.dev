"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Category } from "@/lib/categories/model";
import { CategoryChip } from "../CategoryChip";
import { SECTION_LABEL } from "../styles";

type DeleteCategoryDialogProps = {
  open: boolean;
  category: Category;
  /** The other categories, in order: where tasks and templates can move to. */
  others: Category[];
  taskCount: number;
  templateCount: number;
  onCancel: () => void;
  /** moveToId is null when nothing uses the category. */
  onConfirm: (moveToId: string | null) => void;
};

/**
 * A small dialog on top of the Settings modal (a second <dialog> opened with
 * showModal(), so it sits above it and Escape closes only this one).
 */
export function DeleteCategoryDialog({
  open,
  category,
  others,
  taskCount,
  templateCount,
  onCancel,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Start on Cancel, the safe choice.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        // Handle Escape ourselves. Chrome only lets a page cancel the browser's
        // own Escape handling once without a click in between; after that it
        // closes the dialog whatever we do. Stopping the key here avoids that,
        // and keeps this Escape from also reaching the Settings dialog.
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onCancel();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClose={() => {
        if (open) onCancel();
      }}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) onCancel();
      }}
      className="task-modal m-auto w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl bg-background p-0 text-foreground shadow-xl backdrop:bg-scrim backdrop:backdrop-blur-[4px]"
    >
      {open && (
        <DialogBody
          headingId={headingId}
          category={category}
          others={others}
          taskCount={taskCount}
          templateCount={templateCount}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      )}
    </dialog>
  );
}

function DialogBody({
  headingId,
  category,
  others,
  taskCount,
  templateCount,
  onCancel,
  onConfirm,
}: Omit<DeleteCategoryDialogProps, "open"> & { headingId: string }) {
  const [moveTo, setMoveTo] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const errorId = useId();
  const inUse = taskCount + templateCount > 0;

  function handleConfirm() {
    if (!inUse) {
      onConfirm(null);
      return;
    }
    if (moveTo === null) {
      setShowError(true);
      return;
    }
    onConfirm(moveTo);
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h2 id={headingId} className="text-lg font-semibold break-words">
        Delete {category.name}?
      </h2>
      {inUse ? (
        <>
          <p className="text-base">{usageText(taskCount, templateCount)}</p>
          <fieldset
            aria-describedby={showError ? errorId : undefined}
            className="flex flex-col gap-2"
          >
            <legend className={`mb-2 ${SECTION_LABEL}`}>Move to</legend>
            <div className="flex flex-wrap gap-1.5">
              {others.map((c) => (
                <CategoryChip
                  key={c.id}
                  category={c}
                  selected={moveTo === c.id}
                  onClick={() => {
                    setMoveTo(c.id);
                    setShowError(false);
                  }}
                />
              ))}
            </div>
            {showError && (
              <p id={errorId} className="text-sm text-danger">
                Choose a category to move them to.
              </p>
            )}
          </fieldset>
        </>
      ) : (
        <p className="text-base">This can&apos;t be undone.</p>
      )}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="min-h-12 w-full rounded-xl bg-danger px-4 font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
        >
          {inUse ? "Delete and move" : "Delete"}
        </button>
        <button
          type="button"
          data-autofocus
          onClick={onCancel}
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/** "2 tasks and 1 template use it. Choose where to move them." (parts that are zero are left out) */
function usageText(tasks: number, templates: number): string {
  const parts: string[] = [];
  if (tasks > 0) parts.push(`${tasks} ${tasks === 1 ? "task" : "tasks"}`);
  if (templates > 0) {
    parts.push(`${templates} ${templates === 1 ? "template" : "templates"}`);
  }
  const single = tasks + templates === 1;
  return `${parts.join(" and ")} ${single ? "uses it" : "use it"}. Choose where to move ${single ? "it" : "them"}.`;
}
