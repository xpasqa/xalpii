import { ProtectedDashboardPage } from "../../../components/domain/auth/ProtectedDashboardPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../../../components/ui";
import { ButtonCTA } from "../../../components/ui/ButtonCTA";
import { routes } from "../../../lib/routes";

export default function PartnerDashboardPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["PARTNER"]}
      description="This is the partner dashboard foundation. Future sprints will add activity submission, bookings, scan, and payouts."
      title="Partner dashboard"
    >
      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Partner workspace</CardTitle>
            <CardDescription>
              Manage your profile and activity drafts. Bookings and payouts are prepared for later sprints.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <ButtonCTA href={routes.partnerActivities}>Manage Activities</ButtonCTA>
            <ButtonCTA href={routes.partnerProfile} variant="outline">Open Profile</ButtonCTA>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {["Draft activities", "Profile readiness", "Review queue"].map((item) => (
            <Card key={item}>
              <CardHeader>
                <CardTitle>{item}</CardTitle>
                <CardDescription>
                  Sprint 7 foundation for partner submission. Admin approval arrives later.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedDashboardPage>
  );
}
