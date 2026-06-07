import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";
import { PartnerProfileManager } from "../../../../components/domain/partner/PartnerProfileManager";

export default function PartnerProfilePage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="Manage your partner business profile and contact information."
      title="Partner profile"
    >
      <PartnerProfileManager />
    </ProtectedDashboardPage>
  );
}
