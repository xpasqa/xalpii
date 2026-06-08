CREATE TABLE "activity_option_date_inventory" (
  "id" UUID NOT NULL,
  "option_id" UUID NOT NULL,
  "travel_date" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER,
  "booked_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "activity_option_date_inventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "activity_option_date_inventory_option_id_travel_date_key"
ON "activity_option_date_inventory"("option_id", "travel_date");

CREATE INDEX "activity_option_date_inventory_travel_date_idx"
ON "activity_option_date_inventory"("travel_date");

ALTER TABLE "activity_option_date_inventory"
ADD CONSTRAINT "activity_option_date_inventory_option_id_fkey"
FOREIGN KEY ("option_id") REFERENCES "activity_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
