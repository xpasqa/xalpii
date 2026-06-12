-- Add option-level meeting time choices, stored as a small JSON array of HH:mm strings.
ALTER TABLE "activity_options" ADD COLUMN "meeting_times" JSONB;

-- Persist the selected meeting time on always-available bookings.
ALTER TABLE "bookings" ADD COLUMN "meeting_time" TEXT;
