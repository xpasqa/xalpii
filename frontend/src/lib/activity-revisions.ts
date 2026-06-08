import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { AdminActivity } from "./admin-activities";
import type { PartnerActivity, PartnerActivityOption } from "./partner-activities";

export type ActivityRevisionStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "APPLIED"
  | "CANCELLED";

export type ActivityRevisionSnapshot = {
  activity: Partial<PartnerActivity> & {
    categoryId: string;
    cityId: string;
    destinationId?: string | null;
    description: string;
    shortDescription: string;
    slug: string;
    title: string;
  };
  availability?: unknown[];
  media?: unknown[];
  options?: PartnerActivityOption[];
  pricing?: unknown[];
  pricingTiers?: unknown[];
};

export type ActivityRevision = {
  id: string;
  activityId: string;
  partnerId: string;
  status: ActivityRevisionStatus;
  snapshot: ActivityRevisionSnapshot;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  activity?: Pick<AdminActivity, "id" | "title" | "slug" | "status" | "city" | "category">;
  partner?: {
    id: string;
    businessName: string;
    user?: {
      email: string;
      fullName: string;
    };
  };
};

export type AdminActivityRevisionDetail = ActivityRevision & {
  liveSnapshot: ActivityRevisionSnapshot;
};

export async function createPartnerActivityRevision(activityId: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      method: "POST",
      path: `/partner/activities/${activityId}/revisions`
    })
  );
}

export async function getPartnerCurrentActivityRevision(activityId: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision | null>({
      path: `/partner/activities/${activityId}/revisions/current`
    })
  );
}

export async function getPartnerActivityRevision(activityId: string, revisionId: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      path: `/partner/activities/${activityId}/revisions/${revisionId}`
    })
  );
}

export async function updatePartnerActivityRevision(
  activityId: string,
  revisionId: string,
  snapshot: ActivityRevisionSnapshot
) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      body: JSON.stringify({ snapshot }),
      method: "PATCH",
      path: `/partner/activities/${activityId}/revisions/${revisionId}`
    })
  );
}

export async function submitPartnerActivityRevision(activityId: string, revisionId: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      method: "POST",
      path: `/partner/activities/${activityId}/revisions/${revisionId}/submit`
    })
  );
}

export async function cancelPartnerActivityRevision(activityId: string, revisionId: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      method: "POST",
      path: `/partner/activities/${activityId}/revisions/${revisionId}/cancel`
    })
  );
}

export async function getAdminActivityRevisions(query: { status?: string } = {}) {
  return requireData(
    await authenticatedFetch<ActivityRevision[]>({
      path: `/admin/activity-revisions${buildQuery(query)}`
    })
  );
}

export async function getAdminActivityRevision(revisionId: string) {
  return requireData(
    await authenticatedFetch<AdminActivityRevisionDetail>({
      path: `/admin/activity-revisions/${revisionId}`
    })
  );
}

export async function approveAdminActivityRevision(revisionId: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      method: "POST",
      path: `/admin/activity-revisions/${revisionId}/approve`
    })
  );
}

export async function rejectAdminActivityRevision(revisionId: string, rejectionReason: string) {
  return requireData(
    await authenticatedFetch<ActivityRevision>({
      body: JSON.stringify({ rejectionReason }),
      method: "POST",
      path: `/admin/activity-revisions/${revisionId}/reject`
    })
  );
}

function authenticatedFetch<TData>({
  headers,
  ...options
}: Parameters<typeof apiFetch<TData>>[0]) {
  const token = getAccessToken();

  return apiFetch<TData>({
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });
}

function requireData<TData>(response: Awaited<ReturnType<typeof apiFetch<TData>>>) {
  if (response?.data === undefined) {
    throw new Error("API response did not include data");
  }

  return response.data;
}

function buildQuery(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
