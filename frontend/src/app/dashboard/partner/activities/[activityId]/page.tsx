import { ProtectedDashboardPage } from "../../../../../components/domain/auth/ProtectedDashboardPage";
import { PartnerActivityEditManager } from "../../../../../components/domain/partner-activities/PartnerActivityManagers";

type PartnerActivityEditPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function PartnerActivityEditPage({ params }: PartnerActivityEditPageProps) {
  const { activityId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="Edit draft content, pricing, availability, and media before submitting for review."
      title="Edit activity"
    >
      <PartnerActivityEditManager activityId={activityId} />
    </ProtectedDashboardPage>
  );
}
