"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useCategories } from "@/lib/categories/store";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  type Priority,
  type Task,
  type TaskType,
} from "@/lib/tasks/model";
import { todayKey } from "@/lib/tasks/dates";
import { defaultDeadlineDate } from "@/lib/settings/model";
import { useDefaults } from "@/lib/settings/store";
import { addTask } from "@/lib/tasks/store";
import type { Template } from "@/lib/templates/model";
import { saveTemplate, useTemplates } from "@/lib/templates/store";
import { Chip } from "./Chip";
import { SubtasksField } from "./SubtasksField";
import { CategoryChip } from "./CategoryChip";
import { SECTION_LABEL } from "./styles";

type SearchAddBarProps = {
  text: string;
  onTextChange: (text: string) => void;
  adding: boolean;
  onAddingChange: (adding: boolean) => void;
  onAdded: (task: Task) => void;
  onTemplateSaved: (result: "saved" | "replaced") => void;
};

/**
 * The box at the top (T16-T22). In search mode it filters the list as you type
 * (T16); the + button turns on add mode (T17, TD38), where the box holds a new
 * task's title and its details show underneath (TD36). Add mode stays on after
 * each add (T18); the category is kept and the other details go back to the
 * user's defaults from Settings (T19, TD39). A default of None leaves that
 * field empty, and adding with Priority or Category empty shows an error.
 * The text is shared between modes (T20). Escape clears the search or leaves
 * add mode (TD32). The label floats onto the top border once there's text
 * (T21, T22, TD41). Adding works with Enter or the button (TD37). The details
 * include a Subtasks section kept only when the task is added (T48, T49, T50),
 * a "Templates" chip row at the top that fills the whole form (T55, TD77,
 * TD84), and "Save as template", which saves without adding the task and
 * leaves the form filled (T51, TD80); the parent shows the confirmation.
 */
