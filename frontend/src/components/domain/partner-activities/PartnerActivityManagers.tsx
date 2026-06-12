"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ImagePlus,
  Info,
  ListPlus,
  Pencil,
  Plus,
  Trash2,
  Upload
} from "lucide-react";
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
import { formatDate } from "../../../lib/dates";
import { requestPresignedUpload, uploadFileToPresignedUrl } from "../../../lib/files";
import {
  formatBaseUsd,
  parseUsdInputToMinor,
  usdMinorToInput
} from "../../../lib/money";
import {
  createPartnerActivityRevision,
  getPartnerActivityRevision,
  submitPartnerActivityRevision,
  updatePartnerActivityRevision
} from "../../../lib/activity-revisions";
import type {
  ActivityRevision,
  ActivityRevisionSnapshot
} from "../../../lib/activity-revisions";
import {
  createPartnerActivity,
  createPartnerActivityAvailability,
  createPartnerActivityMedia,
  createPartnerActivityOption,
  createPartnerActivityOptionAvailability,
  deactivatePartnerActivityAvailability,
  deletePartnerActivityMedia,
  deactivatePartnerActivityOption,
  deactivatePartnerActivityOptionAvailability,
  getPartnerActivities,
  getPartnerActivity,
  getPartnerLookupCategories,
  getPartnerLookupCities,
  getPartnerLookupDestinations,
  submitPartnerActivity,
  updatePartnerActivity,
  updatePartnerActivityOption,
  upsertPartnerActivityOptionPricing,
  upsertPartnerActivityPricing
} from "../../../lib/partner-activities";
import type {
  ActivityStatus,
  AvailabilityMode,
  LookupCategory,
  LookupCity,
  LookupDestination,
  PartnerActivity,
  PartnerActivityInput,
  PartnerActivityOption
} from "../../../lib/partner-activities";
import { routes } from "../../../lib/routes";

type BasicDetailsState = {
  title: string;
  slug: string;
  cityId: string;
  destinationId: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  durationLabel: string;
  meetingPoint: string;
};

type ActivityLookups = {
  categories: LookupCategory[];
  cities: LookupCity[];
  destinations: LookupDestination[];
};

type PoliciesState = {
  cancellationPolicy: string;
  importantInfo: string;
};

type ItineraryStop = {
  title: string;
  subtitle: string;
  durationLabel: string;
  type: "start" | "stop" | "food" | "photo" | "end";
};

type ItemModalState =
  | { kind: "highlight"; index?: number; value: string }
  | { kind: "included"; index?: number; value: string }
  | { kind: "notIncluded"; index?: number; value: string }
  | null;

type ItineraryModalState = { index?: number; value: ItineraryStop } | null;

type AvailabilityModalState = {
  startDateTime: string;
  endDateTime: string;
  capacity: string;
  isActive: boolean;
} | null;

type MediaUrlModalState = {
  url: string;
  altText: string;
  isCover: boolean;
} | null;

