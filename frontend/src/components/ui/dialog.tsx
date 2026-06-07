"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type DialogProps = {
  children: ReactNode;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Dialog({ children, description, onClose, open, title }: DialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
      <button aria-label="Close dialog" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <section
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-travel-lg border border-[#2B2B2B]/15 bg-white shadow-[0_24px_70px_rgba(26,26,26,0.22)]"
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#2B2B2B]/10 px-5 py-4">
          <div>
            <h2 className="font-brand text-lg font-semibold text-travel-dark">{title}</h2>
            {description ? (
              <p className="mt-1 font-interface text-sm leading-6 text-travel-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-travel-md text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-5">{children}</div>
      </section>
    </div>
  );
}
