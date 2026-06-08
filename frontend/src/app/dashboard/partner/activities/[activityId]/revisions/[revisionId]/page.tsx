import { PartnerActivityRevisionManager } from "../../../../../../../components/domain/partner-activities/PartnerActivityManagers";
import { ProtectedDashboardPage } from "../../../../../../../components/domain/auth/ProtectedDashboardPage";

type PartnerActivityRevisionPageProps = {
  params: Promise<{
    activityId: string;
    revisionId: string;
  }>;
};

export default async function PartnerActivityRevisionPage({
  params
}: PartnerActivityRevisionPageProps) {
  const { activityId, revisionId } = await params;

  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="Edit proposed changes without mutating the live public activity."
      title="Activity revision"
    >
      <PartnerActivityRevisionManager activityId={activityId} revisionId={revisionId} />
    </ProtectedDashboardPage>
  );
}
