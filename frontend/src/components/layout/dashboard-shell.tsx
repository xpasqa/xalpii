"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { LogOut, Undo2 } from "lucide-react";
import { cn } from "../../lib/utils";

export type DashboardNavItem = {
  disabled?: boolean;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

type DashboardShellProps = {
  children: ReactNode;
  eyebrow?: string;
  isImpersonating?: boolean;
  navItems?: DashboardNavItem[];
  onLogout?: () => void;
  onReturnToAdmin?: () => void;
  title?: string;
  userInitial?: string;
};

export function DashboardShell({
  children,
  eyebrow = "Dashboard",
  isImpersonating = false,
  navItems = [],
  onLogout,
  onReturnToAdmin,
  title = "Dashboard",
  userInitial = "A"
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-travel-dark">
      <aside className="group fixed inset-y-0 left-0 z-40 hidden w-[72px] border-r border-[#2B2B2B]/15 bg-white shadow-sm transition-[width] duration-200 ease-out hover:w-64 md:block">
        <div className="flex h-16 items-center gap-3 border-b border-[#2B2B2B]/10 px-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-travel-md bg-travel-primary font-brand text-sm font-bold text-white">
            A
          </div>
          <div className="min-w-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <p className="truncate font-brand text-sm font-bold text-travel-dark">Alpii</p>
            <p className="truncate font-interface text-xs text-travel-muted">{eyebrow}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = Boolean(item.href && pathname === item.href);
            const content = (
              <>
                <item.icon className="size-5 shrink-0" />
                <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {item.label}
                </span>
                {item.disabled ? (
                  <span className="ml-auto hidden rounded-full bg-travel-bg px-2 py-0.5 text-[10px] font-medium text-travel-muted group-hover:inline-flex">
                    Later
                  </span>
                ) : null}
              </>
            );
            const className = cn(
              "flex h-11 items-center gap-3 overflow-hidden rounded-travel-md px-3 font-interface text-sm font-medium transition",
              isActive
                ? "bg-[#FBEAE8] text-travel-primary"
                : "text-travel-muted hover:bg-travel-bg hover:text-travel-dark",
              item.disabled && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-travel-muted"
            );

            if (item.href && !item.disabled) {
              return (
                <Link aria-label={item.label} className={className} href={item.href} key={item.label}>
                  {content}
                </Link>
              );
            }

            return (
              <span aria-label={item.label} className={className} key={item.label}>
                {content}
              </span>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-[#2B2B2B]/10 p-3">
          <div className="grid gap-2">
          {isImpersonating && onReturnToAdmin ? (
            <button
              className="flex h-10 items-center gap-3 overflow-hidden rounded-travel-md bg-[#FBEAE8] px-3 font-interface text-sm font-semibold text-travel-primary transition hover:bg-[#f6d6d1]"
              onClick={onReturnToAdmin}
              type="button"
            >
              <Undo2 className="size-5 shrink-0" />
              <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                Return to admin
              </span>
            </button>
          ) : null}
          <div className="flex h-11 items-center gap-3 overflow-hidden rounded-travel-md bg-travel-bg px-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-travel-dark font-interface text-xs font-semibold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <p className="truncate font-interface text-xs font-semibold text-travel-dark">
                {eyebrow} access
              </p>
              <p className="truncate font-interface text-[11px] text-travel-muted">Signed in</p>
            </div>
          </div>
          {onLogout ? (
            <button
              className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-travel-md px-3 font-interface text-sm font-semibold text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark"
              onClick={onLogout}
              type="button"
            >
              <LogOut className="size-5 shrink-0" />
              <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                Logout
              </span>
            </button>
          ) : null}
          </div>
        </div>
      </aside>

      <div className="md:pl-[72px]">
        <header className="sticky top-0 z-30 border-b border-[#2B2B2B]/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="font-brand text-base font-semibold text-travel-dark">{title}</p>
              <p className="font-interface text-xs text-travel-muted">{eyebrow} workspace</p>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              {navItems
                .filter((item) => item.href && !item.disabled)
                .slice(0, 4)
                .map((item) => (
                  <Link
                    className={cn(
                      "flex size-10 items-center justify-center rounded-travel-md border border-[#2B2B2B]/10 text-travel-muted",
                      pathname === item.href && "bg-[#FBEAE8] text-travel-primary"
                    )}
                    href={item.href ?? "#"}
                    key={item.label}
                  >
                    <item.icon className="size-5" />
                  </Link>
                ))}
            </div>
            <div className="hidden size-9 items-center justify-center rounded-travel-md bg-travel-primary font-interface text-sm font-semibold text-white md:flex">
              {userInitial}
            </div>
          </div>
        </header>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
