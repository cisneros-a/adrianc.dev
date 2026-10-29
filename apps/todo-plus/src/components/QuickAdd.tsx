"use client";

import { useState, type FormEvent } from "react";
import { addTask } from "@/lib/tasks/store";

/** Add a task by title; priority, type and deadline are set in the detail panel. */
export function QuickAdd() {
  const [title, setTitle] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="new-task" className="sr-only">
        New task
      </label>
      <input
        id="new-task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a task…"
        autoComplete="off"
        enterKeyHint="done"
        className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-accent-foreground transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
      >
        Add
      </button>
    </form>
  );
}
