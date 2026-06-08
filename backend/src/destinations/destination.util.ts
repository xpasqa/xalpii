import type { DestinationType } from "@prisma/client";

export type DestinationWithParent = {
  id: string;
  name: string;
  slug: string;
  type: DestinationType;
  parent?: DestinationWithParent | null;
};

export type DestinationSummary = {
  id: string;
  name: string;
  slug: string;
  type: DestinationType;
};

export function destinationParentInclude(depth = 4): object {
  if (depth <= 0) {
    return {};
  }

  return {
    parent: {
      include: destinationParentInclude(depth - 1)
    }
  };
}

export function getDestinationBreadcrumb(
  destination?: DestinationWithParent | null
): DestinationSummary[] {
  const chain: DestinationSummary[] = [];
  let current = destination;

  while (current) {
    chain.unshift({
      id: current.id,
      name: current.name,
      slug: current.slug,
      type: current.type
    });
    current = current.parent ?? null;
  }

  return chain;
}

export function formatDestinationBreadcrumb(destination?: DestinationWithParent | null) {
  return getDestinationBreadcrumb(destination)
    .map((item) => item.name)
    .join(" / ");
}
