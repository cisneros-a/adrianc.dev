"use client";

import { useEffect, useRef, useState } from "react";
import type { Status, Task } from "@/lib/tasks/model";
import { todayKey } from "@/lib/tasks/dates";
import {
  NO_FILTERS,
  filterTasks,
  sortCompletedTasks,
  sortOpenTasks,
  type Filters,
} from "@/lib/tasks/filters";
import { updateTask, useTasks } from "@/lib/tasks/store";
import { CompletedSection } from "./CompletedSection";
import { FilterBar } from "./FilterBar";
import { QuickAdd } from "./QuickAdd";
import { SECTION_LABEL } from "./styles";
import { TaskItem } from "./TaskItem";
import { TaskPanel } from "./TaskPanel";
import { UndoToast } from "./UndoToast";

/** How long a task checked off stays in place, struck through, before moving to Completed (T11). */
const HOLD_MS = 2000;

/** The whole app below the header: add, filter, list, and the detail panel. */
export function TodoApp() {
  const tasks = useTasks();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  // Read once per visit; deadlines are compared against this.
  const [today] = useState(todayKey);

  const [completedOpen, setCompletedOpen] = useState(false);
  // Tasks checked off within the last HOLD_MS, mapped to the status they had before (T11).
  const [held, setHeld] = useState<Map<string, Status>>(new Map());
  const holdTimers = useRef<Map<string, number>>(new Map());
  const [undo, setUndo] = useState<{
    id: string;
    title: string;
    previous: Status;
  } | null>(null);

  useEffect(() => {
    const timers = holdTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function release(id: string) {
    const timer = holdTimers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    holdTimers.current.delete(id);
    setHeld((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  function handleToggleDone(task: Task) {
    if (task.status !== "done") {
      updateTask(task.id, { status: "done" });
      setHeld((prev) => new Map(prev).set(task.id, task.status));
      const old = holdTimers.current.get(task.id);
      if (old !== undefined) window.clearTimeout(old);
      holdTimers.current.set(
        task.id,
        window.setTimeout(() => release(task.id), HOLD_MS),
      );
      setUndo({ id: task.id, title: task.title, previous: task.status });
      return;
    }
    const previous = held.get(task.id);
    updateTask(task.id, { status: previous ?? "todo" });
    release(task.id);
    setUndo((current) => (current?.id === task.id ? null : current));
  }

  function handleUndo() {
    if (!undo) return;
    updateTask(undo.id, { status: undo.previous });
    release(undo.id);
    setUndo(null);
  }

  function handleFiltersChange(next: Filters) {
    setFilters(next);
    // Filtering on Done alone opens Completed (TD30).
    if (next.statuses.length === 1 && next.statuses[0] === "done") {
      setCompletedOpen(true);
    }
  }

  const openTask = tasks?.find((task) => task.id === openTaskId) ?? null;

  // A held task counts as open until the hold ends, if it's still done (T11, TD28).
  const asShown = (tasks ?? []).map((task) => {
    const previous = held.get(task.id);
    return previous !== undefined && task.status === "done"
      ? { ...task, status: previous }
      : task;
  });
  const visible = filterTasks(asShown, filters, today);
  const realById = new Map((tasks ?? []).map((task) => [task.id, task]));
  const open = sortOpenTasks(visible.filter((t) => t.status !== "done")).map(
    (t) => realById.get(t.id) ?? t,
  );
  const completed = sortCompletedTasks(
    visible.filter((t) => t.status === "done"),
  );

  return (
    <div className="flex flex-col gap-4 pb-24">
      <QuickAdd />

      {tasks === null ? (
        <p className="py-12 text-center text-muted">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          body="Add your first task above, then tap it to set a priority, type and deadline."
        />
      ) : (
        <>
          <FilterBar
            filters={filters}
            onChange={handleFiltersChange}
            shown={visible.length}
            total={tasks.length}
          />
          {visible.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              body="Try removing a filter."
            />
          ) : (
            <>
              {open.length > 0 && (
                <section
                  aria-labelledby="tasks-heading"
                  className="flex flex-col gap-3"
                >
                  <h2 id="tasks-heading" className={SECTION_LABEL}>
                    Tasks
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {open.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        today={today}
                        onOpen={() => setOpenTaskId(task.id)}
                        onToggleDone={() => handleToggleDone(task)}
                      />
                    ))}
                  </ul>
                </section>
              )}
              {completed.length > 0 && (
                <CompletedSection
                  tasks={completed}
                  today={today}
                  open={completedOpen}
                  onToggleOpen={() => setCompletedOpen((o) => !o)}
                  onOpenTask={setOpenTaskId}
                  onToggleDone={handleToggleDone}
                />
              )}
            </>
          )}
        </>
      )}

      <TaskPanel task={openTask} onClose={() => setOpenTaskId(null)} />
      <UndoToast
        message={undo}
        onUndo={handleUndo}
        onDismiss={() => setUndo(null)}
      />
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
