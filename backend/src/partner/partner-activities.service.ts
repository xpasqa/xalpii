import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ActivityRevisionStatus,
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PricingMode,
  Prisma
} from "@prisma/client";
import { destinationParentInclude } from "../destinations/destination.util";
import { PrismaService } from "../prisma.service";
import { BASE_CURRENCY } from "../common/money.constants";
import type {
  CreatePartnerActivityAvailabilityDto,
  CreatePartnerActivityDto,
  CreatePartnerActivityMediaDto,
  CreatePartnerActivityOptionDto,
  PartnerActivityQueryDto,
  UpdatePartnerActivityAvailabilityDto,
  UpdatePartnerActivityDto,
  UpdatePartnerActivityMediaDto,
  UpdatePartnerActivityOptionDto,
  UpsertPartnerActivityOptionPricingDto,
  UpsertPartnerActivityPricingDto
} from "./dto/partner-activity.dto";

const editableStatuses = new Set<ActivityStatus>([
  ActivityStatus.DRAFT,
  ActivityStatus.REVISION_REQUESTED
]);

const activeRevisionStatuses = [
  ActivityRevisionStatus.DRAFT,
  ActivityRevisionStatus.PENDING_REVIEW,
  ActivityRevisionStatus.REJECTED
];

const activityDetailInclude = {
  availability: {
    orderBy: {
      startDateTime: "asc"
    }
  },
  category: true,
  city: true,
  destination: {
    include: destinationParentInclude(4)
  },
  media: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  },
  pricing: {
    orderBy: {
      createdAt: "desc"
    }
  },
  pricingTiers: {
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  },
  options: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      availability: {
        orderBy: {
          startDateTime: "asc"
        }
      },
      pricingTiers: {
        orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
      }
    }
  },
  revisions: {
    where: {
      status: {
        in: activeRevisionStatuses
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 1
  }
} satisfies Prisma.ActivityInclude;

const optionDetailInclude = {
  availability: {
    orderBy: {
      startDateTime: "asc"
    }
  },
  pricingTiers: {
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  }
} satisfies Prisma.ActivityOptionInclude;

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
        destination: {
          include: destinationParentInclude(4)
        },
        media: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 1
        },
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
        },
        revisions: {
          where: {
            status: {
              in: activeRevisionStatuses
            }
          },
          orderBy: {
            updatedAt: "desc"
          },
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
    const cityId = await this.resolveLegacyCityId(dto.cityId, dto.destinationId);
    await this.assertActivityReferences(cityId, dto.categoryId, dto.destinationId);

    const slug = await this.resolveAvailableSlug(dto.slug ?? dto.title);
    const activity = await this.prisma.activity.create({
      data: {
        categoryId: dto.categoryId,
        cityId,
        destinationId: dto.destinationId,
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
      where: { id: activity.id },
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

    const pricingMode = dto.pricingMode ?? PricingMode.SIMPLE;
    const requestedCurrency = dto.currency.trim().toUpperCase();
    if (requestedCurrency !== BASE_CURRENCY) {
      throw new BadRequestException({
        code: "ACTIVITY_PRICING_CURRENCY_UNSUPPORTED",
        message: "Partner pricing must be entered and stored in USD"
      });
    }
    const currency = BASE_CURRENCY;
    const priceType = dto.priceType?.trim() || "per_person";
    const isActive = dto.isActive ?? true;
    const tiers =
      pricingMode === PricingMode.GROUP_TIER
        ? normalizePricingTiers(dto.tiers ?? [], currency, priceType)
        : [];

    if (pricingMode === PricingMode.SIMPLE && !dto.priceCents) {
      throw new BadRequestException({
        code: "ACTIVITY_SIMPLE_PRICE_REQUIRED",
        message: "A positive simple price is required"
      });
    }

    const summaryPrice =
      pricingMode === PricingMode.GROUP_TIER
        ? Math.min(...tiers.filter((tier) => tier.isActive).map((tier) => tier.adultPriceCents))
        : dto.priceCents!;

    const pricing = await this.prisma.$transaction(async (tx) => {
      await tx.activity.update({
        where: { id: activity.id },
        data: { pricingMode }
      });
      await tx.activityPricing.updateMany({
        where: { activityId: activity.id },
        data: { isActive: false }
      });
      await tx.activityPricingTier.deleteMany({
        where: { activityId: activity.id }
      });

      const summary = await tx.activityPricing.create({
        data: {
          activityId: activity.id,
          currency,
          isActive,
          priceCents: summaryPrice,
          priceType
        }
      });

      if (tiers.length) {
        await tx.activityPricingTier.createMany({
          data: tiers.map((tier) => ({
            ...tier,
            activityId: activity.id
          }))
        });
      }

      return summary;
    });

    await this.audit(userId, "ACTIVITY_PRICING_UPDATED", activity.id, {
      pricingId: pricing.id,
      pricingMode,
      tierCount: tiers.length
    });
    return this.getPricing(userId, activity.id);
  }

  async getPricing(userId: string, activityId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);

    return {
      pricingMode: activity.pricingMode,
      pricing: activity.pricing,
      pricingTiers: activity.pricingTiers
    };
  }

  async listOptions(userId: string, activityId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);

    return this.prisma.activityOption.findMany({
      where: { activityId: activity.id },
      include: optionDetailInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
  }

  async createOption(userId: string, activityId: string, dto: CreatePartnerActivityOptionDto) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);

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
        meetingTimes: normalizeMeetingTimes(dto.meetingTimes),
        slug,
        sortOrder: dto.sortOrder ?? 0,
        title: dto.title.trim()
      },
      include: optionDetailInclude
    });

    await this.audit(userId, "ACTIVITY_OPTION_CREATED", activity.id, { optionId: option.id });
    return option;
  }

  async getOption(userId: string, activityId: string, optionId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    return this.getOwnedOption(activity.id, optionId);
  }

  async updateOption(
    userId: string,
    activityId: string,
    optionId: string,
    dto: UpdatePartnerActivityOptionDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    const option = await this.getOwnedOption(activity.id, optionId);
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
        meetingTimes:
          dto.meetingTimes !== undefined ? normalizeMeetingTimes(dto.meetingTimes) : undefined,
        slug,
        sortOrder: dto.sortOrder,
        title: dto.title?.trim()
      },
      include: optionDetailInclude
    });

    await this.audit(userId, "ACTIVITY_OPTION_UPDATED", activity.id, { optionId: option.id });
    return updated;
  }

  async deactivateOption(userId: string, activityId: string, optionId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    await this.getOwnedOption(activity.id, optionId);

    const updated = await this.prisma.activityOption.update({
      where: { id: optionId },
      data: { isActive: false },
      include: optionDetailInclude
    });
    await this.audit(userId, "ACTIVITY_OPTION_DEACTIVATED", activity.id, { optionId });
    return updated;
  }

  async getOptionPricing(userId: string, activityId: string, optionId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    const option = await this.getOwnedOption(activity.id, optionId);

    return {
      currency: BASE_CURRENCY,
      pricingTiers: option.pricingTiers
    };
  }

  async upsertOptionPricing(
    userId: string,
    activityId: string,
    optionId: string,
    dto: UpsertPartnerActivityOptionPricingDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    const option = await this.getOwnedOption(activity.id, optionId);
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

    await this.audit(userId, "ACTIVITY_OPTION_PRICING_UPDATED", activity.id, {
      optionId: option.id,
      tierCount: tiers.length
    });
    return this.getOptionPricing(userId, activity.id, option.id);
  }

  async listOptionAvailability(userId: string, activityId: string, optionId: string) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    const option = await this.getOwnedOption(activity.id, optionId);

    return this.prisma.activityAvailability.findMany({
      where: { activityId: activity.id, optionId: option.id },
      orderBy: { startDateTime: "asc" }
    });
  }

  async createOptionAvailability(
    userId: string,
    activityId: string,
    optionId: string,
    dto: CreatePartnerActivityAvailabilityDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    const option = await this.getOwnedOption(activity.id, optionId);
    this.assertScheduledOption(option.availabilityMode);

    return this.prisma.activityAvailability.create({
      data: {
        activityId: activity.id,
        optionId: option.id,
        capacity: dto.capacity,
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : null,
        isActive: dto.isActive ?? true,
        startDateTime: new Date(dto.startDateTime)
      }
    });
  }

  async updateOptionAvailability(
    userId: string,
    activityId: string,
    optionId: string,
    availabilityId: string,
    dto: UpdatePartnerActivityAvailabilityDto
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    const option = await this.getOwnedOption(activity.id, optionId);
    this.assertScheduledOption(option.availabilityMode);
    await this.getOwnedAvailability(activity.id, availabilityId, option.id);

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

  async deactivateOptionAvailability(
    userId: string,
    activityId: string,
    optionId: string,
    availabilityId: string
  ) {
    const partner = await this.getPartnerForUser(userId);
    const activity = await this.getOwnedActivity(partner.id, activityId);
    this.assertEditable(activity.status);
    const option = await this.getOwnedOption(activity.id, optionId);
    await this.getOwnedAvailability(activity.id, availabilityId, option.id);

    return this.prisma.activityAvailability.update({
      where: { id: availabilityId },
      data: { isActive: false }
    });
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

  async listActiveDestinations() {
    const destinations = await this.prisma.destination.findMany({
      where: {
        isActive: true,
        type: {
          in: [DestinationType.REGION, DestinationType.CITY, DestinationType.AREA]
        }
      },
      include: destinationParentInclude(4),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    return destinations.map((destination) => ({
      ...destination,
      breadcrumb: buildBreadcrumb(destination)
    }));
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

  private async getOwnedOption(activityId: string, optionId: string) {
    const option = await this.prisma.activityOption.findFirst({
      where: { activityId, id: optionId },
      include: optionDetailInclude
    });

    if (!option) {
      throw new NotFoundException({
        code: "ACTIVITY_OPTION_NOT_FOUND",
        message: "Activity option was not found"
      });
    }

    return option;
  }

  private async getOwnedAvailability(activityId: string, availabilityId: string, optionId?: string) {
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

  private assertScheduledOption(availabilityMode: AvailabilityMode) {
    if (availabilityMode !== AvailabilityMode.SCHEDULED_SESSIONS) {
      throw new BadRequestException({
        code: "ACTIVITY_OPTION_SESSION_NOT_ALLOWED",
        message: "Scheduled sessions can only be managed for scheduled-session options"
      });
    }
  }

  private assertSubmittable(activity: Awaited<ReturnType<typeof this.getOwnedActivity>>) {
    const hasOptionPricing = activity.options.some(
      (option) => option.isActive && option.pricingTiers.some((tier) => tier.isActive)
    );
    const hasPricing =
      hasOptionPricing ||
      (activity.pricing.some((price) => price.isActive) &&
        (activity.pricingMode !== PricingMode.GROUP_TIER ||
          activity.pricingTiers.some((tier) => tier.isActive)));
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
        message: "Select a destination before creating an activity"
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

function normalizeMeetingTimes(value?: string[]) {
  if (value === undefined) return undefined;
  const times = [...new Set(value.map((item) => item.trim()).filter(Boolean))];
  const invalid = times.filter((item) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(item));

  if (invalid.length) {
    throw new BadRequestException({
      code: "ACTIVITY_OPTION_MEETING_TIMES_INVALID",
      message: "Meeting times must use HH:mm format",
      details: { invalid }
    });
  }

  return times as Prisma.InputJsonValue;
}

function normalizePricingTiers(
  tiers: NonNullable<UpsertPartnerActivityPricingDto["tiers"]>,
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
