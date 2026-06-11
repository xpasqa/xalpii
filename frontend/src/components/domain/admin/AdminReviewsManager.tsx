"use client";

import { useEffect, useState } from "react";
import { Eye, Search, Star } from "lucide-react";
import {
  adminGetReview,
  adminGetReviews,
  adminUpdateReview,
  adminUpdateReviewMedia,
  reviewErrorMessage,
  type AdminReview,
  type ReviewMediaStatus,
  type ReviewStatus
} from "../../../lib/reviews";
import { formatDate } from "../../../lib/dates";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  Textarea
} from "../../ui";

const statusOptions: Array<{ label: string; value: "" | ReviewStatus }> = [
  { label: "All statuses", value: "" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Hidden", value: "HIDDEN" }
];

export function AdminReviewsManager() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [status, setStatus] = useState<"" | ReviewStatus>("");
  const [featured, setFeatured] = useState("");
  const [rating, setRating] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  async function loadReviews() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await adminGetReviews({
        isFeatured: featured ? featured === "true" : undefined,
        rating: rating ? Number(rating) : undefined,
        search: search.trim() || undefined,
        status: status || undefined
      });
      setReviews(result.items);
    } catch (caughtError) {
      setError(reviewErrorMessage(caughtError, "Unable to load reviews."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openReview(id: string) {
    setIsOpening(true);
    setError(null);
    try {
      setSelectedReview(await adminGetReview(id));
    } catch (caughtError) {
      setError(reviewErrorMessage(caughtError, "Unable to open review."));
    } finally {
      setIsOpening(false);
    }
  }

  const columns = [
    {
      key: "rating",
      header: "Rating",
      cell: (review: AdminReview) => (
        <span className="inline-flex items-center gap-1 font-semibold text-travel-dark">
          <Star className="size-4 fill-travel-rating text-travel-rating" />
          {review.rating}
        </span>
      )
    },
    {
      key: "review",
      header: "Review",
      cell: (review: AdminReview) => (
        <div className="max-w-[320px] whitespace-normal">
          <p className="truncate font-semibold text-travel-dark">
            {review.adminEditedTitle || review.title || "Untitled review"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-travel-muted">
            {review.adminEditedComment || review.comment}
          </p>
        </div>
      )
    },
    {
      key: "activity",
      header: "Activity",
      cell: (review: AdminReview) => (
        <div className="max-w-56 whitespace-normal">
          <p className="font-medium text-travel-dark">{review.activity.title}</p>
          {review.option?.title ? (
            <p className="mt-1 text-xs text-travel-muted">{review.option.title}</p>
          ) : null}
        </div>
      )
    },
    {
      key: "customer",
      header: "Customer",
      cell: (review: AdminReview) => (
        <div>
          <p className="font-medium text-travel-dark">{review.user.fullName}</p>
          <p className="mt-1 text-xs text-travel-muted">{review.user.email}</p>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (review: AdminReview) => <ReviewStatusBadge status={review.status} />
    },
    {
      key: "featured",
      header: "Featured",
      cell: (review: AdminReview) =>
        review.isFeatured ? <Badge variant="info">Featured</Badge> : <span className="text-travel-muted">No</span>
    },
    {
      key: "date",
      header: "Submitted",
      cell: (review: AdminReview) => formatDate(review.submittedAt)
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      cell: (review: AdminReview) => (
        <ButtonCTA
          leftIcon={<Eye className="size-4" />}
          onClick={() => void openReview(review.id)}
          size="sm"
          type="button"
          variant="outline"
        >
          Review
        </ButtonCTA>
      )
    }
  ];

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>
              Manage verified activity reviews before they appear publicly.
            </CardDescription>
          </div>
          <Badge variant="neutral">{reviews.length} shown</Badge>
        </CardHeader>
        <CardContent>
          <form
            className="mb-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_150px_130px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadReviews();
            }}
          >
            <Input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search review, activity, or customer"
              value={search}
            />
            <Select onChange={(event) => setStatus(event.target.value as "" | ReviewStatus)} value={status}>
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setFeatured(event.target.value)} value={featured}>
              <option value="">All reviews</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </Select>
            <Select onChange={(event) => setRating(event.target.value)} value={rating}>
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </Select>
            <ButtonCTA leftIcon={<Search className="size-4" />} type="submit" variant="outline">
              Filter
            </ButtonCTA>
          </form>

          {error ? <ErrorState title="Reviews unavailable" description={error} /> : null}
          {isLoading || isOpening ? <LoadingState label="Loading reviews" /> : null}
          {!isLoading && reviews.length ? (
            <DataTable columns={columns} getRowKey={(review) => review.id} rows={reviews} />
          ) : null}
          {!isLoading && !reviews.length && !error ? (
            <EmptyState title="No reviews found" description="Try changing the moderation filters." />
          ) : null}
        </CardContent>
      </Card>

      <AdminReviewDialog
        onClose={() => setSelectedReview(null)}
        onUpdated={async () => {
          if (selectedReview) setSelectedReview(await adminGetReview(selectedReview.id));
          await loadReviews();
        }}
        review={selectedReview}
      />
    </div>
  );
}

