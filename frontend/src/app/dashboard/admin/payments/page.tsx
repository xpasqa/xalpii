import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";
import { AdminPaymentsManager } from "../../../../components/domain/bookings/BookingManagers";

export default function AdminPaymentsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Read-only monitor for dummy payment records."
      title="Payments"
    >
      <AdminPaymentsManager />
    </ProtectedDashboardPage>
  );
}
