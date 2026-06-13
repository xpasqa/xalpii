import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { PublicActivity } from "./public-marketplace";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
export type VoucherStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";

export type BookingParticipant = {
  id: string;
  label: string;
  participantType: "ADULT" | "CHILD";
  quantity: number;
  priceCents: number;
  createdAt: string;
};

export type BookingContact = {
  id: string;
  bookingId: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  marketingOptIn?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookingTraveler = {
  id: string;
  bookingId: string;
  participantType: "ADULT" | "CHILD";
  firstName: string;
  lastName: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type BookingPayment = {
  id: string;
  bookingId: string;
  provider: "DUMMY" | "STRIPE";
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  providerReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingVoucher = {
  id: string;
  bookingId: string;
  code: string;
  qrPayload: string;
  status: VoucherStatus;
  usedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingUser = {
  id: string;
  email?: string;
  fullName: string;
};

export type Booking = {
  id: string;
  userId: string;
  activityId: string;
  optionId?: string | null;
  availabilityId?: string | null;
  travelDate?: string | null;
  meetingTime?: string | null;
  pickupChoice?: "PICKUP" | "MEET_AT_POINT" | null;
  pickupAddress?: string | null;
  specialRequirements?: string | null;
  status: BookingStatus;
  currency: string;
  totalAmountCents: number;
  platformFeeCents: number;
  partnerPayoutCents: number;
  bookedAt: string;
  createdAt: string;
  updatedAt: string;
  activity: PublicActivity;
  availability?: {
    id: string;
    startDateTime: string;
    endDateTime?: string | null;
    capacity?: number | null;
    bookedCount: number;
    isActive: boolean;
  } | null;
  option?: {
    id: string;
    title: string;
    slug: string;
    availabilityMode: "SCHEDULED_SESSIONS" | "ALWAYS_AVAILABLE";
  } | null;
  participants: BookingParticipant[];
  contact?: BookingContact | null;
  travelers?: BookingTraveler[];
  payment?: BookingPayment | null;
  user?: BookingUser;
  voucher?: BookingVoucher | null;
};

export type PaymentWithBooking = BookingPayment & {
  booking: Booking;
};

export type VoucherValidationResult = BookingVoucher & {
  booking: Booking;
};

export async function createBooking(input: {
  activityId: string;
  availabilityId?: string;
  meetingTime?: string;
  optionId?: string;
  selectedDate?: string;
  participants: Array<{
    participantType: "ADULT" | "CHILD";
    label: string;
    quantity: number;
  }>;
  contact: {
    fullName: string;
    email: string;
    phoneNumber: string;
    marketingOptIn: boolean;
  };
  travelers: Array<{
    participantType: "ADULT" | "CHILD";
    firstName: string;
    lastName: string;
    sortOrder: number;
  }>;
  preferences: {
    pickupChoice: "PICKUP" | "MEET_AT_POINT";
    pickupAddress?: string;
    specialRequirements?: string;
  };
}) {
  return requireData(
    await authenticatedFetch<Booking>({
      body: JSON.stringify(input),
      method: "POST",
      path: "/bookings"
    })
  );
}

export async function getMyBookings() {
  return requireData(await authenticatedFetch<Booking[]>({ path: "/bookings/my" }));
}

export async function getBooking(id: string) {
  return requireData(await authenticatedFetch<Booking>({ path: `/bookings/${id}` }));
}

export async function confirmDummyPayment(paymentId: string) {
  return requireData(
    await authenticatedFetch<Booking>({
      method: "POST",
      path: `/payments/${paymentId}/dummy-confirm`
    })
  );
}

export async function getVoucher(code: string) {
  return requireData(await authenticatedFetch<VoucherValidationResult>({ path: `/vouchers/${code}` }));
}

export async function validateVoucher(code: string) {
  return requireData(
    await authenticatedFetch<VoucherValidationResult>({
      body: JSON.stringify({ code }),
      method: "POST",
      path: "/vouchers/validate"
    })
  );
}

export async function getPartnerBookings(query: { status?: string; search?: string } = {}) {
  return requireData(
    await authenticatedFetch<Booking[]>({ path: `/partner/bookings${buildQuery(query)}` })
  );
}

export async function getAdminBookings(query: { status?: string; search?: string } = {}) {
  return requireData(
    await authenticatedFetch<Booking[]>({ path: `/admin/bookings${buildQuery(query)}` })
  );
}

export async function getAdminPayments(query: { status?: string; search?: string } = {}) {
  return requireData(
    await authenticatedFetch<PaymentWithBooking[]>({ path: `/admin/payments${buildQuery(query)}` })
  );
}

async function authenticatedFetch<TData>(options: {
  body?: BodyInit;
  method?: string;
  path: string;
}) {
  const token = getAccessToken();
  if (!token) throw new Error("Missing access token");

  return apiFetch<TData>({
    ...options,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function buildQuery(query: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.search?.trim()) params.set("search", query.search.trim());
  const value = params.toString();
  return value ? `?${value}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}
