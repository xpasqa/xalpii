import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ActivityStatus, AvailabilityMode, DestinationType, Prisma, PricingMode } from "@prisma/client";
import { destinationParentInclude } from "../destinations/destination.util";
import { PrismaService } from "../prisma.service";
import { BASE_CURRENCY } from "../common/money.constants";
import type {
  AdminActivityQueryDto,
  CreateAdminActivityAvailabilityDto,
  CreateAdminActivityMediaDto,
  CreateAdminActivityOptionDto,
  UpdateAdminActivityAvailabilityDto,
  UpdateAdminActivityDto,
  UpdateAdminActivityMediaDto,
  UpdateAdminActivityOptionDto,
  UpsertAdminActivityOptionPricingDto,
  UpsertAdminActivityPricingDto
} from "./dto/admin-activity.dto";

const adminActivityListInclude = {
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
  partner: true,
  pricing: {
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 1
  },
  pricingTiers: {
    where: { isActive: true },
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  },
  options: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      pricingTiers: {
        where: { isActive: true },
        orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
      }
    }
  }
} satisfies Prisma.ActivityInclude;

const adminOptionDetailInclude = {
  availability: {
    orderBy: { startDateTime: "asc" }
  },
  pricingTiers: {
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  }
} satisfies Prisma.ActivityOptionInclude;

