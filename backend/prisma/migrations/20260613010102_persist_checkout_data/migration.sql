-- CreateEnum
CREATE TYPE "PickupChoice" AS ENUM ('PICKUP', 'MEET_AT_POINT');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "pickup_address" TEXT,
ADD COLUMN     "pickup_choice" "PickupChoice",
ADD COLUMN     "special_requirements" TEXT;

-- CreateTable
CREATE TABLE "booking_contacts" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_travelers" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "participant_type" "ParticipantType" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_travelers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_contacts_booking_id_key" ON "booking_contacts"("booking_id");

-- CreateIndex
CREATE INDEX "booking_travelers_booking_id_sort_order_idx" ON "booking_travelers"("booking_id", "sort_order");

-- AddForeignKey
ALTER TABLE "booking_contacts" ADD CONSTRAINT "booking_contacts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_travelers" ADD CONSTRAINT "booking_travelers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
