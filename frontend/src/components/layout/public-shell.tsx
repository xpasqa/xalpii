import type { ReactNode } from "react";
import Link from "next/link";
import { ButtonCTA } from "../ui";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-white font-interface text-travel-dark">
      <header className="border-b border-travel-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="font-brand text-2xl font-bold text-travel-primary" href="/">
            Alpii
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-travel-muted md:flex">
            <span>Cities</span>
            <span>Activities</span>
            <span>Partners</span>
          </nav>
          <ButtonCTA size="sm">Explore</ButtonCTA>
        </div>
      </header>
      {children}
    </div>
  );
}
