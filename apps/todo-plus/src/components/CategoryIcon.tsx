import { Tag } from "lucide-react";
import type { Category } from "@/lib/categories/model";
import { CATEGORY_ICON_COMPONENTS } from "@/lib/categories/icons";
import { CATEGORY_COLOR_CLASSES } from "@/lib/categories/palette";

// The task's category as an icon in a small tinted circle (T29, T30). Icons come
// from Lucide (TD53, TD56); size and colors are TD54. Decorative: the card
// carries the category name as hidden text for screen readers (TD55).
// An unknown category (undefined) shows a neutral tag icon in the slate colors.
export function CategoryIcon({
  category,
  className = "",
}: {
  category: Category | undefined;
  className?: string;
}) {
  const circle = CATEGORY_COLOR_CLASSES[category?.color ?? "slate"].circle;
  const Icon = category ? CATEGORY_ICON_COMPONENTS[category.icon] : Tag;
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 shrink-0 items-center justify-center rounded-full ${circle} ${className}`}
    >
      <Icon className="size-3" aria-hidden="true" />
    </span>
  );
}
