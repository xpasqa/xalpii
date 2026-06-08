"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { routes } from "../../lib/routes";
import { useCurrency } from "../providers/CurrencyProvider";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const isActivityDetail = pathname.startsWith("/activities/");
  const { currency, setCurrency, supportedCurrencies } = useCurrency();

  useEffect(() => {
    function updateSearchVisibility() {
      const heroThreshold = window.innerHeight * 0.8 - 68;
      setShowSearch(window.scrollY > heroThreshold);
    }

    updateSearchVisibility();
    window.addEventListener("scroll", updateSearchVisibility, { passive: true });
    window.addEventListener("resize", updateSearchVisibility);

    return () => {
      window.removeEventListener("scroll", updateSearchVisibility);
      window.removeEventListener("resize", updateSearchVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-interface text-travel-dark">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-travel-border bg-white shadow-[0_1px_0_rgba(26,26,26,0.04)]">
        <div className="relative mx-auto flex h-[68px] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Link
            className="shrink-0 font-brand text-2xl font-bold leading-none text-travel-primary"
            href="/"
          >
            Alpii
          </Link>

          {isActivityDetail ? (
            <DetailPageNav />
          ) : (
            <>
              <nav
                className={[
                  "pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 whitespace-nowrap font-interface text-[13px] font-normal text-travel-dark transition duration-300 md:flex",
                  showSearch ? "pointer-events-none -translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                ].join(" ")}
              >
                <Link className="transition hover:text-travel-primary" href={routes.city("bali")}>
                  Places to see
                </Link>
                <Link
                  className="transition hover:text-travel-primary"
                  href={routes.activity("ubud-cooking-class-market-visit")}
                >
                  Things to do
                </Link>
                <Link className="transition hover:text-travel-primary" href="/">
                  Travel inspiration
                </Link>
                <Link className="transition hover:text-travel-primary" href="/">
                  About
                </Link>
                <Link className="transition hover:text-travel-primary" href="/">
                  Promos
                </Link>
              </nav>

              <form
                className={[
                  "absolute left-[180px] hidden h-11 w-full max-w-[500px] items-center gap-3 rounded-full border border-travel-border bg-white px-4 shadow-[0_10px_26px_rgba(26,26,26,0.12)] transition duration-300 md:flex",
                  showSearch
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-1 opacity-0"
                ].join(" ")}
                onSubmit={(event) => event.preventDefault()}
              >
                <Search className="size-5 shrink-0 text-travel-muted" />
                <input
                  aria-label="Find places and things to do"
                  className="min-w-0 flex-1 bg-transparent font-interface text-[15px] font-normal text-travel-dark outline-none placeholder:text-travel-muted"
                  placeholder="Find places and things to do"
                  type="search"
                />
                <button
                  className="h-9 rounded-full bg-travel-primary px-6 font-interface text-sm font-semibold text-white transition hover:bg-[#A51E14] active:bg-[#8F1A12]"
                  type="submit"
                >
                  Search
                </button>
              </form>
            </>
          )}

          <nav className="ml-auto flex items-center gap-3 text-[13px] font-semibold text-travel-dark sm:gap-5">
            <label className="relative">
              <span className="sr-only">Display currency</span>
              <select
                aria-label="Display currency"
                className="h-9 cursor-pointer rounded-travel-md border border-[#2B2B2B]/20 bg-white px-2.5 font-interface text-xs font-semibold text-travel-dark outline-none transition hover:border-travel-primary/40 focus:border-travel-primary focus:ring-2 focus:ring-travel-primary/15"
                onChange={(event) => setCurrency(event.target.value as typeof currency)}
                value={currency}
              >
                {supportedCurrencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <Link className="hidden transition hover:text-travel-primary sm:inline" href={routes.login}>
              Login
            </Link>
            <Link
              className="rounded-full border border-[#2B2B2B]/20 px-4 py-2 transition hover:border-travel-primary/40 hover:text-travel-primary"
              href={routes.partnerRegister}
            >
              Become a partner
            </Link>
          </nav>
        </div>
      </header>
      <div className="pt-[68px]">{children}</div>
    </div>
  );
}

function DetailPageNav() {
  const items = [
    ["About this activity", "#about-this-activity"],
    ["Itinerary", "#itinerary"],
    ["Highlights", "#highlights"],
    ["Description", "#description"],
    ["Includes", "#includes"],
    ["Information", "#information"]
  ];

  return (
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 whitespace-nowrap font-interface text-[13px] font-normal text-travel-dark md:flex">
      {items.map(([label, href]) => (
        <a className="transition hover:text-travel-primary" href={href} key={href}>
          {label}
        </a>
      ))}
    </nav>
  );
}
