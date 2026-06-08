"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { activities, cities } from "../../../data/mock-travel";
import { routes } from "../../../lib/routes";

type PublicSearchBarProps = {
  compact?: boolean;
  placeholder?: string;
};

type SearchResult = {
  href: string;
  imageUrl: string;
  label: string;
  meta: string;
  priority: number;
  searchText: string;
  type: "Activity" | "Destination" | "Region" | "Category";
};

export function PublicSearchBar({ compact = false, placeholder = "Where are you going?" }: PublicSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => searchMarketplace(query), [query]);
  const showResults = isFocused && query.trim().length > 0 && results.length > 0;

  function goToResult(result: SearchResult) {
    setQuery(result.label);
    setIsFocused(false);
    router.push(result.href);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = results[0];
    if (firstResult) {
      goToResult(firstResult);
      return;
    }

    const fallbackCity = cities[0];
    if (fallbackCity) router.push(routes.city(fallbackCity.slug));
  }

  return (
    <form
      className={[
        "relative z-[70] flex w-full items-center gap-2 bg-white shadow-[0_18px_44px_rgba(0,0,0,0.22)]",
        compact
          ? "h-11 max-w-[500px] rounded-full border border-travel-border px-4 shadow-[0_10px_26px_rgba(26,26,26,0.12)]"
          : "max-w-3xl rounded-[14px] p-2"
      ].join(" ")}
      onSubmit={submitSearch}
    >
      <Search className={`${compact ? "size-5" : "ml-4 size-5"} shrink-0 text-travel-muted`} />
      <input
        aria-label="Search destinations, activities, regions, or categories"
        autoComplete="off"
        className={[
          "min-w-0 flex-1 bg-transparent font-interface text-travel-dark outline-none placeholder:text-travel-muted/75",
          compact ? "text-[15px] font-normal" : "h-12 text-base font-medium"
        ].join(" ")}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        type="search"
        value={query}
      />
      <button
        className={[
          "shrink-0 bg-travel-primary font-interface text-sm font-semibold text-white transition hover:bg-[#A51E14] active:bg-[#8F1A12]",
          compact ? "h-9 rounded-full px-6" : "h-12 rounded-[11px] px-7"
        ].join(" ")}
        type="submit"
      >
        Search
      </button>

      {showResults ? (
        <div
          className={[
            "absolute left-0 right-0 top-[calc(100%+10px)] z-[120] overflow-hidden rounded-travel-lg border border-[#2B2B2B]/15 bg-white text-left shadow-[0_18px_42px_rgba(26,26,26,0.16)]",
            compact ? "text-travel-dark" : "text-travel-dark"
          ].join(" ")}
        >
          {results.slice(0, 6).map((result) => (
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-travel-bg"
              key={`${result.type}-${result.href}-${result.label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => goToResult(result)}
              type="button"
            >
              <img
                alt=""
                className="size-12 shrink-0 rounded-[10px] object-cover"
                src={result.imageUrl}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-interface text-sm font-semibold text-travel-dark">
                  {result.label}
                </span>
                <span className="mt-0.5 block truncate font-interface text-xs text-travel-muted">
                  {result.meta}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[#FBEAE8] px-2.5 py-1 font-interface text-[10px] font-semibold uppercase tracking-[0.06em] text-travel-primary">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function searchMarketplace(rawQuery: string): SearchResult[] {
  const query = normalizeSearch(rawQuery);
  if (!query) return [];

  const results: SearchResult[] = [];

  cities.forEach((city) => {
    results.push({
      href: routes.city(city.slug),
      imageUrl: city.imageUrl,
      label: city.name,
      meta: `${city.country} · ${city.region}`,
      priority: scoreMatch(query, [city.name, city.country, city.region, city.shortDescription], 120),
      searchText: [city.name, city.country, city.region, city.shortDescription].join(" "),
      type: "Destination"
    });
  });

  const regions = new Map<string, { city: (typeof cities)[number]; count: number }>();
  cities.forEach((city) => {
    const current = regions.get(city.region);
    regions.set(city.region, { city: current?.city ?? city, count: (current?.count ?? 0) + 1 });
  });
  regions.forEach((value, region) => {
    results.push({
      href: routes.city(value.city.slug),
      imageUrl: value.city.imageUrl,
      label: region,
      meta: `${value.count} destination${value.count === 1 ? "" : "s"} · starts with ${value.city.name}`,
      priority: scoreMatch(query, [region, value.city.country, value.city.name], 95),
      searchText: [region, value.city.country, value.city.name].join(" "),
      type: "Region"
    });
  });

  activities.forEach((activity) => {
    results.push({
      href: routes.activity(activity.slug),
      imageUrl: activity.imageUrl,
      label: activity.title,
      meta: `${activity.city}, ${activity.country} · ${activity.category}`,
      priority: scoreMatch(
        query,
        [activity.title, activity.city, activity.country, activity.category, activity.location, activity.summary],
        110
      ),
      searchText: [activity.title, activity.city, activity.country, activity.category, activity.location, activity.summary].join(" "),
      type: "Activity"
    });
  });

  const categories = new Map<string, { citySlug: string; count: number }>();
  activities.forEach((activity) => {
    const current = categories.get(activity.category);
    categories.set(activity.category, {
      citySlug: current?.citySlug ?? activity.citySlug,
      count: (current?.count ?? 0) + 1
    });
  });
  categories.forEach((value, category) => {
    results.push({
      href: routes.city(value.citySlug),
      imageUrl: cities.find((city) => city.slug === value.citySlug)?.imageUrl ?? cities[0]?.imageUrl ?? "",
      label: category,
      meta: `${value.count} activity${value.count === 1 ? "" : "ies"}`,
      priority: scoreMatch(query, [category], 90),
      searchText: category,
      type: "Category"
    });
  });

  return results
    .filter((result) => result.priority > 0 || normalizeSearch(result.searchText).includes(query))
    .sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label));
}

function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, " ");
}

function scoreMatch(query: string, fields: string[], base: number) {
  const normalizedFields = fields.map(normalizeSearch);
  let best = 0;

  normalizedFields.forEach((field) => {
    if (!field) return;
    if (field === query) best = Math.max(best, base + 40);
    else if (field.startsWith(query)) best = Math.max(best, base + 25);
    else if (field.includes(query)) best = Math.max(best, base + 10);
    else if (query.split(" ").every((word) => field.includes(word))) best = Math.max(best, base);
  });

  return best;
}
