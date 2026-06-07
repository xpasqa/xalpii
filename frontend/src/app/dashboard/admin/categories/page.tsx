import { AdminCategoriesManager } from "../../../../components/domain/admin/AdminCategoriesManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminCategoriesPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Create, edit, search, and deactivate activity categories."
      title="Admin categories"
    >
      <AdminCategoriesManager />
    </ProtectedDashboardPage>
  );
}
