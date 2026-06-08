CREATE TYPE "DestinationType" AS ENUM (
  'COUNTRY',
  'REGION',
  'CITY',
  'AREA'
);

CREATE TABLE "destinations" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" "DestinationType" NOT NULL,
  "parent_id" UUID,
  "country_code" TEXT,
  "description" TEXT,
  "image_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");
CREATE INDEX "destinations_parent_id_sort_order_idx" ON "destinations"("parent_id", "sort_order");
CREATE INDEX "destinations_type_is_active_idx" ON "destinations"("type", "is_active");

ALTER TABLE "destinations"
ADD CONSTRAINT "destinations_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "activities" ADD COLUMN "destination_id" UUID;
CREATE INDEX "activities_destination_id_status_idx" ON "activities"("destination_id", "status");

ALTER TABLE "activities"
ADD CONSTRAINT "activities_destination_id_fkey"
FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "destinations" (
  "id",
  "name",
  "slug",
  "type",
  "description",
  "is_active",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  c."country",
  lower(regexp_replace(c."country", '[^a-zA-Z0-9]+', '-', 'g')),
  'COUNTRY'::"DestinationType",
  NULL,
  true,
  min(c."sort_order"),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "cities" c
GROUP BY c."country"
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "destinations" (
  "id",
  "name",
  "slug",
  "type",
  "parent_id",
  "description",
  "is_active",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  c."name",
  c."slug",
  'CITY'::"DestinationType",
  parent."id",
  c."description",
  c."is_active",
  c."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "cities" c
LEFT JOIN "destinations" parent
  ON parent."slug" = lower(regexp_replace(c."country", '[^a-zA-Z0-9]+', '-', 'g'))
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "parent_id" = EXCLUDED."parent_id",
  "description" = EXCLUDED."description",
  "is_active" = EXCLUDED."is_active",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "activities" a
SET "destination_id" = d."id"
FROM "cities" c
JOIN "destinations" d ON d."slug" = c."slug"
WHERE a."city_id" = c."id";
