"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type DialogProps = {
  children: ReactNode;
  description?: string;
  bodyClassName?: string;
  mobileSheet?: boolean;
  onClose: () => void;
  open: boolean;
  panelClassName?: string;
  title: string;
};

export function Dialog({
  children,
  description,
  bodyClassName,
  mobileSheet = false,
  onClose,
  open,
  panelClassName,
  title
}: DialogProps) {
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
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-black/35 px-4 py-6",
        mobileSheet ? "items-end md:items-center md:justify-center" : "items-center justify-center"
      )}
    >
      <button aria-label="Close dialog" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <section
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-hidden border border-[#2B2B2B]/15 bg-white shadow-[0_24px_70px_rgba(26,26,26,0.22)]",
          mobileSheet
            ? "max-w-2xl rounded-[22px] md:rounded-travel-lg"
            : "max-w-2xl rounded-travel-lg",
          panelClassName
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#2B2B2B]/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-brand text-[1.55rem] font-semibold leading-tight text-travel-dark sm:text-[1.65rem]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 font-interface text-[14px] leading-6 text-travel-dark/75">
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-travel-bg text-travel-muted transition hover:bg-[#ECEFF3] hover:text-travel-dark"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className={cn("max-h-[calc(90vh-104px)] overflow-y-auto p-5 sm:p-6", bodyClassName)}>
          {children}
        </div>
      </section>
    </div>
  );
}
