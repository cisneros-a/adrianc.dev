"use client";

import { findCategory } from "@/lib/categories/model";
import { useCategories } from "@/lib/categories/store";
import {
  DEADLINE_DEFAULT_LABELS,
  DEADLINE_DEFAULTS,
} from "@/lib/settings/model";
import { setDefaults, useDefaults } from "@/lib/settings/store";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/tasks/model";
import { CategoryChip } from "../CategoryChip";
import { Chip } from "../Chip";
import { SECTION_LABEL } from "../styles";

/**
 * What a new task starts with in the add panel. Each tap saves right away; there is no Save button.
 */
export function DefaultsView() {
  const defaults = useDefaults();
  const categories = useCategories() ?? [];
  if (defaults === null) return null;
  const category = findCategory(categories, defaults.category);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
      <Group label="Category">
        <Chip
          label="None"
          selected={category === undefined}
          onClick={() => setDefaults({ category: null })}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            category={c}
            selected={category?.id === c.id}
            onClick={() => setDefaults({ category: c.id })}
          />
        ))}
      </Group>
      <Group label="Priority">
        <Chip
          label="None"
          selected={defaults.priority === null}
          onClick={() => setDefaults({ priority: null })}
        />
        {PRIORITIES.map((p) => (
          <Chip
            key={p}
            label={PRIORITY_LABELS[p]}
            selected={defaults.priority === p}
            onClick={() => setDefaults({ priority: p })}
          />
        ))}
      </Group>
      <Group label="Deadline">
        {DEADLINE_DEFAULTS.map((d) => (
          <Chip
            key={d}
            label={DEADLINE_DEFAULT_LABELS[d]}
            selected={defaults.deadline === d}
            onClick={() => setDefaults({ deadline: d })}
          />
        ))}
      </Group>
    </div>
  );
}

function Group({
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
