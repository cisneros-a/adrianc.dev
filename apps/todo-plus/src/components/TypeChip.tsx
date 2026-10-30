"use client";

import { TASK_TYPE_LABELS, type TaskType } from "@/lib/tasks/model";

// Colored chips for task types (TD20): outline in the type's edge color,
// text in a darker shade of it, and a light see-through tint when selected.
// Full class names so Tailwind can find them when building the CSS.
const TYPE_CHIP: Record<
  TaskType,
  { base: string; selected: string; hover: string }
> = {
  work: {
    base: "border-type-work text-type-work-text",
    selected: "bg-type-work/15",
    hover: "hover:bg-type-work/8",
  },
  personal: {
    base: "border-type-personal text-type-personal-text",
    selected: "bg-type-personal/15",
    hover: "hover:bg-type-personal/8",
  },
  school: {
    base: "border-type-school text-type-school-text",
    selected: "bg-type-school/15",
    hover: "hover:bg-type-school/8",
  },
  errands: {
    base: "border-type-errands text-type-errands-text",
    selected: "bg-type-errands/15",
    hover: "hover:bg-type-errands/8",
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
      className={`min-h-10 rounded-full border-[1.5px] px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles.base} ${
        selected ? styles.selected : `bg-transparent ${styles.hover}`
      }`}
    >
      {TASK_TYPE_LABELS[type]}
    </button>
  );
}
