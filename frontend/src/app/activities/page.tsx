import { ActivityGrid, SiteFooter } from "../../components/domain/public";
import { PublicShell } from "../../components/layout";
import { EmptyState } from "../../components/ui";
import {
  getPublicActivities,
  mapPublicActivity
} from "../../lib/public-marketplace";

export default async function ActivitiesPage() {
  const activities = await loadActivities();

  return (
    <PublicShell>
      <main>
        <header className="border-b border-travel-border bg-travel-bg">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="font-interface text-sm font-semibold text-travel-primary">
              Explore Alpii
            </p>
            <h1 className="mt-2 max-w-3xl font-brand text-3xl font-bold leading-tight text-travel-dark sm:text-4xl">
              All activities
            </h1>
            <p className="mt-3 max-w-2xl font-interface text-sm leading-6 text-travel-muted sm:text-base">
              Browse all published experiences from verified local partners.
            </p>
          </div>
        </header>

        {activities.length > 0 ? (
          <ActivityGrid activities={activities} showCategories />
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
            <EmptyState
              description="Published activities will appear here when they are available."
              title="No activities available"
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </PublicShell>
  );
}

async function loadActivities() {
  try {
    const activities = await getPublicActivities({ limit: 48 });
    return activities.map(mapPublicActivity);
  } catch {
    return [];
  }
}
