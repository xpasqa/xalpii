import { AdminCitiesManager } from "../../../../components/domain/admin/AdminCitiesManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminCitiesPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Create, edit, search, and deactivate destination cities."
      title="Admin cities"
    >
      <AdminCitiesManager />
    </ProtectedDashboardPage>
  );
}
