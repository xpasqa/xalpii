import { AdminActivityReviewManager } from "../../../../../components/domain/admin/AdminActivitiesManager";
import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";

type AdminActivityReviewPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function AdminActivityReviewPage({ params }: AdminActivityReviewPageProps) {
  const { activityId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Inspect submitted content, pricing, media, and availability before publishing."
      title="Activity review"
    >
      <AdminActivityReviewManager activityId={activityId} />
    </ProtectedDashboardPage>
  );
}
