import {
  DestinationGrid,
  SiteFooter
} from "../../components/domain/public";
import { PublicShell } from "../../components/layout";
import { EmptyState } from "../../components/ui";
import {
  getPublicCities,
  mapPublicCity
} from "../../lib/public-marketplace";

export default async function DestinationsPage() {
  const destinations = await loadDestinations();

  return (
    <PublicShell>
      <main>
        <header className="border-b border-travel-border bg-travel-bg">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="font-interface text-sm font-semibold text-travel-primary">
              Find your next place
            </p>
            <h1 className="mt-2 max-w-3xl font-brand text-3xl font-bold leading-tight text-travel-dark sm:text-4xl">
              All destinations
            </h1>
            <p className="mt-3 max-w-2xl font-interface text-sm leading-6 text-travel-muted sm:text-base">
              Explore every active city and destination with bookable Alpii experiences.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {destinations.length > 0 ? (
            <DestinationGrid cities={destinations} />
          ) : (
            <EmptyState
              description="Active destinations with published activities will appear here."
              title="No destinations available"
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </PublicShell>
  );
}

async function loadDestinations() {
  try {
    const destinations = await getPublicCities();
    return destinations.map(mapPublicCity);
  } catch {
    return [];
  }
}