export function SearchAddBar({
  text,
  onTextChange,
  adding,
  onAddingChange,
  onAdded,
  onTemplateSaved,
}: SearchAddBarProps) {
  const defaults = useDefaults();
  const categories = useCategories();
  // The form starts from the defaults once they've loaded from the browser.
  const [started, setStarted] = useState(false);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [type, setType] = useState<TaskType | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  // Which required fields were left empty on the last Add / Save as template.
  const [missing, setMissing] = useState({ priority: false, category: false });
  const priorityGroupRef = useRef<HTMLDivElement>(null);
  const categoryGroupRef = useRef<HTMLDivElement>(null);
  if (!started && defaults !== null && categories !== null) {
    setStarted(true);
    setPriority(defaults.priority);
    setType(validCategoryId(categories, defaults.category));
    setDeadline(defaultDeadlineDate(defaults.deadline, todayKey()));
  }
  // A kept category that was deleted since counts as nothing selected.
  const selectedType = validCategoryId(categories ?? [], type);
  const [notes, setNotes] = useState("");
  const [subtasks, setSubtasks] = useState<{ key: string; title: string }[]>(
    [],
  );
  const templates = useTemplates();
  const inputId = useId();
  const deadlineId = useId();
  const notesId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasText = text !== "";
  const showClear = !adding && hasText;

  // True when Priority and Category are both picked. Otherwise shows the
  // errors and focuses the first chip of the first empty group.
  function checkRequired(): boolean {
    const noPriority = priority === null;
    const noCategory = selectedType === null;
    setMissing({ priority: noPriority, category: noCategory });
    if (noPriority) focusFirstChip(priorityGroupRef.current);
    else if (noCategory) focusFirstChip(categoryGroupRef.current);
    return !noPriority && !noCategory;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = text.trim();
    if (!adding || !title) return;
    if (!checkRequired() || priority === null || selectedType === null) return;
    const task = addTask(
      title,
      { priority, type: selectedType, deadline, notes },
      subtasks.map((s) => s.title),
    );
    onAdded(task);
    onTextChange("");
    // Keep the category; priority and deadline go back to the defaults (T19).
    if (defaults !== null) {
      setPriority(defaults.priority);
      setDeadline(defaultDeadlineDate(defaults.deadline, todayKey()));
    }
    setNotes("");
    setSubtasks([]);
    inputRef.current?.focus();
  }

  // Replaces everything in the form, including a typed title. The deadline
  // is the default deadline (T55, TD75).
  function applyTemplate(template: Template) {
    onTextChange(template.title);
    setPriority(template.priority);
    setType(validCategoryId(categories ?? [], template.type));
    setNotes(template.notes);
    setDeadline(defaultDeadlineDate(defaults?.deadline ?? "none", todayKey()));
    setMissing({ priority: false, category: false });
    setSubtasks(
      template.subtasks.map((title) => ({ key: crypto.randomUUID(), title })),
    );
    inputRef.current?.focus();
  }

  function handleSaveTemplate() {
    const title = text.trim();
    if (!title) return;
    if (!checkRequired() || priority === null || selectedType === null) return;
    onTemplateSaved(
      saveTemplate({
        title,
        priority,
        type: selectedType,
        notes,
        subtasks: subtasks.map((s) => s.title),
      }),
    );
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
            {templates !== null && templates.length > 0 && (
              <ChoiceGroup label="Templates">
                {templates.map((template) => (
                  <Chip
                    key={template.id}
                    label={template.title}
                    selected={false}
                    onClick={() => applyTemplate(template)}
                  />
                ))}
              </ChoiceGroup>
            )}

            <ChoiceGroup
              label="Priority"
              required
              error={missing.priority ? "Pick a priority" : undefined}
              chipsRef={priorityGroupRef}
            >
              {PRIORITIES.map((value) => (
                <Chip
                  key={value}
                  label={PRIORITY_LABELS[value]}
                  selected={priority === value}
                  onClick={() => {
                    setPriority(value);
                    setMissing((m) => ({ ...m, priority: false }));
                  }}
                />
              ))}
            </ChoiceGroup>

            <ChoiceGroup
              label="Category"
              required
              error={missing.category ? "Pick a category" : undefined}
              chipsRef={categoryGroupRef}
            >
              {(categories ?? []).map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  selected={selectedType === category.id}
                  onClick={() => {
                    setType(category.id);
                    setMissing((m) => ({ ...m, category: false }));
                  }}
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

            <SubtasksField
              label={
                subtasks.length === 0
                  ? "Subtasks"
                  : `Subtasks · ${subtasks.length}`
              }
              items={subtasks}
              onRemove={(key) =>
                setSubtasks((current) => current.filter((s) => s.key !== key))
              }
              onAdd={(title) =>
                setSubtasks((current) => [
                  ...current,
                  { key: crypto.randomUUID(), title: title.trim() },
                ])
              }
            />

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

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                disabled={!text.trim()}
                onClick={handleSaveTemplate}
                className="min-h-11 px-2 text-sm font-medium underline underline-offset-4 transition-opacity focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
              >
                Save as template
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-accent-foreground transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
              >
                Add task
              </button>
            </div>
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

/** The id if a category with it exists, otherwise null. */
function validCategoryId(
  categories: { id: string }[],
  id: string | null,
): string | null {
  return id !== null && categories.some((c) => c.id === id) ? id : null;
}

function focusFirstChip(group: HTMLElement | null) {
  group?.querySelector<HTMLElement>("button")?.focus();
}

function ChoiceGroup({
  label,
  required = false,
  error,
  chipsRef,
  children,
}: {
  label: string;
  /** Marks the field as required with an orange asterisk (TD52). */
  required?: boolean;
  /** Shown under the chips in the danger color when the field was left empty. */
  error?: string;
  chipsRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const errorId = useId();
  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      className="flex flex-col gap-2"
    >
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
      <div ref={chipsRef} className="flex flex-wrap gap-1.5">
        {children}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
