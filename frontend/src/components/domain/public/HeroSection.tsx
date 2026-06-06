"use client";

import { Search } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-white">
      <div className="relative min-h-[80vh] overflow-hidden bg-black">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 size-full object-cover"
          loop
          muted
          playsInline
        >
          <source
            src="https://alpii.folkatech.com/visit_norway.webm"
            type="video/webm"
          />
        </video>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/24 to-black/58" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl pb-6 text-center text-white">
            <h1 className="whitespace-normal font-brand text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:whitespace-nowrap lg:text-[54px]">
              Experience More, Plan Less.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-interface text-base leading-7 text-white/88 sm:text-lg">
              Discover handpicked local experiences, book faster, and make memories worth keeping.
            </p>
          </div>

          <form
            className="flex w-full max-w-3xl items-center gap-2 rounded-[14px] bg-white p-2 shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search className="ml-4 size-5 shrink-0 text-travel-muted" />
            <input
              aria-label="Search destinations or experiences"
              className="h-12 min-w-0 flex-1 bg-transparent font-interface text-base font-medium text-travel-dark outline-none placeholder:text-travel-muted/75"
              placeholder="Where are you going?"
              type="search"
            />
            <button
              className="h-12 rounded-[11px] bg-travel-primary px-7 font-interface text-sm font-semibold text-white transition hover:bg-[#A51E14] active:bg-[#8F1A12]"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
