"use client";

import {
  THEME_CHOICES,
  THEME_LABELS,
  setThemeChoice,
  useThemeChoice,
} from "@/lib/theme";

/** System / Light / Dark switch (TD12). */
export function ThemeToggle() {
  const choice = useThemeChoice();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex rounded-full border border-border bg-surface p-0.5"
    >
      {THEME_CHOICES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={choice === option}
          onClick={() => setThemeChoice(option)}
          className={`min-h-9 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            choice === option
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {THEME_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
