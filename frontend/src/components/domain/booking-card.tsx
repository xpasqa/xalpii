import { formatDate } from "../../lib/dates";
import { formatBaseUsd } from "../../lib/money";
import { Button } from "../ui";
import { BookingStatusBadge, PaymentStatusBadge, type BookingStatus, type PaymentStatus } from "./status-badges";

type BookingCardProps = {
  bookingCode: string;
  activityTitle: string;
  guestName: string;
  date: string;
  totalMinor: number;
  currency: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
};

export function BookingCard({
  bookingCode,
  activityTitle,
  guestName,
  date,
  totalMinor,
  bookingStatus,
  paymentStatus
}: BookingCardProps) {
  return (
    <article className="min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-muted">{bookingCode}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{activityTitle}</h3>
          <p className="mt-1 text-sm text-muted">
            {guestName} • {formatDate(date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BookingStatusBadge status={bookingStatus} />
          <PaymentStatusBadge status={paymentStatus} />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <p className="text-base font-bold text-ink">{formatBaseUsd(totalMinor)}</p>
        <Button variant="outline">Details</Button>
      </div>
    </article>
  );
}
