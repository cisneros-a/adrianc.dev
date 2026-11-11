"use client";

// Holds the templates in memory and saves every change through storage.ts.
// Components read them with useTemplates(), built on useSyncExternalStore.

import { useSyncExternalStore } from "react";
import type { Priority, TaskType } from "@/lib/tasks/model";
import { templateKey, type Template } from "./model";
import { isTemplatesStorageKey, loadTemplates, saveTemplates } from "./storage";

let templates: Template[] | null = null; // null until first read in the browser
const listeners = new Set<() => void>();

/** A–Z by title (TD84). Sorted once here, so the array stays the same between changes. */
function sorted(list: Template[]): Template[] {
  return [...list].sort((a, b) => a.title.localeCompare(b.title));
}

function getTemplates(): Template[] {
  if (templates === null) templates = sorted(loadTemplates());
  return templates;
}

function setTemplates(next: Template[]): void {
  templates = sorted(next);
  saveTemplates(templates);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Another tab changed the templates: reload them so this tab stays in sync.
  function onStorage(event: StorageEvent) {
    if (!isTemplatesStorageKey(event.key)) return;
    templates = sorted(loadTemplates());
    listener();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The page is built ahead of time with no templates, so the server snapshot is "not loaded yet". */
function getServerSnapshot(): Template[] | null {
  return null;
}

/** All templates A–Z, or null while the page is still loading them from the browser. */
export function useTemplates(): Template[] | null {
  return useSyncExternalStore(subscribe, getTemplates, getServerSnapshot);
}

type TemplateDetails = {
  title: string;
  priority: Priority;
  type: TaskType;
  notes: string;
  subtasks: string[];
};

/**
 * Saves a template named after the title (T51, T52). A template with the same
 * name replaces the old one and keeps its id and creation time (T53, TD83).
 */
export function saveTemplate(details: TemplateDetails): "saved" | "replaced" {
  const now = new Date().toISOString();
  const fields = {
    title: details.title.trim(),
    priority: details.priority,
    type: details.type,
    notes: details.notes,
    subtasks: details.subtasks.map((s) => s.trim()).filter((s) => s !== ""),
  };
  const key = templateKey(fields.title);
  const current = getTemplates();
  const existing = current.find((t) => templateKey(t.title) === key);
  if (existing) {
    setTemplates(
      current.map((t) =>
        t.id === existing.id ? { ...t, ...fields, updatedAt: now } : t,
      ),
    );
    return "replaced";
  }
  setTemplates([
    ...current,
    { ...fields, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
  ]);
  return "saved";
}

/**
 * Changes a template from the Edit template view. Renaming to another
 * template's name (ignoring case and spaces, and ignoring itself) isn't saved.
 */
export function updateTemplate(
  id: string,
  details: TemplateDetails,
): "saved" | "name-taken" {
  const fields = {
    title: details.title.trim(),
    priority: details.priority,
    type: details.type,
    notes: details.notes,
    subtasks: details.subtasks.map((s) => s.trim()).filter((s) => s !== ""),
  };
  const key = templateKey(fields.title);
  const current = getTemplates();
  if (current.some((t) => t.id !== id && templateKey(t.title) === key)) {
    return "name-taken";
  }
  const now = new Date().toISOString();
  setTemplates(
    current.map((t) => (t.id === id ? { ...t, ...fields, updatedAt: now } : t)),
  );
  return "saved";
}

/** Templates can be edited (updateTemplate) and deleted. */
export function deleteTemplate(id: string): void {
  setTemplates(getTemplates().filter((t) => t.id !== id));
}

/** Moves every template from one category to another, when a category is deleted. */
export function reassignType(fromId: string, toId: string): void {
  const current = getTemplates();
  if (!current.some((t) => t.type === fromId)) return;
  setTemplates(
    current.map((t) => (t.type === fromId ? { ...t, type: toId } : t)),
  );
}
