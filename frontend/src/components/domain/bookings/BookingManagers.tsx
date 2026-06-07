"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, QrCode, Search } from "lucide-react";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select
} from "../../ui";
import { getAccessToken } from "../../../lib/auth";
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
import { formatMoney } from "../../../lib/money";
import { calculatePricingEstimate, remainingCapacity } from "../../../lib/activity-pricing";
import { getPublicActivity, mapPublicActivity } from "../../../lib/public-marketplace";
import type { PublicActivity } from "../../../lib/public-marketplace";
import { routes } from "../../../lib/routes";

type CheckoutManagerProps = {
  activitySlug: string;
  initialAdults?: string;
  initialAvailabilityId?: string;
  initialChildren?: string;
};

export function CheckoutManager({
  activitySlug,
  initialAdults,
  initialAvailabilityId,
  initialChildren
}: CheckoutManagerProps) {
  const router = useRouter();
  const [activity, setActivity] = useState<PublicActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availabilityId, setAvailabilityId] = useState("");
  const [adults, setAdults] = useState(() => clampQuantity(initialAdults, 1, 14, 1));
  const [children, setChildren] = useState(() => clampQuantity(initialChildren, 0, 14, 0));

  useEffect(() => {
    async function loadActivity() {
      try {
        const nextActivity = await getPublicActivity(activitySlug);
        setActivity(nextActivity);
        const requestedAvailability = nextActivity.availability?.find(
          (slot) => slot.id === initialAvailabilityId
        );
        setAvailabilityId(requestedAvailability?.id ?? nextActivity.availability?.[0]?.id ?? "");
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load checkout");
      } finally {
        setIsLoading(false);
      }
    }

    void loadActivity();
  }, [activitySlug, initialAvailabilityId]);

  const pricing = activity?.pricing?.find((item) => item.isActive) ?? activity?.pricing?.[0];
  const mappedActivity = activity ? mapPublicActivity(activity) : null;
  const selectedAvailability = activity?.availability?.find((slot) => slot.id === availabilityId);
  const maxTravelers = remainingCapacity(selectedAvailability);
  const estimate = activity
    ? calculatePricingEstimate({
        adults,
        children,
        pricingMode: activity.pricingMode,
        pricingTiers: activity.pricingTiers,
        simplePrice: pricing ?? null
      })
    : null;
  const checkoutReturnPath = `${routes.checkout(activitySlug)}?${new URLSearchParams({
    adults: String(adults),
    children: String(children),
    ...(availabilityId ? { availabilityId } : {})
  }).toString()}`;

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activity || !pricing || !estimate) return;

    setIsCreating(true);
    setError(null);

    try {
      const created = await createBooking({
        activityId: activity.id,
        availabilityId: availabilityId || undefined,
        participants: [
          { label: "Adult", participantType: "ADULT", quantity: adults },
          ...(children > 0
            ? [{ label: "Child", participantType: "CHILD" as const, quantity: children }]
            : [])
        ]
      });
      setBooking(created);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create booking");
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

  if (!getAccessToken()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Log in to continue</CardTitle>
            <CardDescription>
              Create an Alpii account or log in before creating a booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <ButtonCTA href={`${routes.login}?redirect=${encodeURIComponent(checkoutReturnPath)}`}>
              Log in
            </ButtonCTA>
            <ButtonCTA href={routes.register} variant="outline">
              Create account
            </ButtonCTA>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section className="grid gap-5">
        <ButtonCTA href={routes.activity(activity.slug)} leftIcon={<ArrowLeft className="size-4" />} size="sm" variant="ghost">
          Back to activity
        </ButtonCTA>
        <div>
          <h1 className="font-brand text-3xl font-semibold text-travel-dark">Complete your booking</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-travel-muted">
            Choose a session, confirm participants, then complete the MVP dummy payment.
          </p>
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
            <Card>
              <CardHeader>
                <CardTitle>Trip details</CardTitle>
                <CardDescription>Select the session and participants for this booking.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-travel-dark">Session</span>
                  <Select
                    disabled={!activity.availability?.length}
                    onChange={(event) => setAvailabilityId(event.target.value)}
                    value={availabilityId}
                  >
                    {activity.availability?.length ? (
                      activity.availability.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {formatDate(slot.startDateTime, "en-US", { dateStyle: "medium", timeStyle: "short" })}
                        </option>
                      ))
                    ) : (
                      <option value="">No fixed session</option>
                    )}
                  </Select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-travel-dark">Adults</span>
                  <Input
                    max={Math.max(1, maxTravelers - children)}
                    min={1}
                    onChange={(event) =>
                      setAdults(
                        Math.min(
                          Math.max(1, maxTravelers - children),
                          Math.max(1, Number(event.target.value))
                        )
                      )
                    }
                    type="number"
                    value={adults}
                  />
                  <span className="text-xs text-travel-muted">Age 14-105</span>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-travel-dark">Children</span>
                  <Input
                    max={Math.max(0, maxTravelers - adults)}
                    min={0}
                    onChange={(event) =>
                      setChildren(
                        Math.min(
                          Math.max(0, maxTravelers - adults),
                          Math.max(0, Number(event.target.value))
                        )
                      )
                    }
                    type="number"
                    value={children}
                  />
                  <span className="text-xs text-travel-muted">Age 4-13 · child discount applies</span>
                </label>
              </CardContent>
            </Card>

            {estimate?.tier ? (
              <p className="text-sm text-travel-muted">
                Price based on {estimate.totalTravelers} travelers using the {estimate.tier.minTravelers}
                {estimate.tier.minTravelers !== estimate.tier.maxTravelers
                  ? `-${estimate.tier.maxTravelers}`
                  : ""} traveler tier.
              </p>
            ) : null}

            {error ? <ErrorState title="Checkout error" description={error} /> : null}

            <ButtonCTA disabled={!pricing || !estimate} isLoading={isCreating} type="submit">
              Continue to payment
            </ButtonCTA>
          </form>
        )}
      </section>

      <aside>
        <Card className="sticky top-24 shadow-travel-card">
          <img alt={activity.title} className="aspect-[4/3] w-full rounded-t-travel-lg object-cover" src={mappedActivity.imageUrl} />
          <CardHeader>
            <p className="text-sm text-travel-muted">{mappedActivity.location}</p>
            <CardTitle>{activity.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryLine
              label={`Adult x ${adults}`}
              value={estimate ? formatMoney(estimate.adultLineTotalCents, estimate.currency) : "Price unavailable"}
            />
            {children > 0 ? (
              <SummaryLine
                label={`Child x ${children}`}
                value={estimate ? formatMoney(estimate.childLineTotalCents, estimate.currency) : "Price unavailable"}
              />
            ) : null}
            <div className="border-t border-[#2B2B2B]/10 pt-3">
              <SummaryLine label="Total" value={estimate ? formatMoney(estimate.totalAmountCents, estimate.currency) : "Price unavailable"} />
            </div>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}

