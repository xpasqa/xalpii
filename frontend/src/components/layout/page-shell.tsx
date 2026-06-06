import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { PageHeader } from "./page-header";

type PageShellSize = "md" | "lg" | "xl" | "full";

type PageShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  size?: PageShellSize;
  className?: string;
};

const sizes: Record<PageShellSize, string> = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none"
};

export function PageShell({
  children,
  title,
  description,
  actions,
  size = "xl",
  className
}: PageShellProps) {
  return (
    <main
      className={cn("mx-auto w-full min-w-0 px-4 py-8 sm:px-6 lg:px-8", sizes[size], className)}
    >
      {title ? <PageHeader actions={actions} description={description} title={title} /> : null}
      <div className={title ? "mt-8" : undefined}>{children}</div>
    </main>
  );
}
