import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type {
  ActivityStatus,
  LookupCategory,
  LookupCity,
  LookupDestination,
  PartnerActivityInput,
  PartnerAvailabilityInput,
  PartnerActivityAvailability,
  PartnerActivityMedia,
  PartnerActivityOptionInput,
  PartnerActivityPricing,
  PartnerActivityOption,
  PartnerMediaInput,
  PartnerPricingInput
} from "./partner-activities";

export type AdminActivity = {
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
  pricingMode: import("./activity-pricing").PricingMode;
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
  partner: {
    id: string;
    businessName: string;
    status: string;
    user?: {
      email: string;
      fullName: string;
    };
  };
  city: LookupCity;
  destination?: LookupDestination | null;
  category: LookupCategory;
  media: PartnerActivityMedia[];
  pricing: PartnerActivityPricing[];
  pricingTiers: import("./partner-activities").PartnerActivityPricingTier[];
  options?: PartnerActivityOption[];
  availability?: PartnerActivityAvailability[];
  reviews?: Array<{
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    createdAt: string;
  }>;
};

export type AdminActivityQuery = {
  status?: string;
  search?: string;
  cityId?: string;
  destinationId?: string;
  categoryId?: string;
  partnerId?: string;
};

export async function getAdminActivities(query: AdminActivityQuery = {}) {
  return requireData(
    await authenticatedFetch<AdminActivity[]>({
      path: `/admin/activities${buildQuery(query)}`
    })
  );
}

export async function getAdminActivity(id: string) {
  return requireData(
    await authenticatedFetch<AdminActivity>({
      path: `/admin/activities/${id}`
    })
  );
}

export async function updateAdminActivity(id: string, input: Partial<PartnerActivityInput>) {
  return requireData(
    await authenticatedFetch<AdminActivity>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: `/admin/activities/${id}`
    })
  );
}

export async function upsertAdminActivityPricing(id: string, input: PartnerPricingInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityPricing>({
      body: JSON.stringify(input),
      method: "PUT",
      path: `/admin/activities/${id}/pricing`
    })
  );
}

export async function createAdminActivityAvailability(id: string, input: PartnerAvailabilityInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/admin/activities/${id}/availability`
    })
  );
}

export async function createAdminActivityMedia(id: string, input: PartnerMediaInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityMedia>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/admin/activities/${id}/media`
    })
  );
}

export async function createAdminActivityOption(id: string, input: PartnerActivityOptionInput) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/admin/activities/${id}/options`
    })
  );
}

export async function updateAdminActivityOption(
  id: string,
  optionId: string,
  input: Partial<PartnerActivityOptionInput>
) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: `/admin/activities/${id}/options/${optionId}`
    })
  );
}

export async function deactivateAdminActivityOption(id: string, optionId: string) {
  return requireData(
    await authenticatedFetch<PartnerActivityOption>({
      method: "DELETE",
      path: `/admin/activities/${id}/options/${optionId}`
    })
  );
}

export async function upsertAdminActivityOptionPricing(
  id: string,
  optionId: string,
  input: PartnerPricingInput
) {
  return requireData(
    await authenticatedFetch<{ currency: string; pricingTiers: AdminActivity["pricingTiers"] }>({
      body: JSON.stringify(input),
      method: "PUT",
      path: `/admin/activities/${id}/options/${optionId}/pricing`
    })
  );
}

export async function createAdminActivityOptionAvailability(
  id: string,
  optionId: string,
  input: PartnerAvailabilityInput
) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      body: JSON.stringify(input),
      method: "POST",
      path: `/admin/activities/${id}/options/${optionId}/availability`
    })
  );
}

export async function deactivateAdminActivityOptionAvailability(
  id: string,
  optionId: string,
  availabilityId: string
) {
  return requireData(
    await authenticatedFetch<PartnerActivityAvailability>({
      method: "DELETE",
      path: `/admin/activities/${id}/options/${optionId}/availability/${availabilityId}`
    })
  );
}

export async function approveAdminActivity(id: string) {
  return mutateActivity(id, "approve");
}

export async function publishAdminActivity(id: string) {
  return mutateActivity(id, "publish");
}

export async function rejectAdminActivity(id: string, reason: string) {
  return requireData(
    await authenticatedFetch<AdminActivity>({
      body: JSON.stringify({ reason }),
      method: "POST",
      path: `/admin/activities/${id}/reject`
    })
  );
}

export async function requestRevisionAdminActivity(id: string, reason: string) {
  return requireData(
    await authenticatedFetch<AdminActivity>({
      body: JSON.stringify({ reason }),
      method: "POST",
      path: `/admin/activities/${id}/request-revision`
    })
  );
}

export async function archiveAdminActivity(id: string) {
  return mutateActivity(id, "archive");
}

async function mutateActivity(id: string, action: "approve" | "publish" | "archive") {
  return requireData(
    await authenticatedFetch<AdminActivity>({
      method: "POST",
      path: `/admin/activities/${id}/${action}`
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

function buildQuery(query: AdminActivityQuery) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.cityId) params.set("cityId", query.cityId);
  if (query.destinationId) params.set("destinationId", query.destinationId);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.partnerId) params.set("partnerId", query.partnerId);
  const value = params.toString();
  return value ? `?${value}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}
