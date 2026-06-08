"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Edit3, Eye, GitBranch, Plus, Search } from "lucide-react";
import {
  Badge,
  Button,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  Textarea
} from "../../ui";
import {
  createAdminDestination,
  deactivateAdminDestination,
  getAdminDestinations,
  updateAdminDestination
} from "../../../lib/admin";
import { routes } from "../../../lib/routes";
import type {
  AdminDestination,
  AdminDestinationInput,
  DestinationType
} from "../../../lib/admin";

type DestinationFormState = {
  countryCode: string;
  description: string;
  imageUrl: string;
  isActive: "true" | "false";
  name: string;
  parentId: string;
  slug: string;
  sortOrder: string;
  type: DestinationType;
};

const destinationTypes: DestinationType[] = ["COUNTRY", "REGION", "CITY", "AREA"];

const emptyForm: DestinationFormState = {
  countryCode: "",
  description: "",
  imageUrl: "",
  isActive: "true",
  name: "",
  parentId: "",
  slug: "",
  sortOrder: "0",
  type: "COUNTRY"
};

export function AdminDestinationsManager() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editingDestination, setEditingDestination] = useState<AdminDestination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"true" | "false" | "">("true");
  const [form, setForm] = useState<DestinationFormState>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DestinationType | "">("");

  async function loadDestinations() {
    setIsLoading(true);
    setError(null);

    try {
      const nextDestinations = await getAdminDestinations({ isActive: filter });
      setDestinations(nextDestinations);
      setExpandedIds((current) =>
        current.length > 0
          ? current
          : nextDestinations.filter((destination) => destination.type === "COUNTRY").map((destination) => destination.id)
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load destinations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const parentOptions = useMemo(
    () => destinations.filter((destination) => destination.id !== editingDestination?.id),
    [destinations, editingDestination?.id]
  );

  const visibleDestinations = useMemo(() => {
    const destinationById = new Map(destinations.map((destination) => [destination.id, destination]));
    const matchedIds = new Set<string>();
    const normalizedSearch = search.trim().toLowerCase();

    for (const destination of destinations) {
      const searchMatch =
        !normalizedSearch ||
        destination.name.toLowerCase().includes(normalizedSearch) ||
        destination.slug.toLowerCase().includes(normalizedSearch) ||
        (destination.countryCode ?? "").toLowerCase().includes(normalizedSearch) ||
        (destination.breadcrumbLabel ?? "").toLowerCase().includes(normalizedSearch);
      const typeMatch = !typeFilter || destination.type === typeFilter;

      if (searchMatch && typeMatch) {
        let current: AdminDestination | undefined = destination;
        while (current) {
          matchedIds.add(current.id);
          current = current.parentId ? destinationById.get(current.parentId) : undefined;
        }
      }
    }

    if (!normalizedSearch && !typeFilter) {
      return destinations;
    }

    return destinations.filter((destination) => matchedIds.has(destination.id));
  }, [destinations, search, typeFilter]);

  const { activityTotalsById, childIdsByParentId, rootDestinations } = useMemo(() => {
    const grouped = new Map<string, AdminDestination[]>();
    const visibleById = new Map(visibleDestinations.map((destination) => [destination.id, destination]));
    const activityById = new Map(
      visibleDestinations.map((destination) => [destination.id, destination._count?.activities ?? 0])
    );

    for (const destination of visibleDestinations) {
      const parentKey =
        destination.parentId && visibleById.has(destination.parentId)
          ? destination.parentId
          : "__root__";
      grouped.set(parentKey, [...(grouped.get(parentKey) ?? []), destination]);
    }

    for (const [key, items] of grouped) {
      grouped.set(
        key,
        [...items].sort((left, right) =>
          left.sortOrder === right.sortOrder
            ? left.name.localeCompare(right.name)
            : left.sortOrder - right.sortOrder
        )
      );
    }

    const totals = new Map<string, number>();
    const sumActivities = (destinationId: string): number => {
      if (totals.has(destinationId)) {
        return totals.get(destinationId) ?? 0;
      }

      const total =
        (activityById.get(destinationId) ?? 0) +
        (grouped.get(destinationId) ?? []).reduce(
          (sum, child) => sum + sumActivities(child.id),
          0
        );

      totals.set(destinationId, total);
      return total;
    };

    for (const destination of visibleDestinations) {
      sumActivities(destination.id);
    }

    return {
      activityTotalsById: totals,
      childIdsByParentId: grouped,
      rootDestinations: grouped.get("__root__") ?? []
    };
  }, [visibleDestinations]);

  function openCreate() {
    setEditingDestination(null);
    setForm(emptyForm);
    setError(null);
    setIsDialogOpen(true);
  }

  function openChild(parent: AdminDestination) {
    const childType: DestinationType =
      parent.type === "COUNTRY"
        ? "REGION"
        : parent.type === "REGION"
        ? "CITY"
        : parent.type === "CITY"
        ? "AREA"
        : "AREA";
    setEditingDestination(null);
    setForm({
      ...emptyForm,
      parentId: parent.id,
      type: childType
    });
    setError(null);
    setIsDialogOpen(true);
  }

  function openEdit(destination: AdminDestination) {
    setEditingDestination(destination);
    setForm({
      countryCode: destination.countryCode ?? "",
      description: destination.description ?? "",
      imageUrl: destination.imageUrl ?? "",
      isActive: destination.isActive ? "true" : "false",
      name: destination.name,
      parentId: destination.parentId ?? "",
      slug: destination.slug,
      sortOrder: String(destination.sortOrder),
      type: destination.type
    });
    setError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsDialogOpen(false);
    setEditingDestination(null);
    setForm(emptyForm);
  }

  async function saveDestination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Destination name is required.");
      return;
    }
    if (form.type !== "COUNTRY" && !form.parentId) {
      setError("Region, city, and area destinations require a parent.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: AdminDestinationInput = {
        countryCode: form.countryCode.trim() || null,
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        isActive: form.isActive === "true",
        name: form.name.trim(),
        parentId: form.type === "COUNTRY" ? null : form.parentId,
        slug: form.slug.trim() || undefined,
        sortOrder: Number(form.sortOrder || 0),
        type: form.type
      };

      if (editingDestination) {
        await updateAdminDestination(editingDestination.id, input);
      } else {
        await createAdminDestination(input);
      }

      closeDialog();
      await loadDestinations();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save destination");
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivate(destination: AdminDestination) {
    const confirmed = window.confirm(`Deactivate ${destination.name}?`);
    if (!confirmed) return;

    try {
      await deactivateAdminDestination(destination.id);
      await loadDestinations();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to deactivate destination");
    }
  }

  function toggle(destinationId: string) {
    setExpandedIds((current) =>
      current.includes(destinationId)
        ? current.filter((id) => id !== destinationId)
        : [...current, destinationId]
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">Destinations</CardTitle>
            <CardDescription>
              Manage country, region, city, and area hierarchy used by activities.
            </CardDescription>
          </div>
          <ButtonCTA leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Add destination
          </ButtonCTA>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadDestinations();
              }}
              placeholder="Search destination, slug, or country code"
              value={search}
            />
            <Select
              onChange={(event) => setTypeFilter(event.target.value as DestinationType | "")}
              value={typeFilter}
            >
              <option value="">All types</option>
              {destinationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setFilter(event.target.value as "true" | "false" | "")} value={filter}>
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <ButtonCTA leftIcon={<Search className="size-4" />} onClick={() => void loadDestinations()} type="button" variant="outline">
              Search
            </ButtonCTA>
          </div>

          {error && !isDialogOpen ? <ErrorState title="Destination error" description={error} /> : null}
          {isLoading ? <LoadingState label="Loading destinations" /> : null}
          {!isLoading && destinations.length === 0 ? (
            <EmptyState title="No destinations yet" description="Create a country first, then add regions, cities, or areas." />
          ) : null}
          {!isLoading && destinations.length > 0 && rootDestinations.length === 0 ? (
            <EmptyState title="No matching destinations" description="Try a different search term or filter." />
          ) : null}
          {!isLoading && rootDestinations.length > 0 ? (
            <div className="rounded-travel-lg border border-border bg-white">
              {rootDestinations.map((destination, index) => (
                <DestinationNode
                  activityTotalsById={activityTotalsById}
                  key={destination.id}
                  childIdsByParentId={childIdsByParentId}
                  depth={0}
                  destination={destination}
                  expandedIds={expandedIds}
                  isLast={index === rootDestinations.length - 1}
                  onDeactivate={deactivate}
                  onEdit={openEdit}
                  onOpenChild={openChild}
                  onToggle={toggle}
                />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        description="Countries sit at the top. Regions, cities, and areas need a parent destination."
        onClose={closeDialog}
        open={isDialogOpen}
        title={editingDestination ? "Edit destination" : "Add destination"}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveDestination}>
          <LabeledInput label="Name">
            <Input
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
              value={form.name}
            />
          </LabeledInput>
          <LabeledInput label="Slug">
            <Input
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="Optional"
              value={form.slug}
            />
          </LabeledInput>
          <LabeledInput label="Type">
            <Select
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  parentId: event.target.value === "COUNTRY" ? "" : current.parentId,
                  type: event.target.value as DestinationType
                }))
              }
              value={form.type}
            >
              {destinationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </LabeledInput>
          <LabeledInput label="Parent destination">
            <Select
              disabled={form.type === "COUNTRY"}
              onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value }))}
              value={form.type === "COUNTRY" ? "" : form.parentId}
            >
              <option value="">Select parent</option>
              {parentOptions.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.breadcrumbLabel ?? destination.name}
                </option>
              ))}
            </Select>
          </LabeledInput>
          <LabeledInput label="Country code">
            <Input
              maxLength={8}
              onChange={(event) => setForm((current) => ({ ...current, countryCode: event.target.value }))}
              placeholder="ID"
              value={form.countryCode}
            />
          </LabeledInput>
          <LabeledInput label="Sort order">
            <Input
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
              type="number"
              value={form.sortOrder}
            />
          </LabeledInput>
          <LabeledInput label="Image URL" className="md:col-span-2">
            <Input
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              value={form.imageUrl}
            />
          </LabeledInput>
          <LabeledInput label="Status">
            <Select
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value as "true" | "false" }))}
              value={form.isActive}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </LabeledInput>
          <LabeledInput label="Description" className="md:col-span-2">
            <Textarea
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              value={form.description}
            />
          </LabeledInput>
          {error ? (
            <p className="font-interface text-sm font-medium text-red-700 md:col-span-2">{error}</p>
          ) : null}
          <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-end md:justify-between">
            <div className="min-h-11">
              {editingDestination ? (
                <div className="space-y-2">
                  <p className="font-interface text-xs font-medium uppercase tracking-[0.16em] text-travel-muted">
                    Caution
                  </p>
                  <Button
                    disabled={isSaving || !editingDestination.isActive}
                    onClick={() => void deactivate(editingDestination)}
                    type="button"
                    variant="danger"
                  >
                    Deactivate
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={closeDialog} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : editingDestination ? "Save destination" : "Create destination"}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function DestinationNode({
  activityTotalsById,
  childIdsByParentId,
  depth,
  destination,
  expandedIds,
  isLast,
  onDeactivate,
  onEdit,
  onOpenChild,
  onToggle
}: {
  activityTotalsById: Map<string, number>;
  childIdsByParentId: Map<string, AdminDestination[]>;
  depth: number;
  destination: AdminDestination;
  expandedIds: string[];
  isLast: boolean;
  onDeactivate: (destination: AdminDestination) => Promise<void>;
  onEdit: (destination: AdminDestination) => void;
  onOpenChild: (destination: AdminDestination) => void;
  onToggle: (destinationId: string) => void;
}) {
  const children = childIdsByParentId.get(destination.id) ?? [];
  const isExpanded = expandedIds.includes(destination.id);
  const hasChildren = children.length > 0;
  const subtreeActivities = activityTotalsById.get(destination.id) ?? destination._count?.activities ?? 0;

  return (
    <div className={!isLast ? "border-b border-border" : undefined}>
      <div
        className={`grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.6fr)_120px_150px_auto] ${
          destination.type === "COUNTRY"
            ? "bg-slate-100/80"
            : depth === 1
              ? "bg-slate-50/60"
              : "bg-white"
        }`}
        style={{ paddingLeft: `${20 + depth * 24}px` }}
      >
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 inline-flex size-6 items-center justify-center rounded-md text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark disabled:cursor-default disabled:opacity-30"
            disabled={!hasChildren}
            onClick={() => onToggle(destination.id)}
            type="button"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />
            ) : (
              <ChevronRight className="size-4 opacity-0" />
            )}
          </button>
          <div className="min-w-0">
            <p className={destination.type === "COUNTRY" ? "text-base font-semibold text-ink" : "font-semibold text-ink"}>
              {destination.name}
            </p>
            <p className="mt-1 text-xs text-muted">{destination.slug}</p>
          </div>
        </div>
        <div>
          <Badge className="bg-white text-slate-700 ring-1 ring-border" variant="neutral">
            {destination.type}
          </Badge>
        </div>
        <div className="text-sm text-muted">
          {subtreeActivities} activities
        </div>
        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
          <Button
            aria-label={`Add child destination under ${destination.name}`}
            className="min-h-10 px-3"
            onClick={() => onOpenChild(destination)}
            title="Add child"
            type="button"
            variant="outline"
          >
            <GitBranch className="size-4" />
          </Button>
          <Link
            aria-label={`View activities under ${destination.name}`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-white px-3 text-ink transition hover:border-slate-300 hover:bg-slate-50"
            href={routes.adminDestinationDetail(destination.id)}
            title="View subtree activities"
          >
            <Eye className="size-4" />
          </Link>
          <Button
            aria-label={`Edit ${destination.name}`}
            className="min-h-10 px-3"
            onClick={() => onEdit(destination)}
            title="Edit destination"
            type="button"
            variant="outline"
          >
            <Edit3 className="size-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded ? (
        <div className="bg-slate-50/50">
          {children.map((child, index) => (
            <DestinationNode
              activityTotalsById={activityTotalsById}
              key={child.id}
              childIdsByParentId={childIdsByParentId}
              depth={depth + 1}
              destination={child}
              expandedIds={expandedIds}
              isLast={index === children.length - 1}
              onDeactivate={onDeactivate}
              onEdit={onEdit}
              onOpenChild={onOpenChild}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LabeledInput({
  children,
  className = "",
  label
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-interface text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
