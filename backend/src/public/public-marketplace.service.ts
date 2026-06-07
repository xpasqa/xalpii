import { Injectable, NotFoundException } from "@nestjs/common";
import { ActivityStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

type PublicActivityQuery = {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  limit?: string;
};

const publicActivityListInclude = {
  category: true,
  city: true,
  media: {
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
    include: { file: true }
  },
  pricing: {
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 1
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
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 1
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
      status: ActivityStatus.PUBLISHED
    };

    if (query.citySlug) {
      where.city = { slug: query.citySlug, isActive: true };
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug, isActive: true };
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { city: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    return this.prisma.activity.findMany({
      where,
      include: publicActivityListInclude,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit
    });
  }

  async getActivity(slug: string) {
    const activity = await this.prisma.activity.findFirst({
      where: {
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

    return activity;
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
      where: { status: ActivityStatus.PUBLISHED },
      _count: { _all: true }
    });

    return new Map(rows.map((row) => [row.cityId, row._count._all]));
  }
}

function clampLimit(value?: string) {
  const parsed = Number(value ?? 24);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 24;
  }

  return Math.min(Math.floor(parsed), 48);
}
