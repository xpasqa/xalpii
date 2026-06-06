import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-ink shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
