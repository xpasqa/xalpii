import { Badge } from "../ui";

export type ActivityStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

const activityLabels: Record<ActivityStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  REVISION_REQUESTED: "Revision requested",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived"
};

const bookingLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  REFUNDED: "Refunded"
};

const paymentLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded"
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const variant =
    status === "PUBLISHED" || status === "APPROVED"
      ? "success"
      : status === "REJECTED" || status === "ARCHIVED"
        ? "danger"
        : status === "PENDING_REVIEW" || status === "REVISION_REQUESTED"
          ? "warning"
          : "neutral";

  return <Badge variant={variant}>{activityLabels[status]}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const variant =
    status === "CONFIRMED" || status === "COMPLETED"
      ? "success"
      : status === "CANCELLED" || status === "REFUNDED"
        ? "danger"
        : "warning";

  return <Badge variant={variant}>{bookingLabels[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variant =
    status === "PAID"
      ? "success"
      : status === "FAILED" || status === "EXPIRED"
        ? "danger"
        : status === "REFUNDED"
          ? "info"
          : "warning";

  return <Badge variant={variant}>{paymentLabels[status]}</Badge>;
}
