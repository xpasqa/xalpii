import { AdminUsersManager } from "../../../../components/domain/admin/AdminUsersManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminUsersPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Manage users and support accounts through controlled impersonation."
      title="User Management"
    >
      <AdminUsersManager />
    </ProtectedDashboardPage>
  );
}
