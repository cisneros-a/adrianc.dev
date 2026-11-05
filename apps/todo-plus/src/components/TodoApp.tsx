"use client";

import { useEffect, useRef, useState } from "react";
import type { Status, Task } from "@/lib/tasks/model";
import { msUntilMidnight, todayKey } from "@/lib/tasks/dates";
import {
  NO_FILTERS,
  filterTasks,
  searchTasks,
  type Filters,
} from "@/lib/tasks/filters";
import {
  DEFAULT_SORT,
  groupTasks,
  sortCompletedTasks,
} from "@/lib/tasks/sorting";
import { deleteTask, updateTask, useTasks } from "@/lib/tasks/store";
import { FilterBar } from "./FilterBar";
import { SearchAddBar } from "./SearchAddBar";
import { TaskPanel } from "./TaskPanel";
import { TaskSection } from "./TaskSection";
import { UndoToast } from "./UndoToast";

/** How long a task checked off stays in place, struck through, before moving to Completed (T11). */
const HOLD_MS = 2000;

type UndoState =
  | { action: "completed"; id: string; title: string; previous: Status }
  | { action: "added"; id: string; title: string };

/** The whole app below the header: add, filter, list, and the detail panel. */
export function TodoApp() {
  const tasks = useTasks();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  // Deadlines are compared against this; it's refreshed after midnight and when the tab comes back (TD49).
  const [today, setToday] = useState(todayKey);
  // Due groups the user collapsed; all start open, and nothing is saved (TD48).
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());
  const [completedOpen, setCompletedOpen] = useState(false);
  // Tasks checked off within the last HOLD_MS, mapped to the status they had before (T11).
  const [held, setHeld] = useState<Map<string, Status>>(new Map());
  const holdTimers = useRef<Map<string, number>>(new Map());
  const [undo, setUndo] = useState<UndoState | null>(null);
  // The box at the top: a search (T16) or a new task's title in add mode (T17).
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let timer: number;
    function refresh() {
      setToday(todayKey());
    }
    function schedule() {
      timer = window.setTimeout(() => {
        refresh();
        schedule();
      }, msUntilMidnight() + 1000);
    }
    function handleVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    schedule();
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, []);

  function toggleGroup(id: string) {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

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
      setUndo({
        action: "completed",
        id: task.id,
        title: task.title,
        previous: task.status,
      });
      return;
    }
    const previous = held.get(task.id);
    updateTask(task.id, { status: previous ?? "todo" });
    release(task.id);
    setUndo((current) =>
      current?.action === "completed" && current.id === task.id
        ? null
        : current,
    );
  }

  function handleUndo() {
    if (!undo) return;
    if (undo.action === "completed") {
      updateTask(undo.id, { status: undo.previous });
      release(undo.id);
    } else {
      deleteTask(undo.id);
      if (openTaskId === undo.id) setOpenTaskId(null);
    }
    setUndo(null);
  }

  function handleAdded(task: Task) {
    setUndo({ action: "added", id: task.id, title: task.title });
  }

  // Searching only done tasks opens Completed, like filtering on Done (TD33).
  function handleTextChange(next: string) {
    setText(next);
    if (!adding && next.trim() !== "" && tasks !== null) {
      const matches = searchTasks(filterTasks(tasks, filters, today), next);
      if (matches.length > 0 && matches.every((t) => t.status === "done")) {
        setCompletedOpen(true);
      }
    }
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
  // In add mode the box holds a new title, so the list ignores it (TD39).
  const query = adding ? "" : text;
  const visible = searchTasks(filterTasks(asShown, filters, today), query);
  const realById = new Map((tasks ?? []).map((task) => [task.id, task]));
  const groups = groupTasks(
    visible.filter((t) => t.status !== "done"),
    DEFAULT_SORT,
    today,
  ).map((group) => ({
    ...group,
    tasks: group.tasks.map((t) => realById.get(t.id) ?? t),
  }));
  const completed = sortCompletedTasks(
    visible.filter((t) => t.status === "done"),
  );

  return (
    <div className="flex flex-col gap-4 pb-24">
      <SearchAddBar
        text={text}
        onTextChange={handleTextChange}
        adding={adding}
        onAddingChange={setAdding}
        onAdded={handleAdded}
      />

      {tasks === null ? (
        <p className="py-12 text-center text-muted">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks yet" body="Tap + to add your first task." />
      ) : (
        <>
          <FilterBar
            filters={filters}
            onChange={handleFiltersChange}
            shown={visible.length}
            total={tasks.length}
            searching={query.trim() !== ""}
          />
          {visible.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              body="Try a different search or remove a filter."
            />
          ) : (
            <>
              {groups.map((group) => (
                <TaskSection
                  key={group.id}
                  label={group.label}
                  tasks={group.tasks}
                  today={today}
                  open={!closedGroups.has(group.id)}
                  onToggleOpen={() => toggleGroup(group.id)}
                  onOpenTask={setOpenTaskId}
                  onToggleDone={handleToggleDone}
                  tone={group.id === "overdue" ? "danger" : undefined}
                />
              ))}
              {completed.length > 0 && (
                <TaskSection
                  label="Completed"
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
