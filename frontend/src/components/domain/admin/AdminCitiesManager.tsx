"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
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
import {
  createAdminCity,
  deactivateAdminCity,
  getAdminCities,
  updateAdminCity
} from "../../../lib/admin";
import type { AdminCity, AdminCityInput } from "../../../lib/admin";
import { routes } from "../../../lib/routes";

type CityFormState = {
  country: string;
  description: string;
  isActive: "true" | "false";
  name: string;
  slug: string;
  sortOrder: string;
};

const emptyForm: CityFormState = {
  country: "",
  description: "",
  isActive: "true",
  name: "",
  slug: "",
  sortOrder: "0"
};

export function AdminCitiesManager() {
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [editingCity, setEditingCity] = useState<AdminCity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"true" | "false" | "">("");
  const [form, setForm] = useState<CityFormState>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function loadCities() {
    setIsLoading(true);
    setError(null);

    try {
      setCities(await getAdminCities({ isActive: filter, search }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load cities");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (city: AdminCity) => (
        <div>
          <p className="font-semibold text-ink">{city.name}</p>
          <p className="mt-1 text-xs text-muted">{city._count?.activities ?? 0} activities</p>
        </div>
      )
    },
    { key: "country", header: "Country", cell: (city: AdminCity) => city.country },
    { key: "slug", header: "Slug", cell: (city: AdminCity) => city.slug },
    {
      key: "status",
      header: "Status",
      cell: (city: AdminCity) => (
        <Badge variant={city.isActive ? "success" : "neutral"}>
          {city.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    { key: "sortOrder", header: "Sort order", cell: (city: AdminCity) => city.sortOrder },
    {
      key: "updatedAt",
      header: "Updated",
      cell: (city: AdminCity) => new Date(city.updatedAt).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      cell: (city: AdminCity) => (
        <div className="flex justify-end gap-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-slate-50"
            href={routes.adminCityDetail(city.id)}
          >
            <Eye className="mr-2 size-4" />
            View
          </Link>
          <Button onClick={() => openEdit(city)} type="button" variant="outline">
            <Edit3 className="mr-2 size-4" />
            Edit
          </Button>
          <Button
            disabled={!city.isActive}
            onClick={() => void deactivate(city)}
            type="button"
            variant="danger"
          >
            <Trash2 className="mr-2 size-4" />
            Deactivate
          </Button>
        </div>
      )
    }
  ];

  function openCreate() {
    setEditingCity(null);
    setForm(emptyForm);
    setError(null);
    setIsDialogOpen(true);
  }

  function openEdit(city: AdminCity) {
    setEditingCity(city);
    setForm({
      country: city.country,
      description: city.description ?? "",
      isActive: city.isActive ? "true" : "false",
      name: city.name,
      slug: city.slug,
      sortOrder: String(city.sortOrder)
    });
    setError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsDialogOpen(false);
    setEditingCity(null);
    setForm(emptyForm);
  }

  async function saveCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.country.trim()) {
      setError("City name and country are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: AdminCityInput = {
        country: form.country.trim(),
        description: form.description.trim(),
        isActive: form.isActive === "true",
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sortOrder: Number(form.sortOrder || 0)
      };

      if (editingCity) {
        await updateAdminCity(editingCity.id, input);
      } else {
        await createAdminCity(input);
      }

      closeDialog();
      await loadCities();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save city");
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivate(city: AdminCity) {
    const confirmed = window.confirm(`Deactivate ${city.name}?`);
    if (!confirmed) return;

    try {
      await deactivateAdminCity(city.id);
      await loadCities();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to deactivate city");
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">Cities</CardTitle>
            <CardDescription>
              Manage destination master data used by public marketplace discovery.
            </CardDescription>
          </div>
          <ButtonCTA leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Add city
          </ButtonCTA>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadCities();
              }}
              placeholder="Search city, country, or slug"
              value={search}
            />
            <Select onChange={(event) => setFilter(event.target.value as "true" | "false" | "")} value={filter}>
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <ButtonCTA leftIcon={<Search className="size-4" />} onClick={() => void loadCities()} type="button" variant="outline">
              Search
            </ButtonCTA>
          </div>

          {error && !isDialogOpen ? <ErrorState title="City error" description={error} /> : null}
          {isLoading ? <LoadingState label="Loading cities" /> : null}
          {!isLoading && cities.length === 0 ? (
            <EmptyState title="No cities yet" description="Create the first destination city for the marketplace." />
          ) : null}
          {!isLoading && cities.length > 0 ? (
            <DataTable columns={columns} getRowKey={(city) => city.id} rows={cities} />
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        description="Create or update destination data without leaving the table."
        onClose={closeDialog}
        open={isDialogOpen}
        title={editingCity ? "Edit city" : "Add city"}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveCity}>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="City name"
            required
            value={form.name}
          />
          <Input
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Slug, optional"
            value={form.slug}
          />
          <Input
            onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
            placeholder="Country"
            required
            value={form.country}
          />
          <Input
            min="0"
            onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
            placeholder="Sort order"
            type="number"
            value={form.sortOrder}
          />
          <Select
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value as "true" | "false" }))}
            value={form.isActive}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <Textarea
            className="md:col-span-2"
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            value={form.description}
          />
          {error ? (
            <p className="font-interface text-sm font-medium text-red-700 md:col-span-2">{error}</p>
          ) : null}
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button onClick={closeDialog} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : editingCity ? "Save city" : "Create city"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
