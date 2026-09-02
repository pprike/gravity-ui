"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/ui/focus-trap";

interface SidePanelProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  highlighted?: boolean;
}

export function SidePanel({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  highlighted = false,
}: SidePanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/40"
        onClick={onClose}
        aria-label="Close panel"
      />
      <aside
        ref={panelRef}
        className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-xl ${
          highlighted ? "border-2 border-primary-600 shadow-primary-600/10" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
      >
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 id="side-panel-title" className="text-h3 text-neutral-900">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-caption text-neutral-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-neutral-200 px-6 py-4">{footer}</div>
        )}
      </aside>
    </div>
  );
}

interface SidePanelActionsProps {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  equalWidth?: boolean;
}

export function SidePanelActions({
  onCancel,
  onSave,
  saveLabel = "Save",
  isSaving = false,
  saveDisabled = false,
  equalWidth = false,
}: SidePanelActionsProps) {
  return (
    <div className={`flex w-full gap-3 ${equalWidth ? "" : "justify-end"}`}>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        className={equalWidth ? "flex-1" : undefined}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSave}
        isLoading={isSaving}
        disabled={saveDisabled}
        className={equalWidth ? "flex-1" : undefined}
      >
        {saveLabel}
      </Button>
    </div>
  );
}
