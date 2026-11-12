"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * A Settings sub-view (Defaults, Edit category, ...): a back button top-left
 * and a centered title. It mounts waiting off to the right and slides in
 * after two animation frames, so the browser has painted the starting spot
 * (the slide itself is CSS in globals.css). Focus goes to the back button
 * once it's on screen. `wanted` false slides it back out.
 */
export function SubViewShell({
  wanted,
  title,
  onBack,
  children,
}: {
  wanted: boolean;
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  useEffect(() => {
    if (ready) backRef.current?.focus({ preventScroll: true });
  }, [ready]);

  return (
    <div
      data-pos={wanted && ready ? "current" : "ahead"}
      className="settings-view absolute inset-0 flex flex-col bg-background"
    >
      <header className="relative flex items-center justify-center border-b border-border px-14 py-3">
        <button
          ref={backRef}
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      {children}
    </div>
  );
}
