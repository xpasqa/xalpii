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
import { formatMoney } from "../../../lib/money";
import {
  createPartnerActivity,
  createPartnerActivityAvailability,
  createPartnerActivityMedia,
  deactivatePartnerActivityAvailability,
  deletePartnerActivityMedia,
  getPartnerActivities,
  getPartnerActivity,
  getPartnerLookupCategories,
  getPartnerLookupCities,
  submitPartnerActivity,
  updatePartnerActivity,
  upsertPartnerActivityPricing
} from "../../../lib/partner-activities";
import type {
  ActivityStatus,
  LookupCategory,
  LookupCity,
  PartnerActivity,
  PartnerActivityInput
} from "../../../lib/partner-activities";
import { routes } from "../../../lib/routes";

type BasicDetailsState = {
  title: string;
  slug: string;
  cityId: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  durationLabel: string;
  meetingPoint: string;
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
  childDiscountPercent: string;
  isActive: boolean;
};

const emptyBasicDetails: BasicDetailsState = {
  title: "",
  slug: "",
  cityId: "",
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
  const [activities, setActivities] = useState<PartnerActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
                    <span className="text-xs text-travel-muted">
                      Updated {formatDate(activity.updatedAt)}
                    </span>
                  </div>
                  <p className="font-brand text-base font-semibold text-travel-dark">{activity.title}</p>
                  <p className="mt-1 text-sm text-travel-muted">
                    {activity.city.name} · {activity.category.name}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <span className="font-interface text-sm font-semibold text-travel-dark">
                    {price ? formatMoney(price.priceCents, price.currency) : "No price"}
                  </span>
                  <ButtonCTA href={routes.partnerActivityEdit(activity.id)} size="sm" variant="outline">
                    Edit
                  </ButtonCTA>
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
  const [lookups, setLookups] = useState<{ cities: LookupCity[]; categories: LookupCategory[] }>({
    categories: [],
    cities: []
  });
  const [form, setForm] = useState<BasicDetailsState>(emptyBasicDetails);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [cities, categories] = await Promise.all([
          getPartnerLookupCities(),
          getPartnerLookupCategories()
        ]);
        setLookups({ cities, categories });
        setForm((current) => ({
          ...current,
          cityId: cities[0]?.id ?? "",
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
        cityId: form.cityId,
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
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="e.g. Ubud Cooking Class & Market Visit"
                  required
                  value={form.title}
                />
              </Field>
              <Field label="Slug optional">
                <Input
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  placeholder="e.g. ubud-cooking-class-market-visit"
                  value={form.slug}
                />
              </Field>
              <Field label="Destination / City" required>
                <Select
                  onChange={(event) => setForm({ ...form, cityId: event.target.value })}
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
  const [activity, setActivity] = useState<PartnerActivity | null>(null);
  const [lookups, setLookups] = useState<{ cities: LookupCity[]; categories: LookupCategory[] }>({
    categories: [],
    cities: []
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
  const isEditable =
    activity ? activity.status === "DRAFT" || activity.status === "REVISION_REQUESTED" : false;

  useEffect(() => {
    void loadAll();
  }, [activityId]);

  async function loadAll() {
    setError(null);
    setIsLoading(true);

    try {
      const [nextActivity, cities, categories] = await Promise.all([
        getPartnerActivity(activityId),
        getPartnerLookupCities(),
        getPartnerLookupCategories()
      ]);
      hydrateActivity(nextActivity);
      setLookups({ cities, categories });
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
        cityId: basic.cityId,
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

  if (isLoading) {
    return <LoadingState label="Loading activity builder" />;
  }

  if (!activity) {
    return <ErrorState description={error ?? "Activity not found"} title="Activity unavailable" />;
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
              {activity.city.name} · {activity.category.name}
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
          <BasicDetailsSection
            basic={basic}
            disabled={!isEditable || isSaving}
            lookups={lookups}
            onChange={setBasic}
            onSubmit={saveBasic}
          />
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
          <PoliciesSection
            disabled={!isEditable || isSaving}
            onChange={setPolicies}
            onSubmit={savePolicies}
            policies={policies}
          />
          <PricingSection activity={activity} disabled={!isEditable || isSaving} onUpdated={loadAll} />
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
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <ReadinessPanel
            activity={activity}
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

function Field({
  children,
  hint,
  label,
  required
}: {
  children: React.ReactNode;
  hint?: string;
  label: string;
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

function BasicDetailsSection({
  basic,
  disabled,
  lookups,
  onChange,
  onSubmit
}: {
  basic: BasicDetailsState;
  disabled: boolean;
  lookups: { cities: LookupCity[]; categories: LookupCategory[] };
  onChange: (next: BasicDetailsState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  function update(field: keyof BasicDetailsState, value: string) {
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
              <Input disabled={disabled} onChange={(event) => update("slug", event.target.value)} placeholder="e.g. ubud-cooking-class-market-visit" value={basic.slug} />
            </Field>
            <Field label="City" required>
              <Select disabled={disabled} onChange={(event) => update("cityId", event.target.value)} required value={basic.cityId}>
                {lookups.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
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
  const [currency, setCurrency] = useState(activePrice?.currency ?? activity.pricingTiers?.[0]?.currency ?? "USD");
  const [majorPrice, setMajorPrice] = useState(activePrice ? centsToMajor(activePrice.priceCents, activePrice.currency) : "");
  const [priceType, setPriceType] = useState(activePrice?.priceType ?? "per_person");
  const [tiers, setTiers] = useState(activity.pricingTiers ?? []);
  const [tierModal, setTierModal] = useState<PricingTierForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previewCents = parseMoneyToCents(majorPrice, currency);

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
            <Field label="Currency" required>
              <Input disabled={disabled} onChange={(event) => setCurrency(event.target.value.toUpperCase())} required value={currency} />
            </Field>
            <Field label="Price type" required>
              <Select disabled={disabled} onChange={(event) => setPriceType(event.target.value)} required value={priceType}>
                <option value="per_person">Per person</option>
              </Select>
            </Field>
          </div>

          {pricingMode === "SIMPLE" ? (
            <Field label="Adult price" required hint="Use normal currency units, e.g. 48.00.">
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
                    disabled={disabled || tiers.length === 0}
                    onClick={() =>
                      setTiers((current) =>
                        current.map((tier) => ({
                          ...tier,
                          childDiscountPercent: 27,
                          childPriceCents: Math.round(tier.adultPriceCents * 0.73)
                        }))
                      )
                    }
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Apply 27% child discount
                  </ButtonCTA>
                  <ButtonCTA
                    disabled={disabled}
                    leftIcon={<Plus className="size-4" />}
                    onClick={() =>
                      setTierModal({
                        adultPrice: "",
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
                  <span>Discount</span>
                  <span>Actions</span>
                </div>
                {tiers.length ? (
                  tiers.map((tier, index) => (
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-3 border-t border-[#2B2B2B]/10 px-4 py-3 text-sm" key={tier.id ?? `${tier.minTravelers}-${tier.maxTravelers}`}>
                      <span>{tier.minTravelers === tier.maxTravelers ? tier.minTravelers : `${tier.minTravelers}-${tier.maxTravelers}`}</span>
                      <span>{formatMoney(tier.adultPriceCents, tier.currency || currency)}</span>
                      <span>{formatMoney(tier.childPriceCents ?? Math.round(tier.adultPriceCents * 0.73), tier.currency || currency)}</span>
                      <span>{Number(tier.childDiscountPercent ?? 27)}%</span>
                      <div className="flex gap-1">
                        <IconButton
                          disabled={disabled}
                          label="Edit pricing tier"
                          onClick={() =>
                            setTierModal({
                              adultPrice: centsToMajor(tier.adultPriceCents, currency),
                              childDiscountPercent: String(tier.childDiscountPercent ?? 27),
                              childPrice: tier.childPriceCents == null ? "" : centsToMajor(tier.childPriceCents, currency),
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
                Current price: {previewCents ? formatMoney(previewCents, currency) : "No price"} {formatPriceType(priceType)}
              </span>
            ) : null}
          </div>
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        </form>
      </CardContent>
      <Dialog
        description="Prices are per traveler and stored in minor units after saving."
        onClose={() => setTierModal(null)}
        open={Boolean(tierModal)}
        title={tierModal?.index === undefined ? "Add pricing tier" : "Edit pricing tier"}
      >
        {tierModal ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const discount = Number(tierModal.childDiscountPercent || 27);
              const adultPriceCents = parseMoneyToCents(tierModal.adultPrice, currency);
              const childPriceCents = tierModal.childPrice
                ? parseMoneyToCents(tierModal.childPrice, currency)
                : Math.round(adultPriceCents * (1 - discount / 100));
              const next = {
                activityId: activity.id,
                adultPriceCents,
                childDiscountPercent: discount,
                childPriceCents,
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
              <Field label={`Adult price (${currency})`} required>
                <Input min={0} onChange={(event) => setTierModal({ ...tierModal, adultPrice: event.target.value })} required step="0.01" type="number" value={tierModal.adultPrice} />
              </Field>
              <Field label={`Child price (${currency})`} hint="Leave empty to derive it from the discount.">
                <Input min={0} onChange={(event) => setTierModal({ ...tierModal, childPrice: event.target.value })} step="0.01" type="number" value={tierModal.childPrice} />
              </Field>
              <Field label="Child discount percent">
                <Input max={100} min={0} onChange={(event) => setTierModal({ ...tierModal, childDiscountPercent: event.target.value })} type="number" value={tierModal.childDiscountPercent} />
              </Field>
            </div>
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
  activity,
  disabled,
  onSubmit,
  readiness
}: {
  activity: PartnerActivity;
  disabled: boolean;
  onSubmit: () => void;
  readiness: ReturnType<typeof getReadiness>;
}) {
  const firstMissing = readiness.items.find((item) => !item.done)?.label;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission readiness</CardTitle>
        <CardDescription>Complete these items before requesting admin review.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-travel-md border border-[#2B2B2B]/15 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-travel-muted">Current status</p>
          <div className="mt-2">
            <Badge variant={statusVariant(activity.status)}>{formatStatus(activity.status)}</Badge>
          </div>
        </div>
        <div className="grid gap-2">
          {readiness.items.map((item) => (
            <div className="flex items-start gap-3 rounded-travel-md bg-travel-bg p-3" key={item.label}>
              <span className={item.done ? "mt-0.5 text-emerald-600" : "mt-0.5 text-travel-muted"}>
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-travel-dark">{item.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-travel-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <ButtonCTA disabled={disabled || !readiness.canSubmit} fullWidth onClick={onSubmit} type="button">
          Submit for review
        </ButtonCTA>
        {!readiness.canSubmit ? (
          <p className="text-xs leading-5 text-travel-muted">
            Complete {firstMissing ?? "all required sections"} before submission.
          </p>
        ) : null}
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

function activityToBasicDetails(activity: PartnerActivity): BasicDetailsState {
  return {
    categoryId: activity.categoryId,
    cityId: activity.cityId,
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
      activity.cityId &&
      activity.categoryId &&
      activity.shortDescription.trim() &&
      activity.description.trim()
  );
  const pricingDone = activity.pricing.some((price) => price.isActive);
  const availabilityDone = (activity.availability ?? []).some((slot) => slot.isActive);
  const mediaDone = activity.media.length > 0;
  const itineraryDone = itinerary.length > 0;
  const includedDone = included.length > 0 || notIncluded.length > 0;
  const policiesDone = Boolean(policies.cancellationPolicy.trim() || policies.importantInfo.trim());

  const items = [
    { description: "Title, city, category, short and full descriptions.", done: basicDone, label: "Basic details" },
    { description: "One active primary price.", done: pricingDone, label: "Pricing" },
    { description: "At least one active session.", done: availabilityDone, label: "Availability" },
    { description: "At least one image or gallery item.", done: mediaDone, label: "Media" },
    { description: "A traveler-friendly stop-by-stop plan.", done: itineraryDone, label: "Itinerary" },
    { description: "Clear inclusions or exclusions.", done: includedDone, label: "Included / not included" },
    { description: "Cancellation or important trip notes.", done: policiesDone, label: "Policies" }
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

function parseMoneyToCents(value: string, currency: string) {
  const amount = Number(value || 0);
  const factor = zeroDecimalCurrencies.has(currency.toUpperCase()) ? 1 : 100;
  return Math.round(amount * factor);
}

function centsToMajor(value: number, currency: string) {
  const factor = zeroDecimalCurrencies.has(currency.toUpperCase()) ? 1 : 100;
  return String(value / factor);
}

const zeroDecimalCurrencies = new Set(["IDR", "JPY", "KRW", "VND"]);

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

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
