"use client";

// Holds the task list in memory and saves every change through storage.ts.
// Components read it with useTasks(), built on React's useSyncExternalStore.

import { useSyncExternalStore } from "react";
import { DEFAULT_TASK, type Task, type TaskChanges } from "./model";
import { isTasksStorageKey, loadTasks, saveTasks } from "./storage";

let tasks: Task[] | null = null; // null until first read in the browser
const listeners = new Set<() => void>();

function getTasks(): Task[] {
  if (tasks === null) tasks = loadTasks();
  return tasks;
}

function setTasks(next: Task[]): void {
  tasks = next;
  saveTasks(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Another tab changed the tasks: reload them so this tab stays in sync.
  function onStorage(event: StorageEvent) {
    if (!isTasksStorageKey(event.key)) return;
    tasks = loadTasks();
    listener();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The page is built ahead of time with no tasks, so the server snapshot is "not loaded yet". */
function getServerSnapshot(): Task[] | null {
  return null;
}

/** All tasks, or null while the page is still loading them from the browser. */
export function useTasks(): Task[] | null {
  return useSyncExternalStore(subscribe, getTasks, getServerSnapshot);
}

export function addTask(title: string): Task {
  const now = new Date().toISOString();
  const task: Task = {
    ...DEFAULT_TASK,
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
  };
  setTasks([...getTasks(), task]);
  return task;
}

export function updateTask(id: string, changes: TaskChanges): void {
  const now = new Date().toISOString();
  setTasks(
    getTasks().map((task) => {
      if (task.id !== id) return task;
      // Track when a task became done (TD25); other edits keep the old value.
      const statusChanged =
        changes.status !== undefined && changes.status !== task.status;
      const completedOn = statusChanged
        ? changes.status === "done"
          ? now
          : null
        : task.completedOn;
      return { ...task, ...changes, completedOn, updatedAt: now };
    }),
  );
}

export function deleteTask(id: string): void {
  setTasks(getTasks().filter((task) => task.id !== id));
}
