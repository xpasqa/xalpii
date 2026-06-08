"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { getAdminDestination, getAdminDestinations } from "../../../lib/admin";
import type { AdminDestination } from "../../../lib/admin";
import { getAdminActivities } from "../../../lib/admin-activities";
import type { AdminActivity } from "../../../lib/admin-activities";
import { formatBaseUsd } from "../../../lib/money";
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

export function AdminDestinationDetailManager({ destinationId }: { destinationId: string }) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [allDestinations, setAllDestinations] = useState<AdminDestination[]>([]);
  const [destination, setDestination] = useState<AdminDestination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDestinationDetail() {
      setError(null);
      setIsLoading(true);

      try {
        const [nextDestination, nextDestinations, nextActivities] = await Promise.all([
          getAdminDestination(destinationId),
          getAdminDestinations({ isActive: "true" }),
          getAdminActivities({ destinationId })
        ]);
        setDestination(nextDestination);
        setAllDestinations(nextDestinations);
        setActivities(nextActivities);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load destination detail");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDestinationDetail();
  }, [destinationId]);

  const destinationTree = useMemo(() => buildDestinationTree(allDestinations, destinationId), [allDestinations, destinationId]);
  const activityCountsByDestinationId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const activity of activities) {
      if (!activity.destinationId) continue;
      counts.set(activity.destinationId, (counts.get(activity.destinationId) ?? 0) + 1);
    }
    return counts;
  }, [activities]);
  const subtreeActivityTotals = useMemo(
    () => buildSubtreeActivityTotals(destinationTree, activityCountsByDestinationId),
    [activityCountsByDestinationId, destinationTree]
  );

  useEffect(() => {
    if (!destinationTree.length) return;
    setExpandedIds(collectExpandableIds(destinationTree));
  }, [destinationTree]);

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
      key: "destination",
      header: "Destination",
      cell: (activity: AdminActivity) =>
        formatLookupDestination(activity.destination) ??
        activity.destination?.name ??
        activity.city?.name ??
        "Unassigned"
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
    return <LoadingState label="Loading destination activities" />;
  }

  if (error) {
    return <ErrorState description={error} title="Destination detail unavailable" />;
  }

  if (!destination) {
    return <EmptyState description="This destination may have been removed." title="Destination not found" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          className="inline-flex items-center gap-2 font-interface text-sm font-semibold text-travel-muted hover:text-travel-dark"
          href={routes.adminDestinations}
        >
          <ArrowLeft className="size-4" />
          Back to destinations
        </Link>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white text-slate-700 ring-1 ring-border" variant="neutral">
              {destination.type}
            </Badge>
            {destination.countryCode ? (
              <Badge variant="info">{destination.countryCode}</Badge>
            ) : null}
          </div>
          <div>
            <CardTitle className="text-xl">{destination.name}</CardTitle>
            <CardDescription>{destination.breadcrumbLabel ?? destination.name}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Subtree activities" value={String(activities.length)} />
            <Metric label="Direct children" value={String(destination._count?.children ?? 0)} />
            <Metric label="Sort order" value={String(destination.sortOrder)} />
          </div>
          {destination.description ? (
            <p className="mt-4 max-w-3xl font-interface text-sm leading-6 text-travel-muted">
              {destination.description}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hierarchy</CardTitle>
          <CardDescription>
            Operate this destination inside its subtree context.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {destinationTree.length ? (
            <div className="divide-y divide-border">
              {destinationTree.map((node, index) => (
                <HierarchyNode
                  activityCountsByDestinationId={activityCountsByDestinationId}
                  key={node.id}
                  depth={0}
                  expandedIds={expandedIds}
                  isLast={index === destinationTree.length - 1}
                  node={node}
                  subtreeActivityTotals={subtreeActivityTotals}
                  onToggle={(nodeId) =>
                    setExpandedIds((current) =>
                      current.includes(nodeId)
                        ? current.filter((item) => item !== nodeId)
                        : [...current, nodeId]
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState description="No destination hierarchy is available for this node." title="No hierarchy" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities in subtree</CardTitle>
          <CardDescription>
            All activities connected to this destination and every child node below it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length ? (
            <DataTable columns={columns} getRowKey={(activity) => activity.id} rows={activities} />
          ) : (
            <EmptyState
              description="No partner activity has been assigned to this destination subtree yet."
              title="No activities in this destination"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type DestinationTreeNode = AdminDestination & {
  children: DestinationTreeNode[];
};

function buildDestinationTree(destinations: AdminDestination[], selectedId: string) {
  const destinationById = new Map(destinations.map((destination) => [destination.id, destination]));
  const childrenByParentId = new Map<string, AdminDestination[]>();

  for (const destination of destinations) {
    const parentKey = destination.parentId ?? "__root__";
    childrenByParentId.set(parentKey, [...(childrenByParentId.get(parentKey) ?? []), destination]);
  }

  const sortItems = (items: AdminDestination[]) =>
    [...items].sort((left, right) =>
      left.sortOrder === right.sortOrder
        ? left.name.localeCompare(right.name)
        : left.sortOrder - right.sortOrder
    );

  const buildNode = (destination: AdminDestination): DestinationTreeNode => ({
    ...destination,
    children: sortItems(childrenByParentId.get(destination.id) ?? []).map(buildNode)
  });

  const selected = destinationById.get(selectedId);
  if (!selected) return [];

  return [buildNode(selected)];
}

function collectExpandableIds(nodes: DestinationTreeNode[]) {
  const ids: string[] = [];
  const walk = (node: DestinationTreeNode) => {
    if (node.children.length) {
      ids.push(node.id);
      node.children.forEach(walk);
    }
  };

  nodes.forEach(walk);
  return ids;
}

function buildSubtreeActivityTotals(
  nodes: DestinationTreeNode[],
  activityCountsByDestinationId: Map<string, number>
) {
  const totals = new Map<string, number>();

  const walk = (node: DestinationTreeNode): number => {
    const total =
      (activityCountsByDestinationId.get(node.id) ?? 0) +
      node.children.reduce((sum, child) => sum + walk(child), 0);
    totals.set(node.id, total);
    return total;
  };

  nodes.forEach(walk);
  return totals;
}

function HierarchyNode({
  activityCountsByDestinationId,
  depth,
  expandedIds,
  isLast,
  node,
  subtreeActivityTotals,
  onToggle
}: {
  activityCountsByDestinationId: Map<string, number>;
  depth: number;
  expandedIds: string[];
  isLast: boolean;
  node: DestinationTreeNode;
  subtreeActivityTotals: Map<string, number>;
  onToggle: (nodeId: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const directActivities = activityCountsByDestinationId.get(node.id) ?? 0;
  const subtreeActivities = subtreeActivityTotals.get(node.id) ?? directActivities;

  return (
    <div className={!isLast ? "border-b border-border" : undefined}>
      <div
        className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_110px_140px]"
        style={{ paddingLeft: `${20 + depth * 22}px` }}
      >
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 inline-flex size-6 items-center justify-center rounded-md text-travel-muted transition hover:bg-travel-bg hover:text-travel-dark disabled:cursor-default disabled:opacity-30"
            disabled={!hasChildren}
            onClick={() => onToggle(node.id)}
            type="button"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />
            ) : (
              <ChevronRight className="size-4 opacity-0" />
            )}
          </button>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{node.name}</p>
            <p className="mt-1 text-xs text-muted">{node.breadcrumbLabel ?? node.name}</p>
          </div>
        </div>
        <div>
          <Badge className="bg-white text-slate-700 ring-1 ring-border" variant="neutral">
            {node.type}
          </Badge>
        </div>
        <div className="text-sm text-muted">
          {subtreeActivities} activities
          {subtreeActivities !== directActivities ? (
            <span className="ml-2 text-xs text-muted/80">({directActivities} direct)</span>
          ) : null}
        </div>
      </div>
      {hasChildren && isExpanded ? (
        <div>
          {node.children.map((child, index) => (
            <HierarchyNode
              activityCountsByDestinationId={activityCountsByDestinationId}
              key={child.id}
              depth={depth + 1}
              expandedIds={expandedIds}
              isLast={index === node.children.length - 1}
              node={child}
              subtreeActivityTotals={subtreeActivityTotals}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
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

function formatLookupDestination(destination?: AdminActivity["destination"] | null) {
  if (!destination?.breadcrumb?.length) {
    return destination?.name;
  }

  return destination.breadcrumb.map((item) => item.name).join(" / ");
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
