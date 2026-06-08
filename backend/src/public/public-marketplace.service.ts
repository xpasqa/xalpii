import { Injectable, NotFoundException } from "@nestjs/common";
import { ActivityStatus, DestinationType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { BASE_CURRENCY } from "../common/money.constants";
import {
  destinationParentInclude,
  getDestinationBreadcrumb
} from "../destinations/destination.util";

type PublicActivityQuery = {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  limit?: string;
};

const publicActivityListInclude = {
  category: true,
  city: true,
  destination: {
    include: destinationParentInclude(4)
  },
  media: {
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
    include: { file: true }
  },
  pricing: {
    where: { currency: BASE_CURRENCY, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 1
  },
  pricingTiers: {
    where: { currency: BASE_CURRENCY, isActive: true },
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  },
  options: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      pricingTiers: {
        where: { currency: BASE_CURRENCY, isActive: true },
        orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
      }
    }
  }
} satisfies Prisma.ActivityInclude;

const publicActivityDetailInclude = {
  availability: {
    where: {
      isActive: true,
      startDateTime: { gte: new Date() }
    },
    orderBy: { startDateTime: "asc" }
  },
  category: true,
  city: true,
  destination: {
    include: destinationParentInclude(4)
  },
  media: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { file: true }
  },
  partner: {
    select: {
      businessName: true,
      id: true
    }
  },
  pricing: {
    where: { currency: BASE_CURRENCY, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 1
  },
  pricingTiers: {
    where: { currency: BASE_CURRENCY, isActive: true },
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  },
  options: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      availability: {
        where: {
          isActive: true,
          startDateTime: { gte: new Date() }
        },
        orderBy: { startDateTime: "asc" }
      },
      pricingTiers: {
        where: { currency: BASE_CURRENCY, isActive: true },
        orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
      }
    }
  }
} satisfies Prisma.ActivityInclude;

@Injectable()
export class PublicMarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async listCities() {
    const cities = await this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
    const counts = await this.publishedCountsByCity();

    return cities.map((city) => ({
      ...city,
      activityCount: counts.get(city.id) ?? 0
    }));
  }

  async getCity(slug: string) {
    const destination = await this.prisma.destination.findFirst({
      where: { isActive: true, slug },
      include: destinationParentInclude(4)
    });

    if (destination) {
      const destinationIds = await this.getDestinationAndDescendantIds(destination.id);
      const activityCount = await this.prisma.activity.count({
        where: {
          OR: [publishedPricingWhere()],
          status: ActivityStatus.PUBLISHED,
          destinationId: { in: destinationIds }
        }
      });

      return {
        id: destination.id,
        name: destination.name,
        slug: destination.slug,
        country: getDestinationBreadcrumb(destination)[0]?.name ?? destination.name,
        description: destination.description,
        imageFile: null,
        destination: withDestinationBreadcrumb(destination),
        activityCount
      };
    }

    const city = await this.prisma.city.findFirst({
      where: { isActive: true, slug }
    });

    if (!city) {
      throw new NotFoundException({
        code: "PUBLIC_CITY_NOT_FOUND",
        message: "City was not found"
      });
    }

    const counts = await this.publishedCountsByCity();
    return {
      ...city,
      activityCount: counts.get(city.id) ?? 0
    };
  }

  async listActivities(query: PublicActivityQuery) {
    const limit = clampLimit(query.limit);
    const where: Prisma.ActivityWhereInput = {
      OR: [publishedPricingWhere()],
      status: ActivityStatus.PUBLISHED
    };

    if (query.citySlug) {
      const destination = await this.prisma.destination.findFirst({
        where: { isActive: true, slug: query.citySlug },
        select: { id: true }
      });

      if (destination) {
        where.destinationId = { in: await this.getDestinationAndDescendantIds(destination.id) };
      } else {
        where.city = { slug: query.citySlug, isActive: true };
      }
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug, isActive: true };
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.AND = [
        { OR: where.OR },
        { OR: [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { city: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } }
        ] }
      ];
      delete where.OR;
    }

    const activities = await this.prisma.activity.findMany({
      where,
      include: publicActivityListInclude,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit
    });

    return activities.map(withPublicPricingSummary);
  }

  async getActivity(slug: string) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        OR: [publishedPricingWhere()],
        slug,
        status: ActivityStatus.PUBLISHED
      },
      include: publicActivityDetailInclude
    });

    if (!activity) {
      throw new NotFoundException({
        code: "PUBLIC_ACTIVITY_NOT_FOUND",
        message: "Activity was not found"
      });
    }

    return withPublicPricingSummary(activity);
  }

  async home() {
    const [cities, popularActivities, curatedActivities] = await Promise.all([
      this.listCities(),
      this.listActivities({ limit: "8" }),
      this.listActivities({ limit: "12" })
    ]);

    return {
      cities,
      popularActivities,
      curatedActivities
    };
  }

  private async publishedCountsByCity() {
    const rows = await this.prisma.activity.groupBy({
      by: ["cityId"],
      where: {
        OR: [publishedPricingWhere()],
        status: ActivityStatus.PUBLISHED
      },
      _count: { _all: true }
    });

    return new Map(rows.map((row) => [row.cityId, row._count._all]));
  }

  private async getDestinationAndDescendantIds(destinationId: string) {
    const ids = new Set<string>([destinationId]);
    let frontier = [destinationId];

    while (frontier.length) {
      const children = await this.prisma.destination.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true }
      });
      frontier = children.map((child) => child.id).filter((id) => !ids.has(id));
      frontier.forEach((id) => ids.add(id));
    }

    return [...ids];
  }
}

