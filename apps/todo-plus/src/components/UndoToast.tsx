"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 5000;

type UndoToastProps = {
  message: { id: string; title: string } | null;
  onUndo: () => void;
  onDismiss: () => void;
};

/** A flag on the left edge, shown for 5 seconds after checking a task off (T12, TD27). */
export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  // Which message the pointer or focus is on; a different message is not paused.
  const [pausedFor, setPausedFor] = useState<typeof message>(null);
  const paused = message !== null && pausedFor === message;
  const lastMessage = useRef(message);
  const remaining = useRef(DURATION_MS);
  const dismiss = useRef(onDismiss);

  useEffect(() => {
    dismiss.current = onDismiss;
  });

  // Runs while not paused; pausing keeps the time that's left.
  // A new message restarts the 5 seconds.
  useEffect(() => {
    if (message === null || paused) return;
    if (lastMessage.current !== message) {
      lastMessage.current = message;
      remaining.current = DURATION_MS;
    }
    const startedAt = Date.now();
    const timer = window.setTimeout(() => dismiss.current(), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - startedAt),
      );
    };
  }, [message, paused]);

  return (
    <div role="status" aria-live="polite">
      {message && (
        <div
          key={message.id}
          onMouseEnter={() => setPausedFor(message)}
          onMouseLeave={() => setPausedFor(null)}
          onFocus={() => setPausedFor(message)}
          onBlur={() => setPausedFor(null)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 z-30 flex min-h-11 max-w-[min(20rem,calc(100vw-4rem))] items-center rounded-r-full bg-accent pr-2 pl-4 text-sm text-accent-foreground shadow-lg motion-safe:animate-flag-in"
        >
          <span className="min-w-0 truncate">“{message.title}” completed</span>
          <button
            type="button"
            onClick={onUndo}
            className="min-h-11 shrink-0 px-3 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-foreground"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
