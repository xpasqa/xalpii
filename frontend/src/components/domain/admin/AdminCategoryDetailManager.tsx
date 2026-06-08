"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { getAdminCategory } from "../../../lib/admin";
import type { AdminCategory } from "../../../lib/admin";
import { getAdminActivities } from "../../../lib/admin-activities";
import type { AdminActivity } from "../../../lib/admin-activities";
import { formatBaseUsd } from "../../../lib/money";
import { routes } from "../../../lib/routes";
import type { ActivityStatus } from "../../../lib/partner-activities";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState
} from "../../ui";

export function AdminCategoryDetailManager({ categoryId }: { categoryId: string }) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [category, setCategory] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryDetail() {
      setError(null);
      setIsLoading(true);

      try {
        const [nextCategory, nextActivities] = await Promise.all([
          getAdminCategory(categoryId),
          getAdminActivities({ categoryId })
        ]);
        setCategory(nextCategory);
        setActivities(nextActivities);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load category detail");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategoryDetail();
  }, [categoryId]);

  const columns = [
    {
      key: "title",
      header: "Activity",
      cell: (activity: AdminActivity) => (
        <div className="max-w-md">
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
      key: "city",
      header: "City",
      cell: (activity: AdminActivity) => activity.city.name
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

  if (isLoading) {
    return <LoadingState label="Loading category activities" />;
  }

  if (error) {
    return <ErrorState description={error} title="Category detail unavailable" />;
  }

  if (!category) {
    return <EmptyState description="This category may have been removed." title="Category not found" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          className="inline-flex items-center gap-2 font-interface text-sm font-semibold text-travel-muted hover:text-travel-dark"
          href={routes.adminCategories}
        >
          <ArrowLeft className="size-4" />
          Back to categories
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">{category.name}</CardTitle>
            <CardDescription>
              {category.slug} · {category._count?.activities ?? activities.length} activities
            </CardDescription>
          </div>
          <Badge variant={category.isActive ? "success" : "neutral"}>
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Icon" value={category.icon || "-"} />
            <Metric label="Sort order" value={String(category.sortOrder)} />
            <Metric label="Created" value={new Date(category.createdAt).toLocaleDateString()} />
            <Metric label="Updated" value={new Date(category.updatedAt).toLocaleDateString()} />
          </div>
          {category.description ? (
            <p className="mt-4 max-w-3xl font-interface text-sm leading-6 text-travel-muted">
              {category.description}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities in {category.name}</CardTitle>
          <CardDescription>
            Activities connected to this category across all partner statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length ? (
            <DataTable columns={columns} getRowKey={(activity) => activity.id} rows={activities} />
          ) : (
            <EmptyState
              description="No partner activity has been assigned to this category yet."
              title="No activities in this category"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-travel-md border border-travel-border bg-travel-bg p-4">
      <p className="font-interface text-xs font-medium text-travel-muted">{label}</p>
      <p className="mt-1 font-interface text-sm font-semibold text-travel-dark">{value}</p>
    </div>
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

function formatActivityPrice(activity: AdminActivity) {
  const pricing = activity.pricing.find((item) => item.isActive) ?? activity.pricing[0];
  if (!pricing) return "No pricing";

  return formatBaseUsd(pricing.priceCents);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
