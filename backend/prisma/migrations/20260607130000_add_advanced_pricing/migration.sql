CREATE TYPE "PricingMode" AS ENUM ('SIMPLE', 'GROUP_TIER');
CREATE TYPE "ParticipantType" AS ENUM ('ADULT', 'CHILD');

ALTER TABLE "activities"
ADD COLUMN "pricing_mode" "PricingMode" NOT NULL DEFAULT 'SIMPLE';

ALTER TABLE "booking_participants"
ADD COLUMN "participant_type" "ParticipantType" NOT NULL DEFAULT 'ADULT';

CREATE TABLE "activity_pricing_tiers" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "min_travelers" INTEGER NOT NULL,
    "max_travelers" INTEGER NOT NULL,
    "adult_price_cents" INTEGER NOT NULL,
    "child_price_cents" INTEGER,
    "child_discount_percent" DECIMAL(5,2) DEFAULT 27,
    "price_type" TEXT NOT NULL DEFAULT 'per_person',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pricing_tiers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activity_pricing_tiers_range_check" CHECK ("min_travelers" >= 1 AND "max_travelers" >= "min_travelers"),
    CONSTRAINT "activity_pricing_tiers_price_check" CHECK ("adult_price_cents" > 0 AND ("child_price_cents" IS NULL OR "child_price_cents" >= 0))
);

CREATE INDEX "activity_pricing_tiers_activity_id_is_active_idx"
ON "activity_pricing_tiers"("activity_id", "is_active");

CREATE INDEX "activity_pricing_tiers_activity_id_min_travelers_max_travel_idx"
ON "activity_pricing_tiers"("activity_id", "min_travelers", "max_travelers");

ALTER TABLE "activity_pricing_tiers"
ADD CONSTRAINT "activity_pricing_tiers_activity_id_fkey"
FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
