import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";
import { AdminBookingsManager } from "../../../../components/domain/bookings/BookingManagers";

export default function AdminBookingsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Read-only monitor for marketplace bookings."
      title="Bookings"
    >
      <AdminBookingsManager />
    </ProtectedDashboardPage>
  );
}
