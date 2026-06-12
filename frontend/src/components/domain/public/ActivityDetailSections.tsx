"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type AvailabilityResultsState = {
  adults: number;
  children: number;
  packages: AvailablePackage[];
  selectedDate: string;
  selectedOptionId?: string;
};

type AvailabilityResultsContextValue = {
  clearResults: () => void;
  results: AvailabilityResultsState | null;
  selectPackage: (optionId: string) => void;
  setResults: (results: AvailabilityResultsState) => void;
};

type AboutItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const containerOutlineClass = "border-[#2B2B2B]/55";
const detailBodyClassName = "font-interface text-[14px] leading-6 text-travel-dark/85";
const detailListTextClassName = "font-interface text-[14px] leading-6 text-travel-dark";
const AvailabilityResultsContext = createContext<AvailabilityResultsContextValue | null>(null);

export function ActivityAvailabilityProvider({ children }: { children: ReactNode }) {
  const [results, setResultsState] = useState<AvailabilityResultsState | null>(null);

  return (
    <AvailabilityResultsContext.Provider
      value={{
        clearResults: () => setResultsState(null),
        results,
        selectPackage: (optionId: string) =>
          setResultsState((current) => (current ? { ...current, selectedOptionId: optionId } : current)),
        setResults: setResultsState
      }}
    >
      {children}
    </AvailabilityResultsContext.Provider>
  );
}

function useAvailabilityResults() {
  const context = useContext(AvailabilityResultsContext);

  if (!context) {
    return {
      clearResults: () => undefined,
      results: null,
      selectPackage: () => undefined,
      setResults: () => undefined
    };
  }

  return context;
}

