"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Flame,
  ImageIcon,
  Info,
  Languages,
  MapPin,
  Star,
  Users,
  Utensils,
  X
} from "lucide-react";
import type {
  TravelActivity,
  TravelActivityAvailability,
  TravelActivityOption
} from "../../../data/mock-travel";
import { formatMoney } from "../../../lib/money";
import {
  calculatePricingEstimate,
  remainingCapacity,
  travelerSummary
} from "../../../lib/activity-pricing";
import { routes } from "../../../lib/routes";
import {
  ButtonCTA,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../../ui";
import { useCurrency } from "../../providers/CurrencyProvider";

type DetailSectionProps = {
  activity: TravelActivity;
};

type AboutItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const containerOutlineClass = "border-[#2B2B2B]/35";

export function ActivityIntro({ activity }: DetailSectionProps) {
  const providerName = activity.providerName ?? "Curated by Alpii";

  return (
    <section className="space-y-4">
      <p className="font-interface text-sm font-semibold text-travel-primary">{providerName}</p>
      <h1 className="max-w-4xl font-brand text-3xl font-bold leading-tight text-travel-dark sm:text-4xl">
        {activity.title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-interface text-sm text-travel-muted">
        {activity.badgeLabel ?? activity.badge ? (
          <span className="rounded-travel-md bg-[#FBEAE8] px-2.5 py-1 font-semibold text-travel-primary">
            {activity.badgeLabel ?? activity.badge}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <Star className="size-4 fill-travel-rating text-travel-rating" />
          <span className="font-semibold text-travel-dark">{activity.rating.toFixed(1)}</span>
          <span>{activity.reviewCount.toLocaleString()} reviews</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 text-travel-primary" />
          {activity.location}
        </span>
        <span>{activity.category}</span>
      </div>
    </section>
  );
}

export function ActivityDetailGallery({ activity }: DetailSectionProps) {
  const images = ensureGallery(activity);
  const [primary, ...secondary] = images;

  return (
    <section className="grid gap-3 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="overflow-hidden rounded-travel-lg bg-travel-bg">
        <img alt={activity.title} className="aspect-[16/10] size-full object-cover" src={primary} />
      </div>
      <div className="hidden grid-cols-2 gap-3 lg:grid">
        {secondary.slice(0, 4).map((imageUrl, index) => {
          const isLast = index === 3 || index === secondary.slice(0, 4).length - 1;

          return (
            <div className="relative overflow-hidden rounded-travel-lg bg-travel-bg" key={`${imageUrl}-${index}`}>
              <img
                alt={`${activity.title} preview ${index + 2}`}
                className="aspect-[16/10] size-full object-cover"
                src={imageUrl}
              />
              {isLast ? (
                <button
                  className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-interface text-sm font-semibold text-travel-dark shadow-[0_10px_24px_rgba(26,26,26,0.16)]"
                  type="button"
                >
                  <ImageIcon className="size-4" />
                  View all photos
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 overflow-x-auto lg:hidden">
        {secondary.slice(0, 4).map((imageUrl, index) => (
          <img
            alt={`${activity.title} mobile preview ${index + 2}`}
            className="h-28 w-44 shrink-0 rounded-travel-lg object-cover"
            key={`${imageUrl}-${index}`}
            src={imageUrl}
          />
        ))}
      </div>
    </section>
  );
}

export function ActivityBookingBox({ activity }: DetailSectionProps) {
  const { currency: displayCurrency } = useCurrency();
  const isDesktopCalendar = useDesktopCalendar();
  const activeOptions = (activity.options ?? []).filter((option) => option.isActive);
  const initialOption = activeOptions.find((option) => option.isDefault) ?? activeOptions[0] ?? null;
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [openPanel, setOpenPanel] = useState<"date" | "travelers" | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedModalOptionId, setSelectedModalOptionId] = useState("");
  const [selectedModalAvailabilityId, setSelectedModalAvailabilityId] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const availablePackages = useMemo(
    () =>
      selectedDate
        ? getAvailablePackages({
            activity,
            adults,
            children,
            selectedDate
          })
        : [],
    [activity, adults, children, selectedDate]
  );
  const selectedPackage =
    availablePackages.find((item) => item.option.id === selectedModalOptionId) ?? null;
  const selectedPackageAvailability =
    selectedPackage?.sessions.find((session) => session.id === selectedModalAvailabilityId) ??
    selectedPackage?.sessions[0] ??
    null;
  const checkoutHref =
    selectedPackage &&
    `${routes.checkout(activity.slug)}?${new URLSearchParams({
      adults: String(adults),
      children: String(children),
      optionId: selectedPackage.option.id,
      ...(selectedPackage.option.availabilityMode === "ALWAYS_AVAILABLE"
        ? { selectedDate }
        : selectedPackageAvailability
        ? { availabilityId: selectedPackageAvailability.id }
        : {})
    }).toString()}`;
  const childDiscountBadge = firstDiscountBadge(activeOptions, activity);

  function resetPackageSelection() {
    setSelectedModalOptionId("");
    setSelectedModalAvailabilityId("");
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setOpenPanel(null);
    setInlineError(null);
    resetPackageSelection();
  }

  function updateAdults(value: number) {
    setAdults(value);
    resetPackageSelection();
  }

  function updateChildren(value: number) {
    setChildren(value);
    resetPackageSelection();
  }

  function checkAvailability() {
    if (!selectedDate) {
      setInlineError("Please select a date.");
      return;
    }

    setInlineError(null);
    const packages = getAvailablePackages({ activity, adults, children, selectedDate });
    if (packages.length === 1) {
      setSelectedModalOptionId(packages[0].option.id);
      setSelectedModalAvailabilityId(packages[0].sessions[0]?.id ?? "");
    } else {
      resetPackageSelection();
    }
    setAvailabilityModalOpen(true);
  }

  return (
    <div className="space-y-4">
      <Card className={`${containerOutlineClass} shadow-[0_14px_32px_rgba(26,26,26,0.08)]`}>
        <CardContent className="space-y-4 p-5">
          <div className="font-interface text-travel-dark">
            <p className="text-xs font-medium text-travel-muted">From</p>
            <span className="mt-1 inline-block text-2xl font-semibold tracking-normal">
              {formatMoney(activity.price, displayCurrency)}
            </span>
            <span className="ml-2 text-xs font-normal text-travel-muted">per person</span>
          </div>

          <div className={`relative grid rounded-travel-lg border ${containerOutlineClass} md:grid-cols-2`}>
            <Popover
              onOpenChange={(open) => setOpenPanel(open ? "date" : null)}
              open={openPanel === "date"}
            >
              <PopoverTrigger asChild>
                <button
                  className="flex min-h-[58px] items-center justify-between px-3 py-2.5 text-left transition hover:bg-travel-bg"
                  type="button"
                >
                  <span>
                    <span className="block text-[11px] font-medium text-travel-muted">Date</span>
                    <span className="mt-0.5 block text-sm font-medium text-travel-dark">
                      {selectedDate ? formatTravelDate(selectedDate) : "Select date"}
                    </span>
                  </span>
                  <ChevronDown className="size-3.5 text-travel-muted" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)]">
                <Calendar
                  disabled={(date) => isPastCalendarDate(date) || !isDateSelectableForActivity(activity, date)}
                  mode="single"
                  numberOfMonths={isDesktopCalendar ? 2 : 1}
                  onSelect={(date) => {
                    if (date) selectDate(dateToIsoDate(date));
                  }}
                  selected={selectedDate ? isoDateToCalendarDate(selectedDate) : undefined}
                />
                <p className="mt-3 max-w-md text-xs leading-5 text-travel-muted">
                  Dates are filtered by active sessions and package availability. Package choices appear after checking availability.
                </p>
              </PopoverContent>
            </Popover>
            <button
              className={`flex min-h-[58px] items-center justify-between border-t px-3 py-2.5 text-left transition hover:bg-travel-bg ${containerOutlineClass} md:border-l md:border-t-0`}
              onClick={() => setOpenPanel(openPanel === "travelers" ? null : "travelers")}
              type="button"
            >
              <span>
                <span className="block text-[11px] font-medium text-travel-muted">Travelers</span>
                <span className="mt-0.5 block text-sm font-medium text-travel-dark">
                  {travelerSummary(adults, children)}
                </span>
              </span>
              <ChevronDown className="size-3.5 text-travel-muted" />
            </button>

            {openPanel === "travelers" ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 rounded-travel-lg border border-[#2B2B2B]/20 bg-white p-4 shadow-[0_16px_36px_rgba(26,26,26,0.14)]">
                <TravelerStepper
                  description="Age 14-105"
                  label="Adult"
                  max={Math.max(1, 14 - children)}
                  min={1}
                  onChange={updateAdults}
                  value={adults}
                />
                <div className="my-3 border-t border-[#2B2B2B]/10" />
                <TravelerStepper
                  badge={childDiscountBadge}
                  description="Age 4-13"
                  label="Child"
                  max={Math.max(0, 14 - adults)}
                  min={0}
                  onChange={updateChildren}
                  value={children}
                />
                <ButtonCTA className="mt-4" fullWidth onClick={() => setOpenPanel(null)} size="sm" type="button">
                  Apply
                </ButtonCTA>
              </div>
            ) : null}
          </div>

          {inlineError ? <p className="text-sm font-semibold text-red-700">{inlineError}</p> : null}
          <p className="text-xs leading-5 text-travel-muted">
            Select a package after checking availability.
          </p>

          <ButtonCTA fullWidth onClick={checkAvailability} size="lg" type="button">
            Check availability
          </ButtonCTA>

          <div className="space-y-4 rounded-travel-lg bg-[#F3FAF7] p-4">
            <TrustLine
              title="Free cancellation"
              description="up to 24 hours before the experience starts"
              compact
            />
            <TrustLine
              title="Reserve Now and Pay Later"
              description="Secure your spot while staying flexible"
              compact
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        description={
          selectedDate
            ? `Available for ${formatTravelDate(selectedDate)} · ${travelerSummary(adults, children)}`
            : travelerSummary(adults, children)
        }
        onClose={() => setAvailabilityModalOpen(false)}
        open={availabilityModalOpen}
        title="Choose your package"
      >
        <div className="grid gap-4">
          {availablePackages.length ? (
            availablePackages.map((item) => {
              const isSelected = selectedPackage?.option.id === item.option.id;
              const selectedSession =
                item.sessions.find((session) => session.id === selectedModalAvailabilityId) ??
                item.sessions[0] ??
                null;

              return (
                <PackageOptionCard
                  activity={activity}
                  adults={adults}
                  children={children}
                  displayCurrency={displayCurrency}
                  isSelected={isSelected}
                  item={item}
                  key={item.option.id}
                  onSelect={() => {
                    setSelectedModalOptionId(item.option.id);
                    setSelectedModalAvailabilityId(item.sessions[0]?.id ?? "");
                  }}
                  onSessionChange={(availabilityId) => {
                    setSelectedModalOptionId(item.option.id);
                    setSelectedModalAvailabilityId(availabilityId);
                  }}
                  selectedDate={selectedDate}
                  selectedSessionId={selectedSession?.id ?? ""}
                />
              );
            })
          ) : (
            <div className="rounded-travel-lg border border-[#2B2B2B]/15 bg-travel-bg p-5 text-center">
              <p className="font-brand text-lg font-semibold text-travel-dark">
                No package options are available
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-travel-muted">
                Try a different date or traveler count.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-[#2B2B2B]/10 pt-4 sm:flex-row sm:justify-end">
            <ButtonCTA onClick={() => setAvailabilityModalOpen(false)} type="button" variant="ghost">
              Cancel
            </ButtonCTA>
            <ButtonCTA
              disabled={!checkoutHref || (selectedPackage?.option.availabilityMode === "SCHEDULED_SESSIONS" && !selectedPackageAvailability)}
              href={checkoutHref || "#"}
              type="button"
            >
              Continue to checkout
            </ButtonCTA>
          </div>
        </div>
      </Dialog>

      <Card className={`${containerOutlineClass} shadow-none`}>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-travel-lg bg-[#FFF4E8] text-travel-primary">
            <Flame className="size-6" />
          </div>
          <div>
            <p className="font-interface text-base font-semibold text-travel-dark">Book ahead</p>
            <p className="font-interface text-sm leading-6 text-travel-muted">
              On average, this is booked 31 days in advance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TravelerStepper({
  badge,
  description,
  label,
  max,
  min,
  onChange,
  value
}: {
  badge?: string;
  description: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-travel-dark">{label}</p>
          {badge ? <span className="rounded-full bg-[#FBEAE8] px-2 py-0.5 text-[11px] font-semibold text-travel-primary">{badge}</span> : null}
        </div>
        <p className="mt-0.5 text-xs text-travel-muted">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          aria-label={`Decrease ${label}`}
          className="flex size-8 items-center justify-center rounded-full border border-[#2B2B2B]/20 text-lg disabled:opacity-35"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          type="button"
        >
          -
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          aria-label={`Increase ${label}`}
          className="flex size-8 items-center justify-center rounded-full border border-[#2B2B2B]/20 text-lg disabled:opacity-35"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

type AvailablePackage = {
  estimate: NonNullable<ReturnType<typeof calculatePricingEstimate>>;
  option: TravelActivityOption;
  sessions: TravelActivityAvailability[];
};

function PackageOptionCard({
  activity,
  adults,
  children,
  displayCurrency,
  isSelected,
  item,
  onSelect,
  onSessionChange,
  selectedDate,
  selectedSessionId
}: {
  activity: TravelActivity;
  adults: number;
  children: number;
  displayCurrency: Parameters<typeof formatMoney>[1];
  isSelected: boolean;
  item: AvailablePackage;
  onSelect: () => void;
  onSessionChange: (availabilityId: string) => void;
  selectedDate: string;
  selectedSessionId: string;
}) {
  const { estimate, option, sessions } = item;
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];

  return (
    <div
      className={`rounded-travel-lg border p-4 transition ${
        isSelected ? "border-travel-primary bg-[#FBEAE8]/45" : "border-[#2B2B2B]/15 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-brand text-lg font-semibold text-travel-dark">{option.title}</h3>
            <span className="rounded-full bg-travel-bg px-2.5 py-1 text-[11px] font-semibold text-travel-muted">
              {option.availabilityMode === "ALWAYS_AVAILABLE" ? "Available every day" : "Scheduled session"}
            </span>
          </div>
          {option.description ? (
            <p className="mt-2 text-sm leading-6 text-travel-muted">{option.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-travel-muted">
            {option.durationLabel ?? activity.durationLabel ? (
              <span>{option.durationLabel ?? activity.durationLabel}</span>
            ) : null}
            {option.availabilityMode === "ALWAYS_AVAILABLE" ? (
              <>
                <span>{formatTravelDate(selectedDate)}</span>
                {option.dailyCapacity ? <span>Daily capacity {option.dailyCapacity}</span> : null}
              </>
            ) : selectedSession ? (
              <span>{formatSessionDate(selectedSession.startDateTime)}</span>
            ) : null}
          </div>
        </div>
        <ButtonCTA onClick={onSelect} size="sm" type="button" variant={isSelected ? "primary" : "outline"}>
          {isSelected ? "Selected" : "Select"}
        </ButtonCTA>
      </div>

      {option.availabilityMode === "SCHEDULED_SESSIONS" && sessions.length > 1 ? (
        <div className="mt-4 rounded-travel-md border border-[#2B2B2B]/10 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-travel-muted">
            Session time
          </p>
          <div className="grid gap-2">
            {sessions.map((session) => (
              <button
                className={`rounded-travel-md border px-3 py-2 text-left text-sm transition ${
                  selectedSessionId === session.id
                    ? "border-travel-primary bg-[#FBEAE8] text-travel-primary"
                    : "border-[#2B2B2B]/10 hover:bg-travel-bg"
                }`}
                key={session.id}
                onClick={() => onSessionChange(session.id)}
                type="button"
              >
                <span className="font-semibold">{formatSessionDate(session.startDateTime)}</span>
                <span className="ml-2 text-xs text-travel-muted">{remainingCapacity(session)} spots left</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 rounded-travel-md bg-travel-bg p-3 text-sm">
        <PriceLine
          label={`Adult x ${adults}`}
          value={formatMoney(estimate.adultLineTotalCents, displayCurrency)}
        />
        {children > 0 ? (
          <PriceLine
            label={`Child x ${children}`}
            value={formatMoney(estimate.childLineTotalCents, displayCurrency)}
          />
        ) : null}
        <PriceLine
          label="Estimated total"
          strong
          value={formatMoney(estimate.totalAmountCents, displayCurrency)}
        />
        {displayCurrency !== "USD" ? (
          <p className="pt-1 text-xs text-travel-muted">
            Base charge in USD: {formatMoney(estimate.totalAmountCents, "USD")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getAvailablePackages({
  activity,
  adults,
  children,
  selectedDate
}: {
  activity: TravelActivity;
  adults: number;
  children: number;
  selectedDate: string;
}): AvailablePackage[] {
  const options = (activity.options ?? []).filter((option) => option.isActive);
  const sourceOptions = options.length
    ? options
    : [
        {
          availability: activity.availability ?? [],
          availabilityMode: "SCHEDULED_SESSIONS" as const,
          dailyCapacity: null,
          description: activity.summary,
          durationLabel: activity.durationLabel,
          id: activity.id,
          isActive: true,
          isDefault: true,
          meetingPoint: activity.meetingPoint,
          pricingTiers: activity.pricingTiers ?? [],
          slug: activity.slug,
          sortOrder: 0,
          title: "Standard experience"
        }
      ];

  return sourceOptions.flatMap((option) => {
    const estimate = calculatePricingEstimate({
      adults,
      children,
      pricingMode: option.pricingTiers.length ? "GROUP_TIER" : activity.pricingMode,
      pricingTiers: option.pricingTiers.length ? option.pricingTiers : activity.pricingTiers,
      simplePrice: { currency: activity.currency, priceCents: activity.price }
    });
    if (!estimate) return [];

    const totalTravelers = adults + children;
    if (option.availabilityMode === "ALWAYS_AVAILABLE") {
      if (!isDateAllowed(selectedDate, option.availableDays)) return [];
      if (option.dailyCapacity && totalTravelers > option.dailyCapacity) return [];
      return [{ estimate, option, sessions: [] }];
    }

    const sessions = (option.availability ?? activity.availability ?? [])
      .filter((session) => session.isActive)
      .filter((session) => dateToIsoDate(new Date(session.startDateTime)) === selectedDate)
      .filter((session) => remainingCapacity(session) >= totalTravelers);

    if (!sessions.length) return [];
    return [{ estimate, option, sessions }];
  });
}

function firstDiscountBadge(options: TravelActivityOption[], activity: TravelActivity) {
  const tier =
    options.flatMap((option) => option.pricingTiers).find((item) => item.isActive) ??
    activity.pricingTiers?.find((item) => item.isActive);
  return tier && tier.childPriceCents != null ? `-${Number(tier.childDiscountPercent ?? 27)}%` : undefined;
}

function PriceLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "font-semibold text-travel-dark" : "text-travel-muted"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function useDesktopCalendar() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    setIsDesktop(query.matches);

    function onChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches);
    }

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

function nextAvailableDate(availableDays?: string[] | null) {
  const allowed = new Set((availableDays ?? []).map((day) => day.toUpperCase()));
  const weekdayByIndex = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const date = new Date();

  for (let offset = 1; offset <= 14; offset += 1) {
    const candidate = new Date(date);
    candidate.setDate(date.getDate() + offset);
    if (!allowed.size || allowed.has(weekdayByIndex[candidate.getDay()])) {
      return candidate.toISOString().slice(0, 10);
    }
  }

  return todayInputValue();
}

function isPastCalendarDate(date: Date) {
  return dateToIsoDate(date) < todayInputValue();
}

function isDateSelectableForActivity(activity: TravelActivity, date: Date) {
  const isoDate = dateToIsoDate(date);
  const options = (activity.options ?? []).filter((option) => option.isActive);

  if (!options.length) {
    return (activity.availability ?? []).some(
      (session) => session.isActive && dateToIsoDate(new Date(session.startDateTime)) === isoDate
    );
  }

  return options.some((option) => {
    if (option.availabilityMode === "ALWAYS_AVAILABLE") {
      return isDateAllowed(isoDate, option.availableDays);
    }

    return option.availability.some(
      (session) => session.isActive && dateToIsoDate(new Date(session.startDateTime)) === isoDate
    );
  });
}

function isDateAllowed(value: string, availableDays?: string[] | null) {
  if (!availableDays?.length) return true;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const allowed = new Set(availableDays.map((day) => day.toUpperCase()));
  return allowed.has(weekdayByIndex[date.getUTCDay()]);
}

const weekdayByIndex = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function dateToIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isoDateToCalendarDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function formatAvailableDays(availableDays: string[]) {
  return availableDays
    .map((day) => day.charAt(0) + day.slice(1).toLowerCase())
    .join(", ");
}

function formatTravelDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AboutActivitySection({ activity }: DetailSectionProps) {
  const items = getAboutItems(activity);

  return (
    <DetailSection id="about-this-activity" title="About this activity">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div className="flex gap-3" key={item.title}>
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-travel-md bg-[#FBEAE8] text-travel-primary">
              {item.icon}
            </div>
            <div>
              <h3 className="font-brand text-base font-semibold text-travel-dark">{item.title}</h3>
              <p className="mt-1 font-interface text-sm leading-6 text-travel-muted">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}

export function ActivityItinerarySection({ activity }: DetailSectionProps) {
  const itinerary = getItinerary(activity);

  return (
    <DetailSection id="itinerary" title="Itinerary">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-0">
          {itinerary.map((item, index) => (
            <div className="grid grid-cols-[28px_1fr] gap-4" key={`${item.title}-${index}`}>
              <div className="flex flex-col items-center">
                <span className="mt-1 flex size-7 items-center justify-center rounded-full border border-travel-primary bg-white text-travel-primary">
                  {index === 0 ? <MapPin className="size-3.5" /> : <Circle className="size-2 fill-current" />}
                </span>
                {index < itinerary.length - 1 ? (
                  <span className="mt-2 h-full min-h-12 w-px bg-travel-border" />
                ) : null}
              </div>
              <div className="pb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-brand text-base font-semibold text-travel-dark">{item.title}</h3>
                  {item.durationLabel ? (
                    <span className="font-interface text-xs text-travel-muted">{item.durationLabel}</span>
                  ) : null}
                </div>
                <p className="mt-1 font-interface text-sm leading-6 text-travel-muted">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={`relative min-h-72 overflow-hidden rounded-travel-lg border ${containerOutlineClass} bg-travel-bg`}>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(234,234,234,0.65)_1px,transparent_1px),linear-gradient(rgba(234,234,234,0.65)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="absolute left-8 top-8 h-36 w-44 rounded-full border-2 border-dashed border-travel-primary/45" />
          <MapPin className="absolute left-12 top-12 size-6 fill-travel-primary text-travel-primary" />
          <MapPin className="absolute bottom-16 right-14 size-6 fill-travel-primary text-travel-primary" />
          <div className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-2 font-interface text-xs font-semibold text-travel-dark shadow-sm">
            Route preview only
          </div>
        </div>
      </div>
    </DetailSection>
  );
}

export function ActivityContentSections({ activity }: DetailSectionProps) {
  const fullDescription = activity.fullDescription ?? [activity.description];
  const includes = activity.includes ?? activity.included;
  const notIncluded = activity.notIncluded ?? activity.excluded;

  return (
    <>
      <DetailSection id="highlights" title="Highlights">
        <ul className="grid gap-3 md:grid-cols-2">
          {getHighlights(activity).map((highlight) => (
            <li className="flex gap-3 font-interface text-sm leading-6 text-travel-dark" key={highlight}>
              <Check className="mt-0.5 size-4 shrink-0 text-travel-primary" />
              {highlight}
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection id="description" title="Full description">
        <div className="space-y-4 font-interface text-base leading-8 text-travel-muted">
          {fullDescription.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {fullDescription.join(" ").length > 260 ? (
            <button className="font-interface text-sm font-semibold text-travel-primary" type="button">
              See more
            </button>
          ) : null}
        </div>
      </DetailSection>

      <DetailSection id="includes" title="Includes">
        <div className="grid gap-6 md:grid-cols-2">
          <ListBlock icon={<Check className="size-4" />} items={includes} title="Included" tone="positive" />
          <ListBlock icon={<X className="size-4" />} items={notIncluded} title="Not included" tone="muted" />
        </div>
      </DetailSection>

      <DetailSection id="information" title="Important information">
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard title="What to bring" items={activity.whatToBring ?? ["Comfortable shoes", "Water"]} />
          <InfoCard title="Not allowed" items={activity.notAllowed ?? ["Large luggage", "Smoking indoors"]} />
          <InfoCard title="Know before you go" items={activity.importantInfo} />
        </div>
      </DetailSection>

      <div className="grid gap-5 md:grid-cols-2">
        <DetailSection title="Meeting point">
          <p className="font-interface text-sm leading-7 text-travel-muted">{activity.meetingPoint}</p>
        </DetailSection>
        <DetailSection title="Cancellation policy">
          <p className="font-interface text-sm leading-7 text-travel-muted">{activity.cancellationPolicy}</p>
        </DetailSection>
      </div>
    </>
  );
}

function DetailSection({
  id,
  title,
  children
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={`scroll-mt-24 border-t ${containerOutlineClass} pt-8`} id={id}>
      <h2 className="font-brand text-2xl font-bold text-travel-dark">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BookingSplitSelector({
  label,
  value,
  className
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <button
      className={[
        "flex min-h-[58px] w-full items-center justify-between bg-white px-3 py-2.5 text-left font-interface transition hover:bg-travel-bg",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      type="button"
    >
      <span>
        <span>
          <span className="block text-[11px] font-medium text-travel-muted">{label}</span>
          <span className="mt-0.5 block text-sm font-medium text-travel-dark">{value}</span>
        </span>
      </span>
      <ChevronDown className="size-3.5 text-travel-muted" />
    </button>
  );
}

function TrustLine({
  title,
  description,
  compact = false
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex gap-3" : "flex gap-3 py-2"}>
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 fill-travel-primary text-white" />
      <div>
        {compact ? (
          <p className="font-interface text-sm leading-6 text-travel-dark">
            <span className="font-semibold">{title}</span>{" "}
            {description}
          </p>
        ) : (
          <>
            <p className="font-interface text-sm font-semibold text-travel-dark">{title}</p>
            <p className="mt-1 font-interface text-sm leading-6 text-travel-muted">{description}</p>
          </>
        )}
      </div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  icon,
  tone
}: {
  title: string;
  items: string[];
  icon: ReactNode;
  tone: "positive" | "muted";
}) {
  return (
    <div>
      <h3 className="font-brand text-base font-semibold text-travel-dark">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="flex gap-3 font-interface text-sm leading-6 text-travel-muted" key={item}>
            <span className={tone === "positive" ? "mt-1 text-travel-primary" : "mt-1 text-travel-muted"}>
              {icon}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={`rounded-travel-lg border ${containerOutlineClass} p-4`}>
      <h3 className="font-brand text-base font-semibold text-travel-dark">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li className="font-interface text-sm leading-6 text-travel-muted" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getAboutItems(activity: TravelActivity): AboutItem[] {
  if (activity.aboutItems?.length) {
    return activity.aboutItems.map((item, index) => ({
      ...item,
      icon: defaultAboutIcons[index] ?? <Info className="size-4" />
    }));
  }

  return [
    {
      title: "Free cancellation",
      description: activity.cancellationPolicy,
      icon: <CheckCircle2 className="size-4" />
    },
    {
      title: "Reserve now & pay later",
      description:
        activity.paymentFlexibility ??
        "Keep your travel plans flexible — book your spot and pay nothing today.",
      icon: <CalendarDays className="size-4" />
    },
    {
      title: `Duration ${activity.durationLabel ?? activity.duration}`,
      description: "Check availability to see starting times",
      icon: <Clock className="size-4" />
    },
    {
      title: "Live tour guide",
      description: activity.guideLanguages?.join(", ") ?? "English",
      icon: <Languages className="size-4" />
    },
    {
      title: activity.groupType ?? "Private or small groups available",
      description: "Enjoy a more personal experience with a smaller group format.",
      icon: <Users className="size-4" />
    },
    {
      title: "Dietary options available",
      description:
        activity.dietaryOptions ??
        "Vegetarian, pescatarian, dairy-free and other diets supported. Please inform the activity provider of any dietary needs when booking.",
      icon: <Utensils className="size-4" />
    }
  ];
}

const defaultAboutIcons = [
  <CheckCircle2 className="size-4" key="cancel" />,
  <CalendarDays className="size-4" key="pay" />,
  <Clock className="size-4" key="duration" />,
  <Languages className="size-4" key="language" />,
  <Users className="size-4" key="group" />,
  <Utensils className="size-4" key="diet" />
];

function getItinerary(activity: TravelActivity) {
  if (activity.itinerary?.length) {
    return activity.itinerary;
  }

  return [
    {
      title: `${activity.city} meeting point`,
      subtitle: `Meet your host in ${activity.location} and get oriented for the experience.`,
      durationLabel: "15 minutes",
      type: "start" as const
    },
    {
      title: `${activity.category} experience`,
      subtitle: activity.summary,
      durationLabel: activity.duration,
      type: "activity" as const
    },
    {
      title: "Local recommendations",
      subtitle: "Finish with practical tips for where to go next nearby.",
      durationLabel: "15 minutes",
      type: "end" as const
    }
  ];
}

function getHighlights(activity: TravelActivity) {
  return (
    activity.highlights ?? [
      activity.summary,
      `Explore ${activity.location} with local context`,
      "Review clear inclusions, meeting point, and cancellation details",
      "Preview booking flow only, with mock checkout in this sprint"
    ]
  );
}

function ensureGallery(activity: TravelActivity) {
  const images = [activity.gallery[0] ?? activity.imageUrl, ...activity.gallery.slice(1)];

  while (images.length < 5) {
    images.push(activity.imageUrl);
  }

  return images;
}
