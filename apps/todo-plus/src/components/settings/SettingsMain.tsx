"use client";

import { ChevronDown, ChevronRight, ChevronUp, Plus, X } from "lucide-react";
import { useRef } from "react";
import {
  findCategory,
  MAX_CATEGORIES,
  NO_CATEGORY_LABEL,
} from "@/lib/categories/model";
import { moveCategory, useCategories } from "@/lib/categories/store";
import { CategoryIcon } from "../CategoryIcon";
import { DEADLINE_DEFAULT_LABELS, type Defaults } from "@/lib/settings/model";
import { useDefaults } from "@/lib/settings/store";
import { PRIORITY_LABELS } from "@/lib/tasks/model";
import { useTemplates } from "@/lib/templates/store";
import { SECTION_LABEL } from "../styles";
import { ThemeToggle } from "../ThemeToggle";

type SettingsMainProps = {
  headingId: string;
  onClose: () => void;
  onOpenDefaults: (opener: HTMLElement) => void;
  /** id null means a new category. */
  onOpenCategory: (id: string | null, opener: HTMLElement) => void;
  onOpenTemplate: (id: string, opener: HTMLElement) => void;
  categoriesLabelRef: React.RefObject<HTMLHeadingElement | null>;
  templatesLabelRef: React.RefObject<HTMLHeadingElement | null>;
};

const ICON_BUTTON =
  "flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent aria-disabled:opacity-40 aria-disabled:hover:bg-transparent";

/** The first Settings view: Theme, Defaults, Categories and Templates. */
export function SettingsMain({
  headingId,
  onClose,
  onOpenDefaults,
  onOpenCategory,
  onOpenTemplate,
  categoriesLabelRef,
  templatesLabelRef,
}: SettingsMainProps) {
  const categories = useCategories() ?? [];
  const templates = useTemplates();
  const defaults = useDefaults();
  const listRef = useRef<HTMLUListElement>(null);
  const atCap = categories.length >= MAX_CATEGORIES;

  function handleMove(id: string, direction: "up" | "down") {
    moveCategory(id, direction);
    // Moving the row can drop focus; put it back on the same button.
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-move="${id}:${direction}"]`)
        ?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <header className="relative flex items-center justify-center border-b border-border px-14 py-3">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
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
          <h3 className={SECTION_LABEL}>Defaults</h3>
          <button
            type="button"
            onClick={(event) => onOpenDefaults(event.currentTarget)}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface px-4 text-left hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-base">New tasks</span>
              <span className="truncate text-sm text-muted">
                {defaults === null ? "" : defaultsSummary(defaults, categories)}
              </span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-muted"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h3
              ref={categoriesLabelRef}
              tabIndex={-1}
              className={SECTION_LABEL}
            >
              Categories
            </h3>
            <span className="text-xs text-muted">
              {categories.length} of {MAX_CATEGORIES}
            </span>
          </div>
          <ul ref={listRef}>
            {categories.map((category, index) => (
              <li
                key={category.id}
                className="flex min-h-11 items-center gap-1 border-b border-border"
              >
                <button
                  type="button"
                  onClick={(event) =>
                    onOpenCategory(category.id, event.currentTarget)
                  }
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left text-base focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <CategoryIcon category={category} />
                  <span className="min-w-0 flex-1 truncate">
                    {category.name}
                  </span>
                </button>
                <button
                  type="button"
                  data-move={`${category.id}:up`}
                  aria-label={`Move ${category.name} up`}
                  aria-disabled={index === 0}
                  onClick={() => index > 0 && handleMove(category.id, "up")}
                  className={ICON_BUTTON}
                >
                  <ChevronUp className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-move={`${category.id}:down`}
                  aria-label={`Move ${category.name} down`}
                  aria-disabled={index === categories.length - 1}
                  onClick={() =>
                    index < categories.length - 1 &&
                    handleMove(category.id, "down")
                  }
                  className={ICON_BUTTON}
                >
                  <ChevronDown className="size-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-disabled={atCap}
            onClick={(event) => {
              if (!atCap) onOpenCategory(null, event.currentTarget);
            }}
            className="flex min-h-11 items-center gap-2 self-start rounded-full px-2 text-sm font-medium text-accent hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add category
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 ref={templatesLabelRef} tabIndex={-1} className={SECTION_LABEL}>
            Templates
          </h3>
          {templates === null || templates.length === 0 ? (
            <p className="text-sm text-muted">
              No templates yet. Save one from the add panel or a task&apos;s
              details.
            </p>
          ) : (
            <ul>
              {templates.map((template) => (
                <li key={template.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={(event) =>
                      onOpenTemplate(template.id, event.currentTarget)
                    }
                    className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-accent"
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
                    <ChevronRight
                      className="size-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

/** "Personal · Medium · No deadline" */
function defaultsSummary(
  defaults: Defaults,
  categories: Parameters<typeof findCategory>[0],
): string {
  const category =
    findCategory(categories, defaults.category)?.name ?? NO_CATEGORY_LABEL;
  const priority =
    defaults.priority === null
      ? "No priority"
      : PRIORITY_LABELS[defaults.priority];
  const deadline =
    defaults.deadline === "none"
      ? "No deadline"
      : DEADLINE_DEFAULT_LABELS[defaults.deadline];
  return `${category} · ${priority} · ${deadline}`;
}
