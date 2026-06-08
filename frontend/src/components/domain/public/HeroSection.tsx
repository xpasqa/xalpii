"use client";

import { PublicSearchBar } from "./PublicSearchBar";

export function HeroSection() {
  return (
    <section className="relative z-40 bg-white">
      <div className="relative min-h-[72vh] overflow-visible bg-black">
        <img
          alt="Travelers exploring outdoors"
          className="absolute inset-0 size-full object-cover"
          src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/35" />
        <div className="relative z-50 mx-auto flex min-h-[72vh] max-w-7xl flex-col items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl pb-6 text-center text-white">
            <h1 className="whitespace-normal font-brand text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:whitespace-nowrap lg:text-[54px]">
              Experience More, Plan Less.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-interface text-base leading-7 text-white/88 sm:text-lg">
              Discover handpicked local experiences, book faster, and make memories worth keeping.
            </p>
          </div>

          <PublicSearchBar placeholder="Search destinations, activities, regions..." />
        </div>
      </div>
    </section>
  );
}
