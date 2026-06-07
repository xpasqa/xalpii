import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ActivityStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import type {
  AdminActivityQueryDto,
  CreateAdminActivityAvailabilityDto,
  CreateAdminActivityMediaDto,
  UpdateAdminActivityAvailabilityDto,
  UpdateAdminActivityDto,
  UpdateAdminActivityMediaDto,
  UpsertAdminActivityPricingDto
} from "./dto/admin-activity.dto";

const adminActivityListInclude = {
  category: true,
  city: true,
  media: {
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
    include: { file: true }
  },
  partner: true,
  pricing: {
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 1
  },
  pricingTiers: {
    where: { isActive: true },
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  }
} satisfies Prisma.ActivityInclude;

const adminActivityDetailInclude = {
  availability: {
    orderBy: { startDateTime: "asc" }
  },
  category: true,
  city: true,
  media: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { file: true }
  },
  partner: {
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          id: true
        }
      }
    }
  },
  pricing: {
    orderBy: { createdAt: "desc" }
  },
  pricingTiers: {
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  },
  reviews: {
    orderBy: { createdAt: "desc" },
    take: 20
  }
} satisfies Prisma.ActivityInclude;

@Injectable()
export class AdminActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminActivityQueryDto) {
    const where: Prisma.ActivityWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.cityId) where.cityId = query.cityId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.partnerId) where.partnerId = query.partnerId;

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { partner: { businessName: { contains: search, mode: "insensitive" } } }
      ];
    }

    return this.prisma.activity.findMany({
      where,
      include: adminActivityListInclude,
      orderBy: { updatedAt: "desc" }
    });
  }

  async get(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: adminActivityDetailInclude
    });

    if (!activity) {
      throw new NotFoundException({
        code: "ADMIN_ACTIVITY_NOT_FOUND",
        message: "Activity was not found"
      });
    }

    return activity;
  }

  async update(id: string, actorUserId: string, dto: UpdateAdminActivityDto) {
    const activity = await this.get(id);

    if (dto.cityId || dto.categoryId) {
      await this.assertCityAndCategory(dto.cityId ?? activity.cityId, dto.categoryId ?? activity.categoryId);
    }

    const slug =
      dto.slug !== undefined || dto.title !== undefined
        ? await this.resolveAvailableSlug(dto.slug ?? dto.title ?? activity.title, activity.id)
        : undefined;

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        cityId: dto.cityId,
        cancellationPolicy:
          dto.cancellationPolicy !== undefined ? normalizeNullable(dto.cancellationPolicy) : undefined,
        description: dto.description?.trim(),
        durationLabel:
          dto.durationLabel !== undefined ? normalizeNullable(dto.durationLabel) : undefined,
        highlights: dto.highlights !== undefined ? normalizeStringArray(dto.highlights) : undefined,
        importantInfo:
          dto.importantInfo !== undefined ? normalizeNullable(dto.importantInfo) : undefined,
        included: dto.included !== undefined ? normalizeStringArray(dto.included) : undefined,
        itinerary: dto.itinerary !== undefined ? normalizeJson(dto.itinerary) : undefined,
        meetingPoint:
          dto.meetingPoint !== undefined ? normalizeNullable(dto.meetingPoint) : undefined,
        notIncluded:
          dto.notIncluded !== undefined ? normalizeStringArray(dto.notIncluded) : undefined,
        shortDescription: dto.shortDescription?.trim(),
        slug,
        title: dto.title?.trim()
      },
      include: adminActivityDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_UPDATED", id, { slug: updated.slug });
    return updated;
  }

  async upsertPricing(id: string, actorUserId: string, dto: UpsertAdminActivityPricingDto) {
    const activity = await this.get(id);
    const isActive = dto.isActive ?? true;
    if (!dto.priceCents) {
      throw new BadRequestException({
        code: "ACTIVITY_SIMPLE_PRICE_REQUIRED",
        message: "A positive simple price is required"
      });
    }
    const priceCents = dto.priceCents;

    const pricing = await this.prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.activityPricing.updateMany({
          where: { activityId: activity.id },
          data: { isActive: false }
        });
      }

      return tx.activityPricing.create({
        data: {
          activityId: activity.id,
          currency: dto.currency.trim().toUpperCase(),
          isActive,
          priceCents,
          priceType: dto.priceType?.trim() || "per_person"
        }
      });
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_PRICING_UPDATED", id, {
      pricingId: pricing.id
    });
    return pricing;
  }

  async listAvailability(id: string) {
    const activity = await this.get(id);

    return this.prisma.activityAvailability.findMany({
      where: { activityId: activity.id },
      orderBy: { startDateTime: "asc" }
    });
  }

  async createAvailability(
    id: string,
    actorUserId: string,
    dto: CreateAdminActivityAvailabilityDto
  ) {
    const activity = await this.get(id);

    const availability = await this.prisma.activityAvailability.create({
      data: {
        activityId: activity.id,
        capacity: dto.capacity,
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : null,
        isActive: dto.isActive ?? true,
        startDateTime: new Date(dto.startDateTime)
      }
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_AVAILABILITY_CREATED", id, {
      availabilityId: availability.id
    });
    return availability;
  }

  async updateAvailability(
    id: string,
    availabilityId: string,
    actorUserId: string,
    dto: UpdateAdminActivityAvailabilityDto
  ) {
    const activity = await this.get(id);
    await this.getActivityAvailability(activity.id, availabilityId);

    const availability = await this.prisma.activityAvailability.update({
      where: { id: availabilityId },
      data: {
        capacity: dto.capacity,
        endDateTime: dto.endDateTime !== undefined ? new Date(dto.endDateTime) : undefined,
        isActive: dto.isActive,
        startDateTime:
          dto.startDateTime !== undefined ? new Date(dto.startDateTime) : undefined
      }
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_AVAILABILITY_UPDATED", id, {
      availabilityId
    });
    return availability;
  }

  async deactivateAvailability(id: string, availabilityId: string, actorUserId: string) {
    const activity = await this.get(id);
    await this.getActivityAvailability(activity.id, availabilityId);

    const availability = await this.prisma.activityAvailability.update({
      where: { id: availabilityId },
      data: { isActive: false }
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_AVAILABILITY_DEACTIVATED", id, {
      availabilityId
    });
    return availability;
  }

  async listMedia(id: string) {
    const activity = await this.get(id);

    return this.prisma.activityMedia.findMany({
      where: { activityId: activity.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { file: true }
    });
  }

  async createMedia(id: string, actorUserId: string, dto: CreateAdminActivityMediaDto) {
    const activity = await this.get(id);

    if (!dto.fileAssetId && !dto.url?.trim()) {
      throw new BadRequestException({
        code: "ACTIVITY_MEDIA_SOURCE_REQUIRED",
        message: "Provide either fileAssetId or url"
      });
    }

    if (dto.fileAssetId) {
      const file = await this.prisma.fileAsset.findUnique({ where: { id: dto.fileAssetId } });
      if (!file) {
        throw new NotFoundException({
          code: "FILE_ASSET_NOT_FOUND",
          message: "File asset was not found"
        });
      }
    }

    const media = await this.prisma.$transaction(async (tx) => {
      if (dto.isCover) {
        await tx.activityMedia.updateMany({
          where: { activityId: activity.id },
          data: { isCover: false }
        });
      }

      return tx.activityMedia.create({
        data: {
          activityId: activity.id,
          altText: normalizeNullable(dto.altText),
          fileId: dto.fileAssetId,
          isCover: dto.isCover ?? false,
          sortOrder: dto.sortOrder ?? 0,
          url: normalizeNullable(dto.url)
        },
        include: { file: true }
      });
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_MEDIA_ADDED", id, { mediaId: media.id });
    return media;
  }

  async updateMedia(
    id: string,
    mediaId: string,
    actorUserId: string,
    dto: UpdateAdminActivityMediaDto
  ) {
    const activity = await this.get(id);
    await this.getActivityMedia(activity.id, mediaId);

    const media = await this.prisma.$transaction(async (tx) => {
      if (dto.isCover) {
        await tx.activityMedia.updateMany({
          where: { activityId: activity.id },
          data: { isCover: false }
        });
      }

      return tx.activityMedia.update({
        where: { id: mediaId },
        data: {
          altText: dto.altText !== undefined ? normalizeNullable(dto.altText) : undefined,
          isCover: dto.isCover,
          sortOrder: dto.sortOrder,
          url: dto.url !== undefined ? normalizeNullable(dto.url) : undefined
        },
        include: { file: true }
      });
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_MEDIA_UPDATED", id, { mediaId });
    return media;
  }

  async deleteMedia(id: string, mediaId: string, actorUserId: string) {
    const activity = await this.get(id);
    await this.getActivityMedia(activity.id, mediaId);

    const media = await this.prisma.activityMedia.delete({
      where: { id: mediaId }
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_MEDIA_DELETED", id, { mediaId });
    return media;
  }

  async approve(id: string, actorUserId: string) {
    const activity = await this.get(id);
    this.assertStatus(
      activity.status,
      [ActivityStatus.PENDING_REVIEW, ActivityStatus.REVISION_REQUESTED],
      "approve"
    );

    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: ActivityStatus.APPROVED },
      include: adminActivityDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_APPROVED", id, { previousStatus: activity.status });
    return updated;
  }

  async publish(id: string, actorUserId: string) {
    const activity = await this.get(id);
    this.assertStatus(
      activity.status,
      [ActivityStatus.APPROVED, ActivityStatus.PENDING_REVIEW],
      "publish"
    );

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        publishedAt: new Date(),
        status: ActivityStatus.PUBLISHED
      },
      include: adminActivityDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_PUBLISHED", id, { previousStatus: activity.status });
    return updated;
  }

  async reject(id: string, actorUserId: string, reason: string) {
    const activity = await this.get(id);
    this.assertStatus(activity.status, [ActivityStatus.PENDING_REVIEW, ActivityStatus.APPROVED], "reject");

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw new BadRequestException({
        code: "ACTIVITY_REJECTION_REASON_REQUIRED",
        message: "Rejection reason is required"
      });
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: ActivityStatus.REJECTED },
      include: adminActivityDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_REJECTED", id, {
      previousStatus: activity.status,
      reason: normalizedReason
    });
    return updated;
  }

  async requestRevision(id: string, actorUserId: string, reason: string) {
    const activity = await this.get(id);
    this.assertStatus(
      activity.status,
      [ActivityStatus.PENDING_REVIEW, ActivityStatus.APPROVED],
      "request revision for"
    );

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_REASON_REQUIRED",
        message: "Revision reason is required"
      });
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: ActivityStatus.REVISION_REQUESTED },
      include: adminActivityDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_REVISION_REQUESTED", id, {
      previousStatus: activity.status,
      reason: normalizedReason
    });
    return updated;
  }

  async archive(id: string, actorUserId: string) {
    const activity = await this.get(id);
    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: ActivityStatus.ARCHIVED },
      include: adminActivityDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_ARCHIVED", id, { previousStatus: activity.status });
    return updated;
  }

  private assertStatus(status: ActivityStatus, allowed: ActivityStatus[], action: string) {
    if (!allowed.includes(status)) {
      throw new BadRequestException({
        code: "ACTIVITY_STATUS_TRANSITION_INVALID",
        message: `Activity with status ${status} cannot be ${action}d`,
        details: { allowed, current: status }
      });
    }
  }

  private async assertCityAndCategory(cityId: string, categoryId: string) {
    const [city, category] = await Promise.all([
      this.prisma.city.findFirst({ where: { id: cityId, isActive: true }, select: { id: true } }),
      this.prisma.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true }
      })
    ]);

    if (!city) {
      throw new BadRequestException({
        code: "CITY_INVALID",
        message: "City is not active or does not exist"
      });
    }

    if (!category) {
      throw new BadRequestException({
        code: "CATEGORY_INVALID",
        message: "Category is not active or does not exist"
      });
    }
  }

  private async resolveAvailableSlug(value: string, excludeActivityId?: string) {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestException({
        code: "ACTIVITY_SLUG_REQUIRED",
        message: "Activity slug could not be generated"
      });
    }

    const existing = await this.prisma.activity.findFirst({
      where: {
        slug,
        ...(excludeActivityId ? { id: { not: excludeActivityId } } : {})
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException({
        code: "ACTIVITY_SLUG_TAKEN",
        message: "Activity slug is already used"
      });
    }

    return slug;
  }

  private async getActivityAvailability(activityId: string, availabilityId: string) {
    const availability = await this.prisma.activityAvailability.findFirst({
      where: { activityId, id: availabilityId }
    });

    if (!availability) {
      throw new NotFoundException({
        code: "ACTIVITY_AVAILABILITY_NOT_FOUND",
        message: "Availability was not found"
      });
    }

    return availability;
  }

  private async getActivityMedia(activityId: string, mediaId: string) {
    const media = await this.prisma.activityMedia.findFirst({
      where: { activityId, id: mediaId }
    });

    if (!media) {
      throw new NotFoundException({
        code: "ACTIVITY_MEDIA_NOT_FOUND",
        message: "Media was not found"
      });
    }

    return media;
  }

  private async audit(
    actorUserId: string,
    action: string,
    entityId: string,
    metadata?: Prisma.InputJsonValue
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        actorUserId,
        entityId,
        entityType: "ACTIVITY",
        metadata
      }
    });
  }
}

function normalizeNullable(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeStringArray(value?: string[]) {
  return (value ?? [])
    .map((item) => item.trim())
    .filter(Boolean) as Prisma.InputJsonValue;
}

function normalizeJson(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value as Prisma.InputJsonValue;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
