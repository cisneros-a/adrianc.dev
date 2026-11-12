// The category color palette: 10 named colors, defined as theme tokens in
// globals.css (--cat-{key} and --cat-{key}-text, light and dark). Each key maps
// to complete Tailwind class strings, written out in full so Tailwind can find
// them when building the CSS.

export const CATEGORY_COLORS = [
  "blue",
  "magenta",
  "teal",
  "yellow",
  "mint",
  "purple",
  "red",
  "orange",
  "brown",
  "slate",
] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export function isCategoryColor(value: unknown): value is CategoryColor {
  return CATEGORY_COLORS.includes(value as CategoryColor);
}

export type CategoryColorClasses = {
  /** The solid strip on the right of a task card (TD17). */
  edge: string;
  /** Chip outline and text (TD20). */
  chip: string;
  /** Chip tint when selected. */
  chipSelected: string;
  /** Chip tint on hover. */
  chipHover: string;
  /** The icon circle (TD54). */
  circle: string;
  /** A solid fill, for the color picker. */
  swatch: string;
};

export const CATEGORY_COLOR_CLASSES: Record<
  CategoryColor,
  CategoryColorClasses
> = {
  blue: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-blue)]",
    chip: "border-cat-blue text-cat-blue-text",
    chipSelected: "bg-cat-blue/25",
    chipHover: "hover:bg-cat-blue/12",
    circle: "bg-cat-blue/15 text-cat-blue-text",
    swatch: "bg-cat-blue",
  },
  magenta: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-magenta)]",
    chip: "border-cat-magenta text-cat-magenta-text",
    chipSelected: "bg-cat-magenta/25",
    chipHover: "hover:bg-cat-magenta/12",
    circle: "bg-cat-magenta/15 text-cat-magenta-text",
    swatch: "bg-cat-magenta",
  },
  teal: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-teal)]",
    chip: "border-cat-teal text-cat-teal-text",
    chipSelected: "bg-cat-teal/25",
    chipHover: "hover:bg-cat-teal/12",
    circle: "bg-cat-teal/15 text-cat-teal-text",
    swatch: "bg-cat-teal",
  },
  yellow: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-yellow)]",
    chip: "border-cat-yellow text-cat-yellow-text",
    chipSelected: "bg-cat-yellow/25",
    chipHover: "hover:bg-cat-yellow/12",
    circle: "bg-cat-yellow/25 text-cat-yellow-text",
    swatch: "bg-cat-yellow",
  },
  mint: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-mint)]",
    chip: "border-cat-mint text-cat-mint-text",
    chipSelected: "bg-cat-mint/25",
    chipHover: "hover:bg-cat-mint/12",
    circle: "bg-cat-mint/15 text-cat-mint-text",
    swatch: "bg-cat-mint",
  },
  purple: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-purple)]",
    chip: "border-cat-purple text-cat-purple-text",
    chipSelected: "bg-cat-purple/25",
    chipHover: "hover:bg-cat-purple/12",
    circle: "bg-cat-purple/15 text-cat-purple-text",
    swatch: "bg-cat-purple",
  },
  red: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-red)]",
    chip: "border-cat-red text-cat-red-text",
    chipSelected: "bg-cat-red/25",
    chipHover: "hover:bg-cat-red/12",
    circle: "bg-cat-red/15 text-cat-red-text",
    swatch: "bg-cat-red",
  },
  orange: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-orange)]",
    chip: "border-cat-orange text-cat-orange-text",
    chipSelected: "bg-cat-orange/25",
    chipHover: "hover:bg-cat-orange/12",
    circle: "bg-cat-orange/15 text-cat-orange-text",
    swatch: "bg-cat-orange",
  },
  brown: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-brown)]",
    chip: "border-cat-brown text-cat-brown-text",
    chipSelected: "bg-cat-brown/25",
    chipHover: "hover:bg-cat-brown/12",
    circle: "bg-cat-brown/15 text-cat-brown-text",
    swatch: "bg-cat-brown",
  },
  slate: {
    edge: "shadow-[4px_0_0_0_var(--color-cat-slate)]",
    chip: "border-cat-slate text-cat-slate-text",
    chipSelected: "bg-cat-slate/25",
    chipHover: "hover:bg-cat-slate/12",
    circle: "bg-cat-slate/15 text-cat-slate-text",
    swatch: "bg-cat-slate",
  },
};

/** The name shown to people and screen readers, e.g. "Blue". */
export function colorLabel(color: CategoryColor): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}
