"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  CreditCard,
  LockKeyhole,
  MapPin,
  QrCode,
  Search,
  Tag,
  UserRound,
  CalendarDays,
  CheckCircle2
} from "lucide-react";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Dialog,
  EmptyState,
  ErrorState,
  FooterAwareFixedPanel,
  Input,
  LoadingState,
  Select
} from "../../ui";
import { getAccessToken, getMe, register, saveAccessToken } from "../../../lib/auth";
import type { AuthUser } from "../../../lib/auth";
import { ApiFetchError } from "../../../lib/api";
import {
  confirmDummyPayment,
  createBooking,
  getAdminBookings,
  getAdminPayments,
  getBooking,
  getMyBookings,
  getPartnerBookings,
  validateVoucher
} from "../../../lib/bookings";
import type { Booking, BookingPayment, BookingStatus, PaymentWithBooking } from "../../../lib/bookings";
import { formatDate } from "../../../lib/dates";
import { formatBaseUsd, formatMoney } from "../../../lib/money";
import { calculatePricingEstimate, remainingCapacity } from "../../../lib/activity-pricing";
import { getPublicActivity, mapPublicActivity } from "../../../lib/public-marketplace";
import type { PublicActivity } from "../../../lib/public-marketplace";
import { routes } from "../../../lib/routes";
import { getMyReviews, type UserReview } from "../../../lib/reviews";
import { useCurrency } from "../../providers/CurrencyProvider";
import { UserReviewCard } from "../reviews/UserReviewCard";
import { Textarea } from "../../ui/textarea";

type CheckoutManagerProps = {
  activitySlug: string;
  initialAdults?: string;
  initialAvailabilityId?: string;
  initialChildren?: string;
  initialMeetingTime?: string;
  initialOptionId?: string;
  initialSelectedDate?: string;
};

type TravelerDetail = {
  firstName: string;
  lastName: string;
  type: "Adult" | "Child";
};

