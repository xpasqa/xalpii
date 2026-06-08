CREATE TYPE "ActivityRevisionStatus" AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'APPLIED',
  'CANCELLED'
);

CREATE TABLE "activity_revisions" (
  "id" UUID NOT NULL,
  "activity_id" UUID NOT NULL,
  "partner_id" UUID NOT NULL,
  "status" "ActivityRevisionStatus" NOT NULL DEFAULT 'DRAFT',
  "snapshot" JSONB NOT NULL,
  "rejection_reason" TEXT,
  "submitted_at" TIMESTAMP(3),
  "reviewed_at" TIMESTAMP(3),
  "reviewed_by_id" UUID,
  "applied_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "activity_revisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "activity_revisions_activity_id_status_idx" ON "activity_revisions"("activity_id", "status");
CREATE INDEX "activity_revisions_partner_id_status_idx" ON "activity_revisions"("partner_id", "status");
CREATE INDEX "activity_revisions_status_submitted_at_idx" ON "activity_revisions"("status", "submitted_at");

ALTER TABLE "activity_revisions"
ADD CONSTRAINT "activity_revisions_activity_id_fkey"
FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_revisions"
ADD CONSTRAINT "activity_revisions_partner_id_fkey"
FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_revisions"
ADD CONSTRAINT "activity_revisions_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
