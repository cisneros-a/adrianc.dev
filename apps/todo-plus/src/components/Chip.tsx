"use client";

type ChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

/** A pill-shaped toggle button, used for filters and single-choice fields. */
export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        selected
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
      {label}
    </button>
  );
}