function clampQuantity(value: string | undefined, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export function UserBookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setBookings(await getMyBookings());
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load bookings");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  return <BookingTable title="My bookings" description="Your confirmed and pending Alpii bookings." bookings={bookings} error={error} isLoading={isLoading} />;
}

export function UserBookingDetailManager({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setBooking(await getBooking(bookingId));
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
            <SummaryLine label="Participants" value={participantLabel(booking)} />
            <SummaryLine label="Total" value={formatMoney(booking.totalAmountCents, booking.currency)} />
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
      </div>
      <aside>
        <Card>
          {cover ? <img alt="" className="aspect-[4/3] w-full rounded-t-travel-lg object-cover" src={cover} /> : null}
          <CardContent className="space-y-3 pt-5">
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
    { key: "amount", header: "Amount", cell: (payment: PaymentWithBooking) => formatMoney(payment.amountCents, payment.currency) },
    { key: "created", header: "Created", cell: (payment: PaymentWithBooking) => formatDate(payment.createdAt) }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Read-only dummy payment monitor.</CardDescription>
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
  title: string;
}) {
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
      { key: "total", header: "Total", cell: (booking: Booking) => formatMoney(booking.totalAmountCents, booking.currency) },
      { key: "created", header: "Booked", cell: (booking: Booking) => formatDate(booking.createdAt) },
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
    [showCustomer]
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

function SummaryLine({ label, value }: { label: string; value: string }) {
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

function participantLabel(booking: Booking) {
  return booking.participants.map((item) => `${item.quantity} ${item.label}`).join(", ");
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