export function ActivityIntro({ activity }: DetailSectionProps) {
  const locationEyebrow = activity.destinationBreadcrumb ?? buildActivityEyebrow(activity);

  return (
    <section className="space-y-4">
      <p className="font-interface text-sm font-semibold text-travel-primary">{locationEyebrow}</p>
      <h1 className="max-w-4xl font-brand text-[2rem] font-bold leading-[1.08] text-travel-dark sm:text-4xl">
        {activity.title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-interface text-[13px] text-travel-muted sm:text-sm">
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
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <>
      <section className="grid gap-3 lg:grid-cols-[1.5fr_0.95fr]">
        <div className="overflow-hidden rounded-travel-lg bg-travel-bg">
          <img alt={activity.title} className="aspect-[16/12.8] size-full object-cover" src={primary} />
        </div>
        <div className="hidden grid-cols-2 gap-3 lg:grid">
          {secondary.slice(0, 4).map((imageUrl, index) => {
            const isLast = index === 3 || index === secondary.slice(0, 4).length - 1;

            return (
              <div className="relative overflow-hidden rounded-travel-lg bg-travel-bg" key={`${imageUrl}-${index}`}>
                <img
                  alt={`${activity.title} preview ${index + 2}`}
                  className="aspect-[16/13.2] size-full object-cover"
                  src={imageUrl}
                />
                {isLast ? (
                  <button
                    className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-interface text-sm font-semibold text-travel-dark shadow-[0_10px_24px_rgba(26,26,26,0.16)]"
                    onClick={() => setGalleryOpen(true)}
                    type="button"
                  >
                    <span>View all</span>
                    <ImageIcon className="size-4" />
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
          <button
            className="inline-flex h-28 w-44 shrink-0 items-center justify-center rounded-travel-lg border border-[#2B2B2B]/12 bg-white font-interface text-sm font-semibold text-travel-dark"
            onClick={() => setGalleryOpen(true)}
            type="button"
          >
            View all photos
          </button>
        </div>
      </section>

      <Dialog
        bodyClassName="px-4 pb-4 pt-3 sm:px-6"
        mobileSheet
        onClose={() => setGalleryOpen(false)}
        open={galleryOpen}
        panelClassName="max-w-5xl"
        title="All photos"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((imageUrl, index) => (
            <div className="overflow-hidden rounded-travel-lg bg-travel-bg" key={`${imageUrl}-${index}`}>
              <img
                alt={`${activity.title} gallery ${index + 1}`}
                className="aspect-square size-full object-cover"
                src={imageUrl}
              />
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
}

export function ActivityBookingBox({ activity }: DetailSectionProps) {
  const { currency: displayCurrency } = useCurrency();
  const { results, setResults } = useAvailabilityResults();
  const isDesktopCalendar = useDesktopCalendar();
  const isDesktopBooking = isDesktopCalendar;
  const activeOptions = (activity.options ?? []).filter((option) => option.isActive);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [openPanel, setOpenPanel] = useState<"date" | "travelers" | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSearchingAvailability, setIsSearchingAvailability] = useState(false);
  const childDiscountBadge = firstDiscountBadge(activeOptions, activity);
  const totalTravelers = adults + children;
  const selectedPackage =
    results?.packages.find((item) => item.option.id === results.selectedOptionId) ?? results?.packages[0];
  const sidebarTotalPrice = selectedPackage?.estimate.totalAmountCents ?? activity.price * totalTravelers;
  const sidebarUnitPrice = Math.round(sidebarTotalPrice / Math.max(totalTravelers, 1));
  const searchButtonLabel = results ? "Update search" : "Check availability";

  function selectDate(date: string) {
    setSelectedDate(date);
    setOpenPanel("travelers");
    setInlineError(null);
  }

  function updateAdults(value: number) {
    setAdults(value);
  }

  function updateChildren(value: number) {
    setChildren(value);
  }

  function updateAvailabilityResults(options?: { scroll?: boolean; wait?: boolean }) {
    if (!selectedDate || totalTravelers < 1) return;

    setIsSearchingAvailability(true);

    window.setTimeout(
      () => {
        const packages = getAvailablePackages({ activity, adults, children, selectedDate });
        const selectedOptionId = packages.some((item) => item.option.id === results?.selectedOptionId)
          ? results?.selectedOptionId
          : packages[0]?.option.id;

        setResults({ adults, children, packages, selectedDate, selectedOptionId });
        setIsSearchingAvailability(false);

        if (options?.scroll) {
          window.setTimeout(() => {
            document.getElementById("availability-results")?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }, 80);
        }
      },
      options?.wait ? 1200 : 0
    );
  }

  function checkAvailability() {
    if (!selectedDate) {
      setInlineError(null);
      setOpenPanel("date");
      return;
    }

    if (totalTravelers < 1) {
      setInlineError(null);
      setOpenPanel("travelers");
      return;
    }

    setInlineError(null);
    updateAvailabilityResults({ scroll: true });
  }

  return (
    <div className="space-y-4">
      <Card className={`${containerOutlineClass} shadow-[0_14px_32px_rgba(26,26,26,0.08)]`}>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="font-interface text-travel-dark">
            {totalTravelers > 0 ? (
              <>
                <p className="text-xs font-medium text-travel-muted">Total</p>
                <span className="mt-1 block text-2xl font-semibold tracking-normal">
                  {formatMoney(sidebarTotalPrice, displayCurrency)}
                </span>
                <span className="mt-1 block text-xs font-normal text-travel-muted">
                  {totalTravelers} {totalTravelers === 1 ? "Traveler" : "Travelers"} x {formatMoney(sidebarUnitPrice, displayCurrency)}
                </span>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-travel-muted">From</p>
                <span className="mt-1 inline-block text-2xl font-semibold tracking-normal">
                  {formatMoney(activity.price, displayCurrency)}
                </span>
                <span className="ml-2 text-xs font-normal text-travel-muted">per person</span>
              </>
            )}
          </div>

          <div className={`relative grid rounded-travel-lg border ${containerOutlineClass} md:grid-cols-2`}>
            {isDesktopBooking ? (
              <>
                <Popover
                  onOpenChange={(open) => setOpenPanel(open ? "date" : null)}
                  open={openPanel === "date"}
                >
                  <PopoverTrigger asChild>
                    <button
                      className="flex min-h-[58px] items-center justify-between rounded-l-[11px] px-3 py-2.5 text-left transition hover:bg-travel-bg"
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
                  <PopoverContent align="end" alignOffset={0} className="w-auto max-w-[calc(100vw-2rem)] p-5">
                    <Calendar
                      disabled={(date) => isPastCalendarDate(date) || !isDateSelectableForActivity(activity, date)}
                      mode="single"
                      numberOfMonths={2}
                      onSelect={(date) => {
                        if (date) selectDate(dateToIsoDate(date));
                      }}
                      selected={selectedDate ? isoDateToCalendarDate(selectedDate) : undefined}
                    />
                  </PopoverContent>
                </Popover>
                <button
                  className={`flex min-h-[58px] items-center justify-between rounded-r-[11px] border-t px-3 py-2.5 text-left transition hover:bg-travel-bg ${containerOutlineClass} md:border-l md:border-t-0`}
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
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 rounded-travel-lg border border-[#2B2B2B]/20 bg-white p-3 shadow-[0_16px_36px_rgba(26,26,26,0.14)]">
                    <TravelerPicker
                      adults={adults}
                      childDiscountBadge={childDiscountBadge}
                      children={children}
                      onAdultsChange={updateAdults}
                      onApply={() => {
                        setOpenPanel(null);
                        updateAvailabilityResults({ scroll: true, wait: true });
                      }}
                      onChildrenChange={updateChildren}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <button
                  className="flex min-h-[62px] items-center justify-between rounded-t-[11px] px-3 py-3 text-left transition hover:bg-travel-bg"
                  onClick={() => setOpenPanel("date")}
                  type="button"
                >
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-travel-muted">
                      Date
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-travel-dark">
                      {selectedDate ? formatTravelDate(selectedDate) : "Select date"}
                    </span>
                  </span>
                  <CalendarDays className="size-4 text-travel-muted" />
                </button>
                <button
                  className={`flex min-h-[62px] items-center justify-between rounded-b-[11px] border-t px-3 py-3 text-left transition hover:bg-travel-bg ${containerOutlineClass}`}
                  onClick={() => setOpenPanel("travelers")}
                  type="button"
                >
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-travel-muted">
                      Travelers
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-travel-dark">
                      {travelerSummary(adults, children)}
                    </span>
                  </span>
                  <Users className="size-4 text-travel-muted" />
                </button>
              </>
            )}
          </div>

          {inlineError ? <p className="text-sm font-semibold text-red-700">{inlineError}</p> : null}
          {isSearchingAvailability ? (
            <div className="flex items-center gap-2 rounded-travel-md bg-[#F3FAF7] px-3 py-2 font-interface text-xs font-semibold text-travel-dark">
              <span className="size-2 animate-pulse rounded-full bg-travel-primary" />
              Calculating availability and prices...
            </div>
          ) : null}

          <div className="hidden md:block">
            <ButtonCTA disabled={isSearchingAvailability} fullWidth onClick={checkAvailability} size="lg" type="button">
              {isSearchingAvailability ? "Calculating..." : searchButtonLabel}
            </ButtonCTA>
          </div>

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

      {!isDesktopBooking ? (
        <>
          <div className="h-20" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2B2B2B]/10 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 shadow-[0_-12px_34px_rgba(26,26,26,0.12)] backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-travel-muted">
                  {totalTravelers > 0 ? "Total" : "From"}
                </p>
                <p className="truncate font-interface text-base font-semibold text-travel-dark">
                  {formatMoney(totalTravelers > 0 ? sidebarTotalPrice : activity.price, displayCurrency)}
                </p>
                {totalTravelers > 0 ? (
                  <p className="truncate font-interface text-[11px] leading-4 text-travel-muted">
                    {totalTravelers} {totalTravelers === 1 ? "Traveler" : "Travelers"} x {formatMoney(sidebarUnitPrice, displayCurrency)}
                  </p>
                ) : null}
              </div>
              <ButtonCTA className="h-12 flex-1 rounded-[12px]" disabled={isSearchingAvailability} fullWidth onClick={checkAvailability} size="lg" type="button">
                {isSearchingAvailability ? "Calculating..." : searchButtonLabel}
              </ButtonCTA>
            </div>
          </div>
        </>
      ) : null}

      <Dialog
        bodyClassName="px-4 pb-5 pt-3 sm:px-6"
        description="Choose a travel date before selecting your package."
        mobileSheet
        onClose={() => setOpenPanel(null)}
        open={!isDesktopBooking && openPanel === "date"}
        title="Select date"
      >
        <Calendar
          className="mx-auto"
          disabled={(date) => isPastCalendarDate(date) || !isDateSelectableForActivity(activity, date)}
          mode="single"
          numberOfMonths={1}
          onSelect={(date) => {
            if (date) selectDate(dateToIsoDate(date));
          }}
          selected={selectedDate ? isoDateToCalendarDate(selectedDate) : undefined}
        />
      </Dialog>

      <Dialog
        bodyClassName="px-4 pb-5 pt-3 sm:px-6"
        description="Choose the number of travelers for this booking."
        mobileSheet
        onClose={() => setOpenPanel(null)}
        open={!isDesktopBooking && openPanel === "travelers"}
        title="Select travelers"
      >
        <TravelerPicker
          adults={adults}
          childDiscountBadge={childDiscountBadge}
          children={children}
          onAdultsChange={updateAdults}
          onApply={() => {
            setOpenPanel(null);
            updateAvailabilityResults({ scroll: true, wait: true });
          }}
          onChildrenChange={updateChildren}
        />
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

function TravelerPicker({
  adults,
  childDiscountBadge,
  children,
  onAdultsChange,
  onApply,
  onChildrenChange
}: {
  adults: number;
  childDiscountBadge?: string;
  children: number;
  onAdultsChange: (value: number) => void;
  onApply: () => void;
  onChildrenChange: (value: number) => void;
}) {
  return (
    <>
      <div className="space-y-3">
        <TravelerStepper
          description="Age 14-105"
          label="Adult"
          max={Math.max(1, 14 - children)}
          min={1}
          onChange={onAdultsChange}
          value={adults}
        />
        <div className="border-t border-[#2B2B2B]/10" />
        <TravelerStepper
          badge={childDiscountBadge}
          description="Age 4-13"
          label="Child"
          max={Math.max(0, 14 - adults)}
          min={0}
          onChange={onChildrenChange}
          value={children}
        />
      </div>
      <ButtonCTA className="mt-4 h-11 rounded-[12px]" fullWidth onClick={onApply} size="lg" type="button">
        Apply
      </ButtonCTA>
    </>
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
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold leading-5 text-travel-dark">{label}</p>
          {badge ? <span className="rounded-full bg-[#FBEAE8] px-2 py-0.5 text-[10px] font-semibold leading-4 text-travel-primary">{badge}</span> : null}
        </div>
        <p className="mt-0.5 text-xs leading-4 text-travel-muted">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          aria-label={`Decrease ${label}`}
          className="flex size-8 items-center justify-center rounded-full border border-[#2B2B2B]/20 text-base disabled:opacity-35"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          type="button"
        >
          -
        </button>
        <span className="w-6 text-center text-base font-semibold">{value}</span>
        <button
          aria-label={`Increase ${label}`}
          className="flex size-8 items-center justify-center rounded-full border border-[#2B2B2B]/20 text-base disabled:opacity-35"
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

export function ActivityAvailabilityResults({ activity }: DetailSectionProps) {
  const { currency: displayCurrency } = useCurrency();
  const { results, selectPackage } = useAvailabilityResults();
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState("");

  useEffect(() => {
    const firstPackage = results?.packages[0];
    const selectedPackage = results?.packages.find((item) => item.option.id === results.selectedOptionId) ?? firstPackage;
    setSelectedOptionId(selectedPackage?.option.id ?? "");
    setSelectedAvailabilityId(selectedPackage?.sessions[0]?.id ?? "");
    if (firstPackage && !results?.selectedOptionId) {
      selectPackage(firstPackage.option.id);
    }
  }, [results, selectPackage]);

  if (!results) return null;

  return (
    <section className="scroll-mt-24 space-y-4" id="availability-results">
      <div className={`rounded-travel-lg border ${containerOutlineClass} bg-white p-4 shadow-[0_12px_30px_rgba(26,26,26,0.06)] sm:p-5`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-interface text-xs font-semibold uppercase tracking-[0.08em] text-travel-primary">
              Available packages
            </p>
            <h2 className="mt-1 font-brand text-[1.2rem] font-bold leading-tight text-travel-dark">
              Choose your package
            </h2>
          </div>
          <p className="font-interface text-sm leading-6 text-travel-muted">
            {formatTravelDate(results.selectedDate)} · {travelerSummary(results.adults, results.children)}
          </p>
        </div>

        {results.packages.length ? (
          <div className="mt-5 space-y-3">
            {results.packages.map((item, index) => {
              const isSelected = item.option.id === selectedOptionId;
              const selectedSession =
                item.sessions.find((session) => session.id === selectedAvailabilityId) ??
                item.sessions[0] ??
                null;

              return (
                <InlinePackageOption
                  activity={activity}
                  adults={results.adults}
                  children={results.children}
                  displayCurrency={displayCurrency}
                  isBestSeller={index === 0}
                  isSelected={isSelected}
                  item={item}
                  key={item.option.id}
                  onSelect={() => {
                    setSelectedOptionId(item.option.id);
                    setSelectedAvailabilityId(item.sessions[0]?.id ?? "");
                    selectPackage(item.option.id);
                  }}
                  onSessionChange={setSelectedAvailabilityId}
                  selectedDate={results.selectedDate}
                  selectedSession={selectedSession}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-travel-lg border border-[#2B2B2B]/15 bg-travel-bg p-5">
            <p className="font-interface text-sm font-semibold text-travel-dark">
              No package options are available for this date and traveler count.
            </p>
            <p className="mt-1 font-interface text-sm leading-6 text-travel-muted">
              Update the date or traveler count and check availability again.
            </p>
          </div>
        )}
      </div>

    </section>
  );
}

function InlinePackageOption({
  activity,
  adults,
  children,
  displayCurrency,
  isBestSeller,
  isSelected,
  item,
  onSelect,
  onSessionChange,
  selectedDate,
  selectedSession
}: {
  activity: TravelActivity;
  adults: number;
  children: number;
  displayCurrency: Parameters<typeof formatMoney>[1];
  isBestSeller: boolean;
  isSelected: boolean;
  item: AvailablePackage;
  onSelect: () => void;
  onSessionChange: (availabilityId: string) => void;
  selectedDate: string;
  selectedSession: TravelActivityAvailability | null;
}) {
  const router = useRouter();
  const totalTravelers = adults + children;
  const unitPrice = Math.round(item.estimate.totalAmountCents / Math.max(totalTravelers, 1));
  const meetingTimes = Array.isArray(item.option.meetingTimes) ? item.option.meetingTimes : [];
  const [selectedMeetingTime, setSelectedMeetingTime] = useState(meetingTimes[0] ?? "");
  const [processingAction, setProcessingAction] = useState<"book" | "reserve" | null>(null);
  const checkoutHref = packageCheckoutHref({
    activity,
    adults,
    children,
    item,
    selectedDate,
    selectedMeetingTime,
    selectedSession
  });

  async function continueToCheckout(action: "book" | "reserve") {
    if (processingAction) return;

    setProcessingAction(action);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    router.push(checkoutHref);
  }

  return (
    <article
      className={[
        "relative overflow-hidden rounded-travel-lg border bg-white transition",
        isSelected ? "border-travel-primary shadow-[0_12px_28px_rgba(185,34,22,0.08)]" : "border-[#2B2B2B]/20"
      ].join(" ")}
    >
      <button
        className="grid w-full items-center gap-4 p-4 text-left sm:grid-cols-[minmax(0,1fr)_260px]"
        onClick={onSelect}
        type="button"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={[
              "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
              isSelected ? "border-travel-primary" : "border-[#2B2B2B]/45"
            ].join(" ")}
          >
            {isSelected ? <span className="size-2.5 rounded-full bg-travel-primary" /> : null}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-brand text-[1rem] font-semibold leading-tight text-travel-dark">
                {item.option.title}
              </h3>
              {isBestSeller ? (
                <span className="rounded-full bg-[#FBEAE8] px-3 py-1 font-interface text-[11px] font-semibold text-travel-primary">
                  Best seller
                </span>
              ) : null}
            </div>
            {!isSelected ? (
              <p className="mt-1 line-clamp-1 font-interface text-sm leading-6 text-travel-muted">
                {item.option.description ?? activity.summary}
              </p>
            ) : null}
          </div>
        </div>

        <PackagePriceSummary
          displayCurrency={displayCurrency}
          estimate={item.estimate}
          totalTravelers={totalTravelers}
          unitPrice={unitPrice}
        />
      </button>

      {isSelected ? (
        <div className="grid border-t border-[#2B2B2B]/14 sm:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4 p-4 sm:p-5">
            <div className={detailBodyClassName}>
              <p>{item.option.description ?? activity.summary}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-semibold text-travel-dark">
                <span>Duration: {item.option.durationLabel ?? activity.durationLabel ?? activity.duration}</span>
                {item.option.availabilityMode === "ALWAYS_AVAILABLE" ? (
                  <span>{formatTravelDate(selectedDate)}</span>
                ) : selectedSession ? (
                  <span>{formatSessionDate(selectedSession.startDateTime)}</span>
                ) : null}
                {item.option.dailyCapacity ? <span>Daily capacity {item.option.dailyCapacity}</span> : null}
              </div>
            </div>

            {item.option.availabilityMode === "ALWAYS_AVAILABLE" && meetingTimes.length ? (
              <div className="space-y-2">
                <p className="font-interface text-sm font-semibold leading-5 text-travel-dark">Meeting time</p>
                <div className="flex flex-wrap gap-2">
                  {meetingTimes.map((time) => (
                    <button
                      className={[
                        "rounded-[10px] border px-4 py-2 font-interface text-sm font-semibold transition",
                        selectedMeetingTime === time
                          ? "border-travel-primary bg-travel-primary text-white"
                          : "border-travel-primary bg-white text-travel-primary hover:bg-[#FBEAE8]"
                      ].join(" ")}
                      key={time}
                      onClick={() => setSelectedMeetingTime(time)}
                      type="button"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {item.option.availabilityMode === "SCHEDULED_SESSIONS" && item.sessions.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {item.sessions.map((session) => (
                  <button
                    className={[
                      "rounded-[10px] border px-4 py-2 font-interface text-sm font-semibold transition",
                      selectedSession?.id === session.id
                        ? "border-travel-primary bg-travel-primary text-white"
                        : "border-travel-primary bg-white text-travel-primary hover:bg-[#FBEAE8]"
                    ].join(" ")}
                    key={session.id}
                    onClick={() => onSessionChange(session.id)}
                    type="button"
                  >
                    {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(session.startDateTime))}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 rounded-travel-md bg-[#F3FAF7] p-4 font-interface text-sm leading-6 text-travel-dark">
              <TrustLine compact description={`before ${formatTravelDate(selectedDate)}`} title="Free cancellation" />
              <TrustLine compact description="Book your spot and pay nothing today" title="Reserve now, pay later" />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 border-t border-[#2B2B2B]/14 p-4 sm:border-l sm:border-t-0 sm:p-5">
            <ButtonCTA
              disabled={processingAction !== null}
              fullWidth
              isLoading={processingAction === "reserve"}
              onClick={() => void continueToCheckout("reserve")}
              size="lg"
              variant="outline"
            >
              {processingAction === "reserve" ? "Processing..." : "Reserve Now & Pay Later"}
            </ButtonCTA>
            <ButtonCTA
              disabled={processingAction !== null}
              fullWidth
              isLoading={processingAction === "book"}
              onClick={() => void continueToCheckout("book")}
              size="lg"
            >
              {processingAction === "book" ? "Processing..." : "Book Now"}
            </ButtonCTA>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function PackagePriceSummary({
  displayCurrency,
  estimate,
  large = false,
  totalTravelers,
  unitPrice
}: {
  displayCurrency: Parameters<typeof formatMoney>[1];
  estimate: AvailablePackage["estimate"];
  large?: boolean;
  totalTravelers: number;
  unitPrice: number;
}) {
  return (
    <div className={large ? "text-left sm:text-right" : "text-left sm:text-right"}>
      <p className={`font-interface font-bold text-travel-dark ${large ? "text-xl" : "text-base"}`}>
        {formatMoney(estimate.totalAmountCents, displayCurrency)}
      </p>
      <p className="mt-0.5 font-interface text-xs leading-5 text-travel-dark">
        {totalTravelers} {totalTravelers === 1 ? "Traveler" : "Travelers"} x {formatMoney(unitPrice, displayCurrency)}
      </p>
    </div>
  );
}

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
            <h3 className="font-brand text-[1.02rem] font-semibold leading-tight text-travel-dark">
              {option.title}
            </h3>
            <span className="rounded-full bg-travel-bg px-2.5 py-1 text-[11px] font-medium text-travel-muted">
              {option.availabilityMode === "ALWAYS_AVAILABLE" ? "Available every day" : "Scheduled session"}
            </span>
          </div>
          {option.description ? (
            <p className="mt-2 font-interface text-[14px] leading-6 text-travel-dark/75">
              {option.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-interface text-[12px] font-medium text-travel-muted">
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
          <p className="mb-2 font-interface text-[11px] font-semibold uppercase tracking-[0.08em] text-travel-muted">
            Session time
          </p>
          <div className="grid gap-2">
            {sessions.map((session) => (
              <button
                className={`rounded-travel-md border px-3 py-2 text-left font-interface text-[14px] leading-6 transition ${
                  selectedSessionId === session.id
                    ? "border-travel-primary bg-[#FBEAE8] text-travel-primary"
                    : "border-[#2B2B2B]/10 hover:bg-travel-bg"
                }`}
                key={session.id}
                onClick={() => onSessionChange(session.id)}
                type="button"
              >
                <span className="font-semibold">{formatSessionDate(session.startDateTime)}</span>
                <span className="ml-2 text-[12px] text-travel-muted">{remainingCapacity(session)} spots left</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 rounded-travel-md bg-travel-bg p-3 font-interface text-[14px] leading-6">
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
          <p className="pt-1 text-[12px] text-travel-muted">
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
          meetingTimes: [],
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
      .filter((session) => availabilityDateValue(session.startDateTime) === selectedDate)
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
    <div
      className={`flex items-center justify-between gap-4 ${
        strong ? "font-semibold text-travel-dark" : "text-travel-dark/75"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function packageCheckoutHref({
  activity,
  adults,
  children,
  item,
  selectedDate,
  selectedMeetingTime,
  selectedSession
}: {
  activity: TravelActivity;
  adults: number;
  children: number;
  item: AvailablePackage;
  selectedDate: string;
  selectedMeetingTime?: string;
  selectedSession: TravelActivityAvailability | null;
}) {
  return `${routes.checkout(activity.slug)}?${new URLSearchParams({
    adults: String(adults),
    children: String(children),
    optionId: item.option.id,
    ...(item.option.availabilityMode === "ALWAYS_AVAILABLE"
      ? {
          selectedDate,
          ...(selectedMeetingTime ? { meetingTime: selectedMeetingTime } : {})
        }
      : selectedSession
      ? { availabilityId: selectedSession.id }
      : {})
  }).toString()}`;
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
      (session) => session.isActive && availabilityDateValue(session.startDateTime) === isoDate
    );
  }

  return options.some((option) => {
    if (option.availabilityMode === "ALWAYS_AVAILABLE") {
      return isDateAllowed(isoDate, option.availableDays);
    }

    return option.availability.some(
      (session) => session.isActive && availabilityDateValue(session.startDateTime) === isoDate
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

function availabilityDateValue(value: string) {
  if (value.includes("T")) {
    return value.slice(0, 10);
  }

  return dateToIsoDate(new Date(value));
}

function buildActivityEyebrow(activity: TravelActivity) {
  const locationParts = activity.location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const values = [activity.country, activity.city, ...locationParts].filter(Boolean);

  return values.filter((value, index) => values.indexOf(value) === index).join(" / ");
}

export function AboutActivitySection({ activity }: DetailSectionProps) {
  const items = getAboutItems(activity);

  return (
    <DetailSection id="about-this-activity" title="About this activity">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div className="flex gap-3" key={item.title}>
            <div className="flex size-11 shrink-0 items-center justify-center self-center rounded-travel-md bg-[#FBEAE8] text-travel-primary">
              {item.icon}
            </div>
            <div>
              <h3 className="font-brand text-[15px] font-semibold leading-[1.35] text-travel-dark">
                {item.title}
              </h3>
              <p className={`mt-1 ${detailBodyClassName}`}>
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
              <div className="relative flex justify-center">
                {index < itinerary.length - 1 ? (
                  <span className="absolute left-1/2 top-[12px] h-[calc(100%-12px)] w-px -translate-x-1/2 bg-travel-border" />
                ) : null}
                <span className="relative mt-1 block size-3 rounded-full bg-travel-primary" />
              </div>
              <div className="pb-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-brand text-[15px] font-semibold leading-[1.35] text-travel-dark">
                    {item.title}
                  </h3>
                  {item.durationLabel ? (
                    <span className="font-interface text-xs text-travel-muted">{item.durationLabel}</span>
                  ) : null}
                </div>
                <p className={`mt-1 ${detailBodyClassName}`}>
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-travel-lg bg-travel-bg/55">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(234,234,234,0.65)_1px,transparent_1px),linear-gradient(rgba(234,234,234,0.65)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="absolute left-8 top-8 h-36 w-44 rounded-full border-2 border-dashed border-travel-primary/45" />
          <MapPin className="absolute left-12 top-12 size-6 fill-travel-primary text-travel-primary" />
          <MapPin className="absolute bottom-16 right-14 size-6 fill-travel-primary text-travel-primary" />
          <div className="absolute bottom-4 left-4 font-interface text-xs font-medium text-travel-muted">
            Route preview only
          </div>
        </div>
      </div>
    </DetailSection>
  );
}

export function ActivityContentSections({ activity }: DetailSectionProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const fullDescription = activity.fullDescription ?? [activity.description];
  const includes = activity.includes ?? activity.included;
  const notIncluded = activity.notIncluded ?? activity.excluded;
  const descriptionText = fullDescription.join(" ");
  const includeRows = [
    ...includes.map((item) => ({ item, tone: "positive" as const })),
    ...notIncluded.map((item) => ({ item, tone: "muted" as const }))
  ];

  return (
    <>
      <SplitDetailSection id="highlights" title="Highlights">
        <ul className="space-y-1">
          {getHighlights(activity).map((highlight) => (
            <li className={`flex gap-2.5 ${detailListTextClassName}`} key={highlight}>
              <span className="mt-[9px] block size-1.5 shrink-0 rounded-full bg-travel-dark" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </SplitDetailSection>

      <SplitDetailSection id="description" title="Description">
        <div>
          <p
            className={[
              detailBodyClassName,
              descriptionExpanded ? "" : "line-clamp-5"
            ].join(" ")}
          >
            {descriptionText}
          </p>
          {descriptionText.length > 260 ? (
            <button
              className="mt-1.5 font-interface text-sm font-semibold text-travel-dark underline underline-offset-4"
              onClick={() => setDescriptionExpanded((current) => !current)}
              type="button"
            >
              {descriptionExpanded ? "Show less" : "See more"}
            </button>
          ) : null}
        </div>
      </SplitDetailSection>

      <SplitDetailSection id="includes" title="Includes">
        <ul className="space-y-1.5">
          {includeRows.map(({ item, tone }) => (
            <li className={`flex gap-2.5 ${detailListTextClassName}`} key={`${tone}-${item}`}>
              {tone === "positive" ? (
                <Check className="mt-1 size-[18px] shrink-0 stroke-[2.75] text-[#178A57]" />
              ) : (
                <X className="mt-1 size-[18px] shrink-0 stroke-[2.5] text-travel-primary" />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SplitDetailSection>
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
    <section className={`scroll-mt-24 border-t ${containerOutlineClass} pt-7 pb-3`} id={id}>
      <h2 className="font-brand text-[1.12rem] font-bold leading-tight text-travel-dark sm:text-[1.2rem]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SplitDetailSection({
  id,
  title,
  children,
  className
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`scroll-mt-24 border-t ${containerOutlineClass} pt-7 pb-3 ${className ?? ""}`} id={id}>
      <div className="grid items-start gap-3 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5">
        <h2 className="font-brand text-[1.05rem] font-bold leading-tight text-travel-dark sm:text-[1.1rem]">
          {title}
        </h2>
        <div className="max-w-4xl">{children}</div>
      </div>
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
      <h3 className="font-brand text-[17px] font-semibold leading-[1.35] text-travel-dark">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="flex gap-3 font-interface text-sm leading-7 text-travel-muted md:text-[15px]" key={item}>
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
      <h3 className="font-brand text-[17px] font-semibold leading-[1.35] text-travel-dark">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li className="font-interface text-sm leading-7 text-travel-muted md:text-[15px]" key={item}>
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
      icon: defaultAboutIcons[index] ?? <Info className="size-[18px]" />
    }));
  }

  return [
    {
      title: "Free cancellation",
      description: "Cancel up to 24 hours in advance for a full refund",
      icon: <CheckCircle2 className="size-[18px]" />
    },
    {
      title: "Reserve now & pay later",
      description: "Book your spot and pay nothing today.",
      icon: <CalendarDays className="size-[18px]" />
    },
    {
      title: `Duration ${activity.durationLabel ?? activity.duration}`,
      description: "Check availability to see starting times",
      icon: <Clock className="size-[18px]" />
    },
    {
      title: "Live tour guide",
      description: activity.guideLanguages?.join(", ") ?? "English",
      icon: <Languages className="size-[18px]" />
    },
    {
      title: activity.groupType ?? "Private or small groups available",
      description: "Enjoy a more personal experience.",
      icon: <Users className="size-[18px]" />
    },
    {
      title: "Dietary options available",
      description: "Dietary needs can be shared with the activity.",
      icon: <Utensils className="size-[18px]" />
    }
  ];
}

const defaultAboutIcons = [
  <CheckCircle2 className="size-[18px]" key="cancel" />,
  <CalendarDays className="size-[18px]" key="pay" />,
  <Clock className="size-[18px]" key="duration" />,
  <Languages className="size-[18px]" key="language" />,
  <Users className="size-[18px]" key="group" />,
  <Utensils className="size-[18px]" key="diet" />
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
