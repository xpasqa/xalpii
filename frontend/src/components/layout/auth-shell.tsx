import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="grid min-h-[520px] overflow-hidden rounded-travel-lg border border-travel-border bg-white shadow-sm lg:grid-cols-[1fr_420px]">
      <section className="hidden bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center lg:block" />
      <section className="flex flex-col justify-center p-6 sm:p-10">
        <Link className="mb-10 font-brand text-xl font-bold text-travel-primary" href="/">
          Alpii
        </Link>
        <div className="mb-8">
          <h2 className="font-brand text-2xl font-bold text-travel-dark">{title}</h2>
          <p className="mt-2 font-interface text-sm font-normal leading-6 text-travel-muted">
            {description}
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}
