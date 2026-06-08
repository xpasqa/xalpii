"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("alpii-calendar font-interface", className)}
      classNames={{
        button_next:
          "flex size-9 items-center justify-center rounded-full border border-[#2B2B2B]/12 bg-white text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark",
        button_previous:
          "flex size-9 items-center justify-center rounded-full border border-[#2B2B2B]/12 bg-white text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark",
        caption_label: "font-brand text-lg font-semibold text-travel-dark md:text-base",
        day: "h-11 w-11 p-0 text-sm text-travel-dark md:h-10 md:w-10",
        day_button:
          "flex size-11 items-center justify-center rounded-[12px] font-interface text-[15px] font-medium text-travel-dark transition hover:bg-[#FBEAE8] hover:text-travel-primary md:size-10 md:text-sm",
        disabled: "cursor-not-allowed text-travel-muted opacity-35 hover:bg-transparent hover:text-travel-muted",
        month: "grid gap-4",
        month_caption: "flex h-11 items-center justify-center",
        month_grid: "w-full border-collapse",
        months: "flex flex-col gap-6 md:flex-row",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        outside: "text-travel-muted opacity-45",
        range_end: "bg-travel-primary text-white",
        range_middle: "bg-[#FBEAE8] text-travel-primary",
        range_start: "bg-travel-primary text-white",
        root: "relative",
        selected:
          "bg-travel-primary text-white hover:bg-travel-primary hover:text-white focus:bg-travel-primary focus:text-white",
        today: "font-semibold text-travel-primary",
        week: "mt-2 flex w-full justify-between",
        weekday: "w-11 text-center text-[12px] font-medium text-travel-muted md:w-10 md:text-[11px]",
        weekdays: "mb-2 flex justify-between",
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
