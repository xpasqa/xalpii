import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { FileAsset } from "./files";

export type ActivityStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type LookupCity = {
  id: string;
  name: string;
  slug: string;
  country: string;
  isActive: boolean;
};

export type LookupCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type PartnerActivityPricing = {
  id: string;
  activityId: string;
  currency: string;
  priceCents: number;
  priceType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerActivityAvailability = {
  id: string;
  activityId: string;
  startDateTime: string;
  endDateTime?: string | null;
  capacity?: number | null;
  bookedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerActivityMedia = {
  id: string;
  activityId: string;
  fileId?: string | null;
  file?: FileAsset | null;
  url?: string | null;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
};

export type PartnerActivity = {
  id: string;
  partnerId: string;
  cityId: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ActivityStatus;
  durationLabel?: string | null;
  meetingPoint?: string | null;
  cancellationPolicy?: string | null;
  importantInfo?: string | null;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary?: unknown;
  ratingAverage: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  city: LookupCity;
  category: LookupCategory;
  media: PartnerActivityMedia[];
  pricing: PartnerActivityPricing[];
  availability?: PartnerActivityAvailability[];
};

export type PartnerActivityInput = {
  title: string;
  slug?: string;
  cityId: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  durationLabel?: string;
  meetingPoint?: string;
  cancellationPolicy?: string;
  importantInfo?: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  itinerary?: unknown;
};

export type PartnerPricingInput = {
  currency: string;
  priceCents: number;
  priceType: string;
  isActive?: boolean;
};

export type PartnerAvailabilityInput = {
  startDateTime: string;
  endDateTime?: string;
  capacity?: number;
  isActive?: boolean;
};

export type PartnerMediaInput = {
  fileAssetId?: string;
  url?: string;
  altText?: string;
  sortOrder?: number;
  isCover?: boolean;
};

export async function getPartnerActivities(query: { status?: string; search?: string } = {}) {
  return requireData(
    await authenticatedFetch<PartnerActivity[]>({
      path: `/partner/activities${buildQuery(query)}`
    })
  );
}

export async function getPartnerActivity(id: string) {
  return requireData(
    await authenticatedFetch<PartnerActivity>({
      path: `/partner/activities/${id}`
    })
  );
}

export async function createPartnerActivity(input: PartnerActivityInput) {
  return requireData(
    await authenticatedFetch<PartnerActivity>({
      body: JSON.stringify(input),
      method: "POST",
      path: "/partner/activities"
    })
  );
}

export async function updatePartnerActivity(id: string, input: Partial<PartnerActivityInput>) {
  return requireData(
    await authenticatedFetch<PartnerActivity>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: `/partner/activities/${id}`
    })
  );
}

export async function submitPartnerActivity(id: string) {
  return requireData(
    await authenticatedFetch<PartnerActivity>({
      method: "POST",
      path: `/partner/activities/${id}/submit`
    })
  );
}

export async function upsertPartnerActivityPricing(id: string, input: PartnerPricingInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityPricing>({
      body: JSON.stringify(input),
      method: "PUT",
      path: `/partner/activities/${id}/pricing`
    })
  );
}

export async function createPartnerActivityAvailability(
  id: string,
  input: PartnerAvailabilityInput
) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/partner/activities/${id}/availability`
    })
  );
}

export async function deactivatePartnerActivityAvailability(id: string, availabilityId: string) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      method: "DELETE",
      path: `/partner/activities/${id}/availability/${availabilityId}`
    })
  );
}

export async function createPartnerActivityMedia(id: string, input: PartnerMediaInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityMedia>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/partner/activities/${id}/media`
    })
  );
}

export async function deletePartnerActivityMedia(id: string, mediaId: string) {
  return requireData(
    await authenticatedFetch<PartnerActivityMedia>({
      method: "DELETE",
      path: `/partner/activities/${id}/media/${mediaId}`
    })
  );
}

export async function getPartnerLookupCities() {
  return requireData(
    await authenticatedFetch<LookupCity[]>({
      path: "/partner/lookups/cities"
    })
  );
}

export async function getPartnerLookupCategories() {
  return requireData(
    await authenticatedFetch<LookupCategory[]>({
      path: "/partner/lookups/categories"
    })
  );
}

async function authenticatedFetch<TData>(input: {
  path: string;
  method?: string;
  body?: BodyInit;
}) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Missing access token");
  }

  return apiFetch<TData>({
    ...input,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function buildQuery(query: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.search?.trim()) params.set("search", query.search.trim());
  const value = params.toString();
  return value ? `?${value}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}
