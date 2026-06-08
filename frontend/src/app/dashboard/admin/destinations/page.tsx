import { AdminDestinationsManager } from "../../../../components/domain/admin/AdminDestinationsManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminDestinationsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Manage the country, region, city, and area hierarchy for marketplace destinations."
      title="Admin destinations"
    >
      <AdminDestinationsManager />
    </ProtectedDashboardPage>
  );
}
