"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  DEFAULT_TASK,
  PRIORITIES,
  PRIORITY_LABELS,
  TASK_TYPES,
  type Priority,
  type Task,
  type TaskType,
} from "@/lib/tasks/model";
import { addTask } from "@/lib/tasks/store";
import { Chip } from "./Chip";
import { TypeChip } from "./TypeChip";
import { SECTION_LABEL } from "./styles";

type SearchAddBarProps = {
  text: string;
  onTextChange: (text: string) => void;
  adding: boolean;
  onAddingChange: (adding: boolean) => void;
  onAdded: (task: Task) => void;
};

/**
 * The box at the top (T16-T22). In search mode it filters the list as you type
 * (T16); the + button turns on add mode (T17, TD38), where the box holds a new
 * task's title and its details show underneath (TD36). Add mode stays on after
 * each add (T18); the type is kept and the other details reset (T19, TD39).
 * The text is shared between modes (T20). Escape clears the search or leaves
 * add mode (TD32). The label floats onto the top border once there's text
 * (T21, T22, TD41). Adding works with Enter or the button (TD37).
 */
export function SearchAddBar({
  text,
  onTextChange,
  adding,
  onAddingChange,
  onAdded,
}: SearchAddBarProps) {
  const [priority, setPriority] = useState<Priority>(DEFAULT_TASK.priority);
  const [type, setType] = useState<TaskType>(DEFAULT_TASK.type);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const inputId = useId();
  const deadlineId = useId();
  const notesId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasText = text !== "";
  const showClear = !adding && hasText;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = text.trim();
    if (!adding || !title) return;
    const task = addTask(title, { priority, type, deadline, notes });
    onAdded(task);
    onTextChange("");
    // Keep the type; everything else goes back to its default (T19).
    setPriority(DEFAULT_TASK.priority);
    setDeadline(null);
    setNotes("");
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (adding) {
      onAddingChange(false);
      inputRef.current?.focus();
    } else if (text) {
      onTextChange("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col"
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          {!adding && (
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" />
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            autoComplete="off"
            enterKeyHint={adding ? "done" : "search"}
            className={`min-h-12 w-full rounded-xl border bg-surface text-base focus-visible:outline-2 focus-visible:outline-accent ${
              adding ? "border-accent pl-4" : "border-border pl-11"
            } ${!adding && hasText ? "pr-12" : "pr-4"}`}
          />
          <label
            htmlFor={inputId}
            style={
              hasText
                ? {
                    background:
                      "linear-gradient(var(--background) 50%, var(--surface) 50%)",
                  }
                : undefined
            }
            className={`pointer-events-none absolute px-1 leading-none motion-safe:transition-all motion-safe:duration-150 ${
              hasText
                ? `top-0 left-3 -translate-y-1/2 text-[11px] font-medium ${
                    adding ? "text-accent" : "text-muted"
                  }`
                : `top-1/2 -translate-y-1/2 text-base text-muted ${
                    adding ? "left-3" : "left-10"
                  }`
            }`}
          >
            {adding ? "Add task" : "Search"}
          </label>
          {showClear && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onTextChange("");
                inputRef.current?.focus();
              }}
              className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Add tasks"
          aria-pressed={adding}
          onClick={() => {
            onAddingChange(!adding);
            inputRef.current?.focus();
          }}
          className={`flex min-h-12 w-12 shrink-0 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            adding
              ? "border border-accent bg-surface text-accent"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {adding ? (
            <SearchIcon className="size-5" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className="size-5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
      </div>

      {/* Always rendered so it can slide open and closed: the row height
          animates from 0 to its content (TD42). `inert` takes it out of tab
          order and screen readers while closed. */}
      <div
        inert={!adding}
        className={`grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-200 motion-safe:ease-out ${
          adding ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* -mx-1 px-1 leaves room so focus rings at the edges aren't clipped. */}
        <div className="-mx-1 min-h-0 overflow-hidden px-1">
          <div className="mt-4 flex flex-col gap-5 border-b border-border pb-5">
            <ChoiceGroup label="Priority" required>
              {PRIORITIES.map((value) => (
                <Chip
                  key={value}
                  label={PRIORITY_LABELS[value]}
                  selected={priority === value}
                  onClick={() => setPriority(value)}
                />
              ))}
            </ChoiceGroup>

            <ChoiceGroup label="Type" required>
              {TASK_TYPES.map((value) => (
                <TypeChip
                  key={value}
                  type={value}
                  selected={type === value}
                  onClick={() => setType(value)}
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
                  value={deadline ?? ""}
                  onChange={(event) => setDeadline(event.target.value || null)}
                  className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
                />
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline(null)}
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
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add details, links, steps…"
                rows={3}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-base placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
              />
            </div>

            <button
              type="submit"
              disabled={!text.trim()}
              className="min-h-12 self-end rounded-xl bg-accent px-5 font-semibold text-accent-foreground transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
            >
              Add task
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function SearchIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function ChoiceGroup({
  label,
  required = false,
  children,
}: {
  label: string;
  /** Marks the field as required with an orange asterisk (TD52). */
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={`mb-2 ${SECTION_LABEL}`}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-accent">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}
