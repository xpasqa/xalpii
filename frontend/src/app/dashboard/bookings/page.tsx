import { UserBookingsManager } from "../../../components/domain/bookings/BookingManagers";
import { ProtectedDashboardPage } from "../../../components/domain/auth/ProtectedDashboardPage";

export default function UserBookingsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]}
      description="View your Alpii bookings, payment status, and voucher access."
      title="Bookings"
    >
      <UserBookingsManager />
    </ProtectedDashboardPage>
  );
}
