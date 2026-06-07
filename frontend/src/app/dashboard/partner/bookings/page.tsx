import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";
import { PartnerBookingsManager } from "../../../../components/domain/bookings/BookingManagers";

export default function PartnerBookingsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="Monitor bookings for your published Alpii activities."
      title="Partner bookings"
    >
      <PartnerBookingsManager />
    </ProtectedDashboardPage>
  );
}
