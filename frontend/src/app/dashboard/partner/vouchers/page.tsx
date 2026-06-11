import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";
import { VoucherValidationManager } from "../../../../components/domain/bookings/BookingManagers";

export default function PartnerVouchersPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER", "ADMIN", "SUPER_ADMIN"]}
      description="Validate traveler vouchers when guests arrive for an activity."
      title="Validate voucher"
    >
      <VoucherValidationManager />
    </ProtectedDashboardPage>
  );
}
