"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { createReview, reviewErrorMessage, type UserReview } from "../../../lib/reviews";
import { requestPresignedUpload, uploadFileToPresignedUrl } from "../../../lib/files";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  Textarea
} from "../../ui";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

type PendingPhoto = {
  file: File;
  previewUrl: string;
};

export function UserReviewCard({
  bookingId,
  existingReview,
  onSubmitted
}: {
  bookingId: string;
  existingReview?: UserReview | null;
  onSubmitted: (review: UserReview) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PendingPhoto[]>([]);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    },
    []
  );

  if (existingReview) {
    return <SubmittedReviewSummary review={existingReview} />;
  }

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(null);

    if (photos.length + selected.length > 5) {
      setError("You can upload up to five review photos.");
      return;
    }

    const invalid = selected.find(
      (file) => !allowedImageTypes.has(file.type) || file.size > maxFileSize
    );
    if (invalid) {
      setError("Photos must be JPG, PNG, or WebP and no larger than 5MB each.");
      return;
    }

    setPhotos((current) => [
      ...current,
      ...selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
    ]);
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      URL.revokeObjectURL(current[index].previewUrl);
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!rating) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }
    if (comment.trim().length < 20) {
      setError("Tell travelers a little more. Your review must be at least 20 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const media = [];
      for (let index = 0; index < photos.length; index += 1) {
        const photo = photos[index];
        const presign = await requestPresignedUpload({
          mimeType: photo.file.type,
          originalName: photo.file.name,
          purpose: "REVIEW_IMAGE",
          sizeBytes: photo.file.size,
          visibility: "PUBLIC"
        });
        await uploadFileToPresignedUrl(presign.uploadUrl, photo.file);
        media.push({
          altText: `Traveler review photo ${index + 1}`,
          fileId: presign.fileAsset.id,
          sortOrder: index,
          url: presign.publicUrl ?? presign.fileAsset.url ?? undefined
        });
      }

      const result = await createReview({
        bookingId,
        comment: comment.trim(),
        media,
        rating,
        title: title.trim() || undefined
      });
      setSuccessMessage(result.message);
      onSubmitted(result.review);
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPhotos([]);
    } catch (caughtError) {
      setError(reviewErrorMessage(caughtError, "Unable to submit your review."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a review</CardTitle>
        <CardDescription>
          Share an honest review from your completed Alpii booking. Reviews appear publicly after moderation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={submit}>
          <fieldset className="grid gap-2">
            <legend className="font-interface text-sm font-semibold text-travel-dark">
              Overall rating <span className="text-travel-primary">*</span>
            </legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  className="rounded-travel-md p-1 transition hover:bg-[#FFF7E6]"
                  key={star}
                  onClick={() => setRating(star)}
                  type="button"
                >
                  <Star
                    className={
                      star <= rating
                        ? "size-7 fill-travel-rating text-travel-rating"
                        : "size-7 text-[#C9CDD3]"
                    }
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2">
            <span className="font-interface text-sm font-semibold text-travel-dark">
              Review title <span className="font-normal text-travel-muted">(optional)</span>
            </span>
            <Input
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Summarize your experience"
              value={title}
            />
          </label>

          <label className="grid gap-2">
            <span className="font-interface text-sm font-semibold text-travel-dark">
              Your review <span className="text-travel-primary">*</span>
            </span>
            <Textarea
              maxLength={5000}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What stood out, and what should future travelers know?"
              rows={6}
              value={comment}
            />
            <span className="font-interface text-xs text-travel-muted">
              Minimum 20 characters · {comment.trim().length}/5000
            </span>
          </label>

          <div className="grid gap-3">
            <div>
              <p className="font-interface text-sm font-semibold text-travel-dark">Photos</p>
              <p className="mt-1 font-interface text-xs text-travel-muted">
                Up to 5 JPG, PNG, or WebP photos. Maximum 5MB each.
              </p>
            </div>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              multiple
              onChange={selectPhotos}
              ref={fileInputRef}
              type="file"
            />
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div className="group relative size-28 overflow-hidden rounded-travel-md" key={photo.previewUrl}>
                  <img alt="" className="size-full object-cover" src={photo.previewUrl} />
                  <button
                    aria-label="Remove photo"
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white text-travel-dark shadow"
                    onClick={() => removePhoto(index)}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {photos.length < 5 ? (
                <button
                  className="flex size-28 flex-col items-center justify-center gap-2 rounded-travel-md border border-dashed border-[#2B2B2B]/30 bg-[#F8F9FB] font-interface text-xs font-semibold text-travel-muted transition hover:border-travel-primary hover:text-travel-primary"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <ImagePlus className="size-5" />
                  Add photos
                </button>
              ) : null}
            </div>
          </div>

          {error ? <ErrorState title="Review not submitted" description={error} /> : null}
          {successMessage ? (
            <div className="rounded-travel-md bg-emerald-50 p-4 font-interface text-sm text-emerald-800">
              {successMessage}
            </div>
          ) : null}
          <div>
            <ButtonCTA disabled={!rating || comment.trim().length < 20} isLoading={isSubmitting} type="submit">
              Submit review
            </ButtonCTA>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmittedReviewSummary({ review }: { review: UserReview }) {
  const statusVariant =
    review.status === "APPROVED"
      ? "success"
      : review.status === "PENDING_REVIEW"
        ? "warning"
        : "danger";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Your review</CardTitle>
            <CardDescription>
              {review.status === "PENDING_REVIEW"
                ? "Your review has been submitted and will appear after moderation."
                : "This booking already has a verified review."}
            </CardDescription>
          </div>
          <Badge variant={statusVariant}>{formatReviewStatus(review.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              className={
                star <= review.rating
                  ? "size-4 fill-travel-rating text-travel-rating"
                  : "size-4 text-[#C9CDD3]"
              }
              key={star}
            />
          ))}
        </div>
        {review.title ? (
          <p className="font-brand text-base font-semibold text-travel-dark">{review.title}</p>
        ) : null}
        <p className="font-interface text-[14px] leading-6 text-travel-dark/85">{review.comment}</p>
        {review.status === "REJECTED" && review.moderationNote ? (
          <div className="rounded-travel-md bg-red-50 p-3 font-interface text-sm text-red-800">
            Moderation note: {review.moderationNote}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatReviewStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
