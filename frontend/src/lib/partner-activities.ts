import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { FileAsset } from "./files";
import type { ActivityPricingTier, PricingMode } from "./activity-pricing";

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

export type LookupDestination = {
  id: string;
  name: string;
  slug: string;
  type: "COUNTRY" | "REGION" | "CITY" | "AREA";
  parentId?: string | null;
  isActive: boolean;
  breadcrumb?: Array<{
    id: string;
    name: string;
    slug: string;
    type: "COUNTRY" | "REGION" | "CITY" | "AREA";
  }>;
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

export type PartnerActivityPricingTier = ActivityPricingTier & {
  id: string;
  activityId: string;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityMode = "SCHEDULED_SESSIONS" | "ALWAYS_AVAILABLE";

export type PartnerActivityPricingConfig = {
  pricingMode: PricingMode;
  pricing: PartnerActivityPricing[];
  pricingTiers: PartnerActivityPricingTier[];
};

export type PartnerActivityAvailability = {
  id: string;
  activityId: string;
  optionId?: string | null;
  startDateTime: string;
  endDateTime?: string | null;
  capacity?: number | null;
  bookedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerActivityOptionPricingTier = ActivityPricingTier & {
  id: string;
  optionId: string;
  createdAt: string;
  updatedAt: string;
};

export type PartnerActivityOption = {
  id: string;
  activityId: string;
  title: string;
  slug: string;
  description?: string | null;
  durationLabel?: string | null;
  meetingPoint?: string | null;
  meetingTimes?: string[] | null;
  availabilityMode: AvailabilityMode;
  availableDays?: string[] | null;
  dailyCapacity?: number | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  pricingTiers: PartnerActivityOptionPricingTier[];
  availability: PartnerActivityAvailability[];
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
  destinationId?: string | null;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ActivityStatus;
  pricingMode: PricingMode;
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
  destination?: LookupDestination | null;
  category: LookupCategory;
  media: PartnerActivityMedia[];
  pricing: PartnerActivityPricing[];
  pricingTiers: PartnerActivityPricingTier[];
  availability?: PartnerActivityAvailability[];
  options?: PartnerActivityOption[];
  revisions?: Array<{
    id: string;
    status: "DRAFT" | "PENDING_REVIEW" | "REJECTED" | "APPROVED" | "APPLIED" | "CANCELLED";
    rejectionReason?: string | null;
    submittedAt?: string | null;
    updatedAt: string;
  }>;
};

export type PartnerActivityInput = {
  title: string;
  slug?: string;
  cityId?: string;
  destinationId?: string;
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
  pricingMode?: PricingMode;
  currency: string;
  priceCents?: number;
  priceType?: string;
  isActive?: boolean;
  tiers?: Array<{
    minTravelers: number;
    maxTravelers: number;
    adultPriceCents: number;
    childPriceCents?: number;
    childAllowed?: boolean;
    childDiscountPercent?: number;
    isActive?: boolean;
  }>;
};

export type PartnerAvailabilityInput = {
  startDateTime: string;
  endDateTime?: string;
  capacity?: number;
  isActive?: boolean;
};

export type PartnerActivityOptionInput = {
  title: string;
  slug?: string;
  description?: string;
  durationLabel?: string;
  meetingPoint?: string;
  meetingTimes?: string[];
  availabilityMode?: AvailabilityMode;
  availableDays?: string[];
  dailyCapacity?: number;
  isActive?: boolean;
  sortOrder?: number;
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
    await authenticatedFetch<PartnerActivityPricingConfig>({
      body: JSON.stringify(input),
      method: "PUT",
      path: `/partner/activities/${id}/pricing`
    })
  );
}

export async function getPartnerActivityPricing(id: string) {
  return requireData(
    await authenticatedFetch<PartnerActivityPricingConfig>({
      path: `/partner/activities/${id}/pricing`
    })
  );
}

export async function getPartnerActivityOptions(id: string) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption[]>({
      path: `/partner/activities/${id}/options`
    })
  );
}

export async function createPartnerActivityOption(id: string, input: PartnerActivityOptionInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/partner/activities/${id}/options`
    })
  );
}

export async function updatePartnerActivityOption(
  id: string,
  optionId: string,
  input: Partial<PartnerActivityOptionInput>
) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: `/partner/activities/${id}/options/${optionId}`
    })
  );
}

export async function deactivatePartnerActivityOption(id: string, optionId: string) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption>({
      method: "DELETE",
      path: `/partner/activities/${id}/options/${optionId}`
    })
  );
}

export async function upsertPartnerActivityOptionPricing(
  id: string,
  optionId: string,
  input: {
    currency: string;
    priceType?: string;
    tiers: NonNullable<PartnerPricingInput["tiers"]>;
  }
) {
  return requireData(
    await authenticatedFetch<{ currency: string; pricingTiers: PartnerActivityOptionPricingTier[] }>({
      body: JSON.stringify(input),
      method: "PUT",
      path: `/partner/activities/${id}/options/${optionId}/pricing`
    })
  );
}

export async function createPartnerActivityOptionAvailability(
  id: string,
  optionId: string,
  input: PartnerAvailabilityInput
) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/partner/activities/${id}/options/${optionId}/availability`
    })
  );
}

export async function deactivatePartnerActivityOptionAvailability(
  id: string,
  optionId: string,
  availabilityId: string
) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      method: "DELETE",
      path: `/partner/activities/${id}/options/${optionId}/availability/${availabilityId}`
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

export async function getPartnerLookupDestinations() {
  return requireData(
    await authenticatedFetch<LookupDestination[]>({
      path: "/partner/lookups/destinations"
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
