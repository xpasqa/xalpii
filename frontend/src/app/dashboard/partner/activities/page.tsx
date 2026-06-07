import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";
import { PartnerActivityListManager } from "../../../../components/domain/partner-activities/PartnerActivityManagers";

export default function PartnerActivitiesPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="Create and manage your activity drafts before admin review."
      title="Partner activities"
    >
      <PartnerActivityListManager />
    </ProtectedDashboardPage>
  );
}
