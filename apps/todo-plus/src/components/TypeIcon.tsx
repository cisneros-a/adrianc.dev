import {
  Book,
  Briefcase,
  ShoppingCart,
  User,
  type LucideIcon,
} from "lucide-react";
import type { TaskType } from "@/lib/tasks/model";

// The task's type as an icon in a small tinted circle (T29, T30). Icons come
// from Lucide (TD53, TD56); size and colors are TD54. Decorative: the card
// carries the type name as hidden text for screen readers (TD55).
// Full class names so Tailwind can find them when building the CSS.
const TYPE_ICON: Record<TaskType, { Icon: LucideIcon; circle: string }> = {
  work: { Icon: Briefcase, circle: "bg-type-work/15 text-type-work-text" },
  personal: {
    Icon: User,
    circle: "bg-type-personal/15 text-type-personal-text",
  },
  school: { Icon: Book, circle: "bg-type-school/15 text-type-school-text" },
  errands: {
    Icon: ShoppingCart,
    circle: "bg-type-errands/25 text-type-errands-text",
  },
};

export function TypeIcon({
  type,
  className = "",
}: {
  type: TaskType;
  className?: string;
}) {
  const { Icon, circle } = TYPE_ICON[type];
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 shrink-0 items-center justify-center rounded-full ${circle} ${className}`}
    >
      <Icon className="size-3" aria-hidden="true" />
    </span>
  );
}
