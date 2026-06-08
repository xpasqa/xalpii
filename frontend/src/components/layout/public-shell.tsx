"use client";


import { Heart, LogIn, ShoppingCart, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "../../lib/routes";
import { PublicSearchBar } from "../domain/public/PublicSearchBar";
import { Dialog } from "../ui";
import { useCurrency } from "../providers/CurrencyProvider";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
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
                  "pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 whitespace-nowrap font-interface text-[13px] font-semibold text-travel-dark transition duration-300 md:flex",
                  showSearch ? "pointer-events-none -translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                ].join(" ")}
              >
                <Link className="border-b-2 border-transparent py-2 transition hover:border-travel-primary hover:text-travel-primary" href={routes.city("bali")}>
                  Destinations
                </Link>
                <Link
                  className="border-b-2 border-transparent py-2 transition hover:border-travel-primary hover:text-travel-primary"
                  href={routes.activity("ubud-cooking-class-market-visit")}
                >
                  Activities
                </Link>
                <Link className="border-b-2 border-transparent py-2 transition hover:border-travel-primary hover:text-travel-primary" href="/">
                  Inspiration
                </Link>
                <Link className="border-b-2 border-transparent py-2 transition hover:border-travel-primary hover:text-travel-primary" href="/">
                  Deals
                </Link>
              </nav>

              <div
                className={[
                  "absolute left-[156px] hidden w-full max-w-[420px] transition duration-300 md:block",
                  showSearch
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-1 opacity-0"
                ].join(" ")}
              >
                <PublicSearchBar compact placeholder="Search experiences" />
              </div>
            </>
          )}

          <nav className="ml-auto flex items-center gap-3 text-travel-dark sm:gap-4">
            <button
              aria-label={`Change currency, currently ${currency}`}
              className="flex min-w-[44px] flex-col items-center justify-center gap-0.5 text-travel-dark transition hover:text-travel-primary"
              onClick={() => setCurrencyDialogOpen(true)}
              type="button"
            >
              <WalletCards className="size-5" />
              <span className="font-interface text-[10px] font-semibold leading-none">{currency}</span>
            </button>
            <Link
              aria-label="Login"
              className="flex min-w-[44px] flex-col items-center justify-center gap-0.5 text-travel-dark transition hover:text-travel-primary"
              href={routes.login}
            >
              <LogIn className="size-5" />
              <span className="font-interface text-[10px] font-semibold leading-none">Login</span>
            </Link>
            <button
              aria-label="Wishlist"
              className="flex min-w-[44px] flex-col items-center justify-center gap-0.5 text-travel-dark transition hover:text-travel-primary"
              type="button"
            >
              <Heart className="size-5" />
              <span className="font-interface text-[10px] font-semibold leading-none">Wishlist</span>
            </button>
            <button
              aria-label="Cart"
              className="relative flex min-w-[44px] flex-col items-center justify-center gap-0.5 text-travel-dark transition hover:text-travel-primary"
              type="button"
            >
              <span className="relative">
                <ShoppingCart className="size-5" />
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-travel-primary" />
              </span>
              <span className="font-interface text-[10px] font-semibold leading-none">Cart</span>
            </button>
          </nav>

          <Dialog
            bodyClassName="p-3 sm:p-3"
            description="Choose the currency used for displaying prices."
            onClose={() => setCurrencyDialogOpen(false)}
            open={currencyDialogOpen}
            panelClassName="max-w-sm"
            title="Display currency"
          >
            <div className="grid gap-2">
              {supportedCurrencies.map((item) => {
                const isSelected = item === currency;

                return (
                  <button
                    className={[
                      "flex items-center justify-between rounded-travel-md px-4 py-3 text-left font-interface text-sm font-semibold transition",
                      isSelected
                        ? "bg-[#FBEAE8] text-travel-primary"
                        : "text-travel-dark hover:bg-travel-bg"
                    ].join(" ")}
                    key={item}
                    onClick={() => {
                      setCurrency(item);
                      setCurrencyDialogOpen(false);
                    }}
                    type="button"
                  >
                    <span>{item}</span>
                    {isSelected ? <span className="text-xs uppercase tracking-[0.08em]">Selected</span> : null}
                  </button>
                );
              })}
            </div>
          </Dialog>
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
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 whitespace-nowrap font-interface text-[13px] font-semibold text-travel-dark md:flex">
      {items.map(([label, href]) => (
        <a className="border-b-2 border-transparent py-2 transition hover:border-travel-primary hover:text-travel-primary" href={href} key={href}>
          {label}
        </a>
      ))}
    </nav>
  );
}
