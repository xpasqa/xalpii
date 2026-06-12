"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Send,
  XCircle
} from "lucide-react";
import {
  approveAdminActivity,
  archiveAdminActivity,
  createAdminActivityAvailability,
  createAdminActivityMedia,
  createAdminActivityOption,
  createAdminActivityOptionAvailability,
  deactivateAdminActivityOption,
  deactivateAdminActivityOptionAvailability,
  getAdminActivities,
  getAdminActivity,
  publishAdminActivity,
  rejectAdminActivity,
  requestRevisionAdminActivity,
  updateAdminActivity,
  updateAdminActivityOption,
  upsertAdminActivityOptionPricing,
  upsertAdminActivityPricing
} from "../../../lib/admin-activities";
import type { AdminActivity } from "../../../lib/admin-activities";
import { getAdminCategories, getAdminCities } from "../../../lib/admin";
import { requestPresignedUpload, uploadFileToPresignedUrl } from "../../../lib/files";
import type {
  ActivityStatus,
  AvailabilityMode,
  LookupCategory,
  LookupCity,
  PartnerActivityInput,
  PartnerActivityOption,
  PartnerActivityOptionInput
} from "../../../lib/partner-activities";
import { formatDate } from "../../../lib/dates";
import {
  formatBaseUsd,
  parseUsdInputToMinor,
  usdMinorToInput
} from "../../../lib/money";
import { routes } from "../../../lib/routes";
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
  Input,
  LoadingState,
  Select,
  Textarea
} from "../../ui";

const statusOptions: Array<ActivityStatus | ""> = [
  "",
  "DRAFT",
  "PENDING_REVIEW",
  "REVISION_REQUESTED",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED"
];

type ActivityFormState = {
  title: string;
  slug: string;
  cityId: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  durationLabel: string;
  meetingPoint: string;
  cancellationPolicy: string;
  importantInfo: string;
  highlights: string;
  included: string;
  notIncluded: string;
  itinerary: string;
};

type TextArrayField = "highlights" | "included" | "notIncluded";

type TextItemModal = {
  field: TextArrayField;
  index?: number;
  value: string;
} | null;

type ItineraryStop = {
  title: string;
  subtitle: string;
  durationLabel: string;
  type: "start" | "stop" | "food" | "photo" | "end";
};

type ItineraryModal = {
  index?: number;
  value: ItineraryStop;
} | null;

type ReviewActionModal = {
  action: "revision" | "reject";
  reason: string;
} | null;

type PricingTierForm = {
  index?: number;
  minTravelers: string;
  maxTravelers: string;
  adultPrice: string;
  childPrice: string;
  childAllowed: boolean;
  isActive: boolean;
};

type OptionModalState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  durationLabel: string;
  meetingPoint: string;
  meetingTimes: string;
  availabilityMode: AvailabilityMode;
  availableDays: string[];
  dailyCapacity: string;
  isActive: boolean;
  sortOrder: string;
} | null;

type AvailabilityModalState = {
  startDateTime: string;
  endDateTime: string;
  capacity: string;
  isActive: boolean;
} | null;

const emptyItineraryStop: ItineraryStop = {
  durationLabel: "",
  subtitle: "",
  title: "",
  type: "stop"
};

const emptyForm: ActivityFormState = {
  title: "",
  slug: "",
  cityId: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  durationLabel: "",
  meetingPoint: "",
  cancellationPolicy: "",
  importantInfo: "",
  highlights: "",
  included: "",
  notIncluded: "",
  itinerary: ""
};

