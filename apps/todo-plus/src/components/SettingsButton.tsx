"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { SettingsModal } from "./settings/SettingsModal";

/**
 * The gear icon in the header and the Settings modal it opens (T56, TD79). The
 * modal holds Theme, Defaults, Categories and Templates, with sub-views that
 * slide in (see settings/SettingsModal.tsx).
 */
export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Settings className="size-5" aria-hidden="true" />
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
