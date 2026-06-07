import { ProtectedDashboardPage } from "../../components/domain/auth/ProtectedDashboardPage";

export default function UserDashboardPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["USER"]}
      description="This is the traveler dashboard foundation. Future sprints will add bookings, vouchers, and reviews."
      title="Traveler dashboard"
    />
  );
}
