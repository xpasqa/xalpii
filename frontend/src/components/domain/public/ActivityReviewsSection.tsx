"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import {
  getActivityReviews,
  type PublicReview,
  type PublicReviewsResponse,
  type ReviewSort
} from "../../../lib/reviews";
import { EmptyState, ErrorState, LoadingState, Select } from "../../ui";

const sortOptions: Array<{ label: string; value: ReviewSort }> = [
  { label: "Featured", value: "featured" },
  { label: "Most recent", value: "newest" },
  { label: "Highest rated", value: "highest" },
  { label: "Lowest rated", value: "lowest" }
];

export function ActivityReviewsSection({ activitySlug }: { activitySlug: string }) {
  const [data, setData] = useState<PublicReviewsResponse | null>(null);
  const [sort, setSort] = useState<ReviewSort>("featured");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setIsLoading(true);
      setError(null);

      try {
        const nextData = await getActivityReviews(activitySlug, { limit: 20, sort });
        if (active) setData(nextData);
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load reviews");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadReviews();
    return () => {
      active = false;
    };
  }, [activitySlug, sort]);

  return (
    <section className="border-t border-[#2B2B2B]/20 pt-8" id="reviews">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-brand text-xl font-semibold text-travel-dark">Reviews</h2>
          <p className="mt-1 font-interface text-[14px] leading-6 text-travel-dark/75">
            Reviews are from verified Alpii bookings.
          </p>
        </div>
        <label className="grid w-full gap-1.5 sm:w-48">
          <span className="font-interface text-xs font-semibold text-travel-muted">Sort reviews</span>
          <Select onChange={(event) => setSort(event.target.value as ReviewSort)} value={sort}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {isLoading ? <LoadingState label="Loading verified reviews" /> : null}
      {error ? <ErrorState title="Reviews unavailable" description={error} /> : null}

      {!isLoading && !error && data ? (
        data.reviewCount ? (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <ReviewSummary data={data} />
            <div className="grid gap-4">
              {data.reviews.map((review) => (
                <PublicReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No verified reviews yet"
            description="Verified traveler feedback will appear here after moderation."
          />
        )
      ) : null}
    </section>
  );
}

function ReviewSummary({ data }: { data: PublicReviewsResponse }) {
  return (
    <aside className="self-start rounded-travel-lg border border-[#2B2B2B]/15 bg-white p-5">
      <div className="flex items-end gap-2">
        <span className="font-brand text-4xl font-semibold leading-none text-travel-dark">
          {Number(data.ratingAverage).toFixed(1)}
        </span>
        <span className="pb-0.5 font-interface text-sm text-travel-muted">out of 5</span>
      </div>
      <StarRow rating={Math.round(data.ratingAverage)} className="mt-3" />
      <p className="mt-2 font-interface text-sm text-travel-muted">
        Based on {data.reviewCount.toLocaleString()} verified reviews
      </p>
      <div className="mt-5 grid gap-2.5">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = data.distribution[rating as 1 | 2 | 3 | 4 | 5] ?? 0;
          const percentage = data.reviewCount ? (count / data.reviewCount) * 100 : 0;

          return (
            <div className="grid grid-cols-[12px_1fr_28px] items-center gap-2" key={rating}>
              <span className="font-interface text-xs text-travel-muted">{rating}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-[#ECEFF3]">
                <span
                  className="block h-full rounded-full bg-travel-primary"
                  style={{ width: `${percentage}%` }}
                />
              </span>
              <span className="text-right font-interface text-xs text-travel-muted">{count}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-[#2B2B2B]/10 pt-4">
        <CheckCircle2 className="size-4 text-emerald-600" />
        <span className="font-interface text-xs font-semibold text-travel-dark">
          Verified Alpii bookings
        </span>
      </div>
    </aside>
  );
}

function PublicReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="rounded-travel-lg border border-[#2B2B2B]/15 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#FBEAE8] font-interface text-sm font-bold text-travel-primary">
            {review.reviewerInitials}
          </div>
          <div>
            <p className="font-interface text-sm font-semibold text-travel-dark">
              {review.reviewerName}
            </p>
            <p className="font-interface text-xs text-travel-muted">
              {formatReviewDate(review.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {review.isFeatured ? (
            <span className="rounded-full bg-[#FBEAE8] px-2.5 py-1 font-interface text-xs font-semibold text-travel-primary">
              Featured
            </span>
          ) : null}
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-interface text-xs font-semibold text-emerald-700">
            Verified booking
          </span>
        </div>
      </div>

      <StarRow rating={review.rating} className="mt-4" />
      {review.title ? (
        <h3 className="mt-3 font-brand text-base font-semibold text-travel-dark">{review.title}</h3>
      ) : null}
      {review.optionTitle ? (
        <p className="mt-1 font-interface text-xs font-medium text-travel-muted">
          Package: {review.optionTitle}
        </p>
      ) : null}
      <p className="mt-3 font-interface text-[14px] leading-6 text-travel-dark/85">
        {review.comment}
      </p>

      {review.media.length ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {review.media.map((media) =>
            media.url ? (
              <img
                alt={media.altText ?? "Traveler review photo"}
                className="aspect-square w-full rounded-travel-md object-cover"
                key={media.id}
                src={media.url}
              />
            ) : null
          )}
        </div>
      ) : null}
    </article>
  );
}

function StarRow({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          className={
            star <= rating
              ? "size-4 fill-travel-rating text-travel-rating"
              : "size-4 text-[#C9CDD3]"
          }
          key={star}
        />
      ))}
    </div>
  );
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