function AdminReviewDialog({
  onClose,
  onUpdated,
  review
}: {
  onClose: () => void;
  onUpdated: () => Promise<void>;
  review: AdminReview | null;
}) {
  const [publicTitle, setPublicTitle] = useState("");
  const [publicComment, setPublicComment] = useState("");
  const [moderationNote, setModerationNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!review) return;
    setPublicTitle(review.adminEditedTitle ?? review.title ?? "");
    setPublicComment(review.adminEditedComment ?? review.comment);
    setModerationNote(review.moderationNote ?? "");
    setError(null);
  }, [review]);

  if (!review) return null;
  const currentReview = review;

  async function updateReview(input: {
    status?: ReviewStatus;
    isFeatured?: boolean;
    includeEdits?: boolean;
  }) {
    setIsSaving(true);
    setError(null);

    try {
      await adminUpdateReview(currentReview.id, {
        ...(input.includeEdits
          ? {
              adminEditedComment: publicComment.trim(),
              adminEditedTitle: publicTitle.trim(),
              moderationNote: moderationNote.trim()
            }
          : moderationNote.trim()
            ? { moderationNote: moderationNote.trim() }
            : {}),
        isFeatured: input.isFeatured,
        status: input.status
      });
      await onUpdated();
    } catch (caughtError) {
      setError(reviewErrorMessage(caughtError, "Unable to update review."));
    } finally {
      setIsSaving(false);
    }
  }

  async function updateMedia(mediaId: string, status: ReviewMediaStatus) {
    setIsSaving(true);
    setError(null);
    try {
      await adminUpdateReviewMedia(currentReview.id, mediaId, { status });
      await onUpdated();
    } catch (caughtError) {
      setError(reviewErrorMessage(caughtError, "Unable to update review photo."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      description={`${review.activity.title} · ${review.user.fullName}`}
      onClose={onClose}
      open
      panelClassName="max-w-5xl"
      title="Review moderation"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <section className="rounded-travel-lg border border-[#2B2B2B]/15 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    className={
                      star <= review.rating
                        ? "size-5 fill-travel-rating text-travel-rating"
                        : "size-5 text-[#C9CDD3]"
                    }
                    key={star}
                  />
                ))}
                <span className="ml-2 font-interface text-sm font-semibold text-travel-dark">
                  {review.rating}/5
                </span>
              </div>
              <ReviewStatusBadge status={review.status} />
            </div>
            <div className="mt-5 grid gap-4">
              <ReadOnlyField label="Original title" value={review.title || "No title supplied"} />
              <ReadOnlyField label="Original comment" value={review.comment} />
            </div>
          </section>

          <section className="rounded-travel-lg border border-[#2B2B2B]/15 p-5">
            <h3 className="font-brand text-base font-semibold text-travel-dark">Public text</h3>
            <p className="mt-1 font-interface text-xs leading-5 text-travel-muted">
              These edits change presentation only. The traveler rating cannot be edited.
            </p>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2">
                <span className="font-interface text-sm font-semibold text-travel-dark">Public title</span>
                <Input
                  maxLength={120}
                  onChange={(event) => setPublicTitle(event.target.value)}
                  value={publicTitle}
                />
              </label>
              <label className="grid gap-2">
                <span className="font-interface text-sm font-semibold text-travel-dark">Public comment</span>
                <Textarea
                  maxLength={5000}
                  onChange={(event) => setPublicComment(event.target.value)}
                  rows={7}
                  value={publicComment}
                />
              </label>
              <label className="grid gap-2">
                <span className="font-interface text-sm font-semibold text-travel-dark">Moderation note</span>
                <Textarea
                  maxLength={1000}
                  onChange={(event) => setModerationNote(event.target.value)}
                  placeholder="Internal reason or context for this moderation decision"
                  rows={3}
                  value={moderationNote}
                />
              </label>
              <ButtonCTA
                isLoading={isSaving}
                onClick={() => void updateReview({ includeEdits: true })}
                type="button"
                variant="outline"
              >
                Save public text
              </ButtonCTA>
            </div>
          </section>

          {review.media.length ? (
            <section className="rounded-travel-lg border border-[#2B2B2B]/15 p-5">
              <h3 className="font-brand text-base font-semibold text-travel-dark">Review photos</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {review.media.map((media) => {
                  const url = media.url ?? media.file?.url;
                  return (
                    <div className="overflow-hidden rounded-travel-md border border-[#2B2B2B]/15" key={media.id}>
                      {url ? <img alt={media.altText ?? ""} className="aspect-video w-full object-cover" src={url} /> : null}
                      <div className="grid gap-3 p-3">
                        <MediaStatusBadge status={media.status ?? "PENDING"} />
                        <div className="flex flex-wrap gap-2">
                          <ButtonCTA onClick={() => void updateMedia(media.id, "APPROVED")} size="sm" type="button" variant="outline">
                            Approve
                          </ButtonCTA>
                          <ButtonCTA onClick={() => void updateMedia(media.id, "REJECTED")} size="sm" type="button" variant="outline">
                            Reject
                          </ButtonCTA>
                          <ButtonCTA onClick={() => void updateMedia(media.id, "HIDDEN")} size="sm" type="button" variant="ghost">
                            Hide
                          </ButtonCTA>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
          {error ? <ErrorState title="Moderation failed" description={error} /> : null}
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-travel-lg border border-[#2B2B2B]/15 bg-[#F8F9FB] p-5">
            <h3 className="font-brand text-base font-semibold text-travel-dark">Review context</h3>
            <div className="mt-4 grid gap-3">
              <ContextLine label="Customer" value={review.user.fullName} />
              <ContextLine label="Email" value={review.user.email} />
              <ContextLine label="Booking" value={review.booking.id.slice(0, 8)} />
              <ContextLine label="Booking status" value={formatStatus(review.booking.status)} />
              <ContextLine label="Activity" value={review.activity.title} />
              <ContextLine label="Package" value={review.option?.title ?? "Standard"} />
              <ContextLine label="Submitted" value={formatDate(review.submittedAt)} />
            </div>
          </section>

          <section className="rounded-travel-lg border border-[#2B2B2B]/15 p-5">
            <h3 className="font-brand text-base font-semibold text-travel-dark">Moderation actions</h3>
            <div className="mt-4 grid gap-2">
              <ButtonCTA
                disabled={review.status === "APPROVED"}
                isLoading={isSaving}
                onClick={() => void updateReview({ includeEdits: true, status: "APPROVED" })}
                type="button"
              >
                Approve with edits
              </ButtonCTA>
              <ButtonCTA
                disabled={review.status !== "APPROVED"}
                onClick={() => void updateReview({ isFeatured: !review.isFeatured })}
                type="button"
                variant="outline"
              >
                {review.isFeatured ? "Unfeature" : "Feature review"}
              </ButtonCTA>
              <ButtonCTA
                onClick={() => void updateReview({ status: "REJECTED" })}
                type="button"
                variant="outline"
              >
                Reject
              </ButtonCTA>
              <ButtonCTA
                onClick={() => void updateReview({ status: "HIDDEN" })}
                type="button"
                variant="ghost"
              >
                Hide review
              </ButtonCTA>
            </div>
          </section>
        </aside>
      </div>
    </Dialog>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-interface text-xs font-semibold uppercase tracking-wide text-travel-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap font-interface text-[14px] leading-6 text-travel-dark">{value}</p>
    </div>
  );
}

function ContextLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-interface text-xs text-travel-muted">{label}</span>
      <span className="max-w-[190px] text-right font-interface text-xs font-semibold text-travel-dark">{value}</span>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const variant =
    status === "APPROVED"
      ? "success"
      : status === "PENDING_REVIEW"
        ? "warning"
        : "danger";
  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function MediaStatusBadge({ status }: { status: ReviewMediaStatus }) {
  const variant =
    status === "APPROVED" ? "success" : status === "PENDING" ? "warning" : "danger";
  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
