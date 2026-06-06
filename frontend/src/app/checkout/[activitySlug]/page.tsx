import { ArrowLeft } from "lucide-react";
import { PriceLine, SiteFooter, activityPrice } from "../../../components/domain/public";
import { PublicShell } from "../../../components/layout";
import {
  ButtonCTA,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState
} from "../../../components/ui";
import { getActivityBySlug } from "../../../data/mock-travel";
import { formatMoney } from "../../../lib/money";
import { routes } from "../../../lib/routes";

type CheckoutPageProps = {
  params: Promise<{
    activitySlug: string;
  }>;
};

export default async function CheckoutPlaceholderPage({ params }: CheckoutPageProps) {
  const { activitySlug } = await params;
  const activity = getActivityBySlug(activitySlug);

  if (!activity) {
    return (
      <PublicShell>
        <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <EmptyState
            description="This checkout preview needs an activity from the Sprint 1 mock dataset."
            title="Checkout activity not found"
          />
        </main>
        <SiteFooter />
      </PublicShell>
    );
  }

  const subtotal = activity.price * 2;
  const serviceFee = activity.currency === "IDR" ? 45000 : 600;
  const total = subtotal + serviceFee;

  return (
    <PublicShell>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-16">
        <section>
          <ButtonCTA
            href={routes.activity(activity.slug)}
            leftIcon={<ArrowLeft className="size-4" />}
            size="sm"
            variant="ghost"
          >
            Back to activity
          </ButtonCTA>
          <h1 className="mt-8 max-w-3xl font-brand text-4xl font-bold leading-tight text-travel-dark sm:text-5xl">
            Checkout preview
          </h1>
          <p className="mt-4 max-w-2xl font-interface text-lg leading-8 text-travel-muted">
            Checkout and dummy payment will be implemented in a later sprint.
          </p>

          <Card className="mt-8 shadow-none">
            <CardHeader>
              <CardTitle>Trip details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-travel-md border border-travel-border p-4">
                <p className="font-interface text-xs text-travel-muted">Selected date</p>
                <p className="mt-1 font-interface text-sm font-semibold text-travel-dark">
                  18 July 2026
                </p>
              </div>
              <div className="rounded-travel-md border border-travel-border p-4">
                <p className="font-interface text-xs text-travel-muted">Participants</p>
                <p className="mt-1 font-interface text-sm font-semibold text-travel-dark">
                  2 adults
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="shadow-travel-card">
            <img
              alt={activity.title}
              className="aspect-[4/3] w-full rounded-t-travel-lg object-cover"
              src={activity.imageUrl}
            />
            <CardHeader>
              <p className="font-interface text-sm text-travel-muted">{activity.location}</p>
              <CardTitle>{activity.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PriceLine
                label={`${activityPrice(activity)} x 2 adults`}
                value={formatMoney(subtotal, activity.currency)}
              />
              <PriceLine
                label="Mock service fee"
                value={formatMoney(serviceFee, activity.currency)}
              />
              <div className="border-t border-travel-border pt-4">
                <PriceLine label="Total preview" value={formatMoney(total, activity.currency)} />
              </div>
              <ButtonCTA disabled fullWidth>
                Payment later sprint
              </ButtonCTA>
            </CardContent>
          </Card>
        </aside>
      </main>
      <SiteFooter />
    </PublicShell>
  );
}
