"use client";

import { useState } from "react";
import { todayKey } from "@/lib/tasks/dates";
import {
  NO_FILTERS,
  filterTasks,
  sortTasks,
  type Filters,
} from "@/lib/tasks/filters";
import { useTasks } from "@/lib/tasks/store";
import { FilterBar } from "./FilterBar";
import { QuickAdd } from "./QuickAdd";
import { TaskItem } from "./TaskItem";
import { TaskPanel } from "./TaskPanel";

/** The whole app below the header: add, filter, list, and the detail panel. */
export function TodoApp() {
  const tasks = useTasks();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  // Read once per visit; deadlines are compared against this.
  const [today] = useState(todayKey);

  const openTask = tasks?.find((task) => task.id === openTaskId) ?? null;
  const visible = tasks ? sortTasks(filterTasks(tasks, filters)) : [];

  return (
    <div className="flex flex-col gap-4">
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
            onChange={setFilters}
            shown={visible.length}
            total={tasks.length}
          />
          {visible.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              body="Try removing a filter."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  today={today}
                  onOpen={() => setOpenTaskId(task.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <TaskPanel task={openTask} onClose={() => setOpenTaskId(null)} />
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
