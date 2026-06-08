import { AdminActivityRevisionDetailManager } from "../../../../../components/domain/admin/AdminActivityRevisionsManager";
import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";

type AdminActivityRevisionPageProps = {
  params: Promise<{
    revisionId: string;
  }>;
};

export default async function AdminActivityRevisionPage({
  params
}: AdminActivityRevisionPageProps) {
  const { revisionId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Review proposed changes and apply them to the live activity only after approval."
      title="Review change request"
    >
      <AdminActivityRevisionDetailManager revisionId={revisionId} />
    </ProtectedDashboardPage>
  );
}
