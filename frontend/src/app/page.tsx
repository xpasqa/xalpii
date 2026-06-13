import {
  DestinationActivityRow,
  FeaturedCities,
  HeroSection,
  SiteFooter
} from "../components/domain/public";
import { PublicShell } from "../components/layout";
import {
  getPublicHome,
  mapPublicActivity,
  mapPublicCity
} from "../lib/public-marketplace";

export default async function Home() {
  const { featuredCities, activityRows } = await loadHomeData();

  return (
    <PublicShell>
      <HeroSection />
      <FeaturedCities cities={featuredCities} />
      <div className="pb-5">
        {activityRows.map((row, index) => (
          <DestinationActivityRow
            activities={row.activities}
            destinationName={row.destinationName}
            destinationSlug={row.destinationSlug}
            key={row.destinationId}
            title={rowTitle(index, row.destinationName)}
          />
        ))}
      </div>
      <SiteFooter />
    </PublicShell>
  );
}

async function loadHomeData() {
  try {
    const home = await getPublicHome();

    return {
      featuredCities: home.cities.map(mapPublicCity),
      activityRows: home.activityRows.map((row) => ({
        ...row,
        activities: row.activities.map(mapPublicActivity)
      }))
    };
  } catch {
    return {
      featuredCities: [],
      activityRows: []
    };
  }
}

const rowTitles = [
  "Explore more in",
  "Dive deeper into",
  "Continue your search in",
  "Discover more in",
  "Popular experiences in",
  "More ways to explore"
];

function rowTitle(index: number, destinationName: string) {
  return `${rowTitles[index % rowTitles.length]} ${destinationName}`;
}
