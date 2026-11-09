"use client";

import { Settings, Trash2, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { deleteTemplate, useTemplates } from "@/lib/templates/store";
import { SECTION_LABEL } from "./styles";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The gear icon in the header and the Settings modal it opens (T56, TD79). The
 * modal looks like task details: × top-left, a tap outside or Escape closes
 * it. It holds the Theme switch, which applies right away, and the list of
 * templates, which can be deleted after a confirmation (T54, TD85).
 */
export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const headingId = useId();
  const templates = useTemplates();

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
  }

  // Play the fade-out (TD65), then close. With reduced motion, close right away.
  function closeAnimated() {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
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
      dialog?.close();
    }
    dialog.addEventListener("animationend", finish, { once: true });
    const timer = window.setTimeout(finish, 250);
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete template “${title}”? This can't be undone.`)) {
      deleteTemplate(id);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        aria-haspopup="dialog"
        onClick={openDialog}
        className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Settings className="size-5" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onCancel={(event) => {
          // Escape key: works like the × button.
          event.preventDefault();
          closeAnimated();
        }}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the dimmed backdrop lands on the <dialog> itself.
          if (event.target === event.currentTarget) closeAnimated();
        }}
        className="task-modal m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl bg-background p-0 text-foreground shadow-xl backdrop:bg-scrim backdrop:backdrop-blur-[4px] open:flex open:flex-col"
      >
        {open && (
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="relative flex items-center justify-center border-b border-border px-14 py-3">
              <button
                type="button"
                aria-label="Close"
                onClick={closeAnimated}
                className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              <h2 id={headingId} className="text-lg font-semibold">
                Settings
              </h2>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
              <div className="flex flex-col gap-2">
                <h3 className={SECTION_LABEL}>Theme</h3>
                <div className="self-start">
                  <ThemeToggle />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className={SECTION_LABEL}>Templates</h3>
                {templates === null || templates.length === 0 ? (
                  <p className="text-sm text-muted">
                    No templates yet. Save one from the add panel or a
                    task&apos;s details.
                  </p>
                ) : (
                  <ul>
                    {templates.map((template) => (
                      <li
                        key={template.id}
                        className="flex min-h-11 items-center gap-3 border-b border-border"
                      >
                        <span className="min-w-0 flex-1 text-base break-words">
                          {template.title}
                          {template.subtasks.length > 0 && (
                            <span className="text-sm text-muted">
                              {" "}
                              · {template.subtasks.length}{" "}
                              {template.subtasks.length === 1
                                ? "subtask"
                                : "subtasks"}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          aria-label={`Delete template “${template.title}”`}
                          onClick={() =>
                            handleDelete(template.id, template.title)
                          }
                          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
