import { ApiFetchError, apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { Booking } from "./bookings";

export type ReviewStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "HIDDEN";
export type ReviewMediaStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
export type ReviewSort = "featured" | "newest" | "highest" | "lowest";

export type ReviewMedia = {
  id: string;
  reviewId?: string;
  fileId?: string | null;
  url?: string | null;
  altText?: string | null;
  sortOrder: number;
  status?: ReviewMediaStatus;
  createdAt?: string;
  file?: {
    id: string;
    url?: string | null;
  } | null;
};

export type UserReview = {
  id: string;
  userId: string;
  activityId: string;
  bookingId: string;
  optionId?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  status: ReviewStatus;
  isFeatured: boolean;
  adminEditedTitle?: string | null;
  adminEditedComment?: string | null;
  moderationNote?: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    title: string;
    slug: string;
  };
  booking: {
    id: string;
    status: Booking["status"];
    travelDate?: string | null;
    bookedAt: string;
  };
  option?: {
    id: string;
    title: string;
  } | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  media: ReviewMedia[];
};

export type PublicReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  reviewerName: string;
  reviewerInitials: string;
  submittedAt: string;
  createdAt: string;
  isFeatured: boolean;
  verifiedBooking: true;
  optionTitle?: string | null;
  media: Array<{
    id: string;
    url?: string | null;
    altText?: string | null;
    sortOrder: number;
  }>;
};

export type PublicReviewsResponse = {
  ratingAverage: number;
  reviewCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  featured: PublicReview[];
  reviews: PublicReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};

export type AdminReview = UserReview & {
  approvedAt?: string | null;
  rejectedAt?: string | null;
  hiddenAt?: string | null;
};

export type AdminReviewsResponse = {
  items: AdminReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};

export type ReviewMediaInput = {
  fileId?: string;
  url?: string;
  altText?: string;
  sortOrder?: number;
};

export async function getActivityReviews(
  slug: string,
  params: { page?: number; limit?: number; sort?: ReviewSort } = {}
) {
  return requireData(
    await apiFetch<PublicReviewsResponse>({
      path: `/public/activities/${slug}/reviews${buildQuery(params)}`
    })
  );
}

export async function createReview(input: {
  bookingId: string;
  rating: number;
  title?: string;
  comment: string;
  media?: ReviewMediaInput[];
}) {
  return requireData(
    await authenticatedFetch<{ review: UserReview; message: string }>({
      body: JSON.stringify(input),
      method: "POST",
      path: "/reviews"
    })
  );
}

export async function getMyReviews() {
  return requireData(await authenticatedFetch<UserReview[]>({ path: "/reviews/my" }));
}

export async function getEligibleReviewBookings() {
  return requireData(
    await authenticatedFetch<Booking[]>({ path: "/reviews/eligible-bookings" })
  );
}

export async function adminGetReviews(
  filters: {
    status?: ReviewStatus;
    activityId?: string;
    rating?: number;
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  return requireData(
    await authenticatedFetch<AdminReviewsResponse>({
      path: `/admin/reviews${buildQuery(filters)}`
    })
  );
}

export async function adminGetReview(id: string) {
  return requireData(await authenticatedFetch<AdminReview>({ path: `/admin/reviews/${id}` }));
}

export async function adminUpdateReview(
  id: string,
  input: {
    adminEditedTitle?: string;
    adminEditedComment?: string;
    moderationNote?: string;
    isFeatured?: boolean;
    status?: ReviewStatus;
  }
) {
  return requireData(
    await authenticatedFetch<AdminReview>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: `/admin/reviews/${id}`
    })
  );
}

export async function adminUpdateReviewMedia(
  reviewId: string,
  mediaId: string,
  input: { status?: ReviewMediaStatus; altText?: string }
) {
  return requireData(
    await authenticatedFetch<ReviewMedia>({
      body: JSON.stringify(input),
      method: "PATCH",
      path: `/admin/reviews/${reviewId}/media/${mediaId}`
    })
  );
}

export function reviewErrorMessage(error: unknown, fallback = "Unable to update review") {
  if (error instanceof ApiFetchError) {
    const messages: Record<string, string> = {
      REVIEW_ALREADY_EXISTS: "A review has already been submitted for this booking.",
      REVIEW_BOOKING_NOT_COMPLETED: "You can review this activity after the booking is completed.",
      REVIEW_BOOKING_FORBIDDEN: "This booking does not belong to your account.",
      REVIEW_MEDIA_INVALID: "Review photos must be JPG, PNG, or WebP images.",
      REVIEW_MEDIA_LIMIT: "You can upload up to five review photos.",
      FEATURE_REQUIRES_APPROVED: "Approve the review before featuring it.",
      UNAUTHORIZED: "Your session has expired. Please log in again."
    };

    return (error.error?.code && messages[error.error.code]) || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

async function authenticatedFetch<TData>(options: {
  body?: BodyInit;
  method?: string;
  path: string;
}) {
  const token = getAccessToken();
  if (!token) throw new Error("Missing access token");

  return apiFetch<TData>({
    ...options,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function buildQuery(values: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) throw new Error("API response did not include data");
  return response.data;
}
