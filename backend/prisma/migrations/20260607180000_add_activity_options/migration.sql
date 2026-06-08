CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "AvailabilityMode" AS ENUM ('SCHEDULED_SESSIONS', 'ALWAYS_AVAILABLE');

CREATE TABLE "activity_options" (
  "id" UUID NOT NULL,
  "activity_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "duration_label" TEXT,
  "meeting_point" TEXT,
  "availability_mode" "AvailabilityMode" NOT NULL DEFAULT 'SCHEDULED_SESSIONS',
  "available_days" JSONB,
  "daily_capacity" INTEGER,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "activity_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_option_pricing_tiers" (
  "id" UUID NOT NULL,
  "option_id" UUID NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "min_travelers" INTEGER NOT NULL,
  "max_travelers" INTEGER NOT NULL,
  "adult_price_cents" INTEGER NOT NULL,
  "child_price_cents" INTEGER,
  "child_discount_percent" DECIMAL(5,2) DEFAULT 27,
  "price_type" TEXT NOT NULL DEFAULT 'per_person',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "activity_option_pricing_tiers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "activity_availability"
ADD COLUMN "option_id" UUID;

ALTER TABLE "bookings"
ADD COLUMN "option_id" UUID,
ADD COLUMN "travel_date" TIMESTAMP(3);

CREATE UNIQUE INDEX "activity_options_activity_id_slug_key" ON "activity_options"("activity_id", "slug");
CREATE INDEX "activity_options_activity_id_is_active_idx" ON "activity_options"("activity_id", "is_active");
CREATE INDEX "activity_options_activity_id_sort_order_idx" ON "activity_options"("activity_id", "sort_order");
CREATE INDEX "activity_option_pricing_tiers_option_id_is_active_idx" ON "activity_option_pricing_tiers"("option_id", "is_active");
CREATE INDEX "activity_option_pricing_tiers_option_id_min_travelers_max_travelers_idx" ON "activity_option_pricing_tiers"("option_id", "min_travelers", "max_travelers");
CREATE INDEX "activity_availability_option_id_start_date_time_idx" ON "activity_availability"("option_id", "start_date_time");
CREATE INDEX "bookings_option_id_idx" ON "bookings"("option_id");

ALTER TABLE "activity_options"
ADD CONSTRAINT "activity_options_activity_id_fkey"
FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_option_pricing_tiers"
ADD CONSTRAINT "activity_option_pricing_tiers_option_id_fkey"
FOREIGN KEY ("option_id") REFERENCES "activity_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_availability"
ADD CONSTRAINT "activity_availability_option_id_fkey"
FOREIGN KEY ("option_id") REFERENCES "activity_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_option_id_fkey"
FOREIGN KEY ("option_id") REFERENCES "activity_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "activity_options" (
  "id",
  "activity_id",
  "title",
  "slug",
  "description",
  "duration_label",
  "meeting_point",
  "availability_mode",
  "is_default",
  "is_active",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  "activities"."id",
  'Standard experience',
  'standard-experience',
  "activities"."short_description",
  "activities"."duration_label",
  "activities"."meeting_point",
  'SCHEDULED_SESSIONS',
  true,
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "activities"
WHERE NOT EXISTS (
  SELECT 1
  FROM "activity_options"
  WHERE "activity_options"."activity_id" = "activities"."id"
    AND "activity_options"."slug" = 'standard-experience'
);

INSERT INTO "activity_option_pricing_tiers" (
  "id",
  "option_id",
  "currency",
  "min_travelers",
  "max_travelers",
  "adult_price_cents",
  "child_price_cents",
  "child_discount_percent",
  "price_type",
  "is_active",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  "activity_options"."id",
  "activity_pricing_tiers"."currency",
  "activity_pricing_tiers"."min_travelers",
  "activity_pricing_tiers"."max_travelers",
  "activity_pricing_tiers"."adult_price_cents",
  "activity_pricing_tiers"."child_price_cents",
  "activity_pricing_tiers"."child_discount_percent",
  "activity_pricing_tiers"."price_type",
  "activity_pricing_tiers"."is_active",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "activity_pricing_tiers"
JOIN "activity_options"
  ON "activity_options"."activity_id" = "activity_pricing_tiers"."activity_id"
 AND "activity_options"."is_default" = true
WHERE NOT EXISTS (
  SELECT 1
  FROM "activity_option_pricing_tiers"
  WHERE "activity_option_pricing_tiers"."option_id" = "activity_options"."id"
);

UPDATE "activity_availability"
SET "option_id" = "activity_options"."id"
FROM "activity_options"
WHERE "activity_availability"."activity_id" = "activity_options"."activity_id"
  AND "activity_options"."is_default" = true
  AND "activity_availability"."option_id" IS NULL;
