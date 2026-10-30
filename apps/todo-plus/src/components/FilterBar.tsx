"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  TASK_TYPES,
} from "@/lib/tasks/model";
import {
  DEADLINE_RANGES,
  DEADLINE_RANGE_LABELS,
  NO_FILTERS,
  countActiveFilters,
  type Filters,
} from "@/lib/tasks/filters";
import { Chip } from "./Chip";
import { TypeChip } from "./TypeChip";
import { SECTION_LABEL } from "./styles";

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  shown: number;
  total: number;
};

/**
 * Filters by status, priority, type and deadline (T2), collapsed by default to save space on phones (T8).
 * The open panel floats over the list (the list doesn't move) with a scrim dimming the page behind it.
 */
export function FilterBar({ filters, onChange, shown, total }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  // Escape closes the panel and puts focus back on the Filters button.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {open && (
        <div
          data-filters-open
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 bg-scrim"
        />
      )}
      <section
        aria-label="Filters"
        className="relative z-20 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            ref={buttonRef}
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
            className="absolute inset-x-0 top-full mt-2 flex max-h-[calc(100dvh-16rem)] flex-col gap-4 overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-4 shadow-lg"
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
                <TypeChip
                  key={type}
                  type={type}
                  selected={filters.types.includes(type)}
                  onClick={() => toggle("types", type)}
                />
              ))}
            </FilterGroup>
            <FilterGroup label="Deadline">
              {DEADLINE_RANGES.map((range) => (
                <Chip
                  key={range}
                  label={DEADLINE_RANGE_LABELS[range]}
                  selected={filters.deadlines.includes(range)}
                  onClick={() => toggle("deadlines", range)}
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
    </>
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
      <legend className={`mb-2 ${SECTION_LABEL}`}>{label}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}
