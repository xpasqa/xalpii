"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TravelActivity } from "../../../types/travel";
import { routes } from "../../../lib/routes";
import { ActivityCard } from "../activity/ActivityCard";

type DestinationActivityRowProps = {
  activities: TravelActivity[];
  destinationName: string;
  destinationSlug: string;
  title: string;
};

export function DestinationActivityRow({
  activities,
  destinationName,
  destinationSlug,
  title
}: DestinationActivityRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({
      behavior: "smooth",
      left: direction * Math.min(scrollerRef.current.clientWidth * 0.82, 960)
    });
  };

  if (!activities.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-brand text-[22px] font-bold leading-tight text-travel-dark sm:text-[28px]">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="hidden font-interface text-sm font-semibold text-travel-primary hover:underline sm:inline"
            href={routes.city(destinationSlug)}
          >
            See all {destinationName}
          </Link>
          <button
            aria-label={`Scroll ${destinationName} activities left`}
            className="hidden size-9 items-center justify-center rounded-full border border-travel-border bg-white text-travel-dark transition hover:border-travel-primary hover:text-travel-primary lg:flex"
            onClick={() => scroll(-1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label={`Scroll ${destinationName} activities right`}
            className="hidden size-9 items-center justify-center rounded-full border border-travel-border bg-white text-travel-dark transition hover:border-travel-primary hover:text-travel-primary lg:flex"
            onClick={() => scroll(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="scrollbar-none -mx-1 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 pt-1"
        ref={scrollerRef}
      >
        {activities.map((activity) => (
          <div
            className="w-[82vw] max-w-[296px] shrink-0 snap-start sm:w-[284px] lg:w-[288px]"
            key={activity.id}
          >
            <ActivityCard
              category={activity.category}
              currency={activity.currency}
              duration={activity.duration}
              href={routes.activity(activity.slug)}
              id={activity.id}
              imageUrl={activity.imageUrl}
              location={activity.location}
              price={activity.price}
              rating={activity.rating}
              reviewCount={activity.reviewCount}
              title={activity.title}
              variant="row"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
