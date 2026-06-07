import { AccountProfileManager } from "../../../components/domain/account/AccountProfileManager";
import { ProtectedDashboardPage } from "../../../components/domain/auth/ProtectedDashboardPage";

export default function DashboardProfilePage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["USER", "PARTNER", "ADMIN", "SUPER_ADMIN"]}
      description="Manage your Alpii account profile."
      title="Profile"
    >
      <AccountProfileManager />
    </ProtectedDashboardPage>
  );
}
