import { UserBookingDetailManager } from "../../../../components/domain/bookings/BookingManagers";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

type BookingDetailPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { bookingId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["USER", "PARTNER", "ADMIN", "SUPER_ADMIN"]}
      description="View booking details, payment status, and voucher information."
      title="Booking detail"
    >
      <UserBookingDetailManager bookingId={bookingId} />
    </ProtectedDashboardPage>
  );
}
