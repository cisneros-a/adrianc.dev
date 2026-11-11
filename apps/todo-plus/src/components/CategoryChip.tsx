"use client";

import type { Category } from "@/lib/categories/model";
import { CATEGORY_COLOR_CLASSES } from "@/lib/categories/palette";

// Colored chips for categories (TD20): outline in the category's edge color,
// text in a darker shade of it, and a 25% see-through tint when selected.
// The class names come from the palette, written out in full there.

type CategoryChipProps = {
  category: Category;
  selected: boolean;
  onClick: () => void;
};

export function CategoryChip({
  category,
  selected,
  onClick,
}: CategoryChipProps) {
  const styles = CATEGORY_COLOR_CLASSES[category.color];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-9 rounded-full border-[1.5px] px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles.chip} ${
        selected ? styles.chipSelected : `bg-transparent ${styles.chipHover}`
      }`}
    >
      {category.name}
    </button>
  );
}