function withPublicPricingSummary<
  TActivity extends {
    destination?: unknown;
    pricing: Array<{ priceCents: number }>;
    pricingTiers: Array<{ adultPriceCents: number; isActive: boolean }>;
    options?: Array<{
      pricingTiers: Array<{ adultPriceCents: number; isActive: boolean }>;
    }>;
  }
>(activity: TActivity) {
  const optionTierPrices = (activity.options ?? [])
    .flatMap((option) => option.pricingTiers)
    .filter((tier) => tier.isActive)
    .map((tier) => tier.adultPriceCents);
  const tierPrices = activity.pricingTiers
    .filter((tier) => tier.isActive)
    .map((tier) => tier.adultPriceCents);

  const fromPriceCents =
    optionTierPrices.length > 0
      ? Math.min(...optionTierPrices)
      : tierPrices.length > 0
      ? Math.min(...tierPrices)
      : activity.pricing[0]?.priceCents ?? null;

  return {
    ...activity,
    baseCurrency: BASE_CURRENCY,
    destination: activity.destination
      ? withDestinationBreadcrumb(activity.destination as Parameters<typeof withDestinationBreadcrumb>[0])
      : null,
    fromPriceCents,
    fromPriceMinorUsd: fromPriceCents
  };
}

function withDestinationBreadcrumb<
  TDestination extends {
    id: string;
    name: string;
    slug: string;
    type: DestinationType;
    parent?: unknown;
  }
>(destination: TDestination) {
  const breadcrumb = getDestinationBreadcrumb(
    destination as unknown as Parameters<typeof getDestinationBreadcrumb>[0]
  );
  return {
    ...destination,
    breadcrumb,
    breadcrumbLabel: breadcrumb.map((item) => item.name).join(" / ")
  };
}

function publishedPricingWhere(): Prisma.ActivityWhereInput {
  return {
    OR: [
      {
        options: {
          some: {
            isActive: true,
            pricingTiers: {
              some: {
                currency: BASE_CURRENCY,
                isActive: true
              }
            }
          }
        }
      },
      {
        pricing: {
          some: {
            currency: BASE_CURRENCY,
            isActive: true
          }
        }
      }
    ]
  };
}

function clampLimit(value?: string) {
  const parsed = Number(value ?? 24);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 24;
  }

  return Math.min(Math.floor(parsed), 48);
}