export function AdminActivitiesManager() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ActivityStatus | "">("");

  async function loadActivities(nextStatus = status, nextSearch = search) {
    setIsLoading(true);
    setError(null);

    try {
      setActivities(await getAdminActivities({ search: nextSearch, status: nextStatus }));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to load admin activities"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadActivities(status, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const columns = [
    {
      key: "title",
      header: "Activity",
      cell: (activity: AdminActivity) => (
        <div className="max-w-sm">
          <p className="truncate font-semibold text-ink">{activity.title}</p>
          <p className="mt-1 truncate text-xs text-muted">{activity.slug}</p>
        </div>
      )
    },
    {
      key: "partner",
      header: "Partner",
      cell: (activity: AdminActivity) => activity.partner.businessName
    },
    {
      key: "destination",
      header: "City / Category",
      cell: (activity: AdminActivity) => (
        <div>
          <p>{activity.city.name}</p>
          <p className="mt-1 text-xs text-muted">{activity.category.name}</p>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (activity: AdminActivity) => <ActivityStatusBadge status={activity.status} />
    },
    {
      key: "price",
      header: "Price",
      cell: (activity: AdminActivity) => formatActivityPrice(activity)
    },
    {
      key: "updated",
      header: "Updated",
      cell: (activity: AdminActivity) => new Date(activity.updatedAt).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      cell: (activity: AdminActivity) => (
        <Link
          className="inline-flex items-center gap-2 font-interface text-sm font-semibold text-travel-primary hover:text-[#8F1A12]"
          href={routes.adminActivityReview(activity.id)}
        >
          <Eye className="size-4" />
          Review
        </Link>
      )
    }
  ];

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
          <CardDescription>
            Review partner submissions and control which experiences can appear publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadActivities(status, search);
              }}
              placeholder="Search title, slug, partner, city, or category"
              value={search}
            />
            <Select
              onChange={(event) => setStatus(event.target.value as ActivityStatus | "")}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? formatStatus(option) : "All status"}
                </option>
              ))}
            </Select>
            <ButtonCTA onClick={() => void loadActivities(status, search)} type="button" variant="outline">
              Search
            </ButtonCTA>
          </div>

          {error ? <ErrorState description={error} title="Activity review error" /> : null}
          {isLoading ? <LoadingState label="Loading activity submissions" /> : null}
          {!isLoading && activities.length === 0 ? (
            <EmptyState
              description="Partner submissions will appear here after they are sent for review."
              title="No activities found"
            />
          ) : null}
          {!isLoading && activities.length > 0 ? (
            <DataTable columns={columns} getRowKey={(activity) => activity.id} rows={activities} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminActivityReviewManager({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [activity, setActivity] = useState<AdminActivity | null>(null);
  const [form, setForm] = useState<ActivityFormState>(emptyForm);
  const [lookups, setLookups] = useState<{ cities: LookupCity[]; categories: LookupCategory[] }>({
    categories: [],
    cities: []
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [textItemModal, setTextItemModal] = useState<TextItemModal>(null);
  const [itineraryModal, setItineraryModal] = useState<ItineraryModal>(null);
  const [reviewActionModal, setReviewActionModal] = useState<ReviewActionModal>(null);
  const [optionModal, setOptionModal] = useState<OptionModalState>(null);
  const [tierModal, setTierModal] = useState<(PricingTierForm & { optionId: string }) | null>(null);
  const [sessionModal, setSessionModal] = useState<(NonNullable<AvailabilityModalState> & { optionId: string }) | null>(null);

  async function loadActivity() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextActivity, cities, categories] = await Promise.all([
        getAdminActivity(activityId),
        getAdminCities({ isActive: "true" }),
        getAdminCategories({ isActive: "true" })
      ]);
      setActivity(nextActivity);
      setForm(activityToForm(nextActivity));
      setLookups({
        categories: categories.map((category) => ({
          id: category.id,
          isActive: category.isActive,
          name: category.name,
          slug: category.slug
        })),
        cities: cities.map((city) => ({
          country: city.country,
          id: city.id,
          isActive: city.isActive,
          name: city.name,
          slug: city.slug
        }))
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load activity");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveActivityInput(input: Partial<PartnerActivityInput>, successMessage: string) {
    if (!activity) return false;

    setIsMutating(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await updateAdminActivity(activity.id, input);
      setActivity(updated);
      setForm(activityToForm(updated));
      setMessage(successMessage);
      return true;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save activity");
      return false;
    } finally {
      setIsMutating(false);
    }
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const didSave = await saveActivityInput(formToInput(form), "Basic details saved.");
    if (didSave) setIsEditing(false);
  }

  useEffect(() => {
    void loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  async function mutate(action: "approve" | "publish" | "archive" | "revision" | "reject", reason = "") {
    if (!activity) return;

    if ((action === "revision" || action === "reject") && !reason.trim()) {
      setError(action === "revision" ? "Revision note is required" : "Reject reason is required");
      return;
    }

    setIsMutating(true);
    setError(null);
    setMessage(null);

    try {
      const nextActivity =
        action === "approve"
          ? await approveAdminActivity(activity.id)
          : action === "publish"
            ? await publishAdminActivity(activity.id)
            : action === "archive"
              ? await archiveAdminActivity(activity.id)
              : action === "revision"
                ? await requestRevisionAdminActivity(activity.id, reason.trim())
                : await rejectAdminActivity(activity.id, reason.trim());

      setActivity(nextActivity);
      setForm(activityToForm(nextActivity));
      setMessage(`Activity ${formatStatus(nextActivity.status).toLowerCase()}.`);
      if (action === "reject" || action === "revision") setReviewActionModal(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update activity");
    } finally {
      setIsMutating(false);
    }
  }

  const coverImage = useMemo(() => {
    const media = activity?.media?.find((item) => item.isCover) ?? activity?.media?.[0];
    return media?.url ?? media?.file?.url;
  }, [activity]);

  if (isLoading) {
    return <LoadingState label="Loading activity review" />;
  }

  if (error && !activity) {
    return <ErrorState description={error} title="Activity review unavailable" />;
  }

  if (!activity) {
    return <EmptyState description="This activity may have been removed." title="Activity not found" />;
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            className="font-interface text-sm font-semibold text-travel-muted hover:text-travel-dark"
            onClick={() => router.push(routes.adminActivities)}
            type="button"
          >
            Back to activity review
          </button>
          <h2 className="mt-3 font-brand text-2xl font-bold text-travel-dark">{activity.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ActivityStatusBadge status={activity.status} />
            <span className="font-interface text-sm text-travel-muted">
              {activity.partner.businessName} · {activity.city.name} · {activity.category.name}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <ButtonCTA
              disabled={isMutating}
              onClick={() => {
                setForm(activityToForm(activity));
                setIsEditing(false);
              }}
              size="sm"
              variant="outline"
            >
              Back to review
            </ButtonCTA>
          ) : (
            <>
              <ButtonCTA
                disabled={isMutating}
                leftIcon={<Pencil className="size-4" />}
                onClick={() => {
                  setForm(activityToForm(activity));
                  setIsEditing(true);
                  setMessage(null);
                  setError(null);
                }}
                size="sm"
                variant="outline"
              >
                Edit
              </ButtonCTA>
              <ButtonCTA
                disabled={isMutating}
                leftIcon={<CheckCircle2 className="size-4" />}
                onClick={() => void mutate("approve")}
                size="sm"
                variant="secondary"
              >
                Approve
              </ButtonCTA>
              <ButtonCTA
                disabled={isMutating}
                leftIcon={<Send className="size-4" />}
                onClick={() => void mutate("publish")}
                size="sm"
              >
                Publish
              </ButtonCTA>
              <ButtonCTA
                disabled={isMutating}
                leftIcon={<Archive className="size-4" />}
                onClick={() => void mutate("archive")}
                size="sm"
                variant="outline"
              >
                Archive
              </ButtonCTA>
            </>
          )}
        </div>
      </div>

      {error ? <ErrorState description={error} title="Review action failed" /> : null}
      {message ? (
        <div className="rounded-travel-lg border border-emerald-200 bg-emerald-50 p-4 font-interface text-sm font-medium text-emerald-800">
          {message}
        </div>
      ) : null}

      {isEditing ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <div className="rounded-travel-lg border border-[#2B2B2B]/15 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-interface text-xs font-semibold uppercase tracking-[0.14em] text-travel-muted">
                    Admin builder
                  </p>
                  <h3 className="mt-2 font-brand text-xl font-semibold text-travel-dark">
                    Edit activity content
                  </h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-travel-muted">
                    Use the same structured activity builder partners use, then return to review for approval actions.
                  </p>
                </div>
                <ButtonCTA
                  onClick={() => {
                    setForm(activityToForm(activity));
                    setIsEditing(false);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Back to review
                </ButtonCTA>
              </div>
            </div>
            <ActivityForm
              error={null}
              form={form}
              isSaving={isMutating}
              lookups={lookups}
              onChange={setForm}
              onSubmit={saveContent}
              submitLabel="Save basic details"
            />
            <AdminRepeatableContentCard
              form={form}
              isSaving={isMutating}
              onAdd={(field) => setTextItemModal({ field, value: "" })}
              onChange={setForm}
              onDelete={(field, index) => {
                const next = removeAt(lines(form[field]), index);
                const nextForm = { ...form, [field]: next.join("\n") };
                setForm(nextForm);
                void saveActivityInput({ [field]: next }, `${formatTextArrayField(field)} saved.`);
              }}
              onEdit={(field, index) =>
                setTextItemModal({ field, index, value: lines(form[field])[index] ?? "" })
              }
            />
            <AdminItineraryEditorCard
              disabled={isMutating}
              items={toItineraryStops(form.itinerary)}
              onAdd={() => setItineraryModal({ value: emptyItineraryStop })}
              onDelete={(index) => {
                const next = removeAt(toItineraryStops(form.itinerary), index);
                const nextForm = { ...form, itinerary: JSON.stringify(next, null, 2) };
                setForm(nextForm);
                void saveActivityInput({ itinerary: next }, "Itinerary saved.");
              }}
              onEdit={(index) =>
                setItineraryModal({
                  index,
                  value: toItineraryStops(form.itinerary)[index] ?? emptyItineraryStop
                })
              }
              onMove={(index, direction) => {
                const next = moveItem(toItineraryStops(form.itinerary), index, direction);
                const nextForm = { ...form, itinerary: JSON.stringify(next, null, 2) };
                setForm(nextForm);
                void saveActivityInput({ itinerary: next }, "Itinerary saved.");
              }}
            />
            <AdminPoliciesCard
              form={form}
              isSaving={isMutating}
              onChange={setForm}
              onSave={() =>
                void saveActivityInput(
                  {
                    cancellationPolicy: form.cancellationPolicy || undefined,
                    importantInfo: form.importantInfo || undefined
                  },
                  "Policies saved."
                )
              }
            />
            <AdminExperienceOptionsSection
              activity={activity}
              disabled={isMutating}
              onAddOption={() =>
                setOptionModal({
                  availabilityMode: "SCHEDULED_SESSIONS",
                  availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                  dailyCapacity: "12",
                  description: "",
                  durationLabel: "",
                  isActive: true,
                  meetingPoint: "",
                  meetingTimes: "07:00, 08:00, 09:00",
                  slug: "",
                  sortOrder: String((activity.options?.length ?? 0) + 1),
                  title: ""
                })
              }
              onEditOption={(option) =>
                setOptionModal({
                  availabilityMode: option.availabilityMode,
                  availableDays: option.availableDays ?? [],
                  dailyCapacity: option.dailyCapacity == null ? "" : String(option.dailyCapacity),
                  description: option.description ?? "",
                  durationLabel: option.durationLabel ?? "",
                  id: option.id,
                  isActive: option.isActive,
                  meetingPoint: option.meetingPoint ?? "",
                  meetingTimes: (option.meetingTimes ?? []).join(", "),
                  slug: option.slug,
                  sortOrder: String(option.sortOrder ?? 0),
                  title: option.title
                })
              }
              onOpenAvailability={(optionId) =>
                setSessionModal({ capacity: "12", endDateTime: "", isActive: true, optionId, startDateTime: "" })
              }
              onOpenPricing={(optionId, tier, index) =>
                setTierModal({
                  adultPrice: usdMinorToInput(tier.adultPriceCents),
                  childAllowed: tier.childPriceCents != null || tier.childDiscountPercent != null,
                  childPrice: tier.childPriceCents == null ? "" : usdMinorToInput(tier.childPriceCents),
                  index,
                  isActive: tier.isActive,
                  maxTravelers: String(tier.maxTravelers),
                  minTravelers: String(tier.minTravelers),
                  optionId
                })
              }
              onUpdated={loadActivity}
            />
            {!(activity.options?.length ?? 0) ? <AdminPricingCard activity={activity} onUpdated={loadActivity} /> : null}
            {!(activity.options?.length ?? 0) ? <AdminAvailabilityCard activity={activity} onUpdated={loadActivity} /> : null}
            <AdminMediaCard activity={activity} onUpdated={loadActivity} />
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <AdminEditStatusPanel
              activity={activity}
              form={form}
              isMutating={isMutating}
              onBackToReview={() => {
                setForm(activityToForm(activity));
                setIsEditing(false);
              }}
            />
          </aside>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <Card>
              {coverImage ? (
                <img
                  alt={activity.title}
                  className="aspect-[16/7] w-full rounded-t-travel-lg object-cover"
                  src={coverImage}
                />
              ) : null}
              <CardHeader>
                <CardTitle>Content review</CardTitle>
                <CardDescription>{activity.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ReviewBlock title="Description">
                  <p>{activity.description}</p>
                </ReviewBlock>
                <div className="grid gap-5 md:grid-cols-2">
                  <ReviewList title="Highlights" items={activity.highlights} />
                  <ReviewList title="Included" items={activity.included} />
                  <ReviewList title="Not included" items={activity.notIncluded} />
                  <ReviewBlock title="Important information">
                    <p>{activity.importantInfo || "No important information provided."}</p>
                  </ReviewBlock>
                </div>
                <ReviewBlock title="Itinerary">
                  <ItineraryTimeline items={toItineraryStops(JSON.stringify(activity.itinerary ?? []))} />
                </ReviewBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience options</CardTitle>
                <CardDescription>Package variants, availability mode, and USD tier pricing.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {activity.options?.length ? (
                  activity.options.map((option) => (
                    <div className="rounded-travel-lg border border-[#2B2B2B]/15 p-4" key={option.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-interface text-sm font-semibold text-travel-dark">{option.title}</p>
                            {option.isDefault ? <Badge variant="info">Default</Badge> : null}
                            <Badge variant={option.isActive ? "success" : "neutral"}>{option.isActive ? "Active" : "Inactive"}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-travel-muted">
                            {option.availabilityMode === "ALWAYS_AVAILABLE" ? "Always available" : "Scheduled sessions"}
                            {option.durationLabel ? ` · ${option.durationLabel}` : ""}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-travel-muted">
                          {option.availabilityMode === "ALWAYS_AVAILABLE"
                            ? `Days: ${(option.availableDays ?? []).join(", ") || "Every day"} · Capacity: ${option.dailyCapacity ?? "Open"}`
                            : `${option.availability.length} sessions`}
                        </p>
                      </div>
                      {option.pricingTiers.length ? (
                        <div className="mt-4 overflow-hidden rounded-travel-md border border-[#2B2B2B]/15">
                          <div className="grid grid-cols-3 gap-2 bg-travel-bg px-3 py-2 text-[11px] font-semibold text-travel-muted">
                            <span>Travelers</span>
                            <span>Adult</span>
                            <span>Child</span>
                          </div>
                          {option.pricingTiers.map((tier) => (
                            <div className="grid grid-cols-3 gap-2 border-t border-[#2B2B2B]/10 px-3 py-2 text-xs" key={tier.id}>
                              <span>{tier.minTravelers === tier.maxTravelers ? tier.minTravelers : `${tier.minTravelers}-${tier.maxTravelers}`}</span>
                              <span>{formatBaseUsd(tier.adultPriceCents)}</span>
                              <span>{formatBaseUsd(tier.childPriceCents ?? Math.round(tier.adultPriceCents * 0.73))}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-travel-muted">No option pricing tiers.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState title="No package options" description="This activity still relies on legacy activity-level pricing." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Images attached by the partner.</CardDescription>
              </CardHeader>
              <CardContent>
                {activity.media.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {activity.media.map((media) => (
                      <div className="overflow-hidden rounded-travel-lg border border-travel-border" key={media.id}>
                        <img
                          alt={media.altText ?? activity.title}
                          className="aspect-[4/3] w-full object-cover"
                          src={media.url ?? media.file?.url ?? ""}
                        />
                        <div className="p-3">
                          <p className="truncate font-interface text-xs text-travel-muted">
                            {media.isCover ? "Cover image" : media.altText ?? "Gallery image"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No media" description="This activity has no attached images yet." />
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Commercial details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailLine
                  label="Pricing model"
                  value={activity.pricingMode === "GROUP_TIER" ? "Group tier pricing" : "Simple per-person"}
                />
                <DetailLine label="Price" value={formatActivityPrice(activity)} />
                {activity.pricingMode === "GROUP_TIER" && activity.pricingTiers.length ? (
                  <div className="overflow-hidden rounded-travel-md border border-[#2B2B2B]/15">
                    <div className="grid grid-cols-3 gap-2 bg-travel-bg px-3 py-2 text-[11px] font-semibold text-travel-muted">
                      <span>Travelers</span>
                      <span>Adult</span>
                      <span>Child</span>
                    </div>
                    {activity.pricingTiers.map((tier) => (
                      <div className="grid grid-cols-3 gap-2 border-t border-[#2B2B2B]/10 px-3 py-2 text-xs" key={tier.id}>
                        <span>{tier.minTravelers === tier.maxTravelers ? tier.minTravelers : `${tier.minTravelers}-${tier.maxTravelers}`}</span>
                        <span>{formatBaseUsd(tier.adultPriceCents)}</span>
                        <span>{formatBaseUsd(tier.childPriceCents ?? Math.round(tier.adultPriceCents * 0.73))}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                <DetailLine label="Duration" value={activity.durationLabel ?? "Not provided"} />
                <DetailLine label="Meeting point" value={activity.meetingPoint ?? "Not provided"} />
                <DetailLine
                  label="Cancellation"
                  value={activity.cancellationPolicy ?? "Not provided"}
                />
                <DetailLine
                  label="Published"
                  value={activity.publishedAt ? new Date(activity.publishedAt).toLocaleString() : "No"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activity.availability?.length ? (
                  activity.availability.map((slot) => (
                    <div className="rounded-travel-md border border-travel-border p-3" key={slot.id}>
                      <p className="font-interface text-sm font-semibold text-travel-dark">
                        {new Date(slot.startDateTime).toLocaleString()}
                      </p>
                      <p className="mt-1 font-interface text-xs text-travel-muted">
                        Capacity {slot.capacity ?? "unlimited"} · Booked {slot.bookedCount}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="font-interface text-sm text-travel-muted">No availability slots yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revision or rejection</CardTitle>
                <CardDescription>
                  Request revision lets the partner edit this activity. Reject is final for this submission.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ButtonCTA
                  disabled={isMutating}
                  fullWidth
                  leftIcon={<Pencil className="size-4" />}
                  onClick={() => setReviewActionModal({ action: "revision", reason: "" })}
                  type="button"
                  variant="outline"
                >
                  Request revision
                </ButtonCTA>
                <ButtonCTA
                  disabled={isMutating}
                  fullWidth
                  leftIcon={<XCircle className="size-4" />}
                  onClick={() => setReviewActionModal({ action: "reject", reason: "" })}
                  type="button"
                  variant="danger"
                >
                  Reject final
                </ButtonCTA>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
      <TextItemDialog
        modal={textItemModal}
        onClose={() => setTextItemModal(null)}
        onSave={(modal) => {
          const current = lines(form[modal.field]);
          const next =
            modal.index === undefined
              ? [...current, modal.value.trim()].filter(Boolean)
              : replaceAt(current, modal.index, modal.value.trim()).filter(Boolean);
          const nextForm = { ...form, [modal.field]: next.join("\n") };
          setForm(nextForm);
          setTextItemModal(null);
          void saveActivityInput({ [modal.field]: next }, `${formatTextArrayField(modal.field)} saved.`);
        }}
      />
      <ItineraryStopDialog
        modal={itineraryModal}
        onClose={() => setItineraryModal(null)}
        onSave={(modal) => {
          const current = toItineraryStops(form.itinerary);
          const next =
            modal.index === undefined
              ? [...current, modal.value]
              : replaceAt(current, modal.index, modal.value);
          setForm({ ...form, itinerary: JSON.stringify(next, null, 2) });
          setItineraryModal(null);
          void saveActivityInput({ itinerary: next }, "Itinerary saved.");
        }}
      />
      <ReviewActionDialog
        modal={reviewActionModal}
        onChange={setReviewActionModal}
        onClose={() => setReviewActionModal(null)}
        onSubmit={(modal) => void mutate(modal.action, modal.reason)}
      />
      <AdminOptionDialog
        modal={optionModal}
        onClose={() => setOptionModal(null)}
        onSave={async (modal) => {
          if (!activity) return;
          const payload: PartnerActivityOptionInput = {
            availabilityMode: modal.availabilityMode,
            availableDays: modal.availabilityMode === "ALWAYS_AVAILABLE" ? modal.availableDays : undefined,
            dailyCapacity:
              modal.availabilityMode === "ALWAYS_AVAILABLE" && modal.dailyCapacity
                ? Number(modal.dailyCapacity)
                : undefined,
            description: modal.description,
            durationLabel: modal.durationLabel,
            isActive: modal.isActive,
            meetingPoint: modal.meetingPoint,
            meetingTimes: parseMeetingTimesInput(modal.meetingTimes),
            slug: modal.slug || undefined,
            sortOrder: Number(modal.sortOrder || 0),
            title: modal.title
          };
          if (modal.id) {
            await updateAdminActivityOption(activity.id, modal.id, payload);
          } else {
            await createAdminActivityOption(activity.id, payload);
          }
          setOptionModal(null);
          await loadActivity();
        }}
      />
      <AdminOptionTierDialog
        modal={tierModal}
        onClose={() => setTierModal(null)}
        onSave={async (modal) => {
          if (!activity) return;
          const option = (activity.options ?? []).find((item) => item.id === modal.optionId);
          if (!option) return;
          const adultPriceCents = parseUsdInputToMinor(modal.adultPrice);
          const childPriceCents = modal.childAllowed
            ? modal.childPrice
              ? parseUsdInputToMinor(modal.childPrice)
              : Math.round(adultPriceCents * 0.73)
            : null;
          const tier = {
            adultPriceCents,
            childAllowed: modal.childAllowed,
            childDiscountPercent: 27,
            childPriceCents: childPriceCents ?? undefined,
            isActive: modal.isActive,
            maxTravelers: Number(modal.maxTravelers),
            minTravelers: Number(modal.minTravelers)
          };
          const currentTiers = option.pricingTiers.map((item) => ({
            adultPriceCents: item.adultPriceCents,
            childAllowed: item.childPriceCents != null || item.childDiscountPercent != null,
            childDiscountPercent: Number(item.childDiscountPercent ?? 27),
            childPriceCents: item.childPriceCents ?? undefined,
            isActive: item.isActive,
            maxTravelers: item.maxTravelers,
            minTravelers: item.minTravelers
          }));
          const tiers = modal.index === undefined ? [...currentTiers, tier] : replaceAt(currentTiers, modal.index, tier);
          await upsertAdminActivityOptionPricing(activity.id, option.id, {
            currency: "USD",
            priceType: "per_person",
            tiers
          });
          setTierModal(null);
          await loadActivity();
        }}
      />
      <AdminOptionAvailabilityDialog
        modal={sessionModal}
        onClose={() => setSessionModal(null)}
        onSave={async (modal) => {
          if (!activity) return;
          await createAdminActivityOptionAvailability(activity.id, modal.optionId, {
            capacity: modal.capacity ? Number(modal.capacity) : undefined,
            endDateTime: modal.endDateTime || undefined,
            isActive: modal.isActive,
            startDateTime: modal.startDateTime
          });
          setSessionModal(null);
          await loadActivity();
        }}
      />
    </div>
  );
}

function ActivityForm({
  error,
  form,
  isSaving,
  lookups,
  onChange,
  onSubmit,
  submitLabel
}: {
  error?: string | null;
  form: ActivityFormState;
  isSaving: boolean;
  lookups: { cities: LookupCity[]; categories: LookupCategory[] };
  onChange: (next: ActivityFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
}) {
  function update(field: keyof ActivityFormState, value: string) {
    onChange({ ...form, [field]: value });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Basic details</CardTitle>
        <CardDescription>Core listing content, destination, duration, and meeting point.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-4 lg:grid-cols-12">
            <Field className="lg:col-span-5" label="Activity title" required>
              <Input
                className="h-11 min-h-0"
                onChange={(event) => update("title", event.target.value)}
                required
                value={form.title}
              />
            </Field>
            <Field className="lg:col-span-4" label="Slug">
              <Input
                className="h-11 min-h-0"
                onChange={(event) => update("slug", event.target.value)}
                placeholder="e.g. ubud-cooking-class-market-visit"
                value={form.slug}
              />
            </Field>
            <Field className="lg:col-span-3" label="Duration label">
              <Input
                className="h-11 min-h-0"
                onChange={(event) => update("durationLabel", event.target.value)}
                placeholder="e.g. 3.5 hours"
                value={form.durationLabel}
              />
            </Field>
            <Field className="lg:col-span-6" label="City" required>
              <Select
                className="h-11 min-h-0"
                onChange={(event) => update("cityId", event.target.value)}
                required
                value={form.cityId}
              >
                {lookups.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </Select>
            </Field>
            <Field className="lg:col-span-6" label="Category" required>
              <Select
                className="h-11 min-h-0"
                onChange={(event) => update("categoryId", event.target.value)}
                required
                value={form.categoryId}
              >
                {lookups.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Short description" required>
            <Textarea
              className="min-h-24 resize-y"
              onChange={(event) => update("shortDescription", event.target.value)}
              required
              value={form.shortDescription}
            />
          </Field>
          <Field label="Full description" required>
            <Textarea
              className="min-h-36 resize-y"
              onChange={(event) => update("description", event.target.value)}
              required
              value={form.description}
            />
          </Field>
          <Field label="Meeting point">
            <Input
              className="h-11 min-h-0"
              onChange={(event) => update("meetingPoint", event.target.value)}
              value={form.meetingPoint}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3 border-t border-[#2B2B2B]/10 pt-5">
            <ButtonCTA disabled={isSaving} size="sm" type="submit">
              {isSaving ? "Saving..." : submitLabel}
            </ButtonCTA>
            {error ? <span className="text-sm font-medium text-red-700">{error}</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  children,
  className,
  hint,
  label,
  required
}: {
  children: ReactNode;
  className?: string;
  hint?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className={`grid content-start gap-2 ${className ?? ""}`}>
      <span className="font-interface text-xs font-semibold uppercase tracking-[0.08em] text-travel-muted">
        {label}
        {required ? <span className="text-travel-primary"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs leading-5 text-travel-muted">{hint}</span> : null}
    </label>
  );
}

function AdminRepeatableContentCard({
  form,
  isSaving,
  onAdd,
  onChange,
  onDelete,
  onEdit
}: {
  form: ActivityFormState;
  isSaving: boolean;
  onAdd: (field: TextArrayField) => void;
  onChange: (next: ActivityFormState) => void;
  onDelete: (field: TextArrayField, index: number) => void;
  onEdit: (field: TextArrayField, index: number) => void;
}) {
  const sections: Array<{ field: TextArrayField; title: string; description: string }> = [
    { field: "highlights", title: "Highlights", description: "Short selling points travelers scan before booking." },
    { field: "included", title: "Included", description: "What travelers receive." },
    { field: "notIncluded", title: "Not included", description: "What travelers should arrange themselves." }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Highlights & inclusions</CardTitle>
        <CardDescription>Repeatable items use the same list pattern as the partner builder.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => {
          const items = lines(form[section.field]);
          return (
            <div className="rounded-travel-lg border border-[#2B2B2B]/15 p-4" key={section.field}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-brand text-base font-semibold text-travel-dark">{section.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-travel-muted">{section.description}</p>
                </div>
                <ButtonCTA disabled={isSaving} onClick={() => onAdd(section.field)} size="sm" type="button" variant="ghost">
                  Add
                </ButtonCTA>
              </div>
              <div className="grid gap-2">
                {items.length ? (
                  items.map((item, index) => (
                    <EditableRow
                      disabled={isSaving}
                      key={`${section.field}-${item}-${index}`}
                      onDelete={() => onDelete(section.field, index)}
                      onEdit={() => onEdit(section.field, index)}
                      text={item}
                    />
                  ))
                ) : (
                  <p className="rounded-travel-md bg-travel-bg p-3 text-sm text-travel-muted">No items yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AdminItineraryEditorCard({
  disabled,
  items,
  onAdd,
  onDelete,
  onEdit,
  onMove
}: {
  disabled: boolean;
  items: ItineraryStop[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Itinerary</CardTitle>
          <CardDescription>Review and edit the stop-by-stop timeline without raw JSON.</CardDescription>
        </div>
        <ButtonCTA disabled={disabled} onClick={onAdd} size="sm" type="button" variant="outline">
          Add stop
        </ButtonCTA>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="grid gap-3">
            {items.map((item, index) => (
              <div className="grid gap-3 rounded-travel-lg border border-[#2B2B2B]/15 p-4 md:grid-cols-[32px_1fr_auto]" key={`${item.title}-${index}`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-[#FBEAE8] text-sm font-semibold text-travel-primary">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-brand text-base font-semibold text-travel-dark">{item.title}</p>
                    <Badge variant="neutral">{formatItineraryType(item.type)}</Badge>
                  </div>
                  {item.subtitle ? <p className="mt-1 text-sm leading-6 text-travel-muted">{item.subtitle}</p> : null}
                  {item.durationLabel ? <p className="mt-2 text-xs font-medium text-travel-muted">{item.durationLabel}</p> : null}
                </div>
                <div className="flex items-start gap-1">
                  <SmallAction disabled={disabled || index === 0} onClick={() => onMove(index, -1)}>Up</SmallAction>
                  <SmallAction disabled={disabled || index === items.length - 1} onClick={() => onMove(index, 1)}>Down</SmallAction>
                  <SmallAction disabled={disabled} onClick={() => onEdit(index)}>Edit</SmallAction>
                  <SmallAction disabled={disabled} onClick={() => onDelete(index)}>Delete</SmallAction>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="No itinerary stops have been added." title="No itinerary" />
        )}
      </CardContent>
    </Card>
  );
}

function AdminPoliciesCard({
  form,
  isSaving,
  onChange,
  onSave
}: {
  form: ActivityFormState;
  isSaving: boolean;
  onChange: (next: ActivityFormState) => void;
  onSave: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policies & important info</CardTitle>
        <CardDescription>Set traveler expectations before booking.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cancellation policy">
            <Textarea
              onChange={(event) => onChange({ ...form, cancellationPolicy: event.target.value })}
              value={form.cancellationPolicy}
            />
          </Field>
          <Field label="Important information">
            <Textarea
              onChange={(event) => onChange({ ...form, importantInfo: event.target.value })}
              value={form.importantInfo}
            />
          </Field>
        </div>
        <ButtonCTA className="w-fit" disabled={isSaving} onClick={onSave} type="button">
          Save policies
        </ButtonCTA>
      </CardContent>
    </Card>
  );
}

function EditableRow({
  disabled,
  onDelete,
  onEdit,
  text
}: {
  disabled?: boolean;
  onDelete: () => void;
  onEdit: () => void;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-travel-md border border-[#2B2B2B]/10 bg-white p-3">
      <p className="text-sm text-travel-dark">{text}</p>
      <div className="flex gap-2">
        <SmallAction disabled={disabled} onClick={onEdit}>Edit</SmallAction>
        <SmallAction disabled={disabled} onClick={onDelete}>Delete</SmallAction>
      </div>
    </div>
  );
}

function SmallAction({
  children,
  disabled,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-travel-md px-2 py-1 text-xs font-semibold text-travel-muted hover:bg-travel-bg hover:text-travel-dark disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function TextItemDialog({
  modal,
  onClose,
  onSave
}: {
  modal: TextItemModal;
  onClose: () => void;
  onSave: (modal: NonNullable<TextItemModal>) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(modal?.value ?? "");
  }, [modal]);

  if (!modal) return null;

  return (
    <Dialog description="Keep this item clear and traveler-facing." onClose={onClose} open title={modal.index === undefined ? `Add ${formatTextArrayField(modal.field)}` : `Edit ${formatTextArrayField(modal.field)}`}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...modal, value });
        }}
      >
        <Field label="Item text" required>
          <Input onChange={(event) => setValue(event.target.value)} required value={value} />
        </Field>
        <DialogActions onCancel={onClose} submitLabel={modal.index === undefined ? "Add item" : "Save item"} />
      </form>
    </Dialog>
  );
}

function ItineraryStopDialog({
  modal,
  onClose,
  onSave
}: {
  modal: ItineraryModal;
  onClose: () => void;
  onSave: (modal: NonNullable<ItineraryModal>) => void;
}) {
  const [value, setValue] = useState<ItineraryStop>(emptyItineraryStop);

  useEffect(() => {
    setValue(modal?.value ?? emptyItineraryStop);
  }, [modal]);

  if (!modal) return null;

  return (
    <Dialog description="Build the same timeline structure partners use." onClose={onClose} open title={modal.index === undefined ? "Add itinerary stop" : "Edit itinerary stop"}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...modal, value });
        }}
      >
        <Field label="Stop title" required>
          <Input onChange={(event) => setValue({ ...value, title: event.target.value })} required value={value.title} />
        </Field>
        <Field label="Subtitle / details">
          <Textarea onChange={(event) => setValue({ ...value, subtitle: event.target.value })} value={value.subtitle} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Duration label">
            <Input onChange={(event) => setValue({ ...value, durationLabel: event.target.value })} placeholder="e.g. 45 minutes" value={value.durationLabel} />
          </Field>
          <Field label="Type">
            <Select onChange={(event) => setValue({ ...value, type: event.target.value as ItineraryStop["type"] })} value={value.type}>
              <option value="start">Starting point</option>
              <option value="stop">Activity stop</option>
              <option value="food">Food stop</option>
              <option value="photo">Photo stop</option>
              <option value="end">Ending point</option>
            </Select>
          </Field>
        </div>
        <DialogActions onCancel={onClose} submitLabel={modal.index === undefined ? "Add stop" : "Save stop"} />
      </form>
    </Dialog>
  );
}

function ReviewActionDialog({
  modal,
  onChange,
  onClose,
  onSubmit
}: {
  modal: ReviewActionModal;
  onChange: (next: ReviewActionModal) => void;
  onClose: () => void;
  onSubmit: (modal: NonNullable<ReviewActionModal>) => void;
}) {
  if (!modal) return null;

  const isRevision = modal.action === "revision";

  return (
    <Dialog
      description={isRevision ? "Partner can edit the activity after revision is requested." : "Rejecting is final for this submission. Partner must create a new activity."}
      onClose={onClose}
      open
      title={isRevision ? "Request revision" : "Reject activity"}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(modal);
        }}
      >
        <Field label={isRevision ? "Revision note" : "Rejection reason"} required>
          <Textarea
            onChange={(event) => onChange({ ...modal, reason: event.target.value })}
            placeholder={isRevision ? "Explain what the partner should improve." : "Explain why this submission is rejected."}
            required
            value={modal.reason}
          />
        </Field>
        <DialogActions onCancel={onClose} submitLabel={isRevision ? "Request revision" : "Reject activity"} variant={isRevision ? "primary" : "danger"} />
      </form>
    </Dialog>
  );
}

function DialogActions({
  onCancel,
  submitLabel,
  variant = "primary"
}: {
  onCancel: () => void;
  submitLabel: string;
  variant?: "primary" | "danger";
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#2B2B2B]/10 pt-4">
      <ButtonCTA onClick={onCancel} type="button" variant="ghost">
        Cancel
      </ButtonCTA>
      <ButtonCTA type="submit" variant={variant === "danger" ? "danger" : "primary"}>
        {submitLabel}
      </ButtonCTA>
    </div>
  );
}

const weekdayOptions = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

function slugifyForInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminExperienceOptionsSection({
  activity,
  disabled,
  onAddOption,
  onEditOption,
  onOpenAvailability,
  onOpenPricing,
  onUpdated
}: {
  activity: AdminActivity;
  disabled: boolean;
  onAddOption: () => void;
  onEditOption: (option: PartnerActivityOption) => void;
  onOpenAvailability: (optionId: string) => void;
  onOpenPricing: (
    optionId: string,
    tier: Pick<
      PartnerActivityOption["pricingTiers"][number],
      "adultPriceCents" | "childDiscountPercent" | "childPriceCents" | "isActive" | "maxTravelers" | "minTravelers"
    >,
    index: number | undefined
  ) => void;
  onUpdated: () => Promise<void>;
}) {
  const options = activity.options ?? [];
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Experience options</CardTitle>
          <CardDescription>
            Admin edits the same package options, sessions, and tier pricing that partners configure.
          </CardDescription>
        </div>
        <ButtonCTA disabled={disabled} leftIcon={<Plus className="size-4" />} onClick={onAddOption} size="sm" type="button" variant="outline">
          Add option
        </ButtonCTA>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {options.length ? (
          options.map((option) => (
            <div className="rounded-travel-lg border border-[#2B2B2B]/15 p-4" key={option.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-interface text-sm font-semibold text-travel-dark">{option.title}</p>
                    {option.isDefault ? <Badge variant="info">Default</Badge> : null}
                    <Badge variant={option.isActive ? "success" : "neutral"}>{option.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-travel-muted">
                    {option.availabilityMode === "ALWAYS_AVAILABLE" ? "Available every day" : "Scheduled sessions"}
                    {option.durationLabel ? ` · ${option.durationLabel}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonCTA disabled={disabled} onClick={() => onEditOption(option)} size="sm" type="button" variant="outline">
                    Edit option
                  </ButtonCTA>
                  <ButtonCTA
                    disabled={disabled || !option.isActive}
                    onClick={async () => {
                      setError(null);
                      try {
                        await deactivateAdminActivityOption(activity.id, option.id);
                        await onUpdated();
                      } catch (caughtError) {
                        setError(caughtError instanceof Error ? caughtError.message : "Unable to deactivate option");
                      }
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Deactivate
                  </ButtonCTA>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-travel-muted">Pricing tiers</p>
                    <ButtonCTA
                      disabled={disabled}
                      onClick={() =>
                        onOpenPricing(option.id, {
                          adultPriceCents: 0,
                          childDiscountPercent: 27,
                          childPriceCents: null,
                          isActive: true,
                          maxTravelers: 1,
                          minTravelers: 1
                        }, undefined)
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Add tier
                    </ButtonCTA>
                  </div>
                  {option.pricingTiers.length ? (
                    <div className="grid gap-2">
                      {option.pricingTiers.map((tier, index) => (
                        <div className="flex items-center justify-between rounded-travel-md bg-travel-bg px-3 py-2 text-sm" key={tier.id}>
                          <span>
                            {tier.minTravelers === tier.maxTravelers ? tier.minTravelers : `${tier.minTravelers}-${tier.maxTravelers}`} travelers
                          </span>
                          <span className="font-semibold text-travel-dark">
                            {formatBaseUsd(tier.adultPriceCents)} adult · {tier.childPriceCents == null ? "No child" : `${formatBaseUsd(tier.childPriceCents)} child`}
                          </span>
                          <button
                            className="text-xs font-semibold text-travel-primary"
                            disabled={disabled}
                            onClick={() => onOpenPricing(option.id, tier, index)}
                            type="button"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-travel-md bg-travel-bg px-3 py-3 text-sm text-travel-muted">No option pricing yet.</p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-travel-muted">Availability</p>
                    {option.availabilityMode === "SCHEDULED_SESSIONS" ? (
                      <ButtonCTA
                        disabled={disabled}
                        onClick={() => onOpenAvailability(option.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Add session
                      </ButtonCTA>
                    ) : null}
                  </div>
                  {option.availabilityMode === "ALWAYS_AVAILABLE" ? (
                    <p className="rounded-travel-md bg-travel-bg px-3 py-3 text-sm text-travel-muted">
                      Days: {(option.availableDays ?? []).join(", ") || "Every day"} · Daily capacity: {option.dailyCapacity ?? "Open"}
                      {option.meetingTimes?.length ? ` · Times: ${option.meetingTimes.map(formatOptionMeetingTime).join(", ")}` : ""}
                    </p>
                  ) : option.availability.length ? (
                    <div className="grid gap-2">
                      {option.availability.map((slot) => (
                        <div className="flex items-center justify-between rounded-travel-md bg-travel-bg px-3 py-2 text-sm" key={slot.id}>
                          <span>{formatDate(slot.startDateTime, "en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                          <ButtonCTA
                            disabled={disabled || !slot.isActive}
                            onClick={async () => {
                              setError(null);
                              try {
                                await deactivateAdminActivityOptionAvailability(activity.id, option.id, slot.id);
                                await onUpdated();
                              } catch (caughtError) {
                                setError(caughtError instanceof Error ? caughtError.message : "Unable to deactivate option session");
                              }
                            }}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            Deactivate
                          </ButtonCTA>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-travel-md bg-travel-bg px-3 py-3 text-sm text-travel-muted">No scheduled sessions yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No package options" description="Add package options so admin can manage the same commerce setup partners use." />
        )}
      </CardContent>
    </Card>
  );
}

function AdminOptionDialog({
  modal,
  onClose,
  onSave
}: {
  modal: OptionModalState;
  onClose: () => void;
  onSave: (modal: NonNullable<OptionModalState>) => Promise<void>;
}) {
  const [value, setValue] = useState<NonNullable<OptionModalState> | null>(modal);

  useEffect(() => {
    setValue(modal);
  }, [modal]);

  return (
    <Dialog description="Package variants can use scheduled sessions or an always-available daily schedule." onClose={onClose} open={Boolean(modal)} title={modal?.id ? "Edit option" : "Add option"}>
      {value ? (
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void onSave(value); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Option name" required>
              <Input
                onChange={(event) => {
                  const currentGeneratedSlug = slugifyForInput(value.title);
                  const nextTitle = event.target.value;
                  const nextGeneratedSlug = slugifyForInput(nextTitle);
                  setValue({
                    ...value,
                    title: nextTitle,
                    slug: !value.slug || value.slug === currentGeneratedSlug ? nextGeneratedSlug : value.slug
                  });
                }}
                required
                value={value.title}
              />
            </Field>
            <Field label="Slug">
              <Input onChange={(event) => setValue({ ...value, slug: slugifyForInput(event.target.value) })} value={value.slug} />
            </Field>
            <Field label="Availability mode" required>
              <Select onChange={(event) => setValue({ ...value, availabilityMode: event.target.value as AvailabilityMode })} value={value.availabilityMode}>
                <option value="SCHEDULED_SESSIONS">Scheduled sessions</option>
                <option value="ALWAYS_AVAILABLE">Available every day</option>
              </Select>
            </Field>
            <Field label="Sort order">
              <Input min={0} onChange={(event) => setValue({ ...value, sortOrder: event.target.value })} type="number" value={value.sortOrder} />
            </Field>
            <Field label="Duration">
              <Input onChange={(event) => setValue({ ...value, durationLabel: event.target.value })} value={value.durationLabel} />
            </Field>
            <Field label="Daily capacity">
              <Input disabled={value.availabilityMode !== "ALWAYS_AVAILABLE"} min={1} onChange={(event) => setValue({ ...value, dailyCapacity: event.target.value })} type="number" value={value.dailyCapacity} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea onChange={(event) => setValue({ ...value, description: event.target.value })} rows={3} value={value.description} />
          </Field>
          <Field label="Meeting point override">
            <Input onChange={(event) => setValue({ ...value, meetingPoint: event.target.value })} value={value.meetingPoint} />
          </Field>
          <Field label="Meeting times">
            <Input
              onChange={(event) => setValue({ ...value, meetingTimes: event.target.value })}
              placeholder="07:00, 08:00, 09:00"
              value={value.meetingTimes}
            />
          </Field>
          {value.availabilityMode === "ALWAYS_AVAILABLE" ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-travel-dark">Available days</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {weekdayOptions.map((day) => (
                  <label className="flex items-center gap-2 text-sm text-travel-dark" key={day}>
                    <input
                      checked={value.availableDays.includes(day)}
                      onChange={(event) =>
                        setValue({
                          ...value,
                          availableDays: event.target.checked
                            ? [...value.availableDays, day]
                            : value.availableDays.filter((item) => item !== day)
                        })
                      }
                      type="checkbox"
                    />
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
            <input checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} type="checkbox" />
            Active option
          </label>
          <DialogActions onCancel={onClose} submitLabel="Save option" />
        </form>
      ) : null}
    </Dialog>
  );
}

function AdminOptionTierDialog({
  modal,
  onClose,
  onSave
}: {
  modal: (PricingTierForm & { optionId: string }) | null;
  onClose: () => void;
  onSave: (modal: PricingTierForm & { optionId: string }) => Promise<void>;
}) {
  const [value, setValue] = useState<typeof modal>(modal);

  useEffect(() => {
    setValue(modal);
  }, [modal]);

  return (
    <Dialog onClose={onClose} open={Boolean(modal)} title={modal?.index === undefined ? "Add option tier" : "Edit option tier"}>
      {value ? (
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void onSave(value); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min travelers" required>
              <Input max={14} min={1} onChange={(event) => setValue({ ...value, minTravelers: event.target.value })} required type="number" value={value.minTravelers} />
            </Field>
            <Field label="Max travelers" required>
              <Input max={14} min={1} onChange={(event) => setValue({ ...value, maxTravelers: event.target.value })} required type="number" value={value.maxTravelers} />
            </Field>
            <Field label="Adult price (USD)" required>
              <Input min={0} onChange={(event) => setValue({ ...value, adultPrice: event.target.value })} required step="0.01" type="number" value={value.adultPrice} />
            </Field>
            <Field label="Child price (USD)">
              <Input disabled={!value.childAllowed} min={0} onChange={(event) => setValue({ ...value, childPrice: event.target.value })} step="0.01" type="number" value={value.childPrice} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
            <input checked={value.childAllowed} onChange={(event) => setValue({ ...value, childAllowed: event.target.checked, childPrice: event.target.checked ? value.childPrice : "" })} type="checkbox" />
            Available for child travelers
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
            <input checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} type="checkbox" />
            Active tier
          </label>
          <DialogActions onCancel={onClose} submitLabel="Save tier" />
        </form>
      ) : null}
    </Dialog>
  );
}

function AdminOptionAvailabilityDialog({
  modal,
  onClose,
  onSave
}: {
  modal: (NonNullable<AvailabilityModalState> & { optionId: string }) | null;
  onClose: () => void;
  onSave: (modal: NonNullable<AvailabilityModalState> & { optionId: string }) => Promise<void>;
}) {
  const [value, setValue] = useState<typeof modal>(modal);

  useEffect(() => {
    setValue(modal);
  }, [modal]);

  return (
    <Dialog description="Add a scheduled session for this package option." onClose={onClose} open={Boolean(modal)} title="Add option session">
      {value ? (
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void onSave(value); }}>
          <Field label="Start date/time" required>
            <Input onChange={(event) => setValue({ ...value, startDateTime: event.target.value })} required type="datetime-local" value={value.startDateTime} />
          </Field>
          <Field label="End date/time">
            <Input onChange={(event) => setValue({ ...value, endDateTime: event.target.value })} type="datetime-local" value={value.endDateTime} />
          </Field>
          <Field label="Capacity">
            <Input min={1} onChange={(event) => setValue({ ...value, capacity: event.target.value })} type="number" value={value.capacity} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
            <input checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} type="checkbox" />
            Active session
          </label>
          <DialogActions onCancel={onClose} submitLabel="Add session" />
        </form>
      ) : null}
    </Dialog>
  );
}


function AdminPricingCard({
  activity,
  onUpdated
}: {
  activity: AdminActivity;
  onUpdated: () => Promise<void>;
}) {
  const activePrice = activity.pricing.find((price) => price.isActive) ?? activity.pricing[0];
  const currency = "USD";
  const [priceInput, setPriceInput] = useState(
    activePrice ? usdMinorToInput(activePrice.priceCents) : ""
  );
  const [priceType, setPriceType] = useState(activePrice?.priceType ?? "per_person");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await upsertAdminActivityPricing(activity.id, {
        currency,
        isActive: true,
        priceCents: parseUsdInputToMinor(priceInput),
        priceType
      });
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save pricing");
    } finally {
      setIsSaving(false);
    }
  }

  if (activity.pricingMode === "GROUP_TIER") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing tiers</CardTitle>
          <CardDescription>
            Group pricing is reviewed here. Partners manage tier ranges and child discounts in their activity builder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-travel-lg border border-[#2B2B2B]/15">
            <div className="grid grid-cols-4 gap-3 bg-travel-bg px-4 py-2.5 text-xs font-semibold text-travel-muted">
              <span>Travelers</span>
              <span>Adult</span>
              <span>Child</span>
              <span>Discount</span>
            </div>
            {activity.pricingTiers.map((tier) => (
              <div className="grid grid-cols-4 gap-3 border-t border-[#2B2B2B]/10 px-4 py-3 text-sm" key={tier.id}>
                <span>{tier.minTravelers === tier.maxTravelers ? tier.minTravelers : `${tier.minTravelers}-${tier.maxTravelers}`}</span>
                <span>{formatBaseUsd(tier.adultPriceCents)}</span>
                <span>{formatBaseUsd(tier.childPriceCents ?? Math.round(tier.adultPriceCents * 0.73))}</span>
                <span>{Number(tier.childDiscountPercent ?? 27)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          Admin can adjust the USD base price before publishing. Public conversion is display-only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-[120px_1fr_1fr_auto]" onSubmit={save}>
          <Input disabled readOnly value={currency} />
          <Input min={0} onChange={(event) => setPriceInput(event.target.value)} placeholder="Price in USD" required step="0.01" type="number" value={priceInput} />
          <Input onChange={(event) => setPriceType(event.target.value)} placeholder="per_person" required value={priceType} />
          <ButtonCTA disabled={isSaving} type="submit" variant="outline">
            Save price
          </ButtonCTA>
        </form>
        {activePrice ? (
          <p className="mt-3 text-sm text-travel-muted">
            Current active price: {formatBaseUsd(activePrice.priceCents)}
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function AdminAvailabilityCard({
  activity,
  onUpdated
}: {
  activity: AdminActivity;
  onUpdated: () => Promise<void>;
}) {
  const [startDateTime, setStartDateTime] = useState("");
  const [capacity, setCapacity] = useState("12");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await createAdminActivityAvailability(activity.id, {
        capacity: Number(capacity),
        isActive: true,
        startDateTime: new Date(startDateTime).toISOString()
      });
      setStartDateTime("");
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to add availability");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Add sessions for this activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-[1fr_140px_auto]" onSubmit={save}>
          <Input onChange={(event) => setStartDateTime(event.target.value)} required type="datetime-local" value={startDateTime} />
          <Input min={1} onChange={(event) => setCapacity(event.target.value)} required type="number" value={capacity} />
          <ButtonCTA disabled={isSaving} type="submit" variant="outline">
            Add session
          </ButtonCTA>
        </form>
        <div className="mt-4 grid gap-2">
          {(activity.availability ?? []).map((item) => (
            <div className="flex items-center justify-between rounded-travel-md border border-travel-border p-3 text-sm" key={item.id}>
              <span>{formatDate(item.startDateTime, "en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className="text-travel-muted">Capacity {item.capacity ?? "open"} · {item.isActive ? "Active" : "Inactive"}</span>
            </div>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function AdminMediaCard({
  activity,
  onUpdated
}: {
  activity: AdminActivity;
  onUpdated: () => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function addUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addMedia({ url });
    setUrl("");
  }

  async function uploadSelectedFile() {
    if (!file) return;
    setError(null);
    setIsSaving(true);

    try {
      const presign = await requestPresignedUpload({
        mimeType: file.type,
        originalName: file.name,
        purpose: "ACTIVITY_IMAGE",
        sizeBytes: file.size,
        visibility: "PUBLIC"
      });
      await uploadFileToPresignedUrl(presign.uploadUrl, file);
      await createAdminActivityMedia(activity.id, {
        altText: activity.title,
        fileAssetId: presign.fileAsset.id,
        isCover: activity.media.length === 0,
        url: presign.publicUrl ?? presign.fileAsset.url ?? undefined
      });
      setFile(null);
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to upload media");
    } finally {
      setIsSaving(false);
    }
  }

  async function addMedia(input: { url: string }) {
    setError(null);
    setIsSaving(true);

    try {
      await createAdminActivityMedia(activity.id, {
        altText: activity.title,
        isCover: activity.media.length === 0,
        url: input.url
      });
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to add media");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>Add or upload marketplace images for this activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={addUrl}>
            <Input onChange={(event) => setUrl(event.target.value)} placeholder="https:// image URL" value={url} />
            <ButtonCTA disabled={isSaving || !url.trim()} type="submit" variant="outline">
              Add URL
            </ButtonCTA>
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <Input onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
            <ButtonCTA disabled={isSaving || !file} onClick={uploadSelectedFile} variant="outline">
              Upload image
            </ButtonCTA>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {activity.media.map((item) => {
              const mediaUrl = item.url ?? item.file?.url;
              return (
                <div className="overflow-hidden rounded-travel-md border border-travel-border" key={item.id}>
                  <div className="aspect-[4/3] bg-travel-bg">
                    {mediaUrl ? <img alt={item.altText ?? ""} className="h-full w-full object-cover" src={mediaUrl} /> : null}
                  </div>
                  <div className="flex items-center justify-between p-3 text-xs text-travel-muted">
                    <span>{item.isCover ? "Cover" : "Gallery"}</span>
                    <span>#{item.sortOrder}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const variant =
    status === "PUBLISHED" || status === "APPROVED"
      ? "success"
      : status === "PENDING_REVIEW" || status === "REVISION_REQUESTED"
        ? "warning"
        : status === "REJECTED" || status === "ARCHIVED"
          ? "danger"
          : "neutral";

  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}

function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="font-brand text-base font-semibold text-travel-dark">{title}</h3>
      <div className="mt-2 font-interface text-sm leading-6 text-travel-muted">{children}</div>
    </section>
  );
}

function ReviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <ReviewBlock title={title}>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No items provided.</p>
      )}
    </ReviewBlock>
  );
}

function ItineraryTimeline({ items }: { items: ItineraryStop[] }) {
  if (items.length === 0) {
    return <p>No itinerary provided.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div className="grid gap-3 rounded-travel-lg border border-[#2B2B2B]/15 bg-white p-4 md:grid-cols-[32px_1fr]" key={`${item.title}-${index}`}>
          <div className="flex size-8 items-center justify-center rounded-full bg-[#FBEAE8] text-sm font-semibold text-travel-primary">
            {index + 1}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-brand text-base font-semibold text-travel-dark">{item.title}</p>
              <Badge variant="neutral">{formatItineraryType(item.type)}</Badge>
            </div>
            {item.subtitle ? <p className="mt-1 text-sm leading-6 text-travel-muted">{item.subtitle}</p> : null}
            {item.durationLabel ? <p className="mt-2 text-xs font-medium text-travel-muted">{item.durationLabel}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-interface text-xs font-medium text-travel-muted">{label}</p>
      <p className="mt-1 font-interface text-sm font-semibold leading-6 text-travel-dark">{value}</p>
    </div>
  );
}

function AdminEditStatusPanel({
  activity,
  form,
  isMutating,
  onBackToReview
}: {
  activity: AdminActivity;
  form: ActivityFormState;
  isMutating: boolean;
  onBackToReview: () => void;
}) {
  const readiness = getAdminEditReadiness(activity, form);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin builder</CardTitle>
        <CardDescription>
          Edit the submitted activity with the same structure partners use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-travel-lg border border-[#2B2B2B]/15 bg-travel-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-interface text-sm font-semibold text-travel-dark">Current status</span>
            <ActivityStatusBadge status={activity.status} />
          </div>
          <div className="mt-4 grid gap-3">
            <DetailLine label="Partner" value={activity.partner.businessName} />
            <DetailLine label="Destination" value={`${activity.city.name} · ${activity.category.name}`} />
            <DetailLine label="Price" value={formatActivityPrice(activity)} />
            <DetailLine label="Updated" value={formatDate(activity.updatedAt)} />
          </div>
        </div>

        <div>
          <p className="font-brand text-base font-semibold text-travel-dark">Content readiness</p>
          <div className="mt-3 grid gap-2">
            {readiness.map((item) => (
              <div
                className="flex items-center justify-between rounded-travel-md border border-[#2B2B2B]/10 bg-white px-3 py-2"
                key={item.label}
              >
                <span className="text-sm text-travel-dark">{item.label}</span>
                <Badge variant={item.done ? "success" : "neutral"}>
                  {item.done ? "Done" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-travel-md border border-[#2B2B2B]/10 bg-white p-3 text-sm leading-6 text-travel-muted">
          Approval, publish, revision, reject, and archive actions stay in review mode so editing and review decisions do not mix.
        </div>

        <ButtonCTA disabled={isMutating} fullWidth onClick={onBackToReview} type="button" variant="outline">
          Back to review
        </ButtonCTA>
      </CardContent>
    </Card>
  );
}

function formatActivityPrice(activity: AdminActivity) {
  const pricing = activity.pricing.find((item) => item.isActive) ?? activity.pricing[0];
  if (!pricing) return "No pricing";

  return formatBaseUsd(pricing.priceCents);
}

function getAdminEditReadiness(activity: AdminActivity, form: ActivityFormState) {
  const hasBasic =
    Boolean(form.title.trim()) &&
    Boolean(form.cityId) &&
    Boolean(form.categoryId) &&
    Boolean(form.shortDescription.trim()) &&
    Boolean(form.description.trim());
  const hasPricing = activity.pricing.some((price) => price.isActive);
  const hasAvailability = (activity.availability ?? []).some((slot) => slot.isActive);
  const hasMedia = activity.media.length > 0;
  const hasItinerary = toItineraryStops(form.itinerary).length > 0;
  const hasIncludes = lines(form.included).length > 0 && lines(form.notIncluded).length > 0;
  const hasPolicies = Boolean(form.cancellationPolicy.trim()) || Boolean(form.importantInfo.trim());

  return [
    { done: hasBasic, label: "Basic details" },
    { done: hasPricing, label: "Pricing" },
    { done: hasAvailability, label: "Availability" },
    { done: hasMedia, label: "Media" },
    { done: hasItinerary, label: "Itinerary" },
    { done: hasIncludes, label: "Included / not included" },
    { done: hasPolicies, label: "Policies" }
  ];
}

function activityToForm(activity: AdminActivity): ActivityFormState {
  return {
    categoryId: activity.categoryId,
    cancellationPolicy: activity.cancellationPolicy ?? "",
    cityId: activity.cityId,
    description: activity.description,
    durationLabel: activity.durationLabel ?? "",
    highlights: (activity.highlights ?? []).join("\n"),
    importantInfo: activity.importantInfo ?? "",
    included: (activity.included ?? []).join("\n"),
    itinerary: activity.itinerary ? JSON.stringify(activity.itinerary, null, 2) : "",
    meetingPoint: activity.meetingPoint ?? "",
    notIncluded: (activity.notIncluded ?? []).join("\n"),
    shortDescription: activity.shortDescription,
    slug: activity.slug,
    title: activity.title
  };
}

function formToInput(form: ActivityFormState): PartnerActivityInput {
  return {
    cancellationPolicy: form.cancellationPolicy || undefined,
    categoryId: form.categoryId,
    cityId: form.cityId,
    description: form.description,
    durationLabel: form.durationLabel || undefined,
    highlights: lines(form.highlights),
    importantInfo: form.importantInfo || undefined,
    included: lines(form.included),
    itinerary: parseOptionalJson(form.itinerary),
    meetingPoint: form.meetingPoint || undefined,
    notIncluded: lines(form.notIncluded),
    shortDescription: form.shortDescription,
    slug: form.slug || undefined,
    title: form.title
  };
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseMeetingTimesInput(value: string) {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

function formatOptionMeetingTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(2026, 0, 1, hours, minutes)));
}

function parseOptionalJson(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  return JSON.parse(normalized) as unknown;
}

function toItineraryStops(value: string) {
  try {
    const parsed = JSON.parse(value || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        return {
          durationLabel: typeof record.durationLabel === "string" ? record.durationLabel : "",
          subtitle: typeof record.subtitle === "string" ? record.subtitle : "",
          title: typeof record.title === "string" ? record.title : "",
          type: normalizeItineraryType(record.type)
        };
      })
      .filter((item): item is ItineraryStop => Boolean(item?.title));
  } catch {
    return [];
  }
}

function normalizeItineraryType(value: unknown): ItineraryStop["type"] {
  if (value === "start" || value === "food" || value === "photo" || value === "end") return value;
  return "stop";
}

function formatItineraryType(value: ItineraryStop["type"]) {
  if (value === "start") return "Starting point";
  if (value === "food") return "Food stop";
  if (value === "photo") return "Photo stop";
  if (value === "end") return "Ending point";
  return "Activity stop";
}

function removeAt<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function replaceAt<T>(items: T[], index: number, value: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function formatTextArrayField(field: TextArrayField) {
  if (field === "notIncluded") return "Not included";
  return field.charAt(0).toUpperCase() + field.slice(1);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
