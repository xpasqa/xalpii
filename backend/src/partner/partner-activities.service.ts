import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ActivityStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import type {
  CreatePartnerActivityAvailabilityDto,
  CreatePartnerActivityDto,
  CreatePartnerActivityMediaDto,
  PartnerActivityQueryDto,
  UpdatePartnerActivityAvailabilityDto,
  UpdatePartnerActivityDto,
  UpdatePartnerActivityMediaDto,
  UpsertPartnerActivityPricingDto
} from "./dto/partner-activity.dto";

const editableStatuses = new Set<ActivityStatus>([
  ActivityStatus.DRAFT,
  ActivityStatus.REVISION_REQUESTED
]);

const activityDetailInclude = {
  availability: {
    orderBy: {
      startDateTime: "asc"
    }
  },
  category: true,
  city: true,
  media: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  },
  pricing: {
    orderBy: {
      createdAt: "desc"
    }
  }
} satisfies Prisma.ActivityInclude;

@Injectable()
export class PartnerActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: PartnerActivityQueryDto) {
    const partner = await this.getPartnerForUser(userId);
    const where: Prisma.ActivityWhereInput = {
      partnerId: partner.id
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } }
      ];
    }

    return this.prisma.activity.findMany({
      where,
      include: {
        category: true,
        city: true,
        media: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 1
        },
        pricing: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  async get(userId: string, activityId: string) {
    const partner = await this.getPartnerForUser(userId);
    return this.getOwnedActivity(partner.id, activityId);
  }

  async create(userId: string, dto: CreatePartnerActivityDto) {
    const partner = await this.getPartnerForUser(userId);
    await this.assertCityAndCategory(dto.cityId, dto.categoryId);

    const slug = await this.resolveAvailableSlug(dto.slug ?? dto.title);
    const activity = await this.prisma.activity.create({
      data: {
        categoryId: dto.categoryId,
        cityId: dto.cityId,
        cancellationPolicy: normalizeNullable(dto.cancellationPolicy),
        description: dto.description.trim(),
        durationLabel: normalizeNullable(dto.durationLabel),
        highlights: normalizeStringArray(dto.highlights),
        importantInfo: normalizeNullable(dto.importantInfo),
        included: normalizeStringArray(dto.included),
        itinerary: normalizeJson(dto.itinerary),
        meetingPoint: normalizeNullable(dto.meetingPoint),
        notIncluded: normalizeStringArray(dto.notIncluded),
        partnerId: partner.id,
        shortDescription: dto.shortDescription.trim(),
        slug,
        status: ActivityStatus.DRAFT,
        title: dto.title.trim()
      },
      include: activityDetailInclude
    });

    await this.audit(userId, "ACTIVITY_DRAFT_CREATED", activity.id, { slug });
    return activity;
  }

  async update(userId: string, activityId: string, dto: UpdatePartnerActivityDto) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);

    if (dto.cityId || dto.categoryId) {
      await this.assertCityAndCategory(dto.cityId ?? activity.cityId, dto.categoryId ?? activity.categoryId);
    }

    const slug =
      dto.slug !== undefined || dto.title !== undefined
        ? await this.resolveAvailableSlug(dto.slug ?? dto.title ?? activity.title, activity.id)
        : undefined;

    const updated = await this.prisma.activity.update({
      where: { id: activity.id },
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
      include: activityDetailInclude
    });

    await this.audit(userId, "ACTIVITY_UPDATED", activity.id, { slug: updated.slug });
    return updated;
  }

  async submit(userId: string, activityId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    this.assertSubmittable(activity);

    const updated = await this.prisma.activity.update({
      where: { id: activity.id },
      data: {
        status: ActivityStatus.PENDING_REVIEW
      },
      include: activityDetailInclude
    });

    await this.audit(userId, "ACTIVITY_SUBMITTED_FOR_REVIEW", activity.id, {
      status: updated.status
    });
    return updated;
  }

  async upsertPricing(userId: string, activityId: string, dto: UpsertPartnerActivityPricingDto) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);

    const isActive = dto.isActive ?? true;
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
          priceCents: dto.priceCents,
          priceType: dto.priceType.trim()
        }
      });
    });

    await this.audit(userId, "ACTIVITY_PRICING_UPDATED", activity.id, {
      pricingId: pricing.id
    });
    return pricing;
  }

  async listAvailability(userId: string, activityId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);

    return this.prisma.activityAvailability.findMany({
      where: { activityId: activity.id },
      orderBy: { startDateTime: "asc" }
    });
  }

  async createAvailability(
    userId: string,
    activityId: string,
    dto: CreatePartnerActivityAvailabilityDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);

    return this.prisma.activityAvailability.create({
      data: {
        activityId: activity.id,
        capacity: dto.capacity,
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : null,
        isActive: dto.isActive ?? true,
        startDateTime: new Date(dto.startDateTime)
      }
    });
  }

  async updateAvailability(
    userId: string,
    activityId: string,
    availabilityId: string,
    dto: UpdatePartnerActivityAvailabilityDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    await this.getOwnedAvailability(activity.id, availabilityId);

    return this.prisma.activityAvailability.update({
      where: { id: availabilityId },
      data: {
        capacity: dto.capacity,
        endDateTime: dto.endDateTime !== undefined ? new Date(dto.endDateTime) : undefined,
        isActive: dto.isActive,
        startDateTime:
          dto.startDateTime !== undefined ? new Date(dto.startDateTime) : undefined
      }
    });
  }

  async deactivateAvailability(userId: string, activityId: string, availabilityId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    await this.getOwnedAvailability(activity.id, availabilityId);

    return this.prisma.activityAvailability.update({
      where: { id: availabilityId },
      data: { isActive: false }
    });
  }

  async listMedia(userId: string, activityId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);

    return this.prisma.activityMedia.findMany({
      where: { activityId: activity.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { file: true }
    });
  }

  async createMedia(userId: string, activityId: string, dto: CreatePartnerActivityMediaDto) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);

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

    await this.audit(userId, "ACTIVITY_MEDIA_ADDED", activity.id, {
      mediaId: media.id
    });
    return media;
  }

  async updateMedia(
    userId: string,
    activityId: string,
    mediaId: string,
    dto: UpdatePartnerActivityMediaDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    await this.getOwnedMedia(activity.id, mediaId);

    return this.prisma.$transaction(async (tx) => {
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
  }

  async deleteMedia(userId: string, activityId: string, mediaId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    await this.getOwnedMedia(activity.id, mediaId);

    return this.prisma.activityMedia.delete({
      where: { id: mediaId }
    });
  }

  async listActiveCities() {
    return this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  async listActiveCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  private async getPartnerForUser(userId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { userId }
    });

    if (!partner) {
      throw new NotFoundException({
        code: "PARTNER_PROFILE_NOT_FOUND",
        message: "Partner profile was not found"
      });
    }

    return partner;
  }

  private async getOwnedActivity(partnerId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id: activityId,
        partnerId
      },
      include: activityDetailInclude
    });

    if (!activity) {
      throw new NotFoundException({
        code: "PARTNER_ACTIVITY_NOT_FOUND",
        message: "Activity was not found"
      });
    }

    return activity;
  }

  private async getOwnedAvailability(activityId: string, availabilityId: string) {
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

  private async getOwnedMedia(activityId: string, mediaId: string) {
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

  private assertEditable(status: ActivityStatus) {
    if (!editableStatuses.has(status)) {
      throw new ForbiddenException({
        code: "ACTIVITY_NOT_EDITABLE",
        message: "Only draft or revision-requested activities can be edited"
      });
    }
  }

  private assertSubmittable(activity: Awaited<ReturnType<typeof this.getOwnedActivity>>) {
    const hasPricing = activity.pricing.some((price) => price.isActive);
    const missing: string[] = [];

    if (!activity.title.trim()) missing.push("title");
    if (!activity.cityId) missing.push("cityId");
    if (!activity.categoryId) missing.push("categoryId");
    if (!activity.shortDescription.trim()) missing.push("shortDescription");
    if (!activity.description.trim()) missing.push("description");
    if (!hasPricing) missing.push("pricing");

    if (missing.length > 0) {
      throw new BadRequestException({
        code: "ACTIVITY_SUBMISSION_INCOMPLETE",
        message: "Activity is missing required fields",
        details: { missing }
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
