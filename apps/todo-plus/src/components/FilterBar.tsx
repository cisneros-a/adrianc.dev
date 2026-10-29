"use client";

import { useId, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  TASK_TYPES,
  TASK_TYPE_LABELS,
} from "@/lib/tasks/model";
import {
  NO_FILTERS,
  countActiveFilters,
  type Filters,
} from "@/lib/tasks/filters";
import { Chip } from "./Chip";

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  shown: number;
  total: number;
};

/** Filters by status, priority and type (T2), collapsed by default to save space on phones (T8). */
export function FilterBar({ filters, onChange, shown, total }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const active = countActiveFilters(filters);

  function toggle<K extends keyof Filters>(
    group: K,
    value: Filters[K][number],
  ) {
    const current = filters[group] as Filters[K][number][];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next });
  }

  return (
    <section aria-label="Filters" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Filters{active > 0 ? ` (${active})` : ""} {open ? "▴" : "▾"}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {active > 0 ? `${shown} of ${total} tasks` : `${total} tasks`}
        </p>
      </div>

      {open && (
        <div
          id={panelId}
          className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4"
        >
          <FilterGroup label="Status">
            {STATUSES.map((status) => (
              <Chip
                key={status}
                label={STATUS_LABELS[status]}
                selected={filters.statuses.includes(status)}
                onClick={() => toggle("statuses", status)}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="Priority">
            {PRIORITIES.map((priority) => (
              <Chip
                key={priority}
                label={PRIORITY_LABELS[priority]}
                selected={filters.priorities.includes(priority)}
                onClick={() => toggle("priorities", priority)}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="Type">
            {TASK_TYPES.map((type) => (
              <Chip
                key={type}
                label={TASK_TYPE_LABELS[type]}
                selected={filters.types.includes(type)}
                onClick={() => toggle("types", type)}
              />
            ))}
          </FilterGroup>
          {active > 0 && (
            <button
              type="button"
              onClick={() => onChange(NO_FILTERS)}
              className="min-h-10 self-start text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
