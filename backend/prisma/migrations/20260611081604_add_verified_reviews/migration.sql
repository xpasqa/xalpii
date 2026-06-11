/*
  Warnings:

  - You are about to drop the column `is_published` on the `reviews` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[booking_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Made the column `booking_id` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comment` on table `reviews` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReviewMediaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- AlterEnum
ALTER TYPE "PricingMode" ADD VALUE 'TIERED';

-- Verified reviews cannot be recovered safely without a completed booking.
-- Remove legacy/imported rows before enforcing the booking-backed invariant.
DELETE FROM "reviews"
WHERE "booking_id" IS NULL OR "comment" IS NULL;

-- Keep the oldest row if legacy data contains more than one review per booking.
DELETE FROM "reviews"
WHERE "id" IN (
    SELECT "id"
    FROM (
        SELECT
            "id",
            ROW_NUMBER() OVER (
                PARTITION BY "booking_id"
                ORDER BY "created_at" ASC, "id" ASC
            ) AS "duplicate_number"
        FROM "reviews"
    ) AS "ranked_reviews"
    WHERE "duplicate_number" > 1
);

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_booking_id_fkey";

-- DropIndex
DROP INDEX "reviews_activity_id_is_published_idx";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "is_published",
ADD COLUMN     "admin_edited_comment" TEXT,
ADD COLUMN     "admin_edited_title" TEXT,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" UUID,
ADD COLUMN     "hidden_at" TIMESTAMP(3),
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderation_note" TEXT,
ADD COLUMN     "option_id" UUID,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "booking_id" SET NOT NULL,
ALTER COLUMN "comment" SET NOT NULL;

-- CreateTable
CREATE TABLE "review_media" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "file_id" UUID,
    "url" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewMediaStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_media_review_id_status_sort_order_idx" ON "review_media"("review_id", "status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_activity_id_status_is_featured_idx" ON "reviews"("activity_id", "status", "is_featured");

-- CreateIndex
CREATE INDEX "reviews_user_id_status_idx" ON "reviews"("user_id", "status");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "activity_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_media" ADD CONSTRAINT "review_media_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_media" ADD CONSTRAINT "review_media_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "activity_option_pricing_tiers_option_id_min_travelers_max_trave" RENAME TO "activity_option_pricing_tiers_option_id_min_travelers_max_t_idx";
