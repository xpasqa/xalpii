import { AdminCategoryDetailManager } from "../../../../../components/domain/admin/AdminCategoryDetailManager";
import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";

type AdminCategoryDetailPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function AdminCategoryDetailPage({ params }: AdminCategoryDetailPageProps) {
  const { categoryId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Review category metadata and all activities assigned to this category."
      title="Category detail"
    >
      <AdminCategoryDetailManager categoryId={categoryId} />
    </ProtectedDashboardPage>
  );
}
