"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { SECTION_LABEL } from "./styles";

type SubtasksFieldProps = {
  label: string;
  items: { key: string; title: string; done?: boolean }[];
  /** When given, each row shows a checkbox (details modal); otherwise just the title and × (add panel, T48). */
  onToggle?: (key: string) => void;
  onRemove: (key: string) => void;
  onAdd: (title: string) => void;
};

/**
 * The subtask list with its "Add subtask" box, shared by the details modal
 * and the add panel (T42, T48). It saves nothing itself; the parent decides
 * what add, remove and toggle do. Enter in the box adds a subtask and never
 * submits the surrounding form (T50).
 */
export function SubtasksField({
  label,
  items,
  onToggle,
  onRemove,
  onAdd,
}: SubtasksFieldProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function add() {
    if (text.trim() === "") return;
    onAdd(text);
    setText("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className={SECTION_LABEL}>{label}</h3>
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li
              key={item.key}
              className="flex min-h-11 items-center gap-3 border-b border-border"
            >
              {onToggle ? (
                <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-base">
                  <input
                    type="checkbox"
                    aria-label={`Mark “${item.title}” as done`}
                    checked={item.done ?? false}
                    onChange={() => onToggle(item.key)}
                    className="size-4 shrink-0 accent-accent"
                  />
                  <span
                    className={`min-w-0 flex-1 break-words ${item.done ? "text-muted line-through" : ""}`}
                  >
                    {item.title}
                  </span>
                </label>
              ) : (
                <span className="min-w-0 flex-1 text-base break-words">
                  {item.title}
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove “${item.title}”`}
                onClick={() => onRemove(item.key)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              add();
            }
          }}
          placeholder="Add subtask"
          aria-label="New subtask"
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
        />
        <button
          type="button"
          aria-label="Add subtask"
          onClick={add}
          className="flex min-h-11 items-center justify-center rounded-xl border border-border px-4 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
