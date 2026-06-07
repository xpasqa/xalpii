import { AdminCityDetailManager } from "../../../../../components/domain/admin/AdminCityDetailManager";
import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";

type AdminCityDetailPageProps = {
  params: Promise<{
    cityId: string;
  }>;
};

export default async function AdminCityDetailPage({ params }: AdminCityDetailPageProps) {
  const { cityId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Review city metadata and all activities assigned to this destination."
      title="City detail"
    >
      <AdminCityDetailManager cityId={cityId} />
    </ProtectedDashboardPage>
  );
}
