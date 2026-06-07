"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { getAdminCity } from "../../../lib/admin";
import type { AdminCity } from "../../../lib/admin";
import { getAdminActivities } from "../../../lib/admin-activities";
import type { AdminActivity } from "../../../lib/admin-activities";
import { formatMoney } from "../../../lib/money";
import { routes } from "../../../lib/routes";
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
import type { ActivityStatus } from "../../../lib/partner-activities";

export function AdminCityDetailManager({ cityId }: { cityId: string }) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [city, setCity] = useState<AdminCity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCityDetail() {
      setError(null);
      setIsLoading(true);

      try {
        const [nextCity, nextActivities] = await Promise.all([
          getAdminCity(cityId),
          getAdminActivities({ cityId })
        ]);
        setCity(nextCity);
        setActivities(nextActivities);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load city detail");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCityDetail();
  }, [cityId]);

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
      key: "category",
      header: "Category",
      cell: (activity: AdminActivity) => activity.category.name
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
    return <LoadingState label="Loading city activities" />;
  }

  if (error) {
    return <ErrorState description={error} title="City detail unavailable" />;
  }

  if (!city) {
    return <EmptyState description="This city may have been removed." title="City not found" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          className="inline-flex items-center gap-2 font-interface text-sm font-semibold text-travel-muted hover:text-travel-dark"
          href={routes.adminCities}
        >
          <ArrowLeft className="size-4" />
          Back to cities
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">{city.name}</CardTitle>
            <CardDescription>
              {city.country} · {city.slug} · {city._count?.activities ?? activities.length} activities
            </CardDescription>
          </div>
          <Badge variant={city.isActive ? "success" : "neutral"}>
            {city.isActive ? "Active" : "Inactive"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Sort order" value={String(city.sortOrder)} />
            <Metric label="Created" value={new Date(city.createdAt).toLocaleDateString()} />
            <Metric label="Updated" value={new Date(city.updatedAt).toLocaleDateString()} />
          </div>
          {city.description ? (
            <p className="mt-4 max-w-3xl font-interface text-sm leading-6 text-travel-muted">
              {city.description}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities in {city.name}</CardTitle>
          <CardDescription>
            Activities connected to this city across all partner statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length ? (
            <DataTable columns={columns} getRowKey={(activity) => activity.id} rows={activities} />
          ) : (
            <EmptyState
              description="No partner activity has been assigned to this city yet."
              title="No activities in this city"
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

  return formatMoney(pricing.priceCents, pricing.currency);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