const adminActivityDetailInclude = {
  availability: {
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
  options: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      availability: {
        orderBy: { startDateTime: "asc" }
      },
      pricingTiers: {
        orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
      }
    }
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
    if (query.destinationId) {
      const destinationIds = await this.getDestinationSubtreeIds(query.destinationId);
      where.destinationId = { in: destinationIds };
    }
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

    if (dto.cityId || dto.destinationId || dto.categoryId) {
      const cityId = await this.resolveLegacyCityId(
        dto.cityId ?? activity.cityId,
        dto.destinationId ?? activity.destinationId ?? undefined
      );
      await this.assertActivityReferences(
        cityId,
        dto.categoryId ?? activity.categoryId,
        dto.destinationId ?? activity.destinationId ?? undefined
      );
    }

    const slug =
      dto.slug !== undefined || dto.title !== undefined
        ? await this.resolveAvailableSlug(dto.slug ?? dto.title ?? activity.title, activity.id)
        : undefined;

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        cityId:
          dto.cityId !== undefined || dto.destinationId !== undefined
            ? await this.resolveLegacyCityId(dto.cityId ?? activity.cityId, dto.destinationId ?? undefined)
            : undefined,
        destinationId: dto.destinationId,
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
    if (dto.currency.trim().toUpperCase() !== BASE_CURRENCY) {
      throw new BadRequestException({
        code: "ACTIVITY_PRICING_CURRENCY_UNSUPPORTED",
        message: "Activity pricing must be entered and stored in USD"
      });
    }
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
          currency: BASE_CURRENCY,
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

  async listOptions(id: string) {
    const activity = await this.get(id);

    return this.prisma.activityOption.findMany({
      where: { activityId: activity.id },
      include: adminOptionDetailInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
  }

  async createOption(id: string, actorUserId: string, dto: CreateAdminActivityOptionDto) {
    const activity = await this.get(id);
    const slug = await this.resolveAvailableOptionSlug(activity.id, dto.slug ?? dto.title);

    const option = await this.prisma.activityOption.create({
      data: {
        activityId: activity.id,
        availabilityMode: dto.availabilityMode ?? AvailabilityMode.SCHEDULED_SESSIONS,
        availableDays: normalizeAvailableDays(dto.availableDays),
        dailyCapacity: dto.dailyCapacity,
        description: normalizeNullable(dto.description),
        durationLabel: normalizeNullable(dto.durationLabel),
        isActive: dto.isActive ?? true,
        meetingPoint: normalizeNullable(dto.meetingPoint),
        slug,
        sortOrder: dto.sortOrder ?? 0,
        title: dto.title.trim()
      },
      include: adminOptionDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_CREATED", id, { optionId: option.id });
    return option;
  }

  async getOption(id: string, optionId: string) {
    const activity = await this.get(id);
    return this.getActivityOption(activity.id, optionId);
  }

  async updateOption(
    id: string,
    optionId: string,
    actorUserId: string,
    dto: UpdateAdminActivityOptionDto
  ) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);
    const slug =
      dto.slug !== undefined || dto.title !== undefined
        ? await this.resolveAvailableOptionSlug(activity.id, dto.slug ?? dto.title ?? option.title, option.id)
        : undefined;

    const updated = await this.prisma.activityOption.update({
      where: { id: option.id },
      data: {
        availabilityMode: dto.availabilityMode,
        availableDays:
          dto.availableDays !== undefined ? normalizeAvailableDays(dto.availableDays) : undefined,
        dailyCapacity: dto.dailyCapacity,
        description: dto.description !== undefined ? normalizeNullable(dto.description) : undefined,
        durationLabel:
          dto.durationLabel !== undefined ? normalizeNullable(dto.durationLabel) : undefined,
        isActive: dto.isActive,
        meetingPoint:
          dto.meetingPoint !== undefined ? normalizeNullable(dto.meetingPoint) : undefined,
        slug,
        sortOrder: dto.sortOrder,
        title: dto.title?.trim()
      },
      include: adminOptionDetailInclude
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_UPDATED", id, { optionId: option.id });
    return updated;
  }

  async deactivateOption(id: string, optionId: string, actorUserId: string) {
    const activity = await this.get(id);
    await this.getActivityOption(activity.id, optionId);

    const updated = await this.prisma.activityOption.update({
      where: { id: optionId },
      data: { isActive: false },
      include: adminOptionDetailInclude
    });
    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_DEACTIVATED", id, { optionId });
    return updated;
  }

  async getOptionPricing(id: string, optionId: string) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);

    return {
      currency: BASE_CURRENCY,
      pricingTiers: option.pricingTiers
    };
  }

  async upsertOptionPricing(
    id: string,
    optionId: string,
    actorUserId: string,
    dto: UpsertAdminActivityOptionPricingDto
  ) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);
    const requestedCurrency = dto.currency.trim().toUpperCase();
    if (requestedCurrency !== BASE_CURRENCY) {
      throw new BadRequestException({
        code: "ACTIVITY_OPTION_PRICING_CURRENCY_UNSUPPORTED",
        message: "Option pricing must be entered and stored in USD"
      });
    }

    const tiers = normalizePricingTiers(dto.tiers, BASE_CURRENCY, dto.priceType?.trim() || "per_person");
    await this.prisma.$transaction(async (tx) => {
      await tx.activityOptionPricingTier.deleteMany({ where: { optionId: option.id } });
      await tx.activityOptionPricingTier.createMany({
        data: tiers.map((tier) => ({
          ...tier,
          optionId: option.id
        }))
      });

      const summaryPrice = Math.min(
        ...tiers.filter((tier) => tier.isActive).map((tier) => tier.adultPriceCents)
      );
      await tx.activity.update({
        where: { id: activity.id },
        data: { pricingMode: PricingMode.GROUP_TIER }
      });
      await tx.activityPricing.updateMany({
        where: { activityId: activity.id },
        data: { isActive: false }
      });
      await tx.activityPricing.create({
        data: {
          activityId: activity.id,
          currency: BASE_CURRENCY,
          isActive: true,
          priceCents: summaryPrice,
          priceType: tiers[0]?.priceType ?? "per_person"
        }
      });
    });

    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_PRICING_UPDATED", id, {
      optionId: option.id,
      tierCount: tiers.length
    });
    return this.getOptionPricing(activity.id, option.id);
  }

  async listOptionAvailability(id: string, optionId: string) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);

    return this.prisma.activityAvailability.findMany({
      where: { activityId: activity.id, optionId: option.id },
      orderBy: { startDateTime: "asc" }
    });
  }

  async createOptionAvailability(
    id: string,
    optionId: string,
    actorUserId: string,
    dto: CreateAdminActivityAvailabilityDto
  ) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);
    this.assertScheduledOption(option.availabilityMode);

    const availability = await this.prisma.activityAvailability.create({
      data: {
        activityId: activity.id,
        optionId: option.id,
        capacity: dto.capacity,
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : null,
        isActive: dto.isActive ?? true,
        startDateTime: new Date(dto.startDateTime)
      }
    });
    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_AVAILABILITY_CREATED", id, {
      optionId: option.id,
      availabilityId: availability.id
    });
    return availability;
  }

  async updateOptionAvailability(
    id: string,
    optionId: string,
    availabilityId: string,
    actorUserId: string,
    dto: UpdateAdminActivityAvailabilityDto
  ) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);
    this.assertScheduledOption(option.availabilityMode);
    await this.getActivityAvailability(activity.id, availabilityId, option.id);

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
    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_AVAILABILITY_UPDATED", id, {
      optionId: option.id,
      availabilityId
    });
    return availability;
  }

  async deactivateOptionAvailability(
    id: string,
    optionId: string,
    availabilityId: string,
    actorUserId: string
  ) {
    const activity = await this.get(id);
    const option = await this.getActivityOption(activity.id, optionId);
    await this.getActivityAvailability(activity.id, availabilityId, option.id);

    const availability = await this.prisma.activityAvailability.update({
      where: { id: availabilityId },
      data: { isActive: false }
    });
    await this.audit(actorUserId, "ACTIVITY_ADMIN_OPTION_AVAILABILITY_DEACTIVATED", id, {
      optionId: option.id,
      availabilityId
    });
    return availability;
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

  private async assertActivityReferences(
    cityId: string,
    categoryId: string,
    destinationId?: string | null
  ) {
    const [city, category, destination] = await Promise.all([
      this.prisma.city.findFirst({ where: { id: cityId, isActive: true }, select: { id: true } }),
      this.prisma.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true }
      }),
      destinationId
        ? this.prisma.destination.findFirst({
            where: {
              id: destinationId,
              isActive: true,
              type: { in: [DestinationType.REGION, DestinationType.CITY, DestinationType.AREA] }
            },
            select: { id: true }
          })
        : Promise.resolve(null)
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

    if (destinationId && !destination) {
      throw new BadRequestException({
        code: "DESTINATION_INVALID",
        message: "Destination is not active, selectable, or does not exist"
      });
    }
  }

  private async resolveLegacyCityId(cityId?: string, destinationId?: string | null) {
    if (cityId) return cityId;

    if (!destinationId) {
      throw new BadRequestException({
        code: "CITY_OR_DESTINATION_REQUIRED",
        message: "Select a destination before updating this activity"
      });
    }

    const destination = await this.prisma.destination.findUnique({
      where: { id: destinationId },
      include: destinationParentInclude(4)
    });

    for (const slug of buildBreadcrumb(destination).map((item) => item.slug).reverse()) {
      const city = await this.prisma.city.findFirst({
        where: { slug, isActive: true },
        select: { id: true }
      });
      if (city) return city.id;
    }

    const fallback = await this.prisma.city.findFirst({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true }
    });

    if (!fallback) {
      throw new BadRequestException({
        code: "LEGACY_CITY_FALLBACK_MISSING",
        message: "No active legacy city is available for this destination"
      });
    }

    return fallback.id;
  }

  private async getDestinationSubtreeIds(destinationId: string) {
    const destinations = await this.prisma.destination.findMany({
      select: {
        id: true,
        parentId: true
      }
    });

    const destination = destinations.find((item) => item.id === destinationId);
    if (!destination) {
      throw new NotFoundException({
        code: "ADMIN_DESTINATION_NOT_FOUND",
        message: "Destination was not found"
      });
    }

    const childIdsByParentId = new Map<string, string[]>();
    for (const item of destinations) {
      if (!item.parentId) continue;
      childIdsByParentId.set(item.parentId, [...(childIdsByParentId.get(item.parentId) ?? []), item.id]);
    }

    const visited = new Set<string>();
    const walk = (currentId: string) => {
      visited.add(currentId);
      for (const childId of childIdsByParentId.get(currentId) ?? []) {
        if (!visited.has(childId)) {
          walk(childId);
        }
      }
    };

    walk(destinationId);
    return [...visited];
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

  private assertScheduledOption(availabilityMode: AvailabilityMode) {
    if (availabilityMode !== AvailabilityMode.SCHEDULED_SESSIONS) {
      throw new BadRequestException({
        code: "ACTIVITY_OPTION_SESSION_NOT_ALLOWED",
        message: "Scheduled sessions can only be managed for scheduled-session options"
      });
    }
  }

  private async resolveAvailableOptionSlug(activityId: string, value: string, excludeOptionId?: string) {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestException({
        code: "ACTIVITY_OPTION_SLUG_REQUIRED",
        message: "Activity option slug could not be generated"
      });
    }

    const existing = await this.prisma.activityOption.findFirst({
      where: {
        activityId,
        slug,
        ...(excludeOptionId ? { id: { not: excludeOptionId } } : {})
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException({
        code: "ACTIVITY_OPTION_SLUG_TAKEN",
        message: "Activity option slug is already used for this activity"
      });
    }

    return slug;
  }

  private async getActivityOption(activityId: string, optionId: string) {
    const option = await this.prisma.activityOption.findFirst({
      where: { activityId, id: optionId },
      include: adminOptionDetailInclude
    });

    if (!option) {
      throw new NotFoundException({
        code: "ACTIVITY_OPTION_NOT_FOUND",
        message: "Activity option was not found"
      });
    }

    return option;
  }

  private async getActivityAvailability(activityId: string, availabilityId: string, optionId?: string) {
    const availability = await this.prisma.activityAvailability.findFirst({
      where: { activityId, id: availabilityId, ...(optionId ? { optionId } : {}) }
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

const validWeekdays = new Set([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
]);

function normalizeAvailableDays(value?: string[]) {
  if (value === undefined) return undefined;
  const days = [...new Set(value.map((day) => day.trim().toUpperCase()))].filter(Boolean);
  const invalid = days.filter((day) => !validWeekdays.has(day));

  if (invalid.length) {
    throw new BadRequestException({
      code: "ACTIVITY_OPTION_AVAILABLE_DAYS_INVALID",
      message: "Available days must be weekday names",
      details: { invalid }
    });
  }

  return days as Prisma.InputJsonValue;
}

function normalizePricingTiers(
  tiers: NonNullable<UpsertAdminActivityOptionPricingDto["tiers"]>,
  currency: string,
  priceType: string
) {
  if (!tiers.length) {
    throw new BadRequestException({
      code: "ACTIVITY_PRICING_TIERS_REQUIRED",
      message: "Group tier pricing requires at least one pricing tier"
    });
  }

  const normalized = tiers
    .map((tier) => {
      const discount = tier.childDiscountPercent ?? 27;
      const childAllowed = tier.childAllowed ?? true;
      return {
        adultPriceCents: tier.adultPriceCents,
        childDiscountPercent: childAllowed ? new Prisma.Decimal(discount) : null,
        childPriceCents: childAllowed
          ? tier.childPriceCents ?? Math.round(tier.adultPriceCents * (1 - discount / 100))
          : null,
        currency,
        isActive: tier.isActive ?? true,
        maxTravelers: tier.maxTravelers,
        minTravelers: tier.minTravelers,
        priceType
      };
    })
    .sort((a, b) => a.minTravelers - b.minTravelers);

  const active = normalized.filter((tier) => tier.isActive);
  if (!active.length) {
    throw new BadRequestException({
      code: "ACTIVITY_ACTIVE_PRICING_TIER_REQUIRED",
      message: "At least one pricing tier must be active"
    });
  }

  for (let index = 0; index < active.length; index += 1) {
    const tier = active[index];
    if (tier.maxTravelers < tier.minTravelers) {
      throw new BadRequestException({
        code: "ACTIVITY_PRICING_TIER_RANGE_INVALID",
        message: "Tier maximum travelers must be greater than or equal to its minimum"
      });
    }

    const previous = active[index - 1];
    if (previous && tier.minTravelers <= previous.maxTravelers) {
      throw new BadRequestException({
        code: "ACTIVITY_PRICING_TIERS_OVERLAP",
        message: "Active pricing tier traveler ranges cannot overlap"
      });
    }
  }

  return normalized;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildBreadcrumb(
  destination?: {
    id: string;
    name: string;
    slug: string;
    type: DestinationType;
    parent?: unknown;
  } | null
) {
  const chain: Array<{ id: string; name: string; slug: string; type: DestinationType }> = [];
  let current = destination;

  while (current) {
    chain.unshift({
      id: current.id,
      name: current.name,
      slug: current.slug,
      type: current.type
    });
    current = current.parent as typeof current;
  }

  return chain;
}
