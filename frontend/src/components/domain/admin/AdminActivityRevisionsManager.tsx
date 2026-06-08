"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Dialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Select,
  Textarea
} from "../../ui";
import {
  approveAdminActivityRevision,
  getAdminActivityRevision,
  getAdminActivityRevisions,
  rejectAdminActivityRevision
} from "../../../lib/activity-revisions";
import type {
  ActivityRevision,
  ActivityRevisionSnapshot,
  AdminActivityRevisionDetail
} from "../../../lib/activity-revisions";
import { formatDate } from "../../../lib/dates";
import { formatBaseUsd } from "../../../lib/money";
import { routes } from "../../../lib/routes";

const revisionStatuses = ["", "DRAFT", "PENDING_REVIEW", "REJECTED", "APPLIED", "CANCELLED"];

export function AdminActivityRevisionsListManager() {
  const [revisions, setRevisions] = useState<ActivityRevision[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadRevisions();
  }, [status]);

  async function loadRevisions() {
    setError(null);
    setIsLoading(true);

    try {
      setRevisions(await getAdminActivityRevisions({ status: status || undefined }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load revisions");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Activity change requests</CardTitle>
            <CardDescription>
              Review partner revisions before they update live published marketplace listings.
            </CardDescription>
          </div>
          <Select className="w-full md:w-60" onChange={(event) => setStatus(event.target.value)} value={status}>
            {revisionStatuses.map((item) => (
              <option key={item || "all"} value={item}>
                {item ? revisionLabel(item as ActivityRevision["status"]) : "All statuses"}
              </option>
            ))}
          </Select>
        </CardHeader>
      </Card>

      {isLoading ? <LoadingState label="Loading change requests" /> : null}
      {error ? <ErrorState description={error} title="Unable to load change requests" /> : null}
      {!isLoading && revisions.length === 0 ? (
        <EmptyState
          description="Submitted revisions from partners will appear here."
          title="No change requests"
        />
      ) : null}
      {!isLoading && revisions.length ? (
        <DataTable
          columns={[
            {
              cell: (revision) => (
                <div>
                  <p className="font-semibold text-travel-dark">
                    {revision.activity?.title ?? revision.snapshot.activity.title}
                  </p>
                  <p className="text-xs text-travel-muted">{revision.activity?.slug}</p>
                </div>
              ),
              header: "Activity",
              key: "activity"
            },
            {
              cell: (revision) => revision.partner?.businessName ?? "Unknown partner",
              header: "Partner",
              key: "partner"
            },
            {
              cell: (revision) => (
                <Badge variant={revisionVariant(revision.status)}>{revisionLabel(revision.status)}</Badge>
              ),
              header: "Status",
              key: "status"
            },
            {
              cell: (revision) => revision.submittedAt ? formatDate(revision.submittedAt) : "-",
              header: "Submitted",
              key: "submitted"
            },
            {
              cell: (revision) => formatDate(revision.updatedAt),
              header: "Updated",
              key: "updated"
            },
            {
              align: "right",
              cell: (revision) => (
                <ButtonCTA
                  href={routes.adminActivityRevisionReview(revision.id)}
                  size="sm"
                  variant="outline"
                >
                  Review
                </ButtonCTA>
              ),
              header: "Actions",
              key: "actions"
            }
          ]}
          getRowKey={(revision) => revision.id}
          rows={revisions}
        />
      ) : null}
    </div>
  );
}

export function AdminActivityRevisionDetailManager({ revisionId }: { revisionId: string }) {
  const [detail, setDetail] = useState<AdminActivityRevisionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    void loadDetail();
  }, [revisionId]);

  async function loadDetail() {
    setError(null);
    setIsLoading(true);

    try {
      setDetail(await getAdminActivityRevision(revisionId));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load revision");
    } finally {
      setIsLoading(false);
    }
  }

  async function approveRevision() {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await approveAdminActivityRevision(revisionId);
      setSuccess("Revision approved and applied to the live activity.");
      await loadDetail();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to approve revision");
    } finally {
      setIsSaving(false);
    }
  }

  async function rejectRevision() {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await rejectAdminActivityRevision(revisionId, rejectionReason);
      setRejectOpen(false);
      setRejectionReason("");
      setSuccess("Revision returned to partner for changes.");
      await loadDetail();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to reject revision");
    } finally {
      setIsSaving(false);
    }
  }

  const proposedFromPrice = useMemo(
    () => (detail ? lowestSnapshotPrice(detail.snapshot) : null),
    [detail]
  );

  if (isLoading) {
    return <LoadingState label="Loading revision review" />;
  }

  if (!detail) {
    return <ErrorState description={error ?? "Revision not found"} title="Revision unavailable" />;
  }

  const canReview = detail.status === "PENDING_REVIEW";

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={revisionVariant(detail.status)}>{revisionLabel(detail.status)}</Badge>
              <Badge variant="success">Live activity protected</Badge>
            </div>
            <CardTitle>{detail.snapshot.activity.title}</CardTitle>
            <CardDescription>
              {detail.partner?.businessName ?? "Partner"} submitted changes for a published activity.
              Approving applies the snapshot to the live listing.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonCTA
              disabled={!canReview || isSaving}
              leftIcon={<CheckCircle2 className="size-4" />}
              onClick={() => void approveRevision()}
              size="sm"
              type="button"
            >
              Approve & apply
            </ButtonCTA>
            <ButtonCTA
              disabled={!canReview || isSaving}
              leftIcon={<XCircle className="size-4" />}
              onClick={() => setRejectOpen(true)}
              size="sm"
              type="button"
              variant="danger"
            >
              Request revision
            </ButtonCTA>
            <ButtonCTA href={routes.adminActivityRevisions} size="sm" type="button" variant="outline">
              Back
            </ButtonCTA>
          </div>
        </CardHeader>
      </Card>

      {error ? <ErrorState description={error} title="Revision action failed" /> : null}
      {success ? <p className="text-sm font-semibold text-emerald-700">{success}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <SnapshotSummaryCard title="Current live activity" snapshot={detail.liveSnapshot} />
          <SnapshotSummaryCard title="Proposed revision" snapshot={detail.snapshot} emphasized />
          <SnapshotOptionsCard snapshot={detail.snapshot} />
        </div>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Review summary</CardTitle>
              <CardDescription>No public data changes until this is approved.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <StatusLine label="Partner" value={detail.partner?.businessName ?? "Unknown"} />
              <StatusLine label="Status" value={revisionLabel(detail.status)} />
              <StatusLine label="Submitted" value={detail.submittedAt ? formatDate(detail.submittedAt) : "-"} />
              <StatusLine label="Proposed from price" value={proposedFromPrice == null ? "No price" : formatBaseUsd(proposedFromPrice)} />
              {detail.rejectionReason ? (
                <div className="rounded-travel-md border border-red-200 bg-red-50 p-3 text-red-800">
                  <p className="font-semibold">Revision note</p>
                  <p className="mt-1 leading-5">{detail.rejectionReason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog
        description="Tell the partner what must change before this revision can be applied."
        onClose={() => setRejectOpen(false)}
        open={rejectOpen}
        title="Request revision"
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void rejectRevision();
          }}
        >
          <label className="grid gap-2">
            <span className="font-interface text-sm font-semibold text-travel-dark">Revision reason</span>
            <Textarea
              className="min-h-32"
              onChange={(event) => setRejectionReason(event.target.value)}
              required
              value={rejectionReason}
            />
          </label>
          <div className="flex justify-end gap-2 border-t border-[#2B2B2B]/10 pt-4">
            <ButtonCTA onClick={() => setRejectOpen(false)} type="button" variant="ghost">
              Cancel
            </ButtonCTA>
            <ButtonCTA disabled={isSaving || !rejectionReason.trim()} type="submit" variant="danger">
              Request revision
            </ButtonCTA>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function SnapshotSummaryCard({
  emphasized,
  snapshot,
  title
}: {
  emphasized?: boolean;
  snapshot: ActivityRevisionSnapshot;
  title: string;
}) {
  const activity = snapshot.activity;

  return (
    <Card className={emphasized ? "border-travel-primary/40" : undefined}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{activity.slug}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-travel-muted">Title</p>
          <p className="mt-1 font-brand text-xl font-semibold text-travel-dark">{activity.title}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoBlock label="Short description" value={activity.shortDescription} />
          <InfoBlock label="Duration" value={activity.durationLabel ?? "Not provided"} />
          <InfoBlock label="Meeting point" value={activity.meetingPoint ?? "Not provided"} />
          <InfoBlock label="Cancellation" value={activity.cancellationPolicy ?? "Not provided"} />
        </div>
        <InfoBlock label="Description" value={activity.description} />
        <ListPreview label="Highlights" values={toStringArray(activity.highlights)} />
        <div className="grid gap-4 md:grid-cols-2">
          <ListPreview label="Included" values={toStringArray(activity.included)} />
          <ListPreview label="Not included" values={toStringArray(activity.notIncluded)} />
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotOptionsCard({ snapshot }: { snapshot: ActivityRevisionSnapshot }) {
  const options = snapshot.options ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposed package options</CardTitle>
        <CardDescription>Option-level pricing is what checkout will use after approval.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {options.length ? (
          options.map((option) => (
            <div className="rounded-travel-lg border border-[#2B2B2B]/15 p-4" key={option.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-brand text-base font-semibold text-travel-dark">{option.title}</p>
                  <p className="mt-1 text-sm text-travel-muted">
                    {option.availabilityMode === "ALWAYS_AVAILABLE" ? "Always available" : "Scheduled sessions"}
                    {option.durationLabel ? ` · ${option.durationLabel}` : ""}
                  </p>
                </div>
                {option.isDefault ? <Badge variant="info">Default</Badge> : null}
              </div>
              {option.pricingTiers.length ? (
                <div className="mt-4 overflow-hidden rounded-travel-md border border-[#2B2B2B]/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-travel-bg text-xs font-semibold uppercase tracking-[0.08em] text-travel-muted">
                      <tr>
                        <th className="px-3 py-2">Travelers</th>
                        <th className="px-3 py-2">Adult</th>
                        <th className="px-3 py-2">Child</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2B2B2B]/10">
                      {option.pricingTiers.map((tier) => (
                        <tr key={tier.id}>
                          <td className="px-3 py-2">
                            {tier.minTravelers === tier.maxTravelers
                              ? tier.minTravelers
                              : `${tier.minTravelers}-${tier.maxTravelers}`}
                          </td>
                          <td className="px-3 py-2 font-semibold">{formatBaseUsd(tier.adultPriceCents)}</td>
                          <td className="px-3 py-2">
                            {formatBaseUsd(tier.childPriceCents ?? Math.round(tier.adultPriceCents * 0.73))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState description="No package options are included in this revision." title="No options" />
        )}
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-travel-muted">{label}</p>
      <p className="mt-1 text-sm leading-6 text-travel-dark">{value}</p>
    </div>
  );
}

function ListPreview({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-travel-muted">{label}</p>
      {values.length ? (
        <ul className="mt-2 grid gap-2 text-sm text-travel-dark">
          {values.map((value, index) => (
            <li className="rounded-travel-md bg-travel-bg px-3 py-2" key={`${value}-${index}`}>
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-travel-md bg-travel-bg px-3 py-2 text-sm text-travel-muted">
          Not provided
        </p>
      )}
    </div>
  );
}

function revisionVariant(status: ActivityRevision["status"]) {
  if (status === "APPLIED" || status === "APPROVED") return "success";
  if (status === "PENDING_REVIEW") return "warning";
  if (status === "REJECTED") return "danger";
  if (status === "CANCELLED") return "neutral";
  return "info";
}

function revisionLabel(status: ActivityRevision["status"]) {
  if (status === "DRAFT") return "Draft changes";
  if (status === "PENDING_REVIEW") return "Pending change review";
  if (status === "REJECTED") return "Revision requested";
  if (status === "APPLIED") return "Applied";
  if (status === "APPROVED") return "Approved";
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#2B2B2B]/10 py-2 last:border-0">
      <span className="text-travel-muted">{label}</span>
      <span className="font-semibold text-travel-dark">{value}</span>
    </div>
  );
}

function lowestSnapshotPrice(snapshot: ActivityRevisionSnapshot) {
  const optionPrices = (snapshot.options ?? []).flatMap((option) =>
    option.pricingTiers.filter((tier) => tier.isActive).map((tier) => tier.adultPriceCents)
  );

  if (optionPrices.length) {
    return Math.min(...optionPrices);
  }

  return null;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [];
}
