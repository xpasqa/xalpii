"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";
import "react-day-picker/style.css";

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("alpii-calendar font-interface", className)}
      classNames={{
        button_next:
          "flex size-8 items-center justify-center rounded-travel-md border border-[#2B2B2B]/15 text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark",
        button_previous:
          "flex size-8 items-center justify-center rounded-travel-md border border-[#2B2B2B]/15 text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark",
        caption_label: "font-brand text-sm font-semibold text-travel-dark",
        day: "size-9 rounded-travel-md text-sm text-travel-dark transition hover:bg-[#FBEAE8] hover:text-travel-primary",
        disabled: "cursor-not-allowed text-travel-muted opacity-35 hover:bg-transparent hover:text-travel-muted",
        month: "grid gap-3",
        month_caption: "flex h-8 items-center justify-center",
        month_grid: "w-full border-collapse",
        months: "flex flex-col gap-5 md:flex-row",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        outside: "text-travel-muted opacity-45",
        range_end: "bg-travel-primary text-white",
        range_middle: "bg-[#FBEAE8] text-travel-primary",
        range_start: "bg-travel-primary text-white",
        root: "relative",
        selected:
          "bg-travel-primary text-white hover:bg-travel-primary hover:text-white focus:bg-travel-primary focus:text-white",
        today: "font-semibold text-travel-primary",
        week: "mt-2 flex w-full",
        weekday: "w-9 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-travel-muted",
        weekdays: "flex",
        ...classNames
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )
      }}
      {...props}
    />
  );
}
