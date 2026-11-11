"use client";

import { useId, useRef, useState } from "react";
import { findCategory } from "@/lib/categories/model";
import { useCategories } from "@/lib/categories/store";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/tasks/model";
import {
  deleteTemplate,
  updateTemplate,
  useTemplates,
} from "@/lib/templates/store";
import { CategoryChip } from "../CategoryChip";
import { Chip } from "../Chip";
import { SubtasksField } from "../SubtasksField";
import { SECTION_LABEL } from "../styles";
import type { Template } from "@/lib/templates/model";

type TemplateEditViewProps = {
  id: string;
  /** Goes back to the main view. `deleted` is true when the template no longer exists. */
  onDone: (deleted?: boolean) => void;
};

/** Edit template: name, priority, category, notes and subtasks. Edits are thrown away when you go back without saving (T54). */
export function TemplateEditView({ id, onDone }: TemplateEditViewProps) {
  const templates = useTemplates();
  // The first version found is kept for the whole visit to this view, so it
  // doesn't flash "no longer exists" while sliding out after Delete.
  const [template] = useState(() => templates?.find((t) => t.id === id));
  if (!template) {
    return (
      <p className="px-4 py-5 text-sm text-muted">
        This template no longer exists.
      </p>
    );
  }
  return <Form template={template} onDone={onDone} />;
}

function Form({
  template,
  onDone,
}: {
  template: Template;
  onDone: (deleted?: boolean) => void;
}) {
  const categories = useCategories() ?? [];
  const [title, setTitle] = useState(template.title);
  const [priority, setPriority] = useState<Priority>(template.priority);
  const [type, setType] = useState<string | null>(
    findCategory(categories, template.type)?.id ?? null,
  );
  const [notes, setNotes] = useState(template.notes);
  const [subtasks, setSubtasks] = useState(() =>
    template.subtasks.map((t) => ({ key: crypto.randomUUID(), title: t })),
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState(false);
  const nameId = useId();
  const nameErrorId = useId();
  const notesId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    const trimmed = title.trim();
    if (trimmed === "") {
      setNameError("Enter a name.");
      nameRef.current?.focus();
      return;
    }
    if (type === null) {
      setCategoryError(true);
      return;
    }
    const result = updateTemplate(template.id, {
      title: trimmed,
      priority,
      type,
      notes,
      subtasks: subtasks.map((s) => s.title),
    });
    if (result === "name-taken") {
      setNameError(`You already have a template called ${trimmed}.`);
      nameRef.current?.focus();
      return;
    }
    onDone();
  }

  function handleDelete() {
    if (
      window.confirm(
        `Delete template “${template.title}”? This can't be undone.`,
      )
    ) {
      deleteTemplate(template.id);
      onDone(true);
    }
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className={SECTION_LABEL}>
            Name
          </label>
          <input
            ref={nameRef}
            id={nameId}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setNameError(null);
            }}
            autoComplete="off"
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? nameErrorId : undefined}
            className="min-h-12 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
          />
          {nameError && (
            <p id={nameErrorId} className="text-sm text-danger">
              {nameError}
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`mb-2 ${SECTION_LABEL}`}>Priority</legend>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={PRIORITY_LABELS[p]}
                selected={priority === p}
                onClick={() => setPriority(p)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className={`mb-2 ${SECTION_LABEL}`}>Category</legend>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                category={c}
                selected={type === c.id}
                onClick={() => {
                  setType(c.id);
                  setCategoryError(false);
                }}
              />
            ))}
          </div>
          {categoryError && (
            <p className="text-sm text-danger">Pick a category</p>
          )}
        </fieldset>

        <SubtasksField
          label={
            subtasks.length === 0 ? "Subtasks" : `Subtasks · ${subtasks.length}`
          }
          items={subtasks}
          onRemove={(key) =>
            setSubtasks((current) => current.filter((s) => s.key !== key))
          }
          onAdd={(t) =>
            setSubtasks((current) => [
              ...current,
              { key: crypto.randomUUID(), title: t.trim() },
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
            rows={4}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-base placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
          />
        </div>
      </div>

      <footer className="flex flex-col items-center gap-3 border-t border-border px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={handleSave}
          className="min-h-12 w-full rounded-xl bg-accent px-4 font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="min-h-11 px-2 text-sm font-medium text-danger underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-danger"
        >
          Delete template
        </button>
      </footer>
    </>
  );
}
