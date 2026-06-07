import { apiFetch } from "./api";
import type { TravelActivity, TravelCity } from "../data/mock-travel";

const placeholderImage =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85";

type PublicCity = {
  id: string;
  name: string;
  slug: string;
  country: string;
  description?: string | null;
  imageFile?: {
    url?: string | null;
  } | null;
  activityCount?: number;
};

type PublicActivityMedia = {
  id: string;
  url?: string | null;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  file?: {
    url?: string | null;
  } | null;
};

type PublicActivityPricing = {
  id: string;
  currency: string;
  priceCents: number;
  priceType: string;
  isActive: boolean;
};

type PublicActivityAvailability = {
  id: string;
  startDateTime: string;
  endDateTime?: string | null;
  capacity?: number | null;
};

export type PublicActivity = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  durationLabel?: string | null;
  meetingPoint?: string | null;
  cancellationPolicy?: string | null;
  importantInfo?: string | null;
  included?: unknown;
  notIncluded?: unknown;
  highlights?: unknown;
  itinerary?: unknown;
  ratingAverage: string | number;
  reviewCount: number;
  city: PublicCity;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  partner?: {
    businessName?: string | null;
  } | null;
  media?: PublicActivityMedia[];
  pricing?: PublicActivityPricing[];
  availability?: PublicActivityAvailability[];
};

export async function getPublicCities() {
  return requireData(await apiFetch<PublicCity[]>({ path: "/public/cities" }));
}

export async function getPublicCity(slug: string) {
  return requireData(await apiFetch<PublicCity>({ path: `/public/cities/${slug}` }));
}

export async function getPublicActivities(query: {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  limit?: number;
} = {}) {
  return requireData(
    await apiFetch<PublicActivity[]>({
      path: `/public/activities${buildQuery(query)}`
    })
  );
}

export async function getPublicActivity(slug: string) {
  return requireData(await apiFetch<PublicActivity>({ path: `/public/activities/${slug}` }));
}

export function mapPublicCity(city: PublicCity): TravelCity {
  const imageUrl = city.imageFile?.url ?? cityImageBySlug[city.slug] ?? placeholderImage;

  return {
    slug: city.slug,
    name: city.name,
    country: city.country,
    region: regionByCountry[city.country] ?? "Curated destination",
    description:
      city.description ??
      `Discover handpicked local experiences and practical trip details in ${city.name}.`,
    shortDescription:
      city.description ??
      `Curated activities, trusted local context, and clear booking details in ${city.name}.`,
    imageUrl,
    heroImageUrl: imageUrl,
    activityCount: city.activityCount ?? 0
  };
}

export function mapPublicActivity(activity: PublicActivity): TravelActivity {
  const cover = coverImage(activity);
  const gallery = galleryImages(activity, cover);
  const pricing = primaryPricing(activity);
  const importantInfo = toStringList(activity.importantInfo);

  return {
    id: activity.id,
    slug: activity.slug,
    title: activity.title,
    category: activity.category.name,
    citySlug: activity.city.slug,
    city: activity.city.name,
    country: activity.city.country,
    location: `${activity.city.name}, ${activity.city.country}`,
    imageUrl: cover,
    gallery,
    duration: activity.durationLabel ?? "Duration varies",
    rating: Number(activity.ratingAverage || 0),
    reviewCount: activity.reviewCount ?? 0,
    price: pricing?.priceCents ?? 0,
    currency: pricing?.currency ?? "IDR",
    badge: activity.reviewCount > 100 ? "Top rated" : undefined,
    badgeLabel: activity.reviewCount > 100 ? "Popular choice" : "Curated by Alpii",
    providerName: activity.partner?.businessName ?? "Curated by Alpii",
    summary: activity.shortDescription,
    description: activity.description,
    fullDescription: splitParagraphs(activity.description),
    highlights: toStringList(activity.highlights, [
      activity.shortDescription,
      `Explore ${activity.city.name} with trusted local context`
    ]),
    included: toStringList(activity.included, ["Activity host", "Curated experience"]),
    includes: toStringList(activity.included, ["Activity host", "Curated experience"]),
    excluded: toStringList(activity.notIncluded, ["Personal expenses"]),
    notIncluded: toStringList(activity.notIncluded, ["Personal expenses"]),
    meetingPoint: activity.meetingPoint ?? "Meeting point details will be confirmed before travel.",
    importantInfo,
    whatToBring: ["Comfortable shoes", "Water"],
    notAllowed: ["Large luggage", "Smoking indoors"],
    cancellationPolicy:
      activity.cancellationPolicy ?? "Cancel up to 24 hours in advance for a full refund.",
    paymentFlexibility: "Keep your travel plans flexible — book your spot and pay nothing today.",
    durationLabel: activity.durationLabel ?? "Duration varies",
    guideLanguages: ["English"],
    groupType: "Private or small groups available",
    dietaryOptions:
      "Dietary needs can be shared with the activity provider before the experience.",
    itinerary: toItinerary(activity.itinerary, activity)
  };
}

function buildQuery(query: {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (query.citySlug) params.set("citySlug", query.citySlug);
  if (query.categorySlug) params.set("categorySlug", query.categorySlug);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.limit) params.set("limit", String(query.limit));
  const value = params.toString();
  return value ? `?${value}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}

function coverImage(activity: PublicActivity) {
  const media = [...(activity.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return media.find((item) => item.isCover)?.url ?? media[0]?.url ?? media[0]?.file?.url ?? placeholderImage;
}

function galleryImages(activity: PublicActivity, fallback: string) {
  const images = [...(activity.media ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => item.url ?? item.file?.url)
    .filter((url): url is string => Boolean(url));

  if (!images.length) {
    return [fallback, fallback, fallback, fallback, fallback];
  }

  while (images.length < 5) {
    images.push(images[0]);
  }

  return images;
}

function primaryPricing(activity: PublicActivity) {
  return activity.pricing?.find((item) => item.isActive) ?? activity.pricing?.[0];
}

function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function toStringList(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function toItinerary(value: unknown, activity: PublicActivity): TravelActivity["itinerary"] {
  if (Array.isArray(value)) {
    const itinerary: NonNullable<TravelActivity["itinerary"]> = [];

    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : undefined;
      if (!title) continue;

      itinerary.push({
        title,
        subtitle:
          typeof record.subtitle === "string"
            ? record.subtitle
            : `Experience stop in ${activity.city.name}.`,
        durationLabel:
          typeof record.durationLabel === "string" ? record.durationLabel : undefined,
        type: toItineraryType(record.type)
      });
    }

    return itinerary;
  }

  return undefined;
}

function toItineraryType(value: unknown): NonNullable<TravelActivity["itinerary"]>[number]["type"] {
  return value === "start" ||
    value === "stop" ||
    value === "food" ||
    value === "activity" ||
    value === "end"
    ? value
    : "stop";
}

const regionByCountry: Record<string, string> = {
  Indonesia: "Southeast Asia",
  Japan: "East Asia",
  France: "Western Europe",
  Switzerland: "Central Europe",
  "United Arab Emirates": "Middle East",
  "South Africa": "Southern Africa"
};

const cityImageBySlug: Record<string, string> = {
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85",
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=85",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
  zurich: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=85",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
  "cape-town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=85"
};
