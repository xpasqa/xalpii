import { EmptyState } from "../../../components/ui";
import {
  ActivityGrid,
  CategoryChips,
  CityHero,
  SiteFooter,
  TrustHighlights
} from "../../../components/domain/public";
import { PublicShell } from "../../../components/layout";
import { getActivitiesByCity, getCityBySlug } from "../../../data/mock-travel";
import {
  getPublicActivities,
  getPublicCity,
  mapPublicActivity,
  mapPublicCity
} from "../../../lib/public-marketplace";

type CityPageProps = {
  params: Promise<{
    citySlug: string;
  }>;
};

export default async function CityPage({ params }: CityPageProps) {
  const { citySlug } = await params;
  const { city, activities } = await loadCityData(citySlug);

  if (!city) {
    return (
      <PublicShell>
        <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <EmptyState
            description="This destination is not in the Sprint 1 mock dataset yet."
            title="City not found"
          />
        </main>
        <SiteFooter />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <CityHero city={city} />
      <CategoryChips />
      <ActivityGrid
        activities={activities}
        description={`Handpicked activities and local experiences in ${city.name}.`}
        title={`Popular in ${city.name}`}
      />
      <TrustHighlights />
      <SiteFooter />
    </PublicShell>
  );
}

async function loadCityData(citySlug: string) {
  try {
    const [publicCity, publicActivities] = await Promise.all([
      getPublicCity(citySlug),
      getPublicActivities({ citySlug })
    ]);

    return {
      city: mapPublicCity(publicCity),
      activities: publicActivities.map(mapPublicActivity)
    };
  } catch {
    const city = getCityBySlug(citySlug);

    return {
      city,
      activities: city ? getActivitiesByCity(city.slug) : []
    };
  }
}
