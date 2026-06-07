import { AdminActivitiesManager } from "../../../../components/domain/admin/AdminActivitiesManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminActivitiesPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Review partner activity submissions and decide what can be published publicly."
      title="Admin activities"
    >
      <AdminActivitiesManager />
    </ProtectedDashboardPage>
  );
}
