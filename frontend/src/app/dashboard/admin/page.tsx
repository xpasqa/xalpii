import { ProtectedDashboardPage } from "../../../components/domain/auth/ProtectedDashboardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui";
import { routes } from "../../../lib/routes";
import Link from "next/link";

const adminCards = [
  {
    title: "Cities",
    description: "Manage destination master data for marketplace discovery.",
    href: routes.adminCities
  },
  {
    title: "Categories",
    description: "Manage activity categories used for filtering and curation.",
    href: routes.adminCategories
  },
  {
    title: "Activities",
    description: "Review partner submissions, approve, publish, reject, or archive activities.",
    href: routes.adminActivities
  }
];

export default function AdminDashboardPage() {
  return (
    <ProtectedDashboardPage
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      description="Manage marketplace master data and operational workflows."
      title="Admin dashboard"
    >
      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Welcome admin</CardTitle>
            <CardDescription>
              Sprint 8 adds activity curation. Booking, partner payout, and payment operations remain placeholders for later sprints.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {["Cities ready", "Categories ready", "Activity review ready"].map((label, index) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{index < 3 ? "Live" : "Later"}</CardTitle>
                <CardDescription>{label}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link className="text-sm font-semibold text-primary hover:text-primary-dark" href={card.href}>
                  Open {card.title}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedDashboardPage>
  );
}
