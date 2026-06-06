import {
  ActivityGrid,
  FeaturedCities,
  HeroSection,
  SiteFooter,
  TopTravelLinksSection
} from "../components/domain/public";
import { PublicShell } from "../components/layout";
import { cities, getFeaturedActivities } from "../data/mock-travel";

export default function Home() {
  return (
    <PublicShell>
      <HeroSection />
      <FeaturedCities cities={cities} />
      <ActivityGrid
        activities={getFeaturedActivities(12)}
        showCategories
        title="Curated activities"
      />
      <TopTravelLinksSection />
      <SiteFooter />
    </PublicShell>
  );
}
