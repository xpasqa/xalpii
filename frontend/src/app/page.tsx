import {
  ActivityGrid,
  FeaturedCities,
  HeroSection,
  SiteFooter,
  TopTravelLinksSection
} from "../components/domain/public";
import { PublicShell } from "../components/layout";
import {
  getPublicActivities,
  getPublicCities,
  mapPublicActivity,
  mapPublicCity
} from "../lib/public-marketplace";

export default async function Home() {
  const { featuredCities, featuredActivities } = await loadHomeData();

  return (
    <PublicShell>
      <HeroSection />
      <FeaturedCities cities={featuredCities} />
      <ActivityGrid
        activities={featuredActivities}
        showCategories
        title="Curated activities"
      />
      <TopTravelLinksSection />
      <SiteFooter />
    </PublicShell>
  );
}

async function loadHomeData() {
  try {
    const [publicCities, publicActivities] = await Promise.all([
      getPublicCities(),
      getPublicActivities({ limit: 12 })
    ]);

    return {
      featuredCities: publicCities.map(mapPublicCity),
      featuredActivities: publicActivities.map(mapPublicActivity)
    };
  } catch {
    return {
      featuredCities: [],
      featuredActivities: []
    };
  }
}
