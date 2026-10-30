"use client";

import { TASK_TYPE_LABELS, type TaskType } from "@/lib/tasks/model";

// Colored chips for task types (TD20): outline in the type's edge color,
// text in a darker shade of it, and a 25% see-through tint when selected.
// Full class names so Tailwind can find them when building the CSS.
const TYPE_CHIP: Record<
  TaskType,
  { base: string; selected: string; hover: string }
> = {
  work: {
    base: "border-type-work text-type-work-text",
    selected: "bg-type-work/25",
    hover: "hover:bg-type-work/12",
  },
  personal: {
    base: "border-type-personal text-type-personal-text",
    selected: "bg-type-personal/25",
    hover: "hover:bg-type-personal/12",
  },
  school: {
    base: "border-type-school text-type-school-text",
    selected: "bg-type-school/25",
    hover: "hover:bg-type-school/12",
  },
  errands: {
    base: "border-type-errands text-type-errands-text",
    selected: "bg-type-errands/25",
    hover: "hover:bg-type-errands/12",
  },
};

type TypeChipProps = {
  type: TaskType;
  selected: boolean;
  onClick: () => void;
};

export function TypeChip({ type, selected, onClick }: TypeChipProps) {
  const styles = TYPE_CHIP[type];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-9 rounded-full border-[1.5px] px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles.base} ${
        selected ? styles.selected : `bg-transparent ${styles.hover}`
      }`}
    >
      {TASK_TYPE_LABELS[type]}
    </button>
  );
}