type PricingTierForm = {
  index?: number;
  minTravelers: string;
  maxTravelers: string;
  adultPrice: string;
  childPrice: string;
  childAllowed: boolean;
  childDiscountPercent: string;
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

const emptyBasicDetails: BasicDetailsState = {
  title: "",
  slug: "",
  cityId: "",
  destinationId: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  durationLabel: "",
  meetingPoint: ""
};

const emptyPolicies: PoliciesState = {
  cancellationPolicy: "",
  importantInfo: ""
};

const emptyItineraryStop: ItineraryStop = {
  title: "",
  subtitle: "",
  durationLabel: "",
  type: "stop"
};

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

export function PartnerActivityListManager() {
  const router = useRouter();
  const [activities, setActivities] = useState<PartnerActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revisionActionId, setRevisionActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ActivityStatus | "">("");

  useEffect(() => {
    void loadActivities();
  }, []);

  async function loadActivities(nextStatus = status, nextSearch = search) {
    setError(null);
    setIsLoading(true);

    try {
      setActivities(await getPartnerActivities({ status: nextStatus, search: nextSearch }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load activities");
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadActivities(status, search);
  }

  async function openRevision(activity: PartnerActivity) {
    const existingRevision = activity.revisions?.[0];

    if (existingRevision) {
      router.push(routes.partnerActivityRevision(activity.id, existingRevision.id));
      return;
    }

    setError(null);
    setRevisionActionId(activity.id);

    try {
      const revision = await createPartnerActivityRevision(activity.id);
      router.push(routes.partnerActivityRevision(activity.id, revision.id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create revision");
    } finally {
      setRevisionActionId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Activities</CardTitle>
            <CardDescription>
              Create drafts, complete trip details, and submit activities for Alpii review.
            </CardDescription>
          </div>
          <ButtonCTA href={routes.partnerActivityNew}>Create activity</ButtonCTA>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]" onSubmit={applyFilters}>
            <Input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search activity title or slug"
              value={search}
            />
            <Select
              onChange={(event) => setStatus(event.target.value as ActivityStatus | "")}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? formatStatus(option) : "All statuses"}
                </option>
              ))}
            </Select>
            <ButtonCTA type="submit" variant="outline">
              Filter
            </ButtonCTA>
          </form>
        </CardContent>
      </Card>

      {isLoading ? <LoadingState label="Loading partner activities" /> : null}
      {error ? <ErrorState description={error} title="Unable to load activities" /> : null}

      {!isLoading && activities.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-brand text-lg font-semibold text-travel-dark">No activities yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-travel-muted">
              Start with a draft, then use the builder to add pricing, itinerary, availability, and images.
            </p>
            <ButtonCTA className="mt-5" href={routes.partnerActivityNew}>
              Create draft
            </ButtonCTA>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {activities.map((activity) => {
          const price = activity.pricing[0];
          const media = activity.media[0];
          const mediaUrl = media?.url ?? media?.file?.url;

          return (
            <Card key={activity.id}>
              <CardContent className="grid gap-4 py-5 md:grid-cols-[96px_1fr_auto] md:items-center">
                <div className="h-20 overflow-hidden rounded-travel-md bg-travel-bg">
                  {mediaUrl ? <img alt="" className="h-full w-full object-cover" src={mediaUrl} /> : null}
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(activity.status)}>{formatStatus(activity.status)}</Badge>
                    {activity.revisions?.[0] ? (
                      <Badge variant={revisionVariant(activity.revisions[0].status)}>
                        {revisionLabel(activity.revisions[0].status)}
                      </Badge>
                    ) : null}
                    <span className="text-xs text-travel-muted">
                      Updated {formatDate(activity.updatedAt)}
                    </span>
                  </div>
                  <p className="font-brand text-base font-semibold text-travel-dark">{activity.title}</p>
                  <p className="mt-1 text-sm text-travel-muted">
                    {formatActivityDestination(activity)} · {activity.category.name}
                  </p>
                  <p className="mt-1 text-xs text-travel-muted">
                    {(activity.options ?? []).length} package option{(activity.options ?? []).length === 1 ? "" : "s"}
                    {activity.status === "PUBLISHED" && activity.revisions?.[0]
                      ? " · Public listing stays live while changes are reviewed"
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <span className="font-interface text-sm font-semibold text-travel-dark">
                    {price ? formatBaseUsd(price.priceCents) : "No price"}
                  </span>
                  {activity.status === "PUBLISHED" ? (
                    <ButtonCTA
                      disabled={revisionActionId === activity.id}
                      isLoading={revisionActionId === activity.id}
                      onClick={() => void openRevision(activity)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {activity.revisions?.[0] ? "Continue changes" : "Edit changes"}
                    </ButtonCTA>
                  ) : (
                    <ButtonCTA href={routes.partnerActivityEdit(activity.id)} size="sm" variant="outline">
                      Edit
                    </ButtonCTA>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function PartnerActivityCreateManager() {
  const router = useRouter();
  const [lookups, setLookups] = useState<ActivityLookups>({
    categories: [],
    cities: [],
    destinations: []
  });
  const [form, setForm] = useState<BasicDetailsState>(emptyBasicDetails);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [cities, categories, destinations] = await Promise.all([
          getPartnerLookupCities(),
          getPartnerLookupCategories(),
          getPartnerLookupDestinations()
        ]);
        setLookups({ cities, categories, destinations });
        setForm((current) => ({
          ...current,
          cityId: cities[0]?.id ?? "",
          destinationId: destinations[0]?.id ?? "",
          categoryId: categories[0]?.id ?? ""
        }));
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load lookups");
      } finally {
        setIsLoading(false);
      }
    }

    void loadLookups();
  }, []);

  async function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const activity = await createPartnerActivity({
        categoryId: form.categoryId,
        cityId: form.cityId || undefined,
        destinationId: form.destinationId || undefined,
        description: form.description,
        shortDescription: form.shortDescription,
        slug: form.slug || undefined,
        title: form.title
      });
      router.push(routes.partnerActivityEdit(activity.id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create activity");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading activity form" />;
  }

  return (
    <div className="grid gap-5">
      <PageIntro
        eyebrow="Partner workspace"
        title="New activity"
        description="Start with the essential details. You can add pricing, availability, media, and itinerary after creating the draft."
      />

      <Card>
        <CardHeader>
          <CardTitle>Basic details</CardTitle>
          <CardDescription>
            These fields create the draft and help Alpii understand what you offer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={createActivity}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Activity title" required>
                <Input
                  onChange={(event) =>
                    setForm((current) => {
                      const currentGeneratedSlug = slugifyForInput(current.title);
                      const nextTitle = event.target.value;
                      const nextGeneratedSlug = slugifyForInput(nextTitle);
                      return {
                        ...current,
                        title: nextTitle,
                        slug:
                          !current.slug || current.slug === currentGeneratedSlug
                            ? nextGeneratedSlug
                            : current.slug
                      };
                    })
                  }
                  placeholder="e.g. Ubud Cooking Class & Market Visit"
                  required
                  value={form.title}
                />
              </Field>
              <Field label="Slug optional">
                <Input
                  onChange={(event) => setForm({ ...form, slug: slugifyForInput(event.target.value) })}
                  placeholder="Auto-generated from title, editable for SEO"
                  value={form.slug}
                />
              </Field>
              <Field label="Destination" required>
                <Select
                  onChange={(event) => setForm({ ...form, destinationId: event.target.value })}
                  required
                  value={form.destinationId}
                >
                  {lookups.destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {formatDestinationOption(destination)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Category" required>
                <Select
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
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
                className="min-h-24"
                onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
                placeholder="e.g. Cook Balinese family recipes after a guided local market visit."
                required
                value={form.shortDescription}
              />
            </Field>
            <Field label="Full description" required>
              <Textarea
                className="min-h-40"
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Describe what guests will do, where they go, and what makes the experience special."
                required
                value={form.description}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonCTA disabled={isSaving} type="submit">
                {isSaving ? "Creating..." : "Create draft"}
              </ButtonCTA>
              {error ? <span className="text-sm font-medium text-red-700">{error}</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function PartnerActivityEditManager({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [activity, setActivity] = useState<PartnerActivity | null>(null);
  const [lookups, setLookups] = useState<ActivityLookups>({
    categories: [],
    cities: [],
    destinations: []
  });
  const [basic, setBasic] = useState<BasicDetailsState>(emptyBasicDetails);
  const [policies, setPolicies] = useState<PoliciesState>(emptyPolicies);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [notIncluded, setNotIncluded] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [itemModal, setItemModal] = useState<ItemModalState>(null);
  const [itineraryModal, setItineraryModal] = useState<ItineraryModalState>(null);
  const [availabilityModal, setAvailabilityModal] = useState<AvailabilityModalState>(null);
  const [mediaUrlModal, setMediaUrlModal] = useState<MediaUrlModalState>(null);
  const [optionModal, setOptionModal] = useState<OptionModalState>(null);
  const isEditable =
    activity ? activity.status === "DRAFT" || activity.status === "REVISION_REQUESTED" : false;

  useEffect(() => {
    void loadAll();
  }, [activityId]);

  async function loadAll() {
    setError(null);
    setIsLoading(true);

    try {
      const [nextActivity, cities, categories, destinations] = await Promise.all([
        getPartnerActivity(activityId),
        getPartnerLookupCities(),
        getPartnerLookupCategories(),
        getPartnerLookupDestinations()
      ]);
      hydrateActivity(nextActivity);
      setLookups({ cities, categories, destinations });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load activity");
    } finally {
      setIsLoading(false);
    }
  }

  function hydrateActivity(nextActivity: PartnerActivity) {
    setActivity(nextActivity);
    setBasic(activityToBasicDetails(nextActivity));
    setPolicies(activityToPolicies(nextActivity));
    setHighlights(toStringArray(nextActivity.highlights));
    setIncluded(toStringArray(nextActivity.included));
    setNotIncluded(toStringArray(nextActivity.notIncluded));
    setItinerary(toItineraryStops(nextActivity.itinerary));
  }

  async function savePartial(input: Partial<PartnerActivityInput>, message: string) {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const updated = await updatePartnerActivity(activityId, input);
      hydrateActivity(updated);
      setSuccess(message);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save activity");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBasic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await savePartial(
      {
        categoryId: basic.categoryId,
        cityId: basic.cityId || undefined,
        destinationId: basic.destinationId || undefined,
        description: basic.description,
        durationLabel: basic.durationLabel || undefined,
        meetingPoint: basic.meetingPoint || undefined,
        shortDescription: basic.shortDescription,
        slug: basic.slug || undefined,
        title: basic.title
      },
      "Basic details saved."
    );
  }

  async function savePolicies(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await savePartial(
      {
        cancellationPolicy: policies.cancellationPolicy || undefined,
        importantInfo: policies.importantInfo || undefined
      },
      "Policies saved."
    );
  }

  async function submitForReview() {
    if (!readiness.canSubmit) return;

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const updated = await submitPartnerActivity(activityId);
      hydrateActivity(updated);
      setSuccess("Activity submitted for review.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to submit activity");
    } finally {
      setIsSaving(false);
    }
  }

  async function beginPublishedRevision() {
    if (!activity) return;

    const existingRevision = activity.revisions?.[0];
    if (existingRevision) {
      router.push(routes.partnerActivityRevision(activity.id, existingRevision.id));
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const revision = await createPartnerActivityRevision(activity.id);
      router.push(routes.partnerActivityRevision(activity.id, revision.id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create revision");
    } finally {
      setIsSaving(false);
    }
  }

  const readiness = useMemo(
    () =>
      activity
        ? getReadiness({
            activity,
            highlights,
            included,
            itinerary,
            notIncluded,
            policies
          })
        : { canSubmit: false, items: [] },
    [activity, highlights, included, itinerary, notIncluded, policies]
  );
  const hasOptionBasedAvailability = (activity?.options?.length ?? 0) > 0;

  if (isLoading) {
    return <LoadingState label="Loading activity builder" />;
  }

  if (!activity) {
    return <ErrorState description={error ?? "Activity not found"} title="Activity unavailable" />;
  }

  if (activity.status === "PUBLISHED") {
    const revision = activity.revisions?.[0];

    return (
      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(activity.status)}>{formatStatus(activity.status)}</Badge>
              {revision ? (
                <Badge variant={revisionVariant(revision.status)}>
                  {revisionLabel(revision.status)}
                </Badge>
              ) : null}
            </div>
            <CardTitle>{activity.title}</CardTitle>
            <CardDescription>
              This activity is published. Changes are edited as a draft revision and require admin
              approval before the public listing changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <ButtonCTA
              disabled={isSaving}
              isLoading={isSaving}
              onClick={() => void beginPublishedRevision()}
              type="button"
            >
              {revision ? "Continue editing changes" : "Edit changes"}
            </ButtonCTA>
            <ButtonCTA href={routes.partnerActivities} type="button" variant="outline">
              Back to activities
            </ButtonCTA>
          </CardContent>
        </Card>
        {error ? <ErrorState description={error} title="Unable to start revision" /> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-travel-lg border border-[#2B2B2B]/15 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(activity.status)}>{formatStatus(activity.status)}</Badge>
              <span className="font-interface text-xs text-travel-muted">
                Updated {formatDate(activity.updatedAt)}
              </span>
            </div>
            <h1 className="font-brand text-2xl font-semibold text-travel-dark">{activity.title}</h1>
            <p className="mt-1 font-interface text-sm text-travel-muted">
              {formatActivityDestination(activity)} · {activity.category.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonCTA disabled={!isEditable || isSaving} onClick={submitForReview} size="sm">
              Submit for review
            </ButtonCTA>
            <ButtonCTA href={routes.partnerActivities} size="sm" variant="outline">
              Back to activities
            </ButtonCTA>
          </div>
        </div>
        {activity.status === "PENDING_REVIEW" ? (
          <div className="mt-4 rounded-travel-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            This activity is pending review. Editing is locked until admin review returns it.
          </div>
        ) : null}
        {error ? <div className="mt-4 text-sm font-medium text-red-700">{error}</div> : null}
        {success ? <div className="mt-4 text-sm font-medium text-emerald-700">{success}</div> : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <SectionAnchor id="basic-details">
            <BasicDetailsSection
              basic={basic}
              disabled={!isEditable || isSaving}
              lookups={lookups}
              onChange={setBasic}
              onSubmit={saveBasic}
            />
          </SectionAnchor>
          <SectionAnchor id="highlights">
            <ListSection
              disabled={!isEditable || isSaving}
              items={highlights}
              onAdd={() => setItemModal({ kind: "highlight", value: "" })}
              onDelete={(index) => {
                const next = removeAt(highlights, index);
                void savePartial({ highlights: next }, "Highlights saved.");
              }}
              onEdit={(index) => setItemModal({ index, kind: "highlight", value: highlights[index] ?? "" })}
              title="Highlights"
              description="Short selling points travelers will scan before booking."
              emptyLabel="No highlights added yet."
            />
          </SectionAnchor>
          <SectionAnchor id="includes">
            <IncludesSection
              disabled={!isEditable || isSaving}
              included={included}
              notIncluded={notIncluded}
              onAddIncluded={() => setItemModal({ kind: "included", value: "" })}
              onAddNotIncluded={() => setItemModal({ kind: "notIncluded", value: "" })}
              onDeleteIncluded={(index) => {
                const next = removeAt(included, index);
                void savePartial({ included: next }, "Included items saved.");
              }}
              onDeleteNotIncluded={(index) => {
                const next = removeAt(notIncluded, index);
                void savePartial({ notIncluded: next }, "Not included items saved.");
              }}
              onEditIncluded={(index) => setItemModal({ index, kind: "included", value: included[index] ?? "" })}
              onEditNotIncluded={(index) =>
                setItemModal({ index, kind: "notIncluded", value: notIncluded[index] ?? "" })
              }
            />
          </SectionAnchor>
          <SectionAnchor id="itinerary">
            <ItinerarySection
              disabled={!isEditable || isSaving}
              items={itinerary}
              onAdd={() => setItineraryModal({ value: emptyItineraryStop })}
              onDelete={(index) => {
                const next = removeAt(itinerary, index);
                void savePartial({ itinerary: next }, "Itinerary saved.");
              }}
              onEdit={(index) =>
                setItineraryModal({ index, value: itinerary[index] ?? emptyItineraryStop })
              }
              onMove={(index, direction) => {
                const next = moveItem(itinerary, index, direction);
                void savePartial({ itinerary: next }, "Itinerary saved.");
              }}
            />
          </SectionAnchor>
          <SectionAnchor id="policies">
            <PoliciesSection
              disabled={!isEditable || isSaving}
              onChange={setPolicies}
              onSubmit={savePolicies}
              policies={policies}
            />
          </SectionAnchor>
          <SectionAnchor id="options">
            <ExperienceOptionsSection
              activity={activity}
              disabled={!isEditable || isSaving}
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
              onUpdated={loadAll}
            />
          </SectionAnchor>
          <SectionAnchor id="pricing">
            <PricingSection activity={activity} disabled={!isEditable || isSaving} onUpdated={loadAll} />
          </SectionAnchor>
          {!hasOptionBasedAvailability ? (
            <SectionAnchor id="availability">
              <AvailabilitySection
                activity={activity}
                disabled={!isEditable || isSaving}
                onAdd={() =>
                  setAvailabilityModal({
                    capacity: "12",
                    endDateTime: "",
                    isActive: true,
                    startDateTime: ""
                  })
                }
                onDeactivate={async (availabilityId) => {
                  setError(null);
                  await deactivatePartnerActivityAvailability(activity.id, availabilityId);
                  await loadAll();
                }}
              />
            </SectionAnchor>
          ) : null}
          <SectionAnchor id="media">
            <MediaSection
              activity={activity}
              disabled={!isEditable || isSaving}
              onAddUrl={() => setMediaUrlModal({ altText: activity.title, isCover: activity.media.length === 0, url: "" })}
              onDelete={async (mediaId) => {
                setError(null);
                await deletePartnerActivityMedia(activity.id, mediaId);
                await loadAll();
              }}
              onUpdated={loadAll}
            />
          </SectionAnchor>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <ReadinessPanel
            activityStatusLabel={formatStatus(activity.status)}
            disabled={!isEditable || isSaving}
            onSubmit={submitForReview}
            readiness={readiness}
          />
        </aside>
      </div>

      <ItemEditorDialog
        modal={itemModal}
        onClose={() => setItemModal(null)}
        onSave={(modal) => {
          const current =
            modal.kind === "highlight" ? highlights : modal.kind === "included" ? included : notIncluded;
          const next =
            modal.index === undefined
              ? [...current, modal.value.trim()].filter(Boolean)
              : replaceAt(current, modal.index, modal.value.trim()).filter(Boolean);
          setItemModal(null);

          if (modal.kind === "highlight") void savePartial({ highlights: next }, "Highlights saved.");
          if (modal.kind === "included") void savePartial({ included: next }, "Included items saved.");
          if (modal.kind === "notIncluded") void savePartial({ notIncluded: next }, "Not included items saved.");
        }}
      />
      <ItineraryEditorDialog
        modal={itineraryModal}
        onClose={() => setItineraryModal(null)}
        onSave={(modal) => {
          const next =
            modal.index === undefined
              ? [...itinerary, modal.value]
              : replaceAt(itinerary, modal.index, modal.value);
          setItineraryModal(null);
          void savePartial({ itinerary: next }, "Itinerary saved.");
        }}
      />
      <AvailabilityDialog
        modal={availabilityModal}
        onClose={() => setAvailabilityModal(null)}
        onSave={async (modal) => {
          setError(null);
          await createPartnerActivityAvailability(activity.id, {
            capacity: modal.capacity ? Number(modal.capacity) : undefined,
            endDateTime: modal.endDateTime ? new Date(modal.endDateTime).toISOString() : undefined,
            isActive: modal.isActive,
            startDateTime: new Date(modal.startDateTime).toISOString()
          });
          setAvailabilityModal(null);
          await loadAll();
        }}
      />
      <MediaUrlDialog
        modal={mediaUrlModal}
        onClose={() => setMediaUrlModal(null)}
        onSave={async (modal) => {
          await createPartnerActivityMedia(activity.id, {
            altText: modal.altText || activity.title,
            isCover: modal.isCover,
            url: modal.url
          });
          setMediaUrlModal(null);
          await loadAll();
        }}
      />
      <OptionDialog
        modal={optionModal}
        onClose={() => setOptionModal(null)}
        onSave={async (modal) => {
          const payload = {
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
            await updatePartnerActivityOption(activity.id, modal.id, payload);
          } else {
            await createPartnerActivityOption(activity.id, payload);
          }
          setOptionModal(null);
          await loadAll();
        }}
      />
    </div>
  );
}

function PageIntro({
  description,
  eyebrow,
  title
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="font-interface text-xs font-semibold uppercase tracking-[0.14em] text-travel-muted">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-brand text-2xl font-semibold text-travel-dark">{title}</h1>
      <p className="mt-2 max-w-3xl font-interface text-sm leading-6 text-travel-muted">
        {description}
      </p>
    </div>
  );
}

export function PartnerActivityRevisionManager({
  activityId,
  revisionId
}: {
  activityId: string;
  revisionId: string;
}) {
  const [revision, setRevision] = useState<ActivityRevision | null>(null);
  const [lookups, setLookups] = useState<ActivityLookups>({
    categories: [],
    cities: [],
    destinations: []
  });
  const [basic, setBasic] = useState<BasicDetailsState>(emptyBasicDetails);
  const [policies, setPolicies] = useState<PoliciesState>(emptyPolicies);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [notIncluded, setNotIncluded] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [itemModal, setItemModal] = useState<ItemModalState>(null);
  const [itineraryModal, setItineraryModal] = useState<ItineraryModalState>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadRevision();
  }, [activityId, revisionId]);

  async function loadRevision() {
    setError(null);
    setIsLoading(true);

    try {
      const [nextRevision, cities, categories, destinations] = await Promise.all([
        getPartnerActivityRevision(activityId, revisionId),
        getPartnerLookupCities(),
        getPartnerLookupCategories(),
        getPartnerLookupDestinations()
      ]);
      hydrateRevision(nextRevision);
      setLookups({ cities, categories, destinations });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load revision");
    } finally {
      setIsLoading(false);
    }
  }

  function hydrateRevision(nextRevision: ActivityRevision) {
    const snapshotActivity = nextRevision.snapshot.activity;
    setRevision(nextRevision);
    setBasic({
      categoryId: snapshotActivity.categoryId ?? "",
      cityId: snapshotActivity.cityId ?? "",
      destinationId: snapshotActivity.destinationId ?? "",
      description: snapshotActivity.description ?? "",
      durationLabel: snapshotActivity.durationLabel ?? "",
      meetingPoint: snapshotActivity.meetingPoint ?? "",
      shortDescription: snapshotActivity.shortDescription ?? "",
      slug: snapshotActivity.slug ?? "",
      title: snapshotActivity.title ?? ""
    });
    setPolicies({
      cancellationPolicy: snapshotActivity.cancellationPolicy ?? "",
      importantInfo: snapshotActivity.importantInfo ?? ""
    });
    setHighlights(toStringArray(snapshotActivity.highlights));
    setIncluded(toStringArray(snapshotActivity.included));
    setNotIncluded(toStringArray(snapshotActivity.notIncluded));
    setItinerary(toItineraryStops(snapshotActivity.itinerary));
  }

  async function saveSnapshot(nextSnapshot: ActivityRevisionSnapshot, message: string) {
    if (!revision || isReadOnlyRevision(revision.status)) return;

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const updated = await updatePartnerActivityRevision(activityId, revision.id, nextSnapshot);
      hydrateRevision(updated);
      setSuccess(message);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save revision");
    } finally {
      setIsSaving(false);
    }
  }

  function snapshotWithActivity(input: Partial<ActivityRevisionSnapshot["activity"]>) {
    if (!revision) throw new Error("Revision is not loaded");

    return {
      ...revision.snapshot,
      activity: {
        ...revision.snapshot.activity,
        ...input
      }
    };
  }

  async function saveBasic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSnapshot(
      snapshotWithActivity({
        categoryId: basic.categoryId,
        cityId: basic.cityId,
        destinationId: basic.destinationId || null,
        description: basic.description,
        durationLabel: basic.durationLabel || null,
        meetingPoint: basic.meetingPoint || null,
        shortDescription: basic.shortDescription,
        slug: basic.slug,
        title: basic.title
      }),
      "Revision basic details saved."
    );
  }

  async function savePolicies(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSnapshot(
      snapshotWithActivity({
        cancellationPolicy: policies.cancellationPolicy || null,
        importantInfo: policies.importantInfo || null
      }),
      "Revision policies saved."
    );
  }

  async function submitRevision() {
    if (!revision || isReadOnlyRevision(revision.status)) return;

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const updated = await submitPartnerActivityRevision(activityId, revision.id);
      hydrateRevision(updated);
      setSuccess("Revision submitted for admin review.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to submit revision");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading activity revision" />;
  }

  if (!revision) {
    return <ErrorState description={error ?? "Revision not found"} title="Revision unavailable" />;
  }

  const disabled = isSaving || isReadOnlyRevision(revision.status);
  const revisionReadiness = getRevisionReadiness({
    basic,
    policies,
    highlights,
    included,
    itinerary,
    notIncluded,
    snapshot: revision.snapshot
  });

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={revisionVariant(revision.status)}>{revisionLabel(revision.status)}</Badge>
              <Badge variant="success">Live remains published</Badge>
            </div>
            <CardTitle>{basic.title || "Activity revision"}</CardTitle>
            <CardDescription>
              You are editing a draft revision. The public activity remains unchanged until admin
              approval applies these changes.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonCTA
              disabled={disabled}
              isLoading={isSaving}
              onClick={() => void submitRevision()}
              size="sm"
              type="button"
            >
              Submit changes for review
            </ButtonCTA>
            <ButtonCTA href={routes.partnerActivityEdit(activityId)} size="sm" type="button" variant="outline">
              Back to live activity
            </ButtonCTA>
          </div>
        </CardHeader>
        {revision.status === "PENDING_REVIEW" ? (
          <CardContent>
            <div className="rounded-travel-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Waiting for admin review. Editing is locked until the revision is approved or rejected.
            </div>
          </CardContent>
        ) : null}
        {revision.status === "REJECTED" && revision.rejectionReason ? (
          <CardContent>
            <div className="rounded-travel-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <span className="font-semibold">Revision requested:</span> {revision.rejectionReason}
            </div>
          </CardContent>
        ) : null}
      </Card>

      {error ? <ErrorState description={error} title="Unable to save revision" /> : null}
      {success ? <p className="text-sm font-semibold text-emerald-700">{success}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <SectionAnchor id="basic-details">
            <BasicDetailsSection
              basic={basic}
              disabled={disabled}
              lookups={lookups}
              onChange={setBasic}
              onSubmit={saveBasic}
            />
          </SectionAnchor>
          <SectionAnchor id="highlights">
            <ListSection
              description="Short selling points travelers will scan before booking."
              disabled={disabled}
              emptyLabel="No highlights added yet."
              items={highlights}
              onAdd={() => setItemModal({ kind: "highlight", value: "" })}
              onDelete={(index) => {
                const next = removeAt(highlights, index);
                void saveSnapshot(snapshotWithActivity({ highlights: next }), "Revision highlights saved.");
              }}
              onEdit={(index) => setItemModal({ index, kind: "highlight", value: highlights[index] ?? "" })}
              title="Highlights"
            />
          </SectionAnchor>
          <SectionAnchor id="includes">
            <IncludesSection
              disabled={disabled}
              included={included}
              notIncluded={notIncluded}
              onAddIncluded={() => setItemModal({ kind: "included", value: "" })}
              onAddNotIncluded={() => setItemModal({ kind: "notIncluded", value: "" })}
              onDeleteIncluded={(index) => {
                const next = removeAt(included, index);
                void saveSnapshot(snapshotWithActivity({ included: next }), "Revision included items saved.");
              }}
              onDeleteNotIncluded={(index) => {
                const next = removeAt(notIncluded, index);
                void saveSnapshot(snapshotWithActivity({ notIncluded: next }), "Revision not included items saved.");
              }}
              onEditIncluded={(index) => setItemModal({ index, kind: "included", value: included[index] ?? "" })}
              onEditNotIncluded={(index) =>
                setItemModal({ index, kind: "notIncluded", value: notIncluded[index] ?? "" })
              }
            />
          </SectionAnchor>
          <SectionAnchor id="itinerary">
            <ItinerarySection
              disabled={disabled}
              items={itinerary}
              onAdd={() => setItineraryModal({ value: emptyItineraryStop })}
              onDelete={(index) => {
                const next = removeAt(itinerary, index);
                void saveSnapshot(snapshotWithActivity({ itinerary: next }), "Revision itinerary saved.");
              }}
              onEdit={(index) => setItineraryModal({ index, value: itinerary[index] ?? emptyItineraryStop })}
              onMove={(index, direction) => {
                const next = moveItem(itinerary, index, direction);
                void saveSnapshot(snapshotWithActivity({ itinerary: next }), "Revision itinerary saved.");
              }}
            />
          </SectionAnchor>
          <SectionAnchor id="policies">
            <PoliciesSection
              disabled={disabled}
              onChange={setPolicies}
              onSubmit={savePolicies}
              policies={policies}
            />
          </SectionAnchor>
          <SectionAnchor id="options">
            <RevisionOptionsSnapshotSection
              disabled={disabled}
              onSave={(options) =>
                saveSnapshot({ ...revision.snapshot, options }, "Revision package options saved.")
              }
              options={revision.snapshot.options ?? []}
            />
          </SectionAnchor>
        </div>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <ReadinessPanel
            activityStatusLabel={revisionLabel(revision.status)}
            disabled={disabled}
            note="The published listing stays live until admin approval applies this revision."
            onSubmit={submitRevision}
            readiness={revisionReadiness}
            submitLabel="Submit changes for review"
          />
        </aside>
      </div>

      <ItemEditorDialog
        modal={itemModal}
        onClose={() => setItemModal(null)}
        onSave={(modal) => {
          const current =
            modal.kind === "highlight" ? highlights : modal.kind === "included" ? included : notIncluded;
          const next =
            modal.index === undefined
              ? [...current, modal.value.trim()].filter(Boolean)
              : replaceAt(current, modal.index, modal.value.trim()).filter(Boolean);
          setItemModal(null);

          if (modal.kind === "highlight") void saveSnapshot(snapshotWithActivity({ highlights: next }), "Revision highlights saved.");
          if (modal.kind === "included") void saveSnapshot(snapshotWithActivity({ included: next }), "Revision included items saved.");
          if (modal.kind === "notIncluded") void saveSnapshot(snapshotWithActivity({ notIncluded: next }), "Revision not included items saved.");
        }}
      />
      <ItineraryEditorDialog
        modal={itineraryModal}
        onClose={() => setItineraryModal(null)}
        onSave={(modal) => {
          const next =
            modal.index === undefined
              ? [...itinerary, modal.value]
              : replaceAt(itinerary, modal.index, modal.value);
          setItineraryModal(null);
          void saveSnapshot(snapshotWithActivity({ itinerary: next }), "Revision itinerary saved.");
        }}
      />
    </div>
  );
}

function Field({
  children,
  hint,
  label,
  required
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-interface text-sm font-semibold text-travel-dark">
        {label}
        {required ? <span className="text-travel-primary"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs leading-5 text-travel-muted">{hint}</span> : null}
    </label>
  );
}

function SectionAnchor({
  children,
  id
}: {
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section className="scroll-mt-28" id={id}>
      {children}
    </section>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <span
        className="inline-flex size-5 items-center justify-center rounded-full border border-[#2B2B2B]/15 bg-travel-bg text-travel-muted"
        tabIndex={0}
      >
        <Info className="size-3.5" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-travel-md bg-travel-dark px-3 py-2 text-xs font-medium leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}

function BasicDetailsSection({
  basic,
  disabled,
  lookups,
  onChange,
  onSubmit
}: {
  basic: BasicDetailsState;
  disabled: boolean;
  lookups: ActivityLookups;
  onChange: (next: BasicDetailsState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  function update(field: keyof BasicDetailsState, value: string) {
    if (field === "title") {
      const currentGeneratedSlug = slugifyForInput(basic.title);
      const nextGeneratedSlug = slugifyForInput(value);
      onChange({
        ...basic,
        title: value,
        slug: !basic.slug || basic.slug === currentGeneratedSlug ? nextGeneratedSlug : basic.slug
      });
      return;
    }

    onChange({ ...basic, [field]: value });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic details</CardTitle>
        <CardDescription>Main listing content and operational meeting details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Activity title" required>
              <Input disabled={disabled} onChange={(event) => update("title", event.target.value)} required value={basic.title} />
            </Field>
            <Field label="Slug">
              <Input
                disabled={disabled}
                onChange={(event) => update("slug", slugifyForInput(event.target.value))}
                placeholder="Auto-generated from title, editable for SEO"
                value={basic.slug}
              />
            </Field>
            <Field label="Destination" required>
              <Select disabled={disabled} onChange={(event) => update("destinationId", event.target.value)} required value={basic.destinationId}>
                {lookups.destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {formatDestinationOption(destination)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category" required>
              <Select disabled={disabled} onChange={(event) => update("categoryId", event.target.value)} required value={basic.categoryId}>
                {lookups.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Short description" required>
            <Textarea className="min-h-24" disabled={disabled} onChange={(event) => update("shortDescription", event.target.value)} required value={basic.shortDescription} />
          </Field>
          <Field label="Full description" required>
            <Textarea className="min-h-40" disabled={disabled} onChange={(event) => update("description", event.target.value)} required value={basic.description} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Duration label">
              <Input disabled={disabled} onChange={(event) => update("durationLabel", event.target.value)} placeholder="e.g. 3.5 hours" value={basic.durationLabel} />
            </Field>
            <Field label="Meeting point">
              <Input disabled={disabled} onChange={(event) => update("meetingPoint", event.target.value)} placeholder="e.g. Lobby near Asakusa Station" value={basic.meetingPoint} />
            </Field>
          </div>
          <ButtonCTA className="w-fit" disabled={disabled} type="submit">
            Save basic details
          </ButtonCTA>
        </form>
      </CardContent>
    </Card>
  );
}

function ListSection({
  description,
  disabled,
  emptyLabel,
  items,
  onAdd,
  onDelete,
  onEdit,
  title
}: {
  description: string;
  disabled: boolean;
  emptyLabel: string;
  items: string[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  title: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <ButtonCTA disabled={disabled} leftIcon={<Plus className="size-4" />} onClick={onAdd} size="sm" type="button" variant="outline">
          Add highlight
        </ButtonCTA>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="grid gap-2">
            {items.map((item, index) => (
              <EditableListRow disabled={disabled} key={`${item}-${index}`} onDelete={() => onDelete(index)} onEdit={() => onEdit(index)} text={item} />
            ))}
          </div>
        ) : (
          <EmptyState description="Use short, specific traveler-facing points." title={emptyLabel} />
        )}
      </CardContent>
    </Card>
  );
}

function IncludesSection({
  disabled,
  included,
  notIncluded,
  onAddIncluded,
  onAddNotIncluded,
  onDeleteIncluded,
  onDeleteNotIncluded,
  onEditIncluded,
  onEditNotIncluded
}: {
  disabled: boolean;
  included: string[];
  notIncluded: string[];
  onAddIncluded: () => void;
  onAddNotIncluded: () => void;
  onDeleteIncluded: (index: number) => void;
  onDeleteNotIncluded: (index: number) => void;
  onEditIncluded: (index: number) => void;
  onEditNotIncluded: (index: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Includes / Not included</CardTitle>
        <CardDescription>Clarify what travelers receive and what they should arrange themselves.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <MiniList
          addLabel="Add included item"
          disabled={disabled}
          emptyLabel="No included items yet."
          items={included}
          onAdd={onAddIncluded}
          onDelete={onDeleteIncluded}
          onEdit={onEditIncluded}
          title="Included"
        />
        <MiniList
          addLabel="Add not included item"
          disabled={disabled}
          emptyLabel="No not included items yet."
          items={notIncluded}
          onAdd={onAddNotIncluded}
          onDelete={onDeleteNotIncluded}
          onEdit={onEditNotIncluded}
          title="Not included"
        />
      </CardContent>
    </Card>
  );
}

function MiniList({
  addLabel,
  disabled,
  emptyLabel,
  items,
  onAdd,
  onDelete,
  onEdit,
  title
}: {
  addLabel: string;
  disabled: boolean;
  emptyLabel: string;
  items: string[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  title: string;
}) {
  return (
    <div className="rounded-travel-lg border border-[#2B2B2B]/15 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-brand text-base font-semibold text-travel-dark">{title}</h3>
        <ButtonCTA disabled={disabled} onClick={onAdd} size="sm" type="button" variant="ghost">
          {addLabel}
        </ButtonCTA>
      </div>
      <div className="grid gap-2">
        {items.length ? (
          items.map((item, index) => (
            <EditableListRow disabled={disabled} key={`${item}-${index}`} onDelete={() => onDelete(index)} onEdit={() => onEdit(index)} text={item} />
          ))
        ) : (
          <p className="rounded-travel-md bg-travel-bg p-3 text-sm text-travel-muted">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function EditableListRow({
  disabled,
  onDelete,
  onEdit,
  text
}: {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-travel-md border border-[#2B2B2B]/10 bg-white p-3">
      <p className="text-sm text-travel-dark">{text}</p>
      <div className="flex gap-1">
        <IconButton disabled={disabled} label="Edit" onClick={onEdit}>
          <Pencil className="size-4" />
        </IconButton>
        <IconButton disabled={disabled} label="Delete" onClick={onDelete}>
          <Trash2 className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

function ItinerarySection({
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
          <CardDescription>Build a readable timeline. No JSON editing required.</CardDescription>
        </div>
        <ButtonCTA disabled={disabled} leftIcon={<ListPlus className="size-4" />} onClick={onAdd} size="sm" type="button" variant="outline">
          Add itinerary stop
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
                  <IconButton disabled={disabled || index === 0} label="Move up" onClick={() => onMove(index, -1)}>
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton disabled={disabled || index === items.length - 1} label="Move down" onClick={() => onMove(index, 1)}>
                    <ArrowDown className="size-4" />
                  </IconButton>
                  <IconButton disabled={disabled} label="Edit" onClick={() => onEdit(index)}>
                    <Pencil className="size-4" />
                  </IconButton>
                  <IconButton disabled={disabled} label="Delete" onClick={() => onDelete(index)}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="Add the main stops travelers will experience." title="No itinerary stops yet" />
        )}
      </CardContent>
    </Card>
  );
}

function PoliciesSection({
  disabled,
  onChange,
  onSubmit,
  policies
}: {
  disabled: boolean;
  onChange: (next: PoliciesState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  policies: PoliciesState;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policies & important info</CardTitle>
        <CardDescription>Set traveler expectations before booking.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="Cancellation policy">
            <Textarea
              disabled={disabled}
              onChange={(event) => onChange({ ...policies, cancellationPolicy: event.target.value })}
              placeholder="e.g. Cancel up to 24 hours in advance for a full refund."
              value={policies.cancellationPolicy}
            />
          </Field>
          <Field label="Important information">
            <Textarea
              disabled={disabled}
              onChange={(event) => onChange({ ...policies, importantInfo: event.target.value })}
              placeholder="e.g. Please arrive 10 minutes early and wear comfortable shoes."
              value={policies.importantInfo}
            />
          </Field>
          <ButtonCTA className="w-fit" disabled={disabled} type="submit">
            Save policies
          </ButtonCTA>
        </form>
      </CardContent>
    </Card>
  );
}

function RevisionOptionsSnapshotSection({
  disabled,
  onSave,
  options
}: {
  disabled: boolean;
  onSave: (options: PartnerActivityOption[]) => Promise<void>;
  options: PartnerActivityOption[];
}) {
  const [optionDraft, setOptionDraft] = useState<PartnerActivityOption | null>(null);
  const [tierModal, setTierModal] = useState<PricingTierForm | null>(null);
  const [sessionModal, setSessionModal] = useState<NonNullable<AvailabilityModalState> | null>(null);
  const [isSavingOption, setIsSavingOption] = useState(false);

  const hasOptionDraft = Boolean(optionDraft);
  const activeOptionIndex = optionDraft ? options.findIndex((item) => item.id === optionDraft.id) : -1;

  function openOptionDraft(option?: PartnerActivityOption) {
    if (option) {
      setOptionDraft({
        ...option,
        pricingTiers: option.pricingTiers.map((tier) => ({ ...tier })),
        availability: option.availability.map((slot) => ({ ...slot })),
        availableDays: [...(option.availableDays ?? [])],
        meetingTimes: [...(option.meetingTimes ?? [])]
      });
      return;
    }

    const now = new Date().toISOString();
    setOptionDraft({
      activityId: "",
      availability: [],
      availabilityMode: "SCHEDULED_SESSIONS",
      availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      createdAt: now,
      dailyCapacity: 12,
      description: "",
      durationLabel: "",
      id: `revision-option-${Date.now()}`,
      isActive: true,
      isDefault: options.length === 0,
      meetingPoint: "",
      meetingTimes: ["07:00", "08:00", "09:00"],
      pricingTiers: [],
      slug: "",
      sortOrder: options.length + 1,
      title: "",
      updatedAt: now
    });
  }

  async function commitOptionDraft() {
    if (!optionDraft) return;

    setIsSavingOption(true);

    try {
      const nextOptions =
        activeOptionIndex >= 0
          ? replaceAt(options, activeOptionIndex, {
              ...optionDraft,
              updatedAt: new Date().toISOString()
            })
          : [
              ...options,
              {
                ...optionDraft,
                updatedAt: new Date().toISOString()
              }
            ];
      await onSave(nextOptions);
      setOptionDraft(null);
    } finally {
      setIsSavingOption(false);
    }
  }

  function updateDraft(patch: Partial<PartnerActivityOption>) {
    if (!optionDraft) return;
    setOptionDraft({ ...optionDraft, ...patch });
  }

  function saveDraftTier(modal: PricingTierForm) {
    if (!optionDraft) return;

    const adultPriceCents = parseUsdInputToMinor(modal.adultPrice);
    const childPriceCents = modal.childAllowed
      ? modal.childPrice
        ? parseUsdInputToMinor(modal.childPrice)
        : Math.round(adultPriceCents * 0.73)
      : null;

    const nextTier = {
      activityId: optionDraft.activityId,
      adultPriceCents,
      childDiscountPercent: childPriceCents == null ? null : 27,
      childPriceCents,
      createdAt: new Date().toISOString(),
      currency: "USD",
      id:
        modal.index === undefined
          ? `revision-tier-${Date.now()}`
          : optionDraft.pricingTiers[modal.index]?.id ?? `revision-tier-${Date.now()}`,
      isActive: modal.isActive,
      maxTravelers: Number(modal.maxTravelers),
      minTravelers: Number(modal.minTravelers),
      optionId: optionDraft.id,
      priceType: "per_person",
      updatedAt: new Date().toISOString()
    };

    const nextPricingTiers =
      modal.index === undefined
        ? [...optionDraft.pricingTiers, nextTier]
        : replaceAt(optionDraft.pricingTiers, modal.index, nextTier);

    setOptionDraft({ ...optionDraft, pricingTiers: nextPricingTiers });
    setTierModal(null);
  }

  function saveDraftSession(modal: NonNullable<AvailabilityModalState>) {
    if (!optionDraft) return;

    const nextSession = {
      activityId: optionDraft.activityId,
      bookedCount: 0,
      capacity: modal.capacity ? Number(modal.capacity) : null,
      createdAt: new Date().toISOString(),
      endDateTime: modal.endDateTime ? new Date(modal.endDateTime).toISOString() : null,
      id: `revision-session-${Date.now()}`,
      isActive: modal.isActive,
      optionId: optionDraft.id,
      startDateTime: new Date(modal.startDateTime).toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOptionDraft({
      ...optionDraft,
      availability: [...optionDraft.availability, nextSession]
    });
    setSessionModal(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CardTitle>Package options</CardTitle>
        <div className="flex flex-col gap-3 sm:items-end">
          <CardDescription>
            Proposed package names, USD pricing tiers, and availability. Changes stay in this revision until approved.
          </CardDescription>
          <ButtonCTA
            disabled={disabled}
            leftIcon={<Plus className="size-4" />}
            onClick={() => openOptionDraft()}
            size="sm"
            type="button"
            variant="outline"
          >
            Add option
          </ButtonCTA>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {options.length ? (
          options.map((option) => (
            <div className="flex flex-col gap-3 rounded-travel-lg border border-[#2B2B2B]/15 p-4 sm:flex-row sm:items-start sm:justify-between" key={option.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-interface text-sm font-semibold text-travel-dark">{option.title}</p>
                  {option.isDefault ? <Badge variant="info">Default</Badge> : null}
                  <Badge variant={option.isActive ? "success" : "neutral"}>
                    {option.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-travel-muted">
                  {option.availabilityMode === "ALWAYS_AVAILABLE" ? "Available every day" : "Scheduled sessions"}
                  {option.durationLabel ? ` · ${option.durationLabel}` : ""}
                </p>
                <p className="mt-2 text-sm text-travel-muted">
                  {getOptionFromPriceLabel(option)} · {getOptionAvailabilitySummary(option)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <ButtonCTA
                  disabled={disabled}
                  onClick={() => openOptionDraft(option)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Manage option
                </ButtonCTA>
              </div>
            </div>
          ))
        ) : (
          <EmptyState description="This revision has no package option snapshot." title="No package options" />
        )}
      </CardContent>

      <Dialog
        description="Edit one package option at a time so pricing and availability stay readable."
        onClose={() => {
          if (isSavingOption) return;
          setOptionDraft(null);
          setTierModal(null);
          setSessionModal(null);
        }}
        open={hasOptionDraft}
        title={optionDraft?.title ? optionDraft.title : "Add option"}
      >
        {optionDraft ? (
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              void commitOptionDraft();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Option title" required>
                <Input
                  onChange={(event) => {
                    const currentGeneratedSlug = slugifyForInput(optionDraft.title);
                    const nextTitle = event.target.value;
                    const nextGeneratedSlug = slugifyForInput(nextTitle);
                    updateDraft({
                      title: nextTitle,
                      slug:
                        !optionDraft.slug || optionDraft.slug === currentGeneratedSlug
                          ? nextGeneratedSlug
                          : optionDraft.slug
                    });
                  }}
                  required
                  value={optionDraft.title}
                />
              </Field>
              <Field label="Slug">
                <Input
                  onChange={(event) => updateDraft({ slug: slugifyForInput(event.target.value) })}
                  placeholder="Auto-generated from option name, editable for SEO"
                  value={optionDraft.slug}
                />
              </Field>
              <Field label="Availability mode" required>
                <Select
                  onChange={(event) =>
                    updateDraft({
                      availabilityMode: event.target.value as AvailabilityMode,
                      availability:
                        event.target.value === "ALWAYS_AVAILABLE" ? [] : optionDraft.availability
                    })
                  }
                  value={optionDraft.availabilityMode}
                >
                  <option value="SCHEDULED_SESSIONS">Scheduled sessions</option>
                  <option value="ALWAYS_AVAILABLE">Available every day</option>
                </Select>
              </Field>
              <Field label="Sort order">
                <Input
                  min={0}
                  onChange={(event) => updateDraft({ sortOrder: Number(event.target.value || 0) })}
                  type="number"
                  value={String(optionDraft.sortOrder)}
                />
              </Field>
              <Field label="Duration override">
                <Input
                  onChange={(event) => updateDraft({ durationLabel: event.target.value || null })}
                  value={optionDraft.durationLabel ?? ""}
                />
              </Field>
              <Field label="Meeting point override">
                <Input
                  onChange={(event) => updateDraft({ meetingPoint: event.target.value || null })}
                  value={optionDraft.meetingPoint ?? ""}
                />
              </Field>
              <Field label="Meeting times">
                <Input
                  onChange={(event) => updateDraft({ meetingTimes: parseMeetingTimesInput(event.target.value) })}
                  placeholder="07:00, 08:00, 09:00"
                  value={(optionDraft.meetingTimes ?? []).join(", ")}
                />
              </Field>
            </div>

            <Field label="Option description">
              <Textarea
                className="min-h-24"
                onChange={(event) => updateDraft({ description: event.target.value || null })}
                value={optionDraft.description ?? ""}
              />
            </Field>

            {optionDraft.availabilityMode === "ALWAYS_AVAILABLE" ? (
              <div className="grid gap-3 rounded-travel-lg border border-[#2B2B2B]/15 p-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-start">
                  <div>
                    <p className="font-interface text-sm font-semibold text-travel-dark">Available days</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {weekdayOptions.map((day) => (
                        <label className="flex items-center gap-2 text-sm text-travel-dark" key={day}>
                          <input
                            checked={(optionDraft.availableDays ?? []).includes(day)}
                            onChange={(event) =>
                              updateDraft({
                                availableDays: event.target.checked
                                  ? [...new Set([...(optionDraft.availableDays ?? []), day])]
                                  : (optionDraft.availableDays ?? []).filter((item) => item !== day)
                              })
                            }
                            type="checkbox"
                          />
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="Daily capacity">
                    <Input
                      min={1}
                      onChange={(event) =>
                        updateDraft({
                          dailyCapacity: event.target.value ? Number(event.target.value) : null
                        })
                      }
                      type="number"
                      value={optionDraft.dailyCapacity == null ? "" : String(optionDraft.dailyCapacity)}
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 rounded-travel-lg border border-[#2B2B2B]/15 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-interface text-sm font-semibold text-travel-dark">Scheduled sessions</p>
                    <p className="text-sm text-travel-muted">Add fixed departures for this option.</p>
                  </div>
                  <ButtonCTA
                    leftIcon={<Plus className="size-4" />}
                    onClick={() =>
                      setSessionModal({
                        capacity: optionDraft.dailyCapacity == null ? "12" : String(optionDraft.dailyCapacity),
                        endDateTime: "",
                        isActive: true,
                        startDateTime: ""
                      })
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Add session
                  </ButtonCTA>
                </div>
                {optionDraft.availability.length ? (
                  <div className="grid gap-2">
                    {optionDraft.availability.map((slot, slotIndex) => (
                      <div className="flex items-center justify-between rounded-travel-md bg-travel-bg px-3 py-3 text-sm" key={slot.id}>
                        <div>
                          <p className="font-medium text-travel-dark">
                            {formatDate(slot.startDateTime, "en-US", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-xs text-travel-muted">
                            Capacity {slot.capacity ?? "Open"} · {slot.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                        <ButtonCTA
                          onClick={() =>
                            updateDraft({
                              availability: optionDraft.availability.filter((_, index) => index !== slotIndex)
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Remove
                        </ButtonCTA>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-travel-md bg-travel-bg px-3 py-3 text-sm text-travel-muted">
                    No scheduled sessions yet.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-3 rounded-travel-lg border border-[#2B2B2B]/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-interface text-sm font-semibold text-travel-dark">Pricing tiers</p>
                  <p className="text-sm text-travel-muted">USD tier pricing based on traveler count.</p>
                </div>
                <ButtonCTA
                  leftIcon={<Plus className="size-4" />}
                  onClick={() =>
                    setTierModal({
                      adultPrice: "",
                      childAllowed: true,
                      childDiscountPercent: "27",
                      childPrice: "",
                      isActive: true,
                      maxTravelers: "",
                      minTravelers: ""
                    })
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Add tier
                </ButtonCTA>
              </div>
              {optionDraft.pricingTiers.length ? (
                <div className="grid gap-2">
                  {optionDraft.pricingTiers.map((tier, tierIndex) => (
                    <div className="flex items-center justify-between rounded-travel-md bg-travel-bg px-3 py-3 text-sm" key={tier.id}>
                      <div>
                        <p className="font-medium text-travel-dark">
                          {tier.minTravelers === tier.maxTravelers
                            ? `${tier.minTravelers} traveler`
                            : `${tier.minTravelers}-${tier.maxTravelers} travelers`}
                        </p>
                        <p className="text-xs text-travel-muted">
                          Adult {formatBaseUsd(tier.adultPriceCents)} ·{" "}
                          {tier.childPriceCents == null
                            ? "Not available for child"
                            : `Child ${formatBaseUsd(tier.childPriceCents)}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <ButtonCTA
                          onClick={() =>
                            setTierModal({
                              adultPrice: usdMinorToInput(tier.adultPriceCents),
                              childAllowed:
                                tier.childPriceCents != null || tier.childDiscountPercent != null,
                              childDiscountPercent: String(tier.childDiscountPercent ?? 27),
                              childPrice: tier.childPriceCents == null ? "" : usdMinorToInput(tier.childPriceCents),
                              index: tierIndex,
                              isActive: tier.isActive,
                              maxTravelers: String(tier.maxTravelers),
                              minTravelers: String(tier.minTravelers)
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Edit
                        </ButtonCTA>
                        <ButtonCTA
                          onClick={() =>
                            updateDraft({
                              pricingTiers: optionDraft.pricingTiers.filter((_, index) => index !== tierIndex)
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Remove
                        </ButtonCTA>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-travel-md bg-travel-bg px-3 py-3 text-sm text-travel-muted">
                  No pricing tiers in this option snapshot yet.
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
              <input
                checked={optionDraft.isActive}
                onChange={(event) => updateDraft({ isActive: event.target.checked })}
                type="checkbox"
              />
              Active option
            </label>

            <DialogActions
              isSaving={isSavingOption}
              onCancel={() => {
                if (isSavingOption) return;
                setOptionDraft(null);
                setTierModal(null);
                setSessionModal(null);
              }}
              submitLabel="Save option"
            />
          </form>
        ) : null}
      </Dialog>

      <OptionTierDialog
        modal={hasOptionDraft && tierModal ? { ...tierModal, optionId: optionDraft?.id ?? "" } : null}
        onClose={() => setTierModal(null)}
        onSave={async (modal) => {
          saveDraftTier(modal);
        }}
      />
      <OptionAvailabilityDialog
        modal={hasOptionDraft && sessionModal ? { ...sessionModal, optionId: optionDraft?.id ?? "" } : null}
        onClose={() => setSessionModal(null)}
        onSave={async (modal) => {
          saveDraftSession(modal);
        }}
      />
    </Card>
  );
}

function getOptionFromPriceLabel(option: PartnerActivityOption) {
  const activeTier = option.pricingTiers.find((tier) => tier.isActive) ?? option.pricingTiers[0];
  if (!activeTier) {
    return "No pricing yet";
  }

  return `From ${formatBaseUsd(activeTier.adultPriceCents)}`;
}

function getOptionAvailabilitySummary(option: PartnerActivityOption) {
  if (option.availabilityMode === "ALWAYS_AVAILABLE") {
    const meetingTimes = option.meetingTimes?.length ? ` · Times ${option.meetingTimes.map(formatOptionMeetingTime).join(", ")}` : "";
    return `Every day${option.dailyCapacity ? ` · Capacity ${option.dailyCapacity}` : ""}${meetingTimes}`;
  }

  return option.availability.length
    ? `${option.availability.length} scheduled session${option.availability.length === 1 ? "" : "s"}`
    : "No scheduled sessions";
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

function PricingSection({
  activity,
  disabled,
  onUpdated
}: {
  activity: PartnerActivity;
  disabled: boolean;
  onUpdated: () => Promise<void>;
}) {
  const activePrice = activity.pricing.find((price) => price.isActive) ?? activity.pricing[0];
  const [pricingMode, setPricingMode] = useState(activity.pricingMode ?? "SIMPLE");
  const currency = "USD";
  const [majorPrice, setMajorPrice] = useState(activePrice ? usdMinorToInput(activePrice.priceCents) : "");
  const [priceType, setPriceType] = useState(activePrice?.priceType ?? "per_person");
  const [tiers, setTiers] = useState(activity.pricingTiers ?? []);
  const [tierModal, setTierModal] = useState<PricingTierForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previewCents = parseUsdInputToMinor(majorPrice);

  useEffect(() => {
    setPricingMode(activity.pricingMode ?? "SIMPLE");
    setTiers(activity.pricingTiers ?? []);
  }, [activity.pricingMode, activity.pricingTiers]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await upsertPartnerActivityPricing(activity.id, {
        currency,
        isActive: true,
        priceCents: pricingMode === "SIMPLE" ? previewCents : undefined,
        priceType,
        pricingMode,
        tiers:
          pricingMode === "GROUP_TIER"
            ? tiers.map((tier) => ({
                adultPriceCents: tier.adultPriceCents,
                childAllowed: tier.childPriceCents != null || tier.childDiscountPercent != null,
                childDiscountPercent: Number(tier.childDiscountPercent ?? 27),
                childPriceCents: tier.childPriceCents ?? undefined,
                isActive: tier.isActive,
                maxTravelers: tier.maxTravelers,
                minTravelers: tier.minTravelers
              }))
            : undefined
      });
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save pricing");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          Choose a simple per-person price or traveler-count tiers. Tier selection uses the total adults and children.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Pricing model" required>
              <Select
                disabled={disabled}
                onChange={(event) => setPricingMode(event.target.value as "SIMPLE" | "GROUP_TIER")}
                value={pricingMode}
              >
                <option value="SIMPLE">Simple per-person</option>
                <option value="GROUP_TIER">Group tier pricing</option>
              </Select>
            </Field>
            <Field
              label={
                <span className="inline-flex items-center gap-2">
                  Base currency
                  <InfoTooltip text="All prices are entered in USD. Customers can view converted prices in IDR, EUR, or CHF." />
                </span>
              }
            >
              <Input disabled readOnly value="USD" />
            </Field>
            <Field label="Price type" required>
              <Select disabled={disabled} onChange={(event) => setPriceType(event.target.value)} required value={priceType}>
                <option value="per_person">Per person</option>
              </Select>
            </Field>
          </div>

          {pricingMode === "SIMPLE" ? (
            <Field label="Adult price (USD)" required hint="Enter normal USD units, e.g. 48.00.">
              <Input disabled={disabled} min={0} onChange={(event) => setMajorPrice(event.target.value)} required step="0.01" type="number" value={majorPrice} />
            </Field>
          ) : (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-travel-dark">Traveler tiers</p>
                  <p className="mt-1 text-xs leading-5 text-travel-muted">
                    The matching tier is selected from the total number of adults and children.
                  </p>
                </div>
                <div className="flex gap-2">
                  <ButtonCTA
                    disabled={disabled}
                    leftIcon={<Plus className="size-4" />}
                    onClick={() =>
                      setTierModal({
                        adultPrice: "",
                        childAllowed: true,
                        childDiscountPercent: "27",
                        childPrice: "",
                        isActive: true,
                        maxTravelers: "",
                        minTravelers: ""
                      })
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Add tier
                  </ButtonCTA>
                </div>
              </div>

              <div className="overflow-hidden rounded-travel-lg border border-[#2B2B2B]/15">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 bg-travel-bg px-4 py-2.5 text-xs font-semibold text-travel-muted">
                  <span>Travelers</span>
                  <span>Adult</span>
                  <span>Child</span>
                  <span>Child policy</span>
                  <span>Actions</span>
                </div>
                {tiers.length ? (
                  tiers.map((tier, index) => (
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-3 border-t border-[#2B2B2B]/10 px-4 py-3 text-sm" key={tier.id ?? `${tier.minTravelers}-${tier.maxTravelers}`}>
                      <span>{tier.minTravelers === tier.maxTravelers ? tier.minTravelers : `${tier.minTravelers}-${tier.maxTravelers}`}</span>
                      <span>{formatBaseUsd(tier.adultPriceCents)}</span>
                      <span>
                        {tier.childPriceCents == null
                          ? "Not available"
                          : formatBaseUsd(tier.childPriceCents)}
                      </span>
                      <span>{tier.childPriceCents == null ? "No child" : "Allowed"}</span>
                      <div className="flex gap-1">
                        <IconButton
                          disabled={disabled}
                          label="Edit pricing tier"
                          onClick={() =>
                            setTierModal({
                              adultPrice: usdMinorToInput(tier.adultPriceCents),
                              childAllowed:
                                tier.childPriceCents != null || tier.childDiscountPercent != null,
                              childDiscountPercent: String(tier.childDiscountPercent ?? 27),
                              childPrice: tier.childPriceCents == null ? "" : usdMinorToInput(tier.childPriceCents),
                              index,
                              isActive: tier.isActive,
                              maxTravelers: String(tier.maxTravelers),
                              minTravelers: String(tier.minTravelers)
                            })
                          }
                        >
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton disabled={disabled} label="Delete pricing tier" onClick={() => setTiers((current) => removeAt(current, index))}>
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="border-t border-[#2B2B2B]/10 px-4 py-6 text-center text-sm text-travel-muted">
                    Add tiers for 1, 2, 3, 4, and a larger group range.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <ButtonCTA disabled={disabled || isSaving || (pricingMode === "GROUP_TIER" && tiers.length === 0)} type="submit" variant="outline">
              Save pricing
            </ButtonCTA>
            {pricingMode === "SIMPLE" ? (
              <span className="text-sm text-travel-muted">
                Current price: {previewCents ? formatBaseUsd(previewCents) : "No price"} {formatPriceType(priceType)}
              </span>
            ) : null}
          </div>
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        </form>
      </CardContent>
      <Dialog
        description="Enter prices in USD. Alpii stores USD cents and converts display prices for customers."
        onClose={() => setTierModal(null)}
        open={Boolean(tierModal)}
        title={tierModal?.index === undefined ? "Add pricing tier" : "Edit pricing tier"}
      >
        {tierModal ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const adultPriceCents = parseUsdInputToMinor(tierModal.adultPrice);
              const childPriceCents = tierModal.childAllowed
                ? tierModal.childPrice
                  ? parseUsdInputToMinor(tierModal.childPrice)
                  : Math.round(adultPriceCents * 0.73)
                : null;
              const next = {
                activityId: activity.id,
                adultPriceCents,
                childAllowed: tierModal.childAllowed,
                childDiscountPercent: 27,
                childPriceCents: childPriceCents ?? undefined,
                createdAt: "",
                currency,
                id: tierModal.index === undefined ? `draft-${Date.now()}` : tiers[tierModal.index].id,
                isActive: tierModal.isActive,
                maxTravelers: Number(tierModal.maxTravelers),
                minTravelers: Number(tierModal.minTravelers),
                priceType,
                updatedAt: ""
              };
              setTiers((current) =>
                tierModal.index === undefined
                  ? [...current, next].sort((a, b) => a.minTravelers - b.minTravelers)
                  : replaceAt(current, tierModal.index, next).sort((a, b) => a.minTravelers - b.minTravelers)
              );
              setTierModal(null);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Min travelers" required>
                <Input max={14} min={1} onChange={(event) => setTierModal({ ...tierModal, minTravelers: event.target.value })} required type="number" value={tierModal.minTravelers} />
              </Field>
              <Field label="Max travelers" required>
                <Input max={14} min={1} onChange={(event) => setTierModal({ ...tierModal, maxTravelers: event.target.value })} required type="number" value={tierModal.maxTravelers} />
              </Field>
              <Field label="Adult price (USD)" required>
                <Input min={0} onChange={(event) => setTierModal({ ...tierModal, adultPrice: event.target.value })} required step="0.01" type="number" value={tierModal.adultPrice} />
              </Field>
              <Field
                label="Child price (USD)"
                hint={tierModal.childAllowed ? "Leave empty to use the default child price." : "This option tier is blocked for child travelers."}
              >
                <Input
                  disabled={!tierModal.childAllowed}
                  min={0}
                  onChange={(event) => setTierModal({ ...tierModal, childPrice: event.target.value })}
                  step="0.01"
                  type="number"
                  value={tierModal.childPrice}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
              <input
                checked={tierModal.childAllowed}
                onChange={(event) =>
                  setTierModal({
                    ...tierModal,
                    childAllowed: event.target.checked,
                    childPrice: event.target.checked ? tierModal.childPrice : ""
                  })
                }
                type="checkbox"
              />
              Available for child travelers
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
              <input checked={tierModal.isActive} onChange={(event) => setTierModal({ ...tierModal, isActive: event.target.checked })} type="checkbox" />
              Active tier
            </label>
            <DialogActions onCancel={() => setTierModal(null)} submitLabel="Save tier" />
          </form>
        ) : null}
      </Dialog>
    </Card>
  );
}

function ExperienceOptionsSection({
  activity,
  disabled,
  onAddOption,
  onEditOption,
  onUpdated
}: {
  activity: PartnerActivity;
  disabled: boolean;
  onAddOption: () => void;
  onEditOption: (option: PartnerActivityOption) => void;
  onUpdated: () => Promise<void>;
}) {
  const options = activity.options ?? [];
  const [tierModal, setTierModal] = useState<(PricingTierForm & { optionId: string }) | null>(null);
  const [sessionModal, setSessionModal] = useState<(NonNullable<AvailabilityModalState> & { optionId: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveTier(modal: PricingTierForm & { optionId: string }) {
    const option = options.find((item) => item.id === modal.optionId);
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
    const tiers =
      modal.index === undefined
        ? [...currentTiers, tier]
        : replaceAt(currentTiers, modal.index, tier);

    setError(null);
    try {
      await upsertPartnerActivityOptionPricing(activity.id, option.id, {
        currency: "USD",
        priceType: "per_person",
        tiers
      });
      setTierModal(null);
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save option pricing");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Experience options</CardTitle>
          <CardDescription>
            Package variants with their own availability mode and USD tier pricing.
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
                  <ButtonCTA disabled={disabled || !option.isActive} onClick={async () => { await deactivatePartnerActivityOption(activity.id, option.id); await onUpdated(); }} size="sm" type="button" variant="ghost">
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
                        setTierModal({
                          adultPrice: "",
                          childAllowed: true,
                          childDiscountPercent: "27",
                          childPrice: "",
                          isActive: true,
                          maxTravelers: "",
                          minTravelers: "",
                          optionId: option.id
                        })
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
                            {formatBaseUsd(tier.adultPriceCents)} adult ·{" "}
                            {tier.childPriceCents == null
                              ? "No child"
                              : `${formatBaseUsd(tier.childPriceCents)} child`}
                          </span>
                          <button
                            className="text-xs font-semibold text-travel-primary"
                            disabled={disabled}
                            onClick={() =>
                              setTierModal({
                                adultPrice: usdMinorToInput(tier.adultPriceCents),
                                childAllowed:
                                  tier.childPriceCents != null || tier.childDiscountPercent != null,
                                childDiscountPercent: String(tier.childDiscountPercent ?? 27),
                                childPrice: tier.childPriceCents == null ? "" : usdMinorToInput(tier.childPriceCents),
                                index,
                                isActive: tier.isActive,
                                maxTravelers: String(tier.maxTravelers),
                                minTravelers: String(tier.minTravelers),
                                optionId: option.id
                              })
                            }
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
                        onClick={() => setSessionModal({ capacity: "12", endDateTime: "", isActive: true, optionId: option.id, startDateTime: "" })}
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
                    </p>
                  ) : option.availability.length ? (
                    <div className="grid gap-2">
                      {option.availability.map((slot) => (
                        <div className="flex items-center justify-between rounded-travel-md bg-travel-bg px-3 py-2 text-sm" key={slot.id}>
                          <span>{formatDate(slot.startDateTime, "en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                          <ButtonCTA disabled={disabled || !slot.isActive} onClick={async () => { await deactivatePartnerActivityOptionAvailability(activity.id, option.id, slot.id); await onUpdated(); }} size="sm" type="button" variant="ghost">
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
          <EmptyState description="Add at least one package option for new booking flows." title="No options yet" />
        )}
      </CardContent>

      <OptionTierDialog modal={tierModal} onClose={() => setTierModal(null)} onSave={saveTier} />
      <OptionAvailabilityDialog
        modal={sessionModal}
        onClose={() => setSessionModal(null)}
        onSave={async (modal) => {
          await createPartnerActivityOptionAvailability(activity.id, modal.optionId, {
            capacity: modal.capacity ? Number(modal.capacity) : undefined,
            endDateTime: modal.endDateTime || undefined,
            isActive: modal.isActive,
            startDateTime: modal.startDateTime
          });
          setSessionModal(null);
          await onUpdated();
        }}
      />
    </Card>
  );
}

function AvailabilitySection({
  activity,
  disabled,
  onAdd,
  onDeactivate
}: {
  activity: PartnerActivity;
  disabled: boolean;
  onAdd: () => void;
  onDeactivate: (availabilityId: string) => void;
}) {
  const rows = activity.availability ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Add bookable sessions and capacity.</CardDescription>
        </div>
        <ButtonCTA disabled={disabled} leftIcon={<Plus className="size-4" />} onClick={onAdd} size="sm" type="button" variant="outline">
          Add session
        </ButtonCTA>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <DataTable
            columns={[
              {
                key: "date",
                header: "Date/time",
                cell: (item) => formatDate(item.startDateTime, "en-US", { dateStyle: "medium", timeStyle: "short" })
              },
              {
                key: "capacity",
                header: "Capacity",
                cell: (item) => item.capacity ?? "Open"
              },
              {
                key: "status",
                header: "Status",
                cell: (item) => <Badge variant={item.isActive ? "success" : "neutral"}>{item.isActive ? "Active" : "Inactive"}</Badge>
              },
              {
                key: "actions",
                header: "Actions",
                align: "right",
                cell: (item) => (
                  <ButtonCTA disabled={disabled || !item.isActive} onClick={() => onDeactivate(item.id)} size="sm" type="button" variant="ghost">
                    Deactivate
                  </ButtonCTA>
                )
              }
            ]}
            getRowKey={(item) => item.id}
            rows={rows}
          />
        ) : (
          <EmptyState description="Add at least one future session before submitting." title="No sessions yet" />
        )}
      </CardContent>
    </Card>
  );
}

function MediaSection({
  activity,
  disabled,
  onAddUrl,
  onDelete,
  onUpdated
}: {
  activity: PartnerActivity;
  disabled: boolean;
  onAddUrl: () => void;
  onDelete: (mediaId: string) => void;
  onUpdated: () => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chosenFileName, setChosenFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const cover = activity.media.find((item) => item.isCover) ?? activity.media[0];
  const coverUrl = cover?.url ?? cover?.file?.url;

  async function uploadFile(file: File) {
    setError(null);
    setIsUploading(true);

    try {
      const presign = await requestPresignedUpload({
        mimeType: file.type,
        originalName: file.name,
        purpose: "ACTIVITY_IMAGE",
        sizeBytes: file.size,
        visibility: "PUBLIC"
      });
      await uploadFileToPresignedUrl(presign.uploadUrl, file);
      await createPartnerActivityMedia(activity.id, {
        altText: activity.title,
        fileAssetId: presign.fileAsset.id,
        isCover: activity.media.length === 0,
        url: presign.publicUrl ?? presign.fileAsset.url ?? undefined
      });
      setChosenFileName("");
      await onUpdated();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to upload media");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Media</CardTitle>
          <CardDescription>Use strong images that clearly show the experience.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonCTA disabled={disabled || isUploading} leftIcon={<Upload className="size-4" />} onClick={() => fileInputRef.current?.click()} size="sm" type="button" variant="outline">
            Upload image
          </ButtonCTA>
          <ButtonCTA disabled={disabled || isUploading} leftIcon={<ImagePlus className="size-4" />} onClick={onAddUrl} size="sm" type="button" variant="ghost">
            Add image URL
          </ButtonCTA>
        </div>
      </CardHeader>
      <CardContent>
        <input
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setChosenFileName(file.name);
            void uploadFile(file);
            event.target.value = "";
          }}
          ref={fileInputRef}
          type="file"
        />
        {chosenFileName ? <p className="mb-3 text-sm text-travel-muted">Selected: {chosenFileName}</p> : null}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-travel-lg border border-[#2B2B2B]/15 bg-travel-bg">
            <div className="aspect-[4/3]">
              {coverUrl ? <img alt={cover?.altText ?? activity.title} className="h-full w-full object-cover" src={coverUrl} /> : null}
            </div>
            <div className="p-3 text-sm font-medium text-travel-dark">Cover image</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activity.media.map((item) => {
              const mediaUrl = item.url ?? item.file?.url;
              return (
                <div className="overflow-hidden rounded-travel-md border border-[#2B2B2B]/15" key={item.id}>
                  <div className="aspect-[4/3] bg-travel-bg">
                    {mediaUrl ? <img alt={item.altText ?? ""} className="h-full w-full object-cover" src={mediaUrl} /> : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3 text-xs text-travel-muted">
                    <span>{item.isCover ? "Cover" : item.altText || "Gallery"}</span>
                    <button
                      className="font-semibold text-travel-primary disabled:opacity-40"
                      disabled={disabled}
                      onClick={() => onDelete(item.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {activity.media.length === 0 ? (
          <p className="mt-4 rounded-travel-md bg-travel-bg p-3 text-sm text-travel-muted">
            No images yet. Add at least one image before submitting.
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function ReadinessPanel({
  activityStatusLabel,
  disabled,
  note,
  onSubmit,
  readiness,
  submitLabel = "Submit for review"
}: {
  activityStatusLabel: string;
  disabled: boolean;
  note?: string;
  onSubmit: () => void;
  readiness: ReturnType<typeof getReadiness>;
  submitLabel?: string;
}) {
  const firstMissing = readiness.items.find((item) => !item.done)?.label;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission readiness</CardTitle>
        <CardDescription>Use the checklist to jump between required sections.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-travel-md border border-[#2B2B2B]/15 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-travel-muted">Current status</p>
          <div className="mt-2">
            <Badge variant={statusLabelVariant(activityStatusLabel)}>{activityStatusLabel}</Badge>
          </div>
        </div>
        <div className="grid gap-2">
          {readiness.items.map((item) => (
            <button
              className="flex items-center gap-3 rounded-travel-md bg-travel-bg px-3 py-2.5 text-left transition hover:bg-[#EEF1F6]"
              key={item.label}
              onClick={() => scrollToSection(item.sectionId)}
              type="button"
            >
              <span className={item.done ? "text-emerald-600" : "text-travel-muted"}>
                <CheckCircle2 className="size-4" />
              </span>
              <span className="text-sm font-semibold text-travel-dark">{item.label}</span>
            </button>
          ))}
        </div>
        <ButtonCTA disabled={disabled || !readiness.canSubmit} fullWidth onClick={onSubmit} type="button">
          {submitLabel}
        </ButtonCTA>
        {!readiness.canSubmit ? (
          <p className="text-xs leading-5 text-travel-muted">
            Complete {firstMissing ?? "all required sections"} before submission.
          </p>
        ) : null}
        {note ? <div className="rounded-travel-md bg-[#FBEAE8] p-3 text-xs leading-5 text-travel-primary">{note}</div> : null}
      </CardContent>
    </Card>
  );
}

function ItemEditorDialog({
  modal,
  onClose,
  onSave
}: {
  modal: ItemModalState;
  onClose: () => void;
  onSave: (modal: NonNullable<ItemModalState>) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(modal?.value ?? "");
  }, [modal]);

  if (!modal) return null;

  const label =
    modal.kind === "highlight" ? "Highlight text" : modal.kind === "included" ? "Included item" : "Not included item";

  return (
    <Dialog
      description="Keep the text short and traveler-friendly."
      onClose={onClose}
      open
      title={modal.index === undefined ? `Add ${label.toLowerCase()}` : `Edit ${label.toLowerCase()}`}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...modal, value });
        }}
      >
        <Field label={label} required>
          <Input onChange={(event) => setValue(event.target.value)} required value={value} />
        </Field>
        <DialogActions onCancel={onClose} submitLabel={modal.index === undefined ? "Add" : "Save"} />
      </form>
    </Dialog>
  );
}

function ItineraryEditorDialog({
  modal,
  onClose,
  onSave
}: {
  modal: ItineraryModalState;
  onClose: () => void;
  onSave: (modal: NonNullable<ItineraryModalState>) => void;
}) {
  const [value, setValue] = useState<ItineraryStop>(emptyItineraryStop);

  useEffect(() => {
    setValue(modal?.value ?? emptyItineraryStop);
  }, [modal]);

  if (!modal) return null;

  return (
    <Dialog description="Create a clear sequence of stops for travelers." onClose={onClose} open title={modal.index === undefined ? "Add itinerary stop" : "Edit itinerary stop"}>
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

function AvailabilityDialog({
  modal,
  onClose,
  onSave
}: {
  modal: AvailabilityModalState;
  onClose: () => void;
  onSave: (modal: NonNullable<AvailabilityModalState>) => Promise<void>;
}) {
  const [value, setValue] = useState<NonNullable<AvailabilityModalState>>({
    capacity: "12",
    endDateTime: "",
    isActive: true,
    startDateTime: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (modal) setValue(modal);
  }, [modal]);

  if (!modal) return null;

  return (
    <Dialog description="Add one bookable session for this activity." onClose={onClose} open title="Add availability session">
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSaving(true);
          try {
            await onSave(value);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <Field label="Start date/time" required>
          <Input onChange={(event) => setValue({ ...value, startDateTime: event.target.value })} required type="datetime-local" value={value.startDateTime} />
        </Field>
        <Field label="End date/time optional">
          <Input onChange={(event) => setValue({ ...value, endDateTime: event.target.value })} type="datetime-local" value={value.endDateTime} />
        </Field>
        <Field label="Capacity">
          <Input min={1} onChange={(event) => setValue({ ...value, capacity: event.target.value })} type="number" value={value.capacity} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
          <input checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} type="checkbox" />
          Active session
        </label>
        <DialogActions isSaving={isSaving} onCancel={onClose} submitLabel="Add session" />
      </form>
    </Dialog>
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

function OptionDialog({
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
    <Dialog
      description="Package variants can use scheduled sessions or an always-available daily schedule."
      onClose={onClose}
      open={Boolean(modal)}
      title={modal?.id ? "Edit option" : "Add option"}
    >
      {value ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave(value);
          }}
        >
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
                    slug:
                      !value.slug || value.slug === currentGeneratedSlug
                        ? nextGeneratedSlug
                        : value.slug
                  });
                }}
                required
                value={value.title}
              />
            </Field>
            <Field label="Slug">
              <Input
                onChange={(event) => setValue({ ...value, slug: slugifyForInput(event.target.value) })}
                placeholder="Auto-generated from option name, editable for SEO"
                value={value.slug}
              />
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

function OptionTierDialog({
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
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave(value);
          }}
        >
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
              <Input
                disabled={!value.childAllowed}
                min={0}
                onChange={(event) => setValue({ ...value, childPrice: event.target.value })}
                step="0.01"
                type="number"
                value={value.childPrice}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
            <input
              checked={value.childAllowed}
              onChange={(event) =>
                setValue({
                  ...value,
                  childAllowed: event.target.checked,
                  childPrice: event.target.checked ? value.childPrice : ""
                })
              }
              type="checkbox"
            />
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

function OptionAvailabilityDialog({
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
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave(value);
          }}
        >
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

function MediaUrlDialog({
  modal,
  onClose,
  onSave
}: {
  modal: MediaUrlModalState;
  onClose: () => void;
  onSave: (modal: NonNullable<MediaUrlModalState>) => Promise<void>;
}) {
  const [value, setValue] = useState<NonNullable<MediaUrlModalState>>({
    altText: "",
    isCover: false,
    url: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (modal) setValue(modal);
  }, [modal]);

  if (!modal) return null;

  return (
    <Dialog description="Use a stable image URL while upload assets are still being curated." onClose={onClose} open title="Add image URL">
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSaving(true);
          try {
            await onSave(value);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <Field label="Image URL" required>
          <Input onChange={(event) => setValue({ ...value, url: event.target.value })} required type="url" value={value.url} />
        </Field>
        <Field label="Alt text">
          <Input onChange={(event) => setValue({ ...value, altText: event.target.value })} value={value.altText} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-travel-dark">
          <input checked={value.isCover} onChange={(event) => setValue({ ...value, isCover: event.target.checked })} type="checkbox" />
          Set as cover image
        </label>
        <DialogActions isSaving={isSaving} onCancel={onClose} submitLabel="Add image" />
      </form>
    </Dialog>
  );
}

function DialogActions({
  isSaving,
  onCancel,
  submitLabel
}: {
  isSaving?: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#2B2B2B]/10 pt-4">
      <ButtonCTA onClick={onCancel} type="button" variant="ghost">
        Cancel
      </ButtonCTA>
      <ButtonCTA disabled={isSaving} type="submit">
        {isSaving ? "Saving..." : submitLabel}
      </ButtonCTA>
    </div>
  );
}

function IconButton({
  children,
  disabled,
  label,
  onClick
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-travel-md text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function slugifyForInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function activityToBasicDetails(activity: PartnerActivity): BasicDetailsState {
  return {
    categoryId: activity.categoryId,
    cityId: activity.cityId,
    destinationId: activity.destinationId ?? "",
    description: activity.description,
    durationLabel: activity.durationLabel ?? "",
    meetingPoint: activity.meetingPoint ?? "",
    shortDescription: activity.shortDescription,
    slug: activity.slug,
    title: activity.title
  };
}

function activityToPolicies(activity: PartnerActivity): PoliciesState {
  return {
    cancellationPolicy: activity.cancellationPolicy ?? "",
    importantInfo: activity.importantInfo ?? ""
  };
}

function formatDestinationOption(destination: LookupDestination) {
  const breadcrumb = destination.breadcrumb?.map((item) => item.name).join(" / ");
  return breadcrumb || destination.name;
}

function formatActivityDestination(activity: PartnerActivity) {
  return activity.destination ? formatDestinationOption(activity.destination) : activity.city.name;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toItineraryStops(value: unknown): ItineraryStop[] {
  if (!Array.isArray(value)) return [];

  return value
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
}

function normalizeItineraryType(value: unknown): ItineraryStop["type"] {
  if (value === "start" || value === "food" || value === "photo" || value === "end") return value;
  return "stop";
}

function getReadiness({
  activity,
  highlights,
  included,
  itinerary,
  notIncluded,
  policies
}: {
  activity: PartnerActivity;
  highlights: string[];
  included: string[];
  itinerary: ItineraryStop[];
  notIncluded: string[];
  policies: PoliciesState;
}) {
  const basicDone = Boolean(
    activity.title.trim() &&
      (activity.destinationId || activity.cityId) &&
      activity.categoryId &&
      activity.shortDescription.trim() &&
      activity.description.trim()
  );
  const hasOptions = (activity.options?.length ?? 0) > 0;
  const pricingDone =
    activity.pricing.some((price) => price.isActive) ||
    (activity.options ?? []).some((option) => option.pricingTiers.some((tier) => tier.isActive));
  const optionsDone = hasOptions
    ? (activity.options ?? []).some((option) =>
        option.isActive &&
        (option.availabilityMode === "ALWAYS_AVAILABLE" ||
          option.availability.some((slot) => slot.isActive))
      )
    : false;
  const availabilityDone = (activity.availability ?? []).some((slot) => slot.isActive);
  const mediaDone = activity.media.length > 0;
  const itineraryDone = itinerary.length > 0;
  const includedDone = included.length > 0 || notIncluded.length > 0;
  const policiesDone = Boolean(policies.cancellationPolicy.trim() || policies.importantInfo.trim());

  const items = [
    { done: basicDone, label: "Basic details", sectionId: "basic-details" },
    ...(hasOptions
      ? [{ done: optionsDone, label: "Package options", sectionId: "options" }]
      : [{ done: availabilityDone, label: "Availability", sectionId: "availability" }]),
    { done: pricingDone, label: "Pricing", sectionId: "pricing" },
    { done: mediaDone, label: "Media", sectionId: "media" },
    { done: itineraryDone, label: "Itinerary", sectionId: "itinerary" },
    { done: includedDone, label: "Included / not included", sectionId: "includes" },
    { done: policiesDone, label: "Policies", sectionId: "policies" }
  ];

  return {
    canSubmit: items.every((item) => item.done),
    items
  };
}

function getRevisionReadiness({
  basic,
  highlights,
  included,
  itinerary,
  notIncluded,
  policies,
  snapshot
}: {
  basic: BasicDetailsState;
  highlights: string[];
  included: string[];
  itinerary: ItineraryStop[];
  notIncluded: string[];
  policies: PoliciesState;
  snapshot: ActivityRevisionSnapshot;
}) {
  const basicDone = Boolean(
    basic.title.trim() &&
      (basic.destinationId || basic.cityId) &&
      basic.categoryId &&
      basic.shortDescription.trim() &&
      basic.description.trim()
  );
  const options = snapshot.options ?? [];
  const pricingDone =
    options.some((option) => option.pricingTiers.some((tier) => tier.isActive)) ||
    ((snapshot.pricing as Array<{ isActive?: boolean }> | undefined) ?? []).some((price) => price.isActive);
  const optionsDone = options.some((option) =>
    option.isActive &&
    (option.availabilityMode === "ALWAYS_AVAILABLE" ||
      option.availability.some((slot) => slot.isActive))
  );
  const mediaDone = ((snapshot.media as unknown[] | undefined) ?? []).length > 0;
  const itineraryDone = itinerary.length > 0;
  const includedDone = included.length > 0 || notIncluded.length > 0;
  const policiesDone = Boolean(policies.cancellationPolicy.trim() || policies.importantInfo.trim());

  const items = [
    { done: basicDone, label: "Basic details", sectionId: "basic-details" },
    { done: optionsDone, label: "Package options", sectionId: "options" },
    { done: pricingDone, label: "Pricing", sectionId: "options" },
    { done: mediaDone, label: "Media", sectionId: "options" },
    { done: itineraryDone, label: "Itinerary", sectionId: "itinerary" },
    { done: includedDone, label: "Included / not included", sectionId: "includes" },
    { done: policiesDone, label: "Policies", sectionId: "policies" }
  ];

  return {
    canSubmit: items.every((item) => item.done),
    items
  };
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

function parseMeetingTimesInput(value: string) {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

function formatPriceType(value: string) {
  if (value === "per_group") return "per group";
  if (value === "fixed") return "fixed";
  return "per person";
}

function formatItineraryType(value: ItineraryStop["type"]) {
  if (value === "start") return "Starting point";
  if (value === "food") return "Food stop";
  if (value === "photo") return "Photo stop";
  if (value === "end") return "Ending point";
  return "Activity stop";
}

function statusVariant(status: ActivityStatus) {
  if (status === "PUBLISHED" || status === "APPROVED") return "success";
  if (status === "PENDING_REVIEW" || status === "REVISION_REQUESTED") return "warning";
  if (status === "REJECTED" || status === "ARCHIVED") return "danger";
  return "neutral";
}

function statusLabelVariant(label: string) {
  if (label.includes("Published") || label.includes("Approved") || label.includes("Applied")) return "success";
  if (label.includes("Pending") || label.includes("Revision")) return "warning";
  if (label.includes("Rejected") || label.includes("Cancelled") || label.includes("Archived")) return "danger";
  return "neutral";
}

function scrollToSection(sectionId: string) {
  if (typeof document === "undefined") return;
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  return formatStatus(status);
}

function isReadOnlyRevision(status: ActivityRevision["status"]) {
  return status === "PENDING_REVIEW" || status === "APPLIED" || status === "APPROVED" || status === "CANCELLED";
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#2B2B2B]/10 py-2 last:border-0">
      <span className="text-travel-muted">{label}</span>
      <span className="font-semibold text-travel-dark">{value}</span>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
