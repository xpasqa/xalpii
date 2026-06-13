"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicActivities,
  getPublicCities,
  type PublicActivity,
  type PublicCity
} from "../../../lib/public-marketplace";
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
  type: "Activity" | "Destination";
};

export function PublicSearchBar({ compact = false, placeholder = "Where are you going?" }: PublicSearchBarProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<PublicActivity[]>([]);
  const [destinations, setDestinations] = useState<PublicCity[]>([]);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadSearchData() {
      try {
        const [nextDestinations, nextActivities] = await Promise.all([
          getPublicCities(),
          getPublicActivities({ limit: 48 })
        ]);

        if (!isActive) return;
        setDestinations(nextDestinations);
        setActivities(nextActivities);
      } catch {
        if (!isActive) return;
        setDestinations([]);
        setActivities([]);
      }
    }

    void loadSearchData();
    return () => {
      isActive = false;
    };
  }, []);

  const results = useMemo(
    () => searchMarketplace(query, destinations, activities),
    [activities, destinations, query]
  );
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

    router.push(routes.activities);
  }

  return (
    <form
      className={[
        "relative z-[70] flex w-full items-center gap-2 bg-white shadow-[0_18px_44px_rgba(0,0,0,0.22)]",
        compact
          ? "h-9 max-w-[420px] rounded-full border border-[#2B2B2B]/10 px-3 shadow-[0_8px_20px_rgba(26,26,26,0.08)]"
          : "max-w-3xl rounded-[14px] p-2"
      ].join(" ")}
      onSubmit={submitSearch}
    >
      <Search className={`${compact ? "size-4" : "ml-4 size-5"} shrink-0 text-travel-muted`} />
      <input
        aria-label="Search destinations or regions"
        autoComplete="off"
        className={[
          "min-w-0 flex-1 bg-transparent font-interface text-travel-dark outline-none placeholder:text-travel-muted/75",
          compact ? "text-[13px] font-normal" : "h-12 text-base font-medium"
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
          compact ? "h-7 rounded-full px-4 text-xs" : "h-12 rounded-[11px] px-7"
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
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-travel-bg"
              key={`${result.type}-${result.href}-${result.label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => goToResult(result)}
              type="button"
            >
              <img
                alt=""
                className="size-9 shrink-0 rounded-[8px] object-cover"
                src={result.imageUrl}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-interface text-sm font-semibold text-travel-dark">
                  {result.label}
                </span>
                <span className="mt-0.5 block truncate font-interface text-[11px] text-travel-muted">
                  {result.meta}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[#FBEAE8] px-2 py-0.5 font-interface text-[9px] font-semibold uppercase tracking-[0.06em] text-travel-primary">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function searchMarketplace(
  rawQuery: string,
  destinations: PublicCity[],
  activities: PublicActivity[]
): SearchResult[] {
  const query = normalizeSearch(rawQuery);
  if (!query) return [];

  const results: SearchResult[] = [];

  destinations.forEach((destination) => {
    const breadcrumb =
      destination.destination?.breadcrumb?.map((item) => item.name).join(" · ") ??
      destination.country;
    const imageUrl =
      destination.imageUrl ??
      destination.imageFile?.url ??
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=75";

    results.push({
      href: routes.city(destination.slug),
      imageUrl,
      label: destination.name,
      meta: breadcrumb,
      priority: scoreMatch(
        query,
        [destination.name, destination.country, breadcrumb, destination.description ?? ""],
        120
      ),
      searchText: [
        destination.name,
        destination.country,
        breadcrumb,
        destination.description ?? ""
      ].join(" "),
      type: "Destination"
    });
  });

  activities.forEach((activity) => {
    const imageUrl =
      activity.media?.find((item) => item.isCover)?.url ??
      activity.media?.[0]?.url ??
      activity.media?.[0]?.file?.url ??
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=75";
    const destinationName = activity.destination?.name ?? activity.city.name;

    results.push({
      href: routes.activity(activity.slug),
      imageUrl,
      label: activity.title,
      meta: `${destinationName} · ${activity.category.name}`,
      priority: scoreMatch(
        query,
        [activity.title, destinationName, activity.city.country, activity.category.name],
        105
      ),
      searchText: [
        activity.title,
        destinationName,
        activity.city.country,
        activity.category.name
      ].join(" "),
      type: "Activity"
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
