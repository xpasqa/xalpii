import { AdminDestinationDetailManager } from "../../../../../components/domain/admin/AdminDestinationDetailManager";
import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";

export default async function AdminDestinationDetailPage({
  params
}: {
  params: Promise<{ destinationId: string }>;
}) {
  const { destinationId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Review one destination subtree and manage activities connected below it."
      title="Destination detail"
    >
      <AdminDestinationDetailManager destinationId={destinationId} />
    </ProtectedDashboardPage>
  );
}
