import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { ActivityCard } from "../activity/ActivityCard";
import type { TravelActivity, TravelCity } from "../../../data/mock-travel";
import { categories } from "../../../data/mock-travel";
import { formatMoney } from "../../../lib/money";
import { routes } from "../../../lib/routes";
import { Badge, ButtonCTA, Card, CardContent, CardHeader, CardTitle } from "../../ui";

export function SectionHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-brand text-2xl font-bold text-travel-dark sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 font-interface text-sm leading-6 text-travel-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FeaturedCities({ cities }: { cities: TravelCity[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
      <SectionHeader title="Featured cities" />
      <div className="mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:gap-4 sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cities.map((city) => (
          <Link
            className="group relative w-[48vw] max-w-[176px] shrink-0 snap-start overflow-hidden rounded-travel-lg bg-travel-dark shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(26,26,26,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary/30 focus-visible:ring-offset-2 sm:w-auto sm:max-w-none sm:shrink"
            href={routes.city(city.slug)}
            key={city.slug}
          >
            <div className="aspect-[4/5.2] sm:aspect-[4/5]">
              <img
                alt={`${city.name}, ${city.country}`}
                className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
                src={city.imageUrl}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-b from-black/0 via-black/52 to-black/95" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 text-white sm:p-4">
              <h3 className="font-brand text-[15px] font-bold leading-none text-white sm:text-xl">{city.name}</h3>
              <p className="mt-1 font-interface text-[10px] font-medium text-white/82 sm:text-xs">
                {city.activityCount} Activities
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DestinationGrid({ cities }: { cities: TravelCity[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cities.map((city) => (
        <Link
          className="group relative min-h-[300px] overflow-hidden rounded-travel-lg bg-travel-dark shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(26,26,26,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary/30 focus-visible:ring-offset-2"
          href={routes.city(city.slug)}
          key={city.slug}
        >
          <img
            alt={`${city.name}, ${city.country}`}
            className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
            src={city.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/90" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="font-interface text-xs font-semibold uppercase tracking-[0.08em] text-white/72">
              {city.country}
            </p>
            <h2 className="mt-1 font-brand text-2xl font-bold leading-tight text-white">
              {city.name}
            </h2>
            <p className="mt-1 font-interface text-sm font-medium text-white/82">
              {city.activityCount} {city.activityCount === 1 ? "activity" : "activities"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CategoryChips() {
  return (
    <section className="border-y border-travel-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <CategoryTags />
      </div>
    </section>
  );
}

export function ActivityGrid({
  activities,
  title,
  description,
  showCategories = false
}: {
  activities: TravelActivity[];
  title?: string;
  description?: string;
  showCategories?: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
      {title ? (
        <SectionHeader
          action={showCategories ? <CategoryTags compact /> : undefined}
          description={description}
          title={title}
        />
      ) : null}
      <div
        className={
          title
            ? "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }
      >
        {activities.map((activity) => (
          <ActivityCard
            badge={activity.badge}
            category={activity.category}
            currency={activity.currency}
            href={routes.activity(activity.slug)}
            id={activity.id}
            imageUrl={activity.imageUrl}
            key={activity.id}
            location={activity.location}
            price={activity.price}
            rating={activity.rating}
            reviewCount={activity.reviewCount}
            title={activity.title}
          />
        ))}
      </div>
    </section>
  );
}

const topTravelTabs = [
  "Top attractions worldwide",
  "Top destinations",
  "Top countries to visit",
  "Top attraction categories"
];

const topTravelLinks = [
  { title: "Siam Park", count: "8 tours & activities" },
  { title: "Colosseum", count: "1,032 tours & activities" },
  { title: "Memorial and Museum A...", count: "117 tours & activities" },
  { title: "Disneyland Paris", count: "33 tours & activities" },
  { title: "Sagrada Familia", count: "350 tours & activities" },
  { title: "Danube River, Hungary", count: "157 tours & activities" },
  { title: "Blue Lagoon, Malta", count: "264 tours & activities" },
  { title: "Seine River", count: "460 tours & activities" },
  { title: "Vatican Museums", count: "469 tours & activities" },
  { title: "Caminito del Rey", count: "59 tours & activities" },
  { title: "Lake Como", count: "530 tours & activities" },
  { title: "Heathrow Airport", count: "163 tours & activities" },
  { title: "Gatwick Airport", count: "63 tours & activities" },
  { title: "Anne Frank House", count: "143 tours & activities" },
  { title: "Eiffel Tower", count: "576 tours & activities" },
  { title: "The Land Of Legends Th...", count: "35 tours & activities" },
  { title: "Louvre Museum", count: "569 tours & activities" },
  { title: "Moulin Rouge", count: "130 tours & activities" },
  { title: "Lake Garda", count: "291 tours & activities" },
  { title: "Warner Bros. Studio Lond...", count: "21 tours & activities" },
  { title: "River Thames", count: "312 tours & activities" },
  { title: "Last Supper", count: "44 tours & activities" },
  { title: "London Eye", count: "257 tours & activities" },
  { title: "Park Guell", count: "96 tours & activities" }
];

export function TopTravelLinksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-travel-border">
        <div className="flex gap-8 overflow-x-auto font-interface text-sm font-semibold text-travel-muted sm:text-base">
          {topTravelTabs.map((tab, index) => (
            <button
              className={[
                "shrink-0 border-b-4 px-1 pb-4 transition hover:text-travel-dark",
                index === 0
                  ? "border-travel-secondary text-travel-dark"
                  : "border-transparent"
              ].join(" ")}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {topTravelLinks.map((item) => (
          <a className="group block" href="/" key={item.title}>
            <p className="truncate font-brand text-base font-semibold text-travel-dark transition group-hover:text-travel-primary">
              {item.title}
            </p>
            <p className="mt-1 font-interface text-sm text-travel-muted">{item.count}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

function CategoryTags({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          className={[
            "rounded-full border border-travel-border bg-white font-interface font-medium text-travel-dark",
            compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
          ].join(" ")}
          key={category}
        >
          {category}
        </span>
      ))}
    </div>
  );
}

export function WhyAlpiiSection() {
  const items = [
    {
      icon: <Compass className="size-5" />,
      title: "Curated for quality",
      description: "Selected experiences with clear details and local context."
    },
    {
      icon: <ShieldCheck className="size-5" />,
      title: "Confident decisions",
      description: "Readable pricing, duration, inclusions, and cancellation notes."
    },
    {
      icon: <Sparkles className="size-5" />,
      title: "Built for operators",
      description: "A public marketplace foundation ready for partner supply later."
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        description="Practical trip details presented with a calmer, more trustworthy commercial rhythm."
        title="Why book with Alpii"
      />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <Card className="shadow-none transition hover:border-travel-primary/20" key={item.title}>
            <CardHeader>
              <div className="mb-4 flex size-10 items-center justify-center rounded-travel-md bg-[#FBEAE8] text-travel-primary">
                {item.icon}
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-interface text-sm leading-6 text-travel-muted">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PartnerCTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-travel-lg border border-travel-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-interface text-sm font-medium text-travel-primary">For local operators</p>
          <h2 className="mt-3 max-w-2xl font-brand text-2xl font-bold leading-tight text-travel-dark sm:text-3xl">
            Bring distinctive local experiences to travelers who are ready to book.
          </h2>
          <p className="mt-3 max-w-2xl font-interface text-sm leading-6 text-travel-muted sm:text-base">
            Partner onboarding and dashboards will arrive in later sprints. This section is a
            visual placeholder for the future partner path.
          </p>
        </div>
        <ButtonCTA href="/" rightIcon={<ArrowRight className="size-4" />} variant="outline">
          Partner flow later
        </ButtonCTA>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-travel-border bg-travel-dark text-white" data-site-footer>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-brand text-2xl font-bold text-white">Alpii</p>
          <p className="mt-3 max-w-sm font-interface text-sm leading-6 text-white/68">
            Curated local experiences for travelers who want less planning and better memories.
          </p>
        </div>
        {[
          ["Explore", "Places to see", "Things to do", "Travel inspiration"],
          ["Company", "About", "Promos", "Partner with us"],
          ["Support", "Help center", "Terms", "Privacy"]
        ].map(([title, ...links]) => (
          <div key={title}>
            <p className="font-interface text-sm font-semibold text-white">{title}</p>
            <div className="mt-3 space-y-2">
              {links.map((link) => (
                <Link
                  className="block font-interface text-sm text-white/62 transition hover:text-white"
                  href={
                    link === "Places to see"
                      ? routes.destinations
                      : link === "Things to do"
                        ? routes.activities
                        : "/"
                  }
                  key={link}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 font-interface text-xs text-white/52 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 Alpii. Mock public visual flow.</p>
          <p>English content only for MVP preview.</p>
        </div>
      </div>
    </footer>
  );
}

export function CityHero({ city }: { city: TravelCity }) {
  return (
    <section className="relative min-h-[46vh] overflow-hidden bg-travel-dark">
      <img
        alt={`${city.name} travel experiences`}
        className="absolute inset-0 size-full object-cover"
        src={city.heroImageUrl}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/18 to-black/38" />
      <div className="relative mx-auto flex min-h-[46vh] max-w-7xl flex-col items-center justify-center px-4 pb-10 pt-24 text-center sm:px-6 lg:px-8">
        <p className="font-interface text-sm font-semibold uppercase tracking-[0.12em] text-white/82">
          {city.region}
        </p>
        <h1 className="mt-3 max-w-4xl font-brand text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[54px]">
          Things to do in {city.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-interface text-base leading-7 text-white/88 sm:text-lg">
          {city.description}
        </p>
      </div>
    </section>
  );
}

export function TrustHighlights() {
  const highlights = ["Curated local hosts", "Clear cancellation policy", "Mock checkout only"];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-travel-lg border border-travel-border bg-travel-bg p-4 sm:grid-cols-3">
        {highlights.map((highlight) => (
          <div className="flex items-center gap-3 rounded-travel-md bg-white p-4" key={highlight}>
            <Check className="size-5 text-travel-primary" />
            <p className="font-interface text-sm font-medium text-travel-dark">{highlight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between font-interface text-sm">
      <span className="text-travel-muted">{label}</span>
      <span className="font-semibold text-travel-dark">{value}</span>
    </div>
  );
}

export function activityPrice(activity: TravelActivity) {
  return formatMoney(activity.price, "USD");
}
