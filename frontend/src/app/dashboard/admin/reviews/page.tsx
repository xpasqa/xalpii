import { AdminReviewsManager } from "../../../../components/domain/admin/AdminReviewsManager";
import { ProtectedDashboardPage } from "../../../../components/domain/auth/ProtectedDashboardPage";

export default function AdminReviewsPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Moderate verified traveler reviews and approved review photos."
      title="Reviews"
    >
      <AdminReviewsManager />
    </ProtectedDashboardPage>
  );
}