export function CheckoutManager({
  activitySlug,
  initialAdults,
  initialAvailabilityId,
  initialChildren,
  initialMeetingTime,
  initialOptionId,
  initialSelectedDate
}: CheckoutManagerProps) {
  const router = useRouter();
  const {
    currency: displayCurrency,
    setCurrency: setDisplayCurrency,
    supportedCurrencies
  } = useCurrency();
  const [activity, setActivity] = useState<PublicActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [holdSeconds, setHoldSeconds] = useState(30 * 60);
  const [optionId, setOptionId] = useState(initialOptionId ?? "");
  const [availabilityId, setAvailabilityId] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate ?? todayInputValue());
  const meetingTime = initialMeetingTime ?? "";
  const [adults, setAdults] = useState(() => clampQuantity(initialAdults, 1, 14, 1));
  const [children, setChildren] = useState(() => clampQuantity(initialChildren, 0, 14, 0));
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [travelers, setTravelers] = useState<TravelerDetail[]>([]);
  const [pickupPreference, setPickupPreference] = useState<"pickup" | "later">("later");
  const [pickupAddress, setPickupAddress] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [paymentTiming, setPaymentTiming] = useState<"pay_now" | "pay_later">("pay_now");
  const [paymentMethod, setPaymentMethod] = useState<"card" | null>("card");
  const draftStorageKey = useMemo(
    () =>
      [
        "checkout-draft",
        activitySlug,
        optionId || "no-option",
        availabilityId || selectedDate || "no-date",
        meetingTime || "no-time",
        adults,
        children
      ].join(":"),
    [activitySlug, adults, availabilityId, children, meetingTime, optionId, selectedDate]
  );

  useEffect(() => {
    async function loadActivity() {
      try {
        const nextActivity = await getPublicActivity(activitySlug);
        setActivity(nextActivity);
        const activeOptions = (nextActivity.options ?? []).filter((option) => option.isActive);
        const requestedOption =
          activeOptions.find((option) => option.id === initialOptionId) ??
          activeOptions.find((option) => option.isDefault) ??
          activeOptions[0];
        setOptionId(requestedOption?.id ?? "");
        const optionAvailability = requestedOption?.availability ?? nextActivity.availability ?? [];
        const requestedAvailability = optionAvailability.find((slot) => slot.id === initialAvailabilityId);
        setAvailabilityId(requestedAvailability?.id ?? optionAvailability[0]?.id ?? "");
        if (!initialSelectedDate && requestedOption?.availabilityMode === "ALWAYS_AVAILABLE") {
          setSelectedDate(nextAvailableDate(requestedOption.availableDays));
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load checkout");
      } finally {
        setIsLoading(false);
      }
    }

    void loadActivity();
  }, [activitySlug, initialAvailabilityId, initialOptionId, initialSelectedDate]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    async function prefillUser() {
      try {
        const { user } = await getMe();
        setCurrentUser(user);
        setAuthPrompt(false);
        setContact((current) => ({
          ...current,
          fullName: current.fullName || user.fullName,
          email: current.email || user.email
        }));
      } catch {
        // Checkout remains usable as guest UI if the stored token is stale.
      }
    }

    void prefillUser();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as Partial<{
        activeStep: 1 | 2 | 3;
        email: string;
        fullName: string;
        phone: string;
        pickupAddress: string;
        pickupPreference: "pickup" | "later";
        specialRequirements: string;
        travelers: TravelerDetail[];
      }>;

      setContact((current) => ({
        ...current,
        fullName: current.fullName || draft.fullName || "",
        email: current.email || draft.email || "",
        phone: current.phone || draft.phone || ""
      }));
      setPickupPreference(draft.pickupPreference ?? "later");
      setPickupAddress(draft.pickupAddress ?? "");
      setSpecialRequirements(draft.specialRequirements ?? "");
      if (draft.travelers?.length) {
        setTravelers(draft.travelers);
      }
      setActiveStep(getAccessToken() ? draft.activeStep ?? 1 : 1);
    } catch {
      // Ignore malformed drafts.
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        activeStep,
        email: contact.email,
        fullName: contact.fullName,
        phone: contact.phone,
        pickupAddress,
        pickupPreference,
        specialRequirements,
        travelers
      })
    );
  }, [activeStep, contact.email, contact.fullName, contact.phone, draftStorageKey, pickupAddress, pickupPreference, specialRequirements, travelers]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHoldSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextTravelers: TravelerDetail[] = [];
    for (let index = 0; index < adults; index += 1) {
      nextTravelers.push({
        type: "Adult",
        firstName: travelers[index]?.firstName ?? "",
        lastName: travelers[index]?.lastName ?? ""
      });
    }
    for (let index = 0; index < children; index += 1) {
      const existing = travelers[adults + index];
      nextTravelers.push({
        type: "Child",
        firstName: existing?.firstName ?? "",
        lastName: existing?.lastName ?? ""
      });
    }
    setTravelers(nextTravelers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children]);

  const pricing = activity?.pricing?.find((item) => item.isActive) ?? activity?.pricing?.[0];
  const mappedActivity = activity ? mapPublicActivity(activity) : null;
  const activeOptions = (activity?.options ?? []).filter((option) => option.isActive);
  const selectedOption =
    activeOptions.find((option) => option.id === optionId) ??
    activeOptions.find((option) => option.isDefault) ??
    activeOptions[0];
  const isAlwaysAvailable = selectedOption?.availabilityMode === "ALWAYS_AVAILABLE";
  const optionAvailability = selectedOption?.availability ?? activity?.availability ?? [];
  const selectedAvailability = optionAvailability.find((slot) => slot.id === availabilityId);
  const maxTravelers = isAlwaysAvailable
    ? Math.max(1, Math.min(14, selectedOption?.dailyCapacity ?? 14))
    : remainingCapacity(selectedAvailability);
  const selectedDateAllowed = isAlwaysAvailable
    ? isDateAllowed(selectedDate, selectedOption?.availableDays)
    : true;
  const optionPricingTiers = selectedOption?.pricingTiers ?? [];
  const estimate = activity
    ? calculatePricingEstimate({
        adults,
        children,
        pricingMode: optionPricingTiers.length ? "GROUP_TIER" : activity.pricingMode,
        pricingTiers: optionPricingTiers.length ? optionPricingTiers : activity.pricingTiers,
        simplePrice: pricing ?? null
      })
    : null;
  const checkoutReturnPath = `${routes.checkout(activitySlug)}?${new URLSearchParams({
    adults: String(adults),
    children: String(children),
    ...(selectedOption ? { optionId: selectedOption.id } : {}),
    ...(isAlwaysAvailable
      ? {
          selectedDate,
          ...(meetingTime ? { meetingTime } : {})
        }
      : availabilityId
        ? { availabilityId }
        : {})
  }).toString()}`;
  const isAuthenticated = Boolean(currentUser && getAccessToken());
  const contactValidation = validateContact(contact, isAuthenticated);
  const activityDetailsValid =
    Boolean(selectedOption) &&
    (isAlwaysAvailable ? selectedDateAllowed : Boolean(selectedAvailability)) &&
    travelers.every((traveler) => traveler.firstName.trim() && traveler.lastName.trim()) &&
    (pickupPreference === "later" || pickupAddress.trim().length > 2);
  const bookingDateLabel = isAlwaysAvailable
    ? [formatCheckoutDate(selectedDate), meetingTime ? formatCheckoutMeetingTime(meetingTime) : ""].filter(Boolean).join(" · ")
    : selectedAvailability
      ? formatDate(selectedAvailability.startDateTime, "en-US", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : "Select date";
  const totalTravelers = adults + children;
  const travelerLabel = `${totalTravelers} ${totalTravelers === 1 ? "Traveler" : "Travelers"}`;
  const stepOneSummary = isAuthenticated
    ? `${contact.fullName || currentUser?.fullName || "Contact saved"} · ${contact.email || currentUser?.email || ""}`
    : contactValidation.isValid
      ? `${contact.fullName} · ${contact.email}`
      : "Create your account to continue";

  async function continueFromStepOne() {
    if (!contactValidation.isValid) {
      setError(contactValidation.message);
      return;
    }

    setError(null);

    if (isAuthenticated) {
      setActiveStep(2);
      return;
    }

    setIsAuthSubmitting(true);

    try {
      const auth = await register({
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        password: contact.password
      });

      saveAccessToken(auth.accessToken);
      setCurrentUser(auth.user);
      setAuthPrompt(false);
      setContact((current) => ({
        ...current,
        email: current.email || auth.user.email,
        fullName: current.fullName || auth.user.fullName,
        password: ""
      }));
      setActiveStep(2);
    } catch (caughtError) {
      if (caughtError instanceof ApiFetchError && (caughtError.status === 409 || caughtError.error?.code === "AUTH_EMAIL_TAKEN")) {
        setError("An account already exists with this email. Log in to continue.");
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to create your account");
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function submitBooking(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!activity || !estimate) return;
    if (isAlwaysAvailable && !selectedDateAllowed) {
      setError("Please select a date that matches this package availability.");
      return;
    }
    if (!isAlwaysAvailable && !selectedAvailability) {
      setError("Please select an available scheduled session.");
      return;
    }
    if (!contactValidation.isValid || !activityDetailsValid) {
      setActiveStep(!contactValidation.isValid ? 1 : 2);
      setError(contactValidation.isValid ? "Please complete the required checkout details before booking." : contactValidation.message);
      return;
    }
    if (!getAccessToken() || !currentUser) {
      setAuthPrompt(true);
      setError(null);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const created = await createBooking({
        activityId: activity.id,
        availabilityId: isAlwaysAvailable ? undefined : availabilityId || undefined,
        meetingTime: isAlwaysAvailable ? meetingTime || undefined : undefined,
        optionId: selectedOption?.id,
        selectedDate: isAlwaysAvailable ? selectedDate : undefined,
        participants: [
          { label: "Adult", participantType: "ADULT", quantity: adults },
          ...(children > 0
            ? [{ label: "Child", participantType: "CHILD" as const, quantity: children }]
            : [])
        ]
      });
      const confirmed = await confirmDummyPayment(created.payment!.id);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftStorageKey);
      }
      router.push(routes.bookingDetail(confirmed.id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to complete booking");
    } finally {
      setIsCreating(false);
    }
  }

  async function payDummy() {
    if (!booking?.payment) return;

    setIsCreating(true);
    setError(null);

    try {
      const confirmed = await confirmDummyPayment(booking.payment.id);
      router.push(routes.bookingDetail(confirmed.id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to confirm payment");
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading checkout" />;
  if (error && !activity) return <ErrorState title="Checkout unavailable" description={error} />;
  if (!activity || !mappedActivity) {
    return <EmptyState title="Activity not found" description="This activity is not available for checkout." />;
  }

  return (
    <main className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
      <section className="grid gap-5">
        <div className="flex flex-wrap items-center gap-3 rounded-travel-lg border border-[#1A1A1A]/14 bg-[rgb(243_250_247_/_1)] px-4 py-3 shadow-[0_14px_35px_rgba(28,28,28,0.04)] sm:px-5">
          <div className="flex items-center gap-3">
            <ButtonCTA
              aria-label="Back to activity"
              href={routes.activity(activity.slug)}
              leftIcon={<ArrowLeft className="size-4" />}
              size="sm"
              variant="ghost"
            >
              <span className="sr-only">Back to activity</span>
            </ButtonCTA>
            <p className="font-interface text-sm font-semibold text-travel-dark">
              {isAuthenticated ? `Signed in as ${currentUser?.email ?? contact.email}` : "Log in or sign up for a faster checkout."}
            </p>
          </div>
        </div>

        {booking ? (
          <Card>
            <CardHeader>
              <CardTitle>Dummy payment</CardTitle>
              <CardDescription>
                This is a test payment for Sprint 9. No real card or external provider is used.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SummaryLine label="Booking status" value={formatStatus(booking.status)} />
              <SummaryLine label="Payment status" value={formatStatus(booking.payment?.status ?? "PENDING")} />
              <SummaryLine label="Base charge" value={formatBaseUsd(booking.totalAmountCents)} />
              <ButtonCTA
                fullWidth
                isLoading={isCreating}
                leftIcon={<CreditCard className="size-4" />}
                onClick={payDummy}
                type="button"
              >
                Pay with Dummy Payment
              </ButtonCTA>
            </CardContent>
          </Card>
        ) : (
          <form className="grid gap-5" onSubmit={submitBooking}>
            <CheckoutSection
              isComplete={contactValidation.isValid}
              isOpen={activeStep === 1}
              number={1}
              onEdit={() => setActiveStep(1)}
              summary={stepOneSummary}
              title={isAuthenticated ? "Contact details" : "Account & contact details"}
            >
                {!isAuthenticated ? (
                  <p className="text-sm leading-6 text-travel-muted">
                    Create your account so we can send your confirmation and keep your voucher in your dashboard.
                  </p>
                ) : (
                  <div className="rounded-travel-md border border-[#2B2B2B]/10 bg-[#F8F8F8] px-4 py-3">
                    <p className="text-sm font-semibold text-travel-dark">{contact.fullName || currentUser?.fullName}</p>
                    <p className="mt-1 text-sm leading-6 text-travel-muted">{contact.email || currentUser?.email}</p>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {!isAuthenticated ? (
                    <>
                      <Field label="Full name" required>
                        <Input
                          autoComplete="name"
                          value={contact.fullName}
                          onChange={(event) => setContactValue("fullName", event.target.value)}
                        />
                      </Field>
                      <Field label="Phone number" required>
                        <Input
                          autoComplete="tel"
                          value={contact.phone}
                          onChange={(event) => setContactValue("phone", event.target.value)}
                        />
                      </Field>
                      <Field label="Email" required>
                        <Input
                          autoComplete="email"
                          type="email"
                          value={contact.email}
                          onChange={(event) => setContactValue("email", event.target.value)}
                        />
                      </Field>
                      <Field label="Password" required>
                        <Input
                          autoComplete="new-password"
                          type="password"
                          value={contact.password}
                          onChange={(event) => setContactValue("password", event.target.value)}
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Phone number" required>
                        <Input
                          autoComplete="tel"
                          value={contact.phone}
                          onChange={(event) => setContactValue("phone", event.target.value)}
                        />
                      </Field>
                      <Field label="Email">
                        <Input disabled type="email" value={contact.email} />
                      </Field>
                    </>
                  )}
                </div>
                {error && activeStep === 1 ? <ErrorState title="Checkout error" description={error} /> : null}
                <div className={`flex flex-wrap gap-3 ${isAuthenticated ? "justify-end" : "justify-between"}`}>
                  {!isAuthenticated ? (
                    <ButtonCTA
                      className="border-[#1A1A1A]/16 bg-white text-travel-dark hover:border-primary hover:text-primary"
                      href={`${routes.login}?redirect=${encodeURIComponent(checkoutReturnPath)}`}
                      type="button"
                      variant="outline"
                    >
                      Already have an account? Log in
                    </ButtonCTA>
                  ) : null}
                  <ButtonCTA
                    disabled={!contactValidation.isValid}
                    isLoading={isAuthSubmitting}
                    onClick={continueFromStepOne}
                    type="button"
                  >
                    {isAuthenticated ? "Continue" : "Register and Continue Payment"}
                  </ButtonCTA>
                </div>
            </CheckoutSection>

            <CheckoutSection
              isComplete={activityDetailsValid}
              isOpen={activeStep === 2}
              number={2}
              onEdit={() => contactValidation.isValid && setActiveStep(2)}
              summary={activityDetailsValid ? `${travelerLabel} · ${bookingDateLabel}` : "Traveler details and pickup"}
              title="Activity details"
            >
              <div className="grid gap-4">
                {travelers.map((traveler, index) => (
                    <div
                      key={`${traveler.type}-${index}`}
                      className="grid gap-3 border-t border-[#2B2B2B]/10 pt-4 first:border-t-0 first:pt-0"
                    >
                      <p className="font-interface text-sm font-semibold text-travel-dark">
                        Traveler {index + 1} · {traveler.type}
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="First name" required>
                          <Input
                            value={traveler.firstName}
                            onChange={(event) => updateTraveler(index, "firstName", event.target.value)}
                          />
                        </Field>
                        <Field label="Last name" required>
                          <Input
                            value={traveler.lastName}
                            onChange={(event) => updateTraveler(index, "lastName", event.target.value)}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 border-t border-[#2B2B2B]/10 pt-4">
                  <p className="font-interface text-sm font-semibold text-travel-dark">Pickup point</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className={optionCardClass(pickupPreference === "pickup")}>
                      <input
                        checked={pickupPreference === "pickup"}
                        className="accent-primary"
                        onChange={() => setPickupPreference("pickup")}
                        type="radio"
                      />
                      I'd like to be picked up
                    </label>
                    <label className={optionCardClass(pickupPreference === "later")}>
                      <input
                        checked={pickupPreference === "later"}
                        className="accent-primary"
                        onChange={() => setPickupPreference("later")}
                        type="radio"
                      />
                      I'll decide later
                    </label>
                  </div>
                  {pickupPreference === "pickup" ? (
                    <div className="grid gap-2">
                      <Field label="Search pickup location" required>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                          <Input
                            className="pl-9"
                            placeholder="Search hotel, villa, or address"
                            value={pickupAddress}
                            onChange={(event) => setPickupAddress(event.target.value)}
                          />
                        </div>
                      </Field>
                      <div className="text-xs leading-5 text-travel-muted">
                        Google Maps pickup search placeholder. Places autocomplete will connect here in the backend/API sprint.
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 border-t border-[#2B2B2B]/10 pt-4">
                  <Field label="Special requirements">
                    <div className="grid gap-2">
                      <Textarea
                        className="min-h-24"
                        maxLength={1000}
                        onChange={(event) => setSpecialRequirements(event.target.value)}
                        placeholder="Dietary needs, accessibility notes, or anything the operator should know."
                        value={specialRequirements}
                      />
                      <span className="text-right text-xs text-travel-muted">{specialRequirements.length}/1000</span>
                    </div>
                  </Field>
                </div>
                <div className="flex flex-wrap justify-between gap-3">
                  <ButtonCTA onClick={() => setActiveStep(1)} type="button" variant="outline">
                    Back
                  </ButtonCTA>
                  <ButtonCTA disabled={!activityDetailsValid} onClick={() => setActiveStep(3)} type="button">
                    Continue to payment
                  </ButtonCTA>
                </div>
            </CheckoutSection>

            <CheckoutSection
              isComplete={Boolean(estimate && contactValidation.isValid && activityDetailsValid)}
              isOpen={activeStep === 3}
              number={3}
              onEdit={() => contactValidation.isValid && activityDetailsValid && setActiveStep(3)}
              summary={estimate ? `${formatMoney(estimate.totalAmountCents, displayCurrency)} total` : "Payment method"}
              title="Payment details"
            >
                <div className="grid gap-7">
                  <div className="grid gap-3">
                    <p className="font-brand text-[16px] font-semibold leading-6 text-travel-dark">Choose when to pay</p>
                    <div className="overflow-hidden rounded-travel-lg">
                      <button
                        className={[
                          "flex w-full items-start justify-between gap-4 rounded-t-travel-lg border px-5 py-4 text-left transition",
                          paymentTiming === "pay_now"
                            ? "relative z-10 border-[#B92216] bg-[#B92216]/[0.04] shadow-[inset_0_0_0_1px_#B92216]"
                            : "border-[#1A1A1A]/14 bg-white hover:bg-[#fafafa]"
                        ].join(" ")}
                        onClick={() => setPaymentTiming("pay_now")}
                        type="button"
                      >
                        <div className="flex items-start gap-4">
                          <span className="mt-1 grid size-6 place-items-center rounded-full border border-[#B92216] text-[#B92216]">
                            <span className={["size-2.5 rounded-full", paymentTiming === "pay_now" ? "bg-[#B92216]" : "bg-transparent"].join(" ")} />
                          </span>
                          <div>
                            <p className="font-brand text-[15px] font-semibold leading-6 text-travel-dark">Pay now</p>
                          </div>
                        </div>
                        <p className="font-brand text-[15px] font-semibold leading-6 text-travel-dark">
                          {estimate ? formatMoney(estimate.totalAmountCents, displayCurrency) : "Price unavailable"}
                        </p>
                      </button>
                      <button
                        className={[
                          "mt-[-1px] flex w-full items-start justify-between gap-4 rounded-b-travel-lg border px-5 py-4 text-left transition",
                          paymentTiming === "pay_later"
                            ? "relative z-10 bg-[#B92216]/[0.04] shadow-[inset_0_0_0_1px_#B92216]"
                            : "border-[#1A1A1A]/14 bg-white hover:bg-[#fafafa]"
                        ].join(" ")}
                        onClick={() => setPaymentTiming("pay_later")}
                        type="button"
                      >
                        <div className="flex items-start gap-4">
                          <span className="mt-1 grid size-6 place-items-center rounded-full border border-[#B92216] text-[#B92216]">
                            <span className={["size-2.5 rounded-full", paymentTiming === "pay_later" ? "bg-[#B92216]" : "bg-transparent"].join(" ")} />
                          </span>
                          <div>
                            <p className="font-brand text-[15px] font-semibold leading-6 text-travel-dark">Reserve now & pay later</p>
                            <p className="mt-1 text-[13px] leading-5 text-travel-muted">
                              No extra fees. You&apos;ll be charged {estimate ? formatMoney(estimate.totalAmountCents, displayCurrency) : "later"} on your travel date.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-brand text-[15px] font-semibold leading-6 text-travel-dark">
                            {paymentTiming === "pay_later" ? formatMoney(0, displayCurrency) : formatMoney(0, displayCurrency)}
                          </p>
                          <p className="text-[13px] leading-5 text-travel-muted">now</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t border-[#1A1A1A]/12 pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-brand text-[16px] font-semibold leading-6 text-travel-dark">Pay with</p>
                      <div className="flex items-center gap-2 text-travel-muted">
                        <CreditCard className="size-4" />
                        <span className="text-[13px] font-medium">Checkout</span>
                      </div>
                    </div>

                    <button
                      className={[
                        "flex w-full items-center gap-4 rounded-travel-md border px-4 py-4 text-left transition",
                        paymentMethod === "card" ? "border-[#B92216] bg-[#B92216]/[0.04]" : "border-[#1A1A1A]/14 bg-white hover:bg-[#fafafa]"
                      ].join(" ")}
                      onClick={() => setPaymentMethod((current) => (current === "card" ? null : "card"))}
                      type="button"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#B92216] text-[#B92216]">
                        <span className={["size-2.5 rounded-full", paymentMethod === "card" ? "bg-[#B92216]" : "bg-transparent"].join(" ")} />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#1A1A1A]/12 bg-white px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#1A4ED8]">
                          VISA
                        </span>
                        <span className="rounded-md border border-[#1A1A1A]/12 bg-white px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#1B7BD5]">
                          AMEX
                        </span>
                        <span className="rounded-md border border-[#1A1A1A]/12 bg-white px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#D3342A]">
                          MC
                        </span>
                      </div>
                      <span className="font-brand text-[15px] font-semibold leading-6 text-travel-dark">Debit/Credit Card</span>
                    </button>

                    {paymentMethod === "card" ? (
                      <div className="grid gap-4 rounded-travel-md border border-[#1A1A1A]/12 bg-white p-4">
                        <Field label="Cardholder name">
                          <Input disabled value="Alpii Payment Demo" />
                        </Field>
                        <Field label="Credit Card Number">
                          <Input disabled value="1234 1234 1234 1234" />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-[160px_32px_160px_minmax(0,1fr)] md:items-end">
                          <Field label="Expiration Date">
                            <Input disabled value="01" />
                          </Field>
                          <div className="hidden pb-3 text-center text-[28px] leading-none text-travel-dark md:block">/</div>
                          <div className="grid gap-2 md:col-start-3">
                            <span className="text-sm font-semibold text-transparent">Year</span>
                            <Input disabled value="28" />
                          </div>
                          <div className="grid gap-2">
                            <Field label="Security Code">
                              <Input disabled value="123" />
                            </Field>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {authPrompt ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-interface text-sm font-semibold text-travel-dark">
                      Create your account in Step 1 to complete this booking.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-travel-muted">
                      Your traveler and trip details are ready. Finish the account step first, then come back here.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ButtonCTA onClick={() => setActiveStep(1)} size="sm" type="button">
                        Go to account step
                      </ButtonCTA>
                      <ButtonCTA href={`${routes.login}?redirect=${encodeURIComponent(checkoutReturnPath)}`} size="sm" variant="outline">
                        Log in instead
                      </ButtonCTA>
                    </div>
                  </div>
                ) : null}

                {error ? <ErrorState title="Checkout error" description={error} /> : null}

                <div className="grid gap-4">
                  <p className="text-[13px] leading-5 text-travel-muted">
                    Clicking &apos;Book Now&apos; confirms your agreement to Viator&apos;s{" "}
                    <a className="font-medium text-travel-dark underline underline-offset-2" href="https://www.viator.com/support/termsAndConditions" rel="noreferrer" target="_blank">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a className="font-medium text-travel-dark underline underline-offset-2" href="https://www.viator.com/support/privacyPolicy" rel="noreferrer" target="_blank">
                      Privacy Statement
                    </a>
                    , and your direct contract with the supplier per the{" "}
                    <a className="font-medium text-travel-dark underline underline-offset-2" href="https://www.viator.com/tours/Florence/Tuscany-Day-Trip-from-Florence-Siena-San-Gimignano-Pisa-and-Lunch-at-a-Winery/d519-5070TUSCANY" rel="noreferrer" target="_blank">
                      listing
                    </a>
                    .
                  </p>
                </div>

                <div className="grid gap-3">
                  <ButtonCTA
                    disabled={!estimate}
                    fullWidth
                    isLoading={isCreating}
                    leftIcon={<LockKeyhole className="size-4" />}
                    type="submit"
                  >
                    Book Now
                  </ButtonCTA>
                </div>
            </CheckoutSection>
          </form>
        )}
      </section>

      <aside className="hidden lg:block lg:w-[390px]" aria-hidden="true" />
      <FooterAwareFixedPanel className="pointer-events-none fixed right-[max(2rem,calc((100vw-80rem)/2+2rem))] z-30 hidden w-[390px] lg:block">
        <div className="pointer-events-auto max-h-[calc(100vh-104px)] overflow-y-auto overscroll-contain pb-4">
          <Card className="overflow-hidden border-[#2B2B2B]/20 shadow-none">
            <div className="border-b border-[#2B2B2B]/10 bg-[#ffdbdb] px-5 py-3">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-travel-dark">
                <Clock3 className="size-4 text-primary" />
                Holding your spot for {formatHoldTime(holdSeconds)}
              </div>
            </div>
            <CardContent className="space-y-0 p-0">
              <div className="flex items-start gap-4 px-5 py-5">
                <img
                  alt={activity.title}
                  className="size-[88px] rounded-travel-md object-cover"
                  src={mappedActivity.imageUrl}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-brand text-[15px] font-semibold leading-6 text-travel-dark">
                    {activity.title}
                  </p>
                  {selectedOption?.title ? (
                    <p className="mt-1 text-sm leading-6 text-travel-muted">{selectedOption.title}</p>
                  ) : null}
                </div>
              </div>
              <div className="border-t border-[#2B2B2B]/8 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 text-travel-dark">
                    <div className="flex items-center gap-3 text-[15px] font-medium leading-6">
                      <UserRound className="size-5 text-travel-muted" />
                      <span>{travelerLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[15px] font-medium leading-6">
                      <CalendarDays className="size-5 text-travel-muted" />
                      <span>{bookingDateLabel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-brand text-[16px] font-semibold leading-6 text-travel-dark">
                      {estimate ? formatMoney(estimate.totalAmountCents, displayCurrency) : "Price unavailable"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 text-[15px] leading-6 text-travel-dark">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <p>
                    <span className="font-semibold">Free cancellation</span>
                    <br />
                    <span className="text-travel-muted">
                      {formatCancellationDeadline({
                        availabilityStartDateTime: selectedAvailability?.startDateTime,
                        selectedDate
                      })}
                    </span>
                  </p>
                </div>
              </div>
              <div className="border-t border-[#2B2B2B]/8 bg-[#F8F8F8]">
                <button
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-[#f2f2f2]"
                  onClick={() => setPromoOpen((current) => !current)}
                  type="button"
                >
                  <span className="flex items-center gap-3 text-travel-dark">
                    <Tag className="size-5" />
                    <span className="text-[15px] font-semibold leading-6 underline underline-offset-2">Enter Promo Code</span>
                  </span>
                  <ChevronDown className={["size-4 text-travel-muted transition", promoOpen ? "rotate-180" : ""].join(" ")} />
                </button>
                {promoOpen ? (
                  <div className="border-t border-[#2B2B2B]/8 px-5 pb-4 pt-3">
                    <div className="flex gap-2">
                      <Input placeholder="Enter promo code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
                      <ButtonCTA type="button" variant="outline">
                        Apply
                      </ButtonCTA>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="px-5 py-5">
                <div className="space-y-2">
                  <SummaryLine
                    label={`Adult x ${adults}${estimate ? ` · ${formatMoney(estimate.adultUnitPriceCents, displayCurrency)}` : ""}`}
                    value={estimate ? formatMoney(estimate.adultLineTotalCents, displayCurrency) : "Price unavailable"}
                  />
                  {children > 0 ? (
                    <SummaryLine
                      label={`Child x ${children}${estimate ? ` · ${formatMoney(estimate.childUnitPriceCents, displayCurrency)}` : ""}`}
                      value={estimate ? formatMoney(estimate.childLineTotalCents, displayCurrency) : "Price unavailable"}
                    />
                  ) : null}
                </div>
                <div className="mt-4 border-t border-[#2B2B2B]/10 pt-4">
                  <SummaryLine
                    label={
                      <span>
                        Total price{" "}
                        <button
                          className="font-semibold underline underline-offset-2 transition hover:text-primary"
                          onClick={() => setCurrencyDialogOpen(true)}
                          type="button"
                        >
                          ({displayCurrency})
                        </button>
                      </span>
                    }
                    value={estimate ? formatMoney(estimate.totalAmountCents, displayCurrency) : "Price unavailable"}
                  />
                  {estimate && displayCurrency !== "USD" ? (
                    <p className="mt-2 text-right text-xs leading-5 text-travel-muted">
                      Base charge: {formatBaseUsd(estimate.totalAmountCents)}
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FooterAwareFixedPanel>
      <Dialog
        bodyClassName="p-3 sm:p-3"
        description="Choose the currency used for displaying this checkout summary."
        onClose={() => setCurrencyDialogOpen(false)}
        open={currencyDialogOpen}
        panelClassName="max-w-sm"
        title="Display currency"
      >
        <div className="grid gap-2">
          {supportedCurrencies.map((item) => {
            const isSelected = item === displayCurrency;
            return (
              <button
                className={[
                  "flex items-center justify-between rounded-travel-md border px-4 py-3 text-left transition",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-[#2B2B2B]/10 bg-white text-travel-dark hover:border-primary/30 hover:bg-[#FAFAFA]"
                ].join(" ")}
                key={item}
                onClick={() => {
                  setDisplayCurrency(item);
                  setCurrencyDialogOpen(false);
                }}
                type="button"
              >
                <span className="font-interface text-sm font-semibold">{item}</span>
                {isSelected ? <span className="text-xs font-semibold">Selected</span> : null}
              </button>
            );
          })}
        </div>
      </Dialog>
    </main>
  );

  function setContactValue<TKey extends keyof typeof contact>(key: TKey, value: (typeof contact)[TKey]) {
    setContact((current) => ({ ...current, [key]: value }));
  }

  function updateTraveler(index: number, key: "firstName" | "lastName", value: string) {
    setTravelers((current) =>
      current.map((traveler, travelerIndex) =>
        travelerIndex === index ? { ...traveler, [key]: value } : traveler
      )
    );
  }
}

function CheckoutSection({
  children,
  isComplete,
  isOpen,
  number,
  onEdit,
  summary,
  title
}: {
  children: ReactNode;
  isComplete: boolean;
  isOpen: boolean;
  number: number;
  onEdit: () => void;
  summary: string;
  title: string;
}) {
  return (
    <Card
      className={
        isOpen
          ? "overflow-hidden border-[#2B2B2B]/18 bg-white shadow-[0_18px_42px_rgba(28,28,28,0.08)]"
          : "overflow-hidden border-[#2B2B2B]/12 bg-white shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
      }
    >
      <CardHeader
        className={[
          "flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-5",
          isOpen ? "bg-[#F6F7F8]" : "bg-white"
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={[
              "flex size-8 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
              isComplete || isOpen
                ? "bg-[#B92216] text-white"
                : "bg-[#ffdbdb] text-[#1A1A1A]"
            ].join(" ")}
          >
            {isComplete && !isOpen ? <CheckCircle2 className="size-[14px]" /> : number}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-[1.05rem]">{title}</CardTitle>
            <CardDescription className="truncate text-[13px] leading-5">{summary}</CardDescription>
          </div>
        </div>
        {!isOpen ? (
          <button
            className="rounded-full border border-[#2B2B2B]/12 bg-white px-4 py-2 text-sm font-semibold text-travel-dark transition hover:border-primary hover:text-primary"
            onClick={onEdit}
            type="button"
          >
            Edit
          </button>
        ) : null}
      </CardHeader>
      {isOpen ? <CardContent className="grid gap-6 border-t border-[#2B2B2B]/8 px-6 pb-6 pt-5">{children}</CardContent> : null}
    </Card>
  );
}

function Field({
  children,
  label,
  required
}: {
  children: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-travel-dark">
        {label} {required ? <span className="text-primary">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function validateContact(contact: {
  email: string;
  fullName: string;
  password: string;
  phone: string;
}, isAuthenticated: boolean) {
  const hasRequiredFields =
    contact.fullName.trim().length > 0 &&
    contact.email.trim().length > 0 &&
    contact.phone.trim().length > 0;
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());
  const passwordValid = isAuthenticated || contact.password.trim().length >= 8;

  if (!contact.fullName.trim().length) {
    return {
      isValid: false,
      message: "Please enter your full name."
    };
  }

  if (!contact.phone.trim().length) {
    return {
      isValid: false,
      message: "Please enter your phone number."
    };
  }

  if (!contact.email.trim().length || !emailLooksValid) {
    return {
      isValid: false,
      message: "Please enter a valid email address."
    };
  }

  if (!passwordValid) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters."
    };
  }

  return {
    isValid: hasRequiredFields && emailLooksValid && passwordValid,
    message: null
  };
}

function optionCardClass(isSelected: boolean) {
  return [
    "flex items-start gap-3 rounded-xl border p-4 text-sm transition",
    isSelected ? "border-primary bg-primary/5" : "border-travel-border bg-white"
  ].join(" ");
}

function formatCheckoutDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Select date";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatCheckoutMeetingTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(2026, 0, 1, hours, minutes)));
}

function formatCancellationDeadline({
  availabilityStartDateTime,
  selectedDate
}: {
  availabilityStartDateTime?: string;
  selectedDate?: string;
}) {
  const baseDate = availabilityStartDateTime
    ? new Date(availabilityStartDateTime)
    : selectedDate
      ? new Date(`${selectedDate}T09:00:00Z`)
      : null;

  if (!baseDate || Number.isNaN(baseDate.getTime())) {
    return "Until 9:00 AM on the previous day";
  }

  const deadline = new Date(baseDate);
  deadline.setUTCDate(deadline.getUTCDate() - 1);
  deadline.setUTCHours(9, 0, 0, 0);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(deadline);

  return `Until 9:00 AM on ${formattedDate}`;
}

function formatHoldTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")} minutes`;
}

function clampQuantity(value: string | undefined, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function nextAvailableDate(availableDays?: string[] | null) {
  const allowed = new Set((availableDays ?? []).map((day) => day.toUpperCase()));
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

const weekdayByIndex = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function isDateAllowed(value: string, availableDays?: string[] | null) {
  if (!availableDays?.length) return true;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const allowed = new Set(availableDays.map((day) => day.toUpperCase()));
  return allowed.has(weekdayByIndex[date.getUTCDay()]);
}

export function UserBookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [nextBookings, nextReviews] = await Promise.all([getMyBookings(), getMyReviews()]);
        setBookings(nextBookings);
        setReviews(nextReviews);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load bookings");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const reviewByBookingId = new Map(reviews.map((review) => [review.bookingId, review]));

  return (
    <BookingTable
      title="My bookings"
      description="Your confirmed and pending Alpii bookings."
      bookings={bookings}
      error={error}
      isLoading={isLoading}
      reviewByBookingId={reviewByBookingId}
      useDisplayCurrency
    />
  );
}

export function UserBookingDetailManager({ bookingId }: { bookingId: string }) {
  const { currency: displayCurrency } = useCurrency();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [review, setReview] = useState<UserReview | null>(null);
  const [viewer, setViewer] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [nextBooking, me] = await Promise.all([getBooking(bookingId), getMe()]);
        setBooking(nextBooking);
        setViewer(me.user);

        if (me.user.role === "USER") {
          const reviews = await getMyReviews();
          setReview(reviews.find((item) => item.bookingId === bookingId) ?? null);
        } else {
          setReview(null);
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load booking");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [bookingId]);

  if (isLoading) return <LoadingState label="Loading booking" />;
  if (error) return <ErrorState title="Booking unavailable" description={error} />;
  if (!booking) return <EmptyState title="Booking not found" description="This booking could not be loaded." />;

  const cover = booking.activity.media?.[0]?.url ?? booking.activity.media?.[0]?.file?.url;
  const canOperateVoucher = viewer?.role === "PARTNER" || viewer?.role === "ADMIN" || viewer?.role === "SUPER_ADMIN";
  const canReview = viewer?.role === "USER" && booking.status === "COMPLETED";
  const canCompleteTour = Boolean(canOperateVoucher && booking.voucher?.code && booking.status !== "COMPLETED");

  async function markCompletedTour() {
    if (!booking?.voucher?.code || !canOperateVoucher) return;

    setIsCompleting(true);
    setError(null);
    try {
      const result = await validateVoucher(booking.voucher.code);
      setBooking(result.booking);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to complete tour");
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>{booking.activity.title}</CardTitle>
            <CardDescription>
              {booking.activity.city.name} · Booked {formatDate(booking.bookedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SummaryLine label="Booking status" value={formatStatus(booking.status)} />
            <SummaryLine label="Payment status" value={formatStatus(booking.payment?.status ?? "PENDING")} />
            {booking.option?.title ? <SummaryLine label="Package" value={booking.option.title} /> : null}
            {booking.travelDate ? (
              <SummaryLine
                label="Travel date"
                value={[formatCheckoutDate(booking.travelDate.slice(0, 10)), booking.meetingTime ? formatCheckoutMeetingTime(booking.meetingTime) : ""]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ) : null}
            <SummaryLine label="Participants" value={participantLabel(booking)} />
            <SummaryLine label="Total" value={formatMoney(booking.totalAmountCents, displayCurrency)} />
            {displayCurrency !== "USD" ? (
              <SummaryLine label="Base charge" value={formatBaseUsd(booking.totalAmountCents)} />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Voucher</CardTitle>
            <CardDescription>Show this code to the activity partner on arrival.</CardDescription>
          </CardHeader>
          <CardContent>
            {booking.voucher ? (
              <VoucherCard voucherCode={booking.voucher.code} status={booking.voucher.status} />
            ) : (
              <EmptyState title="Voucher not generated yet" description="Complete dummy payment to generate your voucher." />
            )}
          </CardContent>
        </Card>
        {canReview ? (
          <UserReviewCard
            bookingId={booking.id}
            existingReview={review}
            onSubmitted={setReview}
          />
        ) : null}
      </div>
      <aside>
        <Card>
          {cover ? <img alt="" className="aspect-[4/3] w-full rounded-t-travel-lg object-cover" src={cover} /> : null}
          <CardContent className="space-y-3 pt-5">
            {canOperateVoucher ? (
              <>
                <ButtonCTA href={routes.partnerVouchers} fullWidth variant="outline">
                  Scan the barcode
                </ButtonCTA>
                <ButtonCTA
                  disabled={!canCompleteTour}
                  fullWidth
                  isLoading={isCompleting}
                  onClick={markCompletedTour}
                  type="button"
                >
                  {booking.status === "COMPLETED" ? "Tour completed" : "Mark as completed tour"}
                </ButtonCTA>
              </>
            ) : null}
            <ButtonCTA href={routes.activity(booking.activity.slug)} fullWidth variant="outline">
              View activity
            </ButtonCTA>
            <ButtonCTA href={routes.bookings} fullWidth variant="ghost">
              Back to bookings
            </ButtonCTA>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

export function PartnerBookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      setBookings(await getPartnerBookings({ search }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load partner bookings");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BookingTable
      title="Partner bookings"
      description="Bookings for activities owned by your partner account."
      bookings={bookings}
      error={error}
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
      onSearch={load}
      showCustomer
    />
  );
}

export function VoucherValidationManager() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const voucher = await validateVoucher(code.trim());
      setResult(voucher.booking);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to validate voucher");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Validate voucher</CardTitle>
          <CardDescription>Enter a traveler voucher code. Camera scanning is intentionally out of scope for Sprint 9.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={submit}>
            <Input onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ALP-XXXX-XXXXX" required value={code} />
            <ButtonCTA isLoading={isLoading} leftIcon={<Search className="size-4" />} type="submit">
              Validate
            </ButtonCTA>
          </form>
          {error ? <div className="mt-5"><ErrorState title="Voucher validation failed" description={error} /></div> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-3">
              <Badge variant="success">Validated</Badge>
              <SummaryLine label="Activity" value={result.activity.title} />
              <SummaryLine label="Customer" value={result.user?.fullName ?? "Customer"} />
              <SummaryLine label="Booking" value={result.id} />
            </div>
          ) : (
            <p className="text-sm text-travel-muted">Validation result will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminBookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      setBookings(await getAdminBookings({ search }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load admin bookings");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <BookingTable title="Bookings" description="Read-only marketplace booking monitor." bookings={bookings} error={error} isLoading={isLoading} search={search} setSearch={setSearch} onSearch={load} showCustomer />;
}

export function AdminPaymentsManager() {
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setPayments(await getAdminPayments());
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load payments");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const columns = [
    { key: "payment", header: "Payment", cell: (payment: PaymentWithBooking) => payment.id.slice(0, 8) },
    { key: "activity", header: "Activity", cell: (payment: PaymentWithBooking) => payment.booking.activity.title },
    { key: "customer", header: "Customer", cell: (payment: PaymentWithBooking) => payment.booking.user?.email ?? "Customer" },
    { key: "status", header: "Status", cell: (payment: PaymentWithBooking) => <PaymentStatusBadge status={payment.status} /> },
    { key: "amount", header: "Amount (USD)", cell: (payment: PaymentWithBooking) => formatBaseUsd(payment.amountCents) },
    { key: "created", header: "Created", cell: (payment: PaymentWithBooking) => formatDate(payment.createdAt) }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Read-only dummy payment monitor. Amounts shown in USD.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? <ErrorState title="Payments unavailable" description={error} /> : null}
        {isLoading ? <LoadingState label="Loading payments" /> : null}
        {!isLoading && payments.length ? <DataTable columns={columns} getRowKey={(payment) => payment.id} rows={payments} /> : null}
        {!isLoading && !payments.length ? <EmptyState title="No payments" description="Dummy payments will appear after checkout." /> : null}
      </CardContent>
    </Card>
  );
}

function BookingTable({
  bookings,
  description,
  error,
  isLoading,
  onSearch,
  search,
  setSearch,
  showCustomer = false,
  reviewByBookingId,
  useDisplayCurrency = false,
  title
}: {
  bookings: Booking[];
  description: string;
  error: string | null;
  isLoading: boolean;
  onSearch?: () => void;
  search?: string;
  setSearch?: (value: string) => void;
  showCustomer?: boolean;
  reviewByBookingId?: Map<string, UserReview>;
  useDisplayCurrency?: boolean;
  title: string;
}) {
  const { currency: displayCurrency } = useCurrency();
  const columns = useMemo(
    () => [
      {
        key: "activity",
        header: "Activity",
        cell: (booking: Booking) => (
          <div className="max-w-sm">
            <p className="truncate font-semibold text-travel-dark">{booking.activity.title}</p>
            <p className="mt-1 text-xs text-travel-muted">{booking.activity.city.name}</p>
          </div>
        )
      },
      ...(showCustomer
        ? [{ key: "customer", header: "Customer", cell: (booking: Booking) => booking.user?.email ?? "Customer" }]
        : []),
      { key: "bookingStatus", header: "Booking", cell: (booking: Booking) => <BookingStatusBadge status={booking.status} /> },
      { key: "paymentStatus", header: "Payment", cell: (booking: Booking) => <PaymentStatusBadge status={booking.payment?.status ?? "PENDING"} /> },
      { key: "voucher", header: "Voucher", cell: (booking: Booking) => booking.voucher ? <VoucherStatusBadge status={booking.voucher.status} /> : "Not issued" },
      {
        key: "total",
        header: useDisplayCurrency ? `Total (${displayCurrency})` : "Total (USD)",
        cell: (booking: Booking) =>
          useDisplayCurrency
            ? formatMoney(booking.totalAmountCents, displayCurrency)
            : formatBaseUsd(booking.totalAmountCents)
      },
      { key: "created", header: "Booked", cell: (booking: Booking) => formatDate(booking.createdAt) },
      ...(reviewByBookingId
        ? [
            {
              key: "review",
              header: "Review",
              cell: (booking: Booking) => {
                const review = reviewByBookingId.get(booking.id);
                if (review) return <ReviewStatusBadge status={review.status} />;
                if (booking.status === "COMPLETED") {
                  return (
                    <Link className="font-semibold text-travel-primary" href={routes.bookingDetail(booking.id)}>
                      Write review
                    </Link>
                  );
                }
                return <span className="text-travel-muted">Not available</span>;
              }
            }
          ]
        : []),
      {
        key: "actions",
        header: "Actions",
        align: "right" as const,
        cell: (booking: Booking) => (
          <Link className="font-semibold text-travel-primary" href={routes.bookingDetail(booking.id)}>
            View
          </Link>
        )
      }
    ],
    [displayCurrency, reviewByBookingId, showCustomer, useDisplayCurrency]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {setSearch && onSearch ? (
          <form
            className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
          >
            <Input onChange={(event) => setSearch(event.target.value)} placeholder="Search booking, customer, activity, or voucher" value={search ?? ""} />
            <ButtonCTA type="submit" variant="outline">Search</ButtonCTA>
          </form>
        ) : null}
        {error ? <ErrorState title={`${title} unavailable`} description={error} /> : null}
        {isLoading ? <LoadingState label={`Loading ${title.toLowerCase()}`} /> : null}
        {!isLoading && bookings.length ? <DataTable columns={columns} getRowKey={(booking) => booking.id} rows={bookings} /> : null}
        {!isLoading && !bookings.length ? <EmptyState title="No bookings" description="Bookings will appear after checkout." /> : null}
      </CardContent>
    </Card>
  );
}

function VoucherCard({ status, voucherCode }: { status: string; voucherCode: string }) {
  return (
    <div className="grid gap-5 rounded-travel-lg border border-[#2B2B2B]/15 bg-white p-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="grid aspect-square place-items-center rounded-travel-lg border border-[#2B2B2B]/15 bg-travel-bg">
        <QrCode className="size-24 text-travel-dark" />
      </div>
      <div>
        <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>{formatStatus(status)}</Badge>
        <p className="mt-3 font-brand text-2xl font-semibold tracking-wide text-travel-dark">{voucherCode}</p>
        <p className="mt-2 text-sm leading-6 text-travel-muted">
          QR placeholder for MVP. The voucher code is the source of truth for partner validation.
        </p>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-travel-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-travel-dark">{value}</span>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const variant = status === "CONFIRMED" || status === "COMPLETED" ? "success" : status === "PENDING_PAYMENT" ? "warning" : "danger";
  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function PaymentStatusBadge({ status }: { status: BookingPayment["status"] }) {
  const variant = status === "PAID" ? "success" : status === "PENDING" ? "warning" : "danger";
  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function VoucherStatusBadge({ status }: { status: string }) {
  const variant = status === "ACTIVE" ? "success" : status === "USED" ? "info" : "danger";
  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function ReviewStatusBadge({ status }: { status: UserReview["status"] }) {
  const variant =
    status === "APPROVED" ? "success" : status === "PENDING_REVIEW" ? "warning" : "danger";
  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function participantLabel(booking: Booking) {
  return booking.participants.map((item) => `${item.quantity} ${item.label}`).join(", ");
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
