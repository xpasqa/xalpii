import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

const navItems = ["Overview", "Bookings", "Activities", "Payouts", "Settings"];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-[620px] min-w-0 overflow-hidden rounded-travel-lg border border-travel-border bg-white shadow-sm md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-travel-border bg-[#FFF8F2] p-5 md:border-b-0 md:border-r">
        <div className="font-brand text-xl font-bold text-travel-primary">Alpii</div>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item, index) => (
            <span
              className={
                index === 0
                  ? "rounded-travel-md bg-white px-3 py-2 text-sm font-semibold text-travel-dark shadow-sm"
                  : "rounded-travel-md px-3 py-2 text-sm font-medium text-travel-muted"
              }
              key={item}
            >
              {item}
            </span>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <div className="flex items-center justify-between border-b border-travel-border px-5 py-4">
          <div>
            <p className="font-brand text-sm font-semibold text-travel-dark">Dashboard preview</p>
            <p className="font-interface text-xs text-travel-muted">Static shell, no auth logic</p>
          </div>
          <div className="size-9 rounded-travel-md bg-travel-primary text-center text-sm font-semibold leading-9 text-white">
            A
          </div>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
