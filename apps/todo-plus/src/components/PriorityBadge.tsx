import { PRIORITY_LABELS, type Priority } from "@/lib/tasks/model";

// Full class names so Tailwind can find them when building the CSS.
const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-priority-low-bg text-priority-low-fg",
  medium: "bg-priority-medium-bg text-priority-medium-fg",
  high: "bg-priority-high-bg text-priority-high-fg",
  urgent: "bg-priority-urgent-bg text-priority-urgent-fg",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
