"use client";

import type { FormEvent, ReactNode } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { ButtonCTA } from "../../ui/ButtonCTA";
import { cn } from "../../../lib/utils";

type SearchBarProps = {
  destination: string;
  date: string;
  participants: number | string;
  onDestinationChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onParticipantsChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
};

export function SearchBar({
  destination,
  date,
  participants,
  onDestinationChange,
  onDateChange,
  onParticipantsChange,
  onSubmit,
  className
}: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className={cn(
        "grid gap-2 rounded-[12px] border border-travel-border bg-white p-2 shadow-[0_18px_42px_rgba(26,26,26,0.12)] transition duration-200 focus-within:border-travel-primary/35 md:grid-cols-[1.35fr_0.95fr_0.85fr_auto] md:items-center md:gap-0",
        className
      )}
      onSubmit={handleSubmit}
    >
      <SearchField
        icon={<MapPin className="size-5 text-travel-primary" />}
        label="Destination"
      >
        <input
          className="w-full bg-transparent font-interface text-[15px] font-medium text-travel-dark outline-none placeholder:text-travel-muted/70"
          onChange={(event) => onDestinationChange(event.target.value)}
          placeholder="Where are you going?"
          type="text"
          value={destination}
        />
      </SearchField>

      <SearchField
        className="md:border-l md:border-travel-border"
        icon={<CalendarDays className="size-5 text-travel-secondary" />}
        label="Date"
      >
        <input
          className="w-full bg-transparent font-interface text-[15px] font-medium text-travel-dark outline-none"
          onChange={(event) => onDateChange(event.target.value)}
          type="date"
          value={date}
        />
      </SearchField>

      <SearchField
        className="md:border-l md:border-travel-border"
        icon={<Users className="size-5 text-travel-primary" />}
        label="Participants"
      >
        <input
          className="w-full bg-transparent font-interface text-[15px] font-medium text-travel-dark outline-none placeholder:text-travel-muted/70"
          min={1}
          onChange={(event) => onParticipantsChange(event.target.value)}
          placeholder="2"
          type="number"
          value={participants}
        />
      </SearchField>

      <ButtonCTA
        className="mt-1 h-11 w-full rounded-[9px] px-5 text-sm md:mt-0 md:h-[52px] md:w-auto md:px-6"
        leftIcon={<Search className="size-5" />}
        type="submit"
      >
        Search
      </ButtonCTA>
    </form>
  );
}

function SearchField({
  label,
  icon,
  children,
  className
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={[
        "flex min-w-0 items-center gap-3 rounded-[9px] px-3 py-2.5 transition duration-200 hover:bg-travel-bg focus-within:bg-travel-bg md:px-4 md:py-3",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-travel-md bg-travel-bg">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-brand text-[10px] font-semibold uppercase tracking-[0.1em] text-travel-muted">
          {label}
        </span>
        <span className="mt-1 block">{children}</span>
      </span>
    </label>
  );
}
