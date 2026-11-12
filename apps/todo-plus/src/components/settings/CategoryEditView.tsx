"use client";

import { useId, useState } from "react";
import {
  CATEGORY_ICON_COMPONENTS,
  CATEGORY_ICONS,
} from "@/lib/categories/icons";
import { findCategory, NAME_MAX, type Category } from "@/lib/categories/model";
import {
  CATEGORY_COLOR_CLASSES,
  CATEGORY_COLORS,
  colorLabel,
  type CategoryColor,
} from "@/lib/categories/palette";
import {
  addCategory,
  deleteCategory,
  firstUnusedColor,
  nameTaken,
  updateCategory,
  useCategories,
} from "@/lib/categories/store";
import { useTasks } from "@/lib/tasks/store";
import { useTemplates } from "@/lib/templates/store";
import { SECTION_LABEL } from "../styles";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import type { CategoryIcon } from "@/lib/categories/icons";

type CategoryEditViewProps = {
  /** The category to edit, or null for a new one. */
  id: string | null;
  /** Goes back to the main view. `deleted` is true when the category no longer exists. */
  onDone: (deleted?: boolean) => void;
};

/** Edit category / New category: name, color, icon, Save and Delete. Edits are thrown away when you go back without saving. */
export function CategoryEditView({ id, onDone }: CategoryEditViewProps) {
  const categories = useCategories() ?? [];
  // The first version found is kept for the whole visit to this view, so it
  // doesn't flash "no longer exists" while sliding out after Delete.
  const [existing] = useState(() => findCategory(categories, id));
  if (id !== null && existing === undefined) {
    return (
      <p className="px-4 py-5 text-sm text-muted">
        This category no longer exists.
      </p>
    );
  }
  return <Form existing={existing} categories={categories} onDone={onDone} />;
}

function Form({
  existing,
  categories,
  onDone,
}: {
  existing: Category | undefined;
  categories: Category[];
  onDone: (deleted?: boolean) => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState<CategoryColor>(
    () => existing?.color ?? firstUnusedColor(),
  );
  const [icon, setIcon] = useState<CategoryIcon>(existing?.icon ?? "star");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const nameId = useId();
  const errorId = useId();
  const tasks = useTasks();
  const templates = useTemplates();

  const isLast = categories.length <= 1;

  function handleSave() {
    const trimmed = name.trim();
    if (trimmed === "") {
      setError("Enter a name.");
      return;
    }
    if (nameTaken(trimmed, existing?.id)) {
      setError(`You already have a category called ${trimmed}.`);
      return;
    }
    if (existing) updateCategory(existing.id, { name: trimmed, color, icon });
    else addCategory({ name: trimmed, color, icon });
    onDone();
  }

  function handleConfirmDelete(moveToId: string | null) {
    if (!existing) return;
    setDeleting(false);
    deleteCategory(existing.id, moveToId);
    onDone(true);
  }

  const taskCount = existing
    ? (tasks ?? []).filter((t) => t.type === existing.id).length
    : 0;
  const templateCount = existing
    ? (templates ?? []).filter((t) => t.type === existing.id).length
    : 0;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className={SECTION_LABEL}>
            Name
          </label>
          <input
            id={nameId}
            value={name}
            maxLength={NAME_MAX}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSave();
              }
            }}
            autoComplete="off"
            aria-invalid={error !== null}
            aria-describedby={error ? errorId : undefined}
            className="min-h-12 rounded-xl border border-border bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-accent"
          />
          <div className="flex justify-between gap-3">
            <p id={errorId} className="text-sm text-danger">
              {error}
            </p>
            <span className="shrink-0 text-xs text-muted">
              {name.length} / {NAME_MAX}
            </span>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`mb-2 ${SECTION_LABEL}`}>Color</legend>
          <div className="grid grid-cols-5 justify-items-center gap-y-3">
            {CATEGORY_COLORS.filter(
              (c) =>
                c === existing?.color ||
                !categories.some((o) => o.id !== existing?.id && o.color === c),
            ).map((c) => (
              <button
                key={c}
                type="button"
                aria-label={colorLabel(c)}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`size-10 rounded-full ${CATEGORY_COLOR_CLASSES[c].swatch} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  color === c
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : ""
                }`}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className={`mb-2 ${SECTION_LABEL}`}>Icon</legend>
          <div className="grid grid-cols-6 justify-items-center gap-y-2">
            {CATEGORY_ICONS.map((key) => {
              const Icon = CATEGORY_ICON_COMPONENTS[key];
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={key.replace(/-/g, " ")}
                  aria-pressed={icon === key}
                  onClick={() => setIcon(key)}
                  className={`flex size-10 items-center justify-center rounded-xl border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    icon === key
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <footer className="flex flex-col items-center gap-3 border-t border-border px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={handleSave}
          className="min-h-12 w-full rounded-xl bg-accent px-4 font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Save
        </button>
        {existing && (
          <button
            type="button"
            aria-disabled={isLast}
            onClick={() => {
              if (!isLast) setDeleting(true);
            }}
            className="min-h-11 px-2 text-sm font-medium text-danger underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-danger aria-disabled:opacity-40"
          >
            Delete category
          </button>
        )}
      </footer>

      {existing && (
        <DeleteCategoryDialog
          open={deleting}
          category={existing}
          others={categories.filter((c) => c.id !== existing.id)}
          taskCount={taskCount}
          templateCount={templateCount}
          onCancel={() => setDeleting(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
