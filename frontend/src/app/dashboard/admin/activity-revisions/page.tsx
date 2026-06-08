import { AdminActivityRevisionsListManager } from "../../../../components/domain/admin/AdminActivityRevisionsManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminActivityRevisionsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Review partner-submitted changes before they update live public activities."
      title="Change requests"
    >
      <AdminActivityRevisionsListManager />
    </ProtectedDashboardPage>
  );
}
