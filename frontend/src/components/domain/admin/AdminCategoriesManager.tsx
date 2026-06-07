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
  createAdminCategory,
  deactivateAdminCategory,
  getAdminCategories,
  updateAdminCategory
} from "../../../lib/admin";
import type { AdminCategory, AdminCategoryInput } from "../../../lib/admin";
import { routes } from "../../../lib/routes";

type CategoryFormState = {
  description: string;
  icon: string;
  isActive: "true" | "false";
  name: string;
  slug: string;
  sortOrder: string;
};

const emptyForm: CategoryFormState = {
  description: "",
  icon: "",
  isActive: "true",
  name: "",
  slug: "",
  sortOrder: "0"
};

export function AdminCategoriesManager() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"true" | "false" | "">("");
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function loadCategories() {
    setIsLoading(true);
    setError(null);

    try {
      setCategories(await getAdminCategories({ isActive: filter, search }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (category: AdminCategory) => (
        <div>
          <p className="font-semibold text-ink">{category.name}</p>
          <p className="mt-1 text-xs text-muted">{category._count?.activities ?? 0} activities</p>
        </div>
      )
    },
    { key: "slug", header: "Slug", cell: (category: AdminCategory) => category.slug },
    { key: "icon", header: "Icon", cell: (category: AdminCategory) => category.icon || "-" },
    {
      key: "status",
      header: "Status",
      cell: (category: AdminCategory) => (
        <Badge variant={category.isActive ? "success" : "neutral"}>
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    { key: "sortOrder", header: "Sort order", cell: (category: AdminCategory) => category.sortOrder },
    {
      key: "updatedAt",
      header: "Updated",
      cell: (category: AdminCategory) => new Date(category.updatedAt).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      cell: (category: AdminCategory) => (
        <div className="flex justify-end gap-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-slate-50"
            href={routes.adminCategoryDetail(category.id)}
          >
            <Eye className="mr-2 size-4" />
            View
          </Link>
          <Button onClick={() => openEdit(category)} type="button" variant="outline">
            <Edit3 className="mr-2 size-4" />
            Edit
          </Button>
          <Button
            disabled={!category.isActive}
            onClick={() => void deactivate(category)}
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
    setEditingCategory(null);
    setForm(emptyForm);
    setError(null);
    setIsDialogOpen(true);
  }

  function openEdit(category: AdminCategory) {
    setEditingCategory(category);
    setForm({
      description: category.description ?? "",
      icon: category.icon ?? "",
      isActive: category.isActive ? "true" : "false",
      name: category.name,
      slug: category.slug,
      sortOrder: String(category.sortOrder)
    });
    setError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsDialogOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: AdminCategoryInput = {
        description: form.description.trim(),
        icon: form.icon.trim(),
        isActive: form.isActive === "true",
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sortOrder: Number(form.sortOrder || 0)
      };

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, input);
      } else {
        await createAdminCategory(input);
      }

      closeDialog();
      await loadCategories();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save category");
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivate(category: AdminCategory) {
    const confirmed = window.confirm(`Deactivate ${category.name}?`);
    if (!confirmed) return;

    try {
      await deactivateAdminCategory(category.id);
      await loadCategories();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to deactivate category");
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">Categories</CardTitle>
            <CardDescription>
              Manage activity categories used for curation, filtering, and partner submissions.
            </CardDescription>
          </div>
          <ButtonCTA leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Add category
          </ButtonCTA>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadCategories();
              }}
              placeholder="Search category, slug, or icon"
              value={search}
            />
            <Select onChange={(event) => setFilter(event.target.value as "true" | "false" | "")} value={filter}>
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <ButtonCTA leftIcon={<Search className="size-4" />} onClick={() => void loadCategories()} type="button" variant="outline">
              Search
            </ButtonCTA>
          </div>

          {error && !isDialogOpen ? <ErrorState title="Category error" description={error} /> : null}
          {isLoading ? <LoadingState label="Loading categories" /> : null}
          {!isLoading && categories.length === 0 ? (
            <EmptyState title="No categories yet" description="Create the first activity category for the marketplace." />
          ) : null}
          {!isLoading && categories.length > 0 ? (
            <DataTable columns={columns} getRowKey={(category) => category.id} rows={categories} />
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        description="Create or update category data without leaving the table."
        onClose={closeDialog}
        open={isDialogOpen}
        title={editingCategory ? "Edit category" : "Add category"}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveCategory}>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Category name"
            required
            value={form.name}
          />
          <Input
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Slug, optional"
            value={form.slug}
          />
          <Input
            onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
            placeholder="Icon, e.g. Compass"
            value={form.icon}
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
              {isSaving ? "Saving..." : editingCategory ? "Save category" : "Create category"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
