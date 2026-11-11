"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CategoryEditView } from "./CategoryEditView";
import { DefaultsView } from "./DefaultsView";
import { SettingsMain } from "./SettingsMain";
import { SubViewShell } from "./SubViewShell";
import { TemplateEditView } from "./TemplateEditView";

type SubView =
  | { kind: "defaults" }
  | { kind: "category"; id: string | null }
  | { kind: "template"; id: string };

const TITLES: Record<SubView["kind"], (v: SubView) => string> = {
  defaults: () => "Defaults",
  category: (v) =>
    v.kind === "category" && v.id === null ? "New category" : "Edit category",
  template: () => "Edit template",
};

/**
 * The Settings modal: a main view plus one sub-view that slides in from the
 * right (Defaults, Edit/New category, Edit template). Escape goes back one
 * view, then closes; tapping outside closes from any view and throws away
 * unsaved edits.
 */
export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const headingId = useId();
  // `sub` is the view that should be showing (null = main); `shown` stays
  // mounted while it slides out.
  const [sub, setSub] = useState<SubView | null>(null);
  const [shown, setShown] = useState<{ view: SubView; nonce: number } | null>(
    null,
  );
  const nonceRef = useRef(0);
  const openerRef = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<HTMLElement | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const categoriesLabelRef = useRef<HTMLHeadingElement>(null);
  const templatesLabelRef = useRef<HTMLHeadingElement>(null);
  const defaultsOpenerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // After going back, focus the row that opened the view (see goBack).
  useEffect(() => {
    if (sub !== null) return;
    const el = pendingFocus.current;
    pendingFocus.current = null;
    if (el && el.isConnected) el.focus({ preventScroll: true });
  }, [sub]);

  function openSub(view: SubView, opener: HTMLElement) {
    window.clearTimeout(leaveTimer.current);
    openerRef.current = opener;
    if (view.kind === "defaults") defaultsOpenerRef.current = opener;
    nonceRef.current += 1;
    setShown({ view, nonce: nonceRef.current });
    setSub(view);
  }

  function goBack(deleted = false) {
    const kind = sub?.kind ?? shown?.view.kind;
    const fallback =
      kind === "category"
        ? categoriesLabelRef.current
        : kind === "template"
          ? templatesLabelRef.current
          : defaultsOpenerRef.current;
    const opener = openerRef.current;
    pendingFocus.current =
      !deleted && opener && opener.isConnected ? opener : fallback;
    setSub(null);
    window.clearTimeout(leaveTimer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(null);
    } else {
      leaveTimer.current = window.setTimeout(() => setShown(null), 320);
    }
  }

  function resetViews() {
    window.clearTimeout(leaveTimer.current);
    setSub(null);
    setShown(null);
  }

  // Fade out (TD65), then close. With reduced motion, close right away.
  function closeAnimated() {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    if (closingRef.current) return;
    closingRef.current = true;
    dialog.dataset.closing = "";
    function finish() {
      if (!closingRef.current) return;
      closingRef.current = false;
      window.clearTimeout(timer);
      dialog?.removeEventListener("animationend", finish);
      delete dialog?.dataset.closing;
      dialog?.close();
    }
    dialog.addEventListener("animationend", finish, { once: true });
    const timer = window.setTimeout(finish, 250);
  }

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        // Escape: back one view, or close on the main view. Handled here, not
        // via the cancel event, because Chrome only lets a page cancel its own
        // Escape handling once without a click in between.
        if (event.key !== "Escape") return;
        event.preventDefault();
        if (sub !== null) goBack();
        else closeAnimated();
      }}
      onCancel={(event) => {
        // React passes a nested dialog's cancel and close events up to this
        // handler too; only react to this dialog's own.
        if (event.target !== event.currentTarget) return;
        // Escape: back one view, or close on the main view.
        event.preventDefault();
        if (sub !== null) goBack();
        else closeAnimated();
      }}
      onClose={(event) => {
        if (event.target !== event.currentTarget) return;
        resetViews();
        onClose();
      }}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) closeAnimated();
      }}
      className="task-modal m-auto h-[min(85dvh,640px)] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl bg-background p-0 text-foreground shadow-xl backdrop:bg-scrim backdrop:backdrop-blur-[4px] open:flex open:flex-col"
    >
      {open && (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            data-pos={sub ? "behind" : "current"}
            className="settings-view absolute inset-0 flex flex-col bg-background"
          >
            <SettingsMain
              headingId={headingId}
              onClose={closeAnimated}
              onOpenDefaults={(el) => openSub({ kind: "defaults" }, el)}
              onOpenCategory={(id, el) => openSub({ kind: "category", id }, el)}
              onOpenTemplate={(id, el) => openSub({ kind: "template", id }, el)}
              categoriesLabelRef={categoriesLabelRef}
              templatesLabelRef={templatesLabelRef}
            />
          </div>
          {shown && (
            <SubViewShell
              key={shown.nonce}
              wanted={sub !== null}
              title={TITLES[shown.view.kind](shown.view)}
              onBack={() => goBack()}
            >
              {shown.view.kind === "defaults" && <DefaultsView />}
              {shown.view.kind === "category" && (
                <CategoryEditView
                  id={shown.view.id}
                  onDone={(deleted) => goBack(deleted)}
                />
              )}
              {shown.view.kind === "template" && (
                <TemplateEditView
                  id={shown.view.id}
                  onDone={(deleted) => goBack(deleted)}
                />
              )}
            </SubViewShell>
          )}
        </div>
      )}
    </dialog>
  );
}
