import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";
import { PartnerActivityCreateManager } from "../../../../../components/domain/partner-activities/PartnerActivityManagers";

export default function NewPartnerActivityPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="Create a draft activity with core marketplace content."
      title="New activity"
    >
      <PartnerActivityCreateManager />
    </ProtectedDashboardPage>
  );
}
