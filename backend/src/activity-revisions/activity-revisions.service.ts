import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ActivityRevisionStatus,
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  Prisma,
  UserRole
} from "@prisma/client";
import { destinationParentInclude } from "../destinations/destination.util";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { PrismaService } from "../prisma.service";
import type { ActivityRevisionQueryDto } from "./dto/activity-revision.dto";

const activePartnerRevisionStatuses = [
  ActivityRevisionStatus.DRAFT,
  ActivityRevisionStatus.PENDING_REVIEW,
  ActivityRevisionStatus.REJECTED
];

const editableRevisionStatuses = new Set<ActivityRevisionStatus>([
  ActivityRevisionStatus.DRAFT,
  ActivityRevisionStatus.REJECTED
]);

const activitySnapshotInclude = {
  availability: {
    orderBy: { startDateTime: "asc" }
  },
  destination: {
    include: destinationParentInclude(4)
  },
  media: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
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
  pricing: {
    orderBy: { createdAt: "desc" }
  },
  pricingTiers: {
    orderBy: [{ minTravelers: "asc" }, { maxTravelers: "asc" }]
  }
} satisfies Prisma.ActivityInclude;

const revisionInclude = {
  activity: {
    include: {
      category: true,
      city: true,
      destination: {
        include: destinationParentInclude(4)
      }
    }
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
  reviewedBy: {
    select: {
      email: true,
      fullName: true,
      id: true
    }
  }
} satisfies Prisma.ActivityRevisionInclude;

type ActivitySnapshot = {
  activity: {
    cancellationPolicy: string | null;
    categoryId: string;
    cityId: string;
    destinationId: string | null;
    description: string;
    durationLabel: string | null;
    highlights: Prisma.JsonValue;
    importantInfo: string | null;
    included: Prisma.JsonValue;
    itinerary: Prisma.JsonValue | null;
    meetingPoint: string | null;
    notIncluded: Prisma.JsonValue;
    pricingMode: string;
    shortDescription: string;
    slug: string;
    title: string;
  };
  availability: Array<Record<string, unknown>>;
  media: Array<Record<string, unknown>>;
  options: Array<Record<string, unknown>>;
  pricing: Array<Record<string, unknown>>;
  pricingTiers: Array<Record<string, unknown>>;
};

@Injectable()
export class ActivityRevisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPartnerRevision(userId: string, activityId: string) {
    const activity = await this.getPartnerPublishedActivity(userId, activityId);
    const existing = await this.prisma.activityRevision.findFirst({
      where: {
        activityId: activity.id,
        partnerId: activity.partnerId,
        status: { in: activePartnerRevisionStatuses }
      },
      include: revisionInclude,
      orderBy: { updatedAt: "desc" }
    });

    if (existing) return existing;

    const snapshot = await this.buildActivitySnapshot(activity.id);
    const revision = await this.prisma.activityRevision.create({
      data: {
        activityId: activity.id,
        partnerId: activity.partnerId,
        snapshot: snapshot as Prisma.InputJsonValue,
        status: ActivityRevisionStatus.DRAFT
      },
      include: revisionInclude
    });

    await this.audit(userId, "ACTIVITY_REVISION_CREATED", revision.id, {
      activityId: activity.id
    });
    return revision;
  }

  async getPartnerCurrentRevision(userId: string, activityId: string) {
    const activity = await this.getPartnerActivity(userId, activityId);
    return this.prisma.activityRevision.findFirst({
      where: {
        activityId: activity.id,
        partnerId: activity.partnerId,
        status: { in: activePartnerRevisionStatuses }
      },
      include: revisionInclude,
      orderBy: { updatedAt: "desc" }
    });
  }

  async getPartnerRevision(userId: string, activityId: string, revisionId: string) {
    const activity = await this.getPartnerActivity(userId, activityId);
    return this.getRevisionForPartner(activity.partnerId, activity.id, revisionId);
  }

  async updatePartnerRevision(
    userId: string,
    activityId: string,
    revisionId: string,
    snapshot: unknown
  ) {
    const activity = await this.getPartnerActivity(userId, activityId);
    const revision = await this.getRevisionForPartner(activity.partnerId, activity.id, revisionId);
    this.assertRevisionEditable(revision.status);
    const validated = await this.validateActivityRevisionSnapshot(snapshot);

    const updated = await this.prisma.activityRevision.update({
      where: { id: revision.id },
      data: {
        rejectionReason: null,
        snapshot: validated as Prisma.InputJsonValue,
        status: ActivityRevisionStatus.DRAFT
      },
      include: revisionInclude
    });

    await this.audit(userId, "ACTIVITY_REVISION_UPDATED", revision.id, {
      activityId: activity.id
    });
    return updated;
  }

  async submitPartnerRevision(userId: string, activityId: string, revisionId: string) {
    const activity = await this.getPartnerActivity(userId, activityId);
    const revision = await this.getRevisionForPartner(activity.partnerId, activity.id, revisionId);
    this.assertRevisionEditable(revision.status);
    await this.validateActivityRevisionSnapshot(revision.snapshot);

    const updated = await this.prisma.activityRevision.update({
      where: { id: revision.id },
      data: {
        status: ActivityRevisionStatus.PENDING_REVIEW,
        submittedAt: new Date()
      },
      include: revisionInclude
    });

    await this.audit(userId, "ACTIVITY_REVISION_SUBMITTED", revision.id, {
      activityId: activity.id
    });
    return updated;
  }

  async cancelPartnerRevision(userId: string, activityId: string, revisionId: string) {
    const activity = await this.getPartnerActivity(userId, activityId);
    const revision = await this.getRevisionForPartner(activity.partnerId, activity.id, revisionId);
    this.assertRevisionEditable(revision.status);

    const updated = await this.prisma.activityRevision.update({
      where: { id: revision.id },
      data: { status: ActivityRevisionStatus.CANCELLED },
      include: revisionInclude
    });

    await this.audit(userId, "ACTIVITY_REVISION_CANCELLED", revision.id, {
      activityId: activity.id
    });
    return updated;
  }

  async listAdminRevisions(query: ActivityRevisionQueryDto) {
    const where: Prisma.ActivityRevisionWhereInput = {};
    if (query.status) where.status = query.status as ActivityRevisionStatus;

    return this.prisma.activityRevision.findMany({
      where,
      include: revisionInclude,
      orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }]
    });
  }

  async getAdminRevision(revisionId: string) {
    const revision = await this.prisma.activityRevision.findUnique({
      where: { id: revisionId },
      include: revisionInclude
    });

    if (!revision) {
      throw new NotFoundException({
        code: "ACTIVITY_REVISION_NOT_FOUND",
        message: "Activity revision was not found"
      });
    }

    return {
      ...revision,
      liveSnapshot: await this.buildActivitySnapshot(revision.activityId)
    };
  }

  async approveAdminRevision(revisionId: string, reviewer: AuthenticatedRequestUser) {
    this.assertAdmin(reviewer);
    const revision = await this.prisma.activityRevision.findUnique({
      where: { id: revisionId },
      include: revisionInclude
    });

    if (!revision) {
      throw new NotFoundException({
        code: "ACTIVITY_REVISION_NOT_FOUND",
        message: "Activity revision was not found"
      });
    }

    if (revision.status !== ActivityRevisionStatus.PENDING_REVIEW) {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_NOT_APPROVABLE",
        message: "Only pending revisions can be approved"
      });
    }

    const snapshot = await this.validateActivityRevisionSnapshot(revision.snapshot);
    const now = new Date();
    await this.applyActivitySnapshot(revision.activityId, snapshot, reviewer.id, revision.id, now);

    return this.prisma.activityRevision.update({
      where: { id: revision.id },
      data: {
        appliedAt: now,
        reviewedAt: now,
        reviewedById: reviewer.id,
        status: ActivityRevisionStatus.APPLIED
      },
      include: revisionInclude
    });
  }

  async rejectAdminRevision(
    revisionId: string,
    reviewer: AuthenticatedRequestUser,
    rejectionReason: string
  ) {
    this.assertAdmin(reviewer);
    const revision = await this.prisma.activityRevision.findUnique({
      where: { id: revisionId }
    });

    if (!revision) {
      throw new NotFoundException({
        code: "ACTIVITY_REVISION_NOT_FOUND",
        message: "Activity revision was not found"
      });
    }

    if (revision.status !== ActivityRevisionStatus.PENDING_REVIEW) {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_NOT_REJECTABLE",
        message: "Only pending revisions can be rejected"
      });
    }

    const updated = await this.prisma.activityRevision.update({
      where: { id: revision.id },
      data: {
        rejectionReason: rejectionReason.trim(),
        reviewedAt: new Date(),
        reviewedById: reviewer.id,
        status: ActivityRevisionStatus.REJECTED
      },
      include: revisionInclude
    });

    await this.audit(reviewer.id, "ACTIVITY_REVISION_REJECTED", revision.id, {
      activityId: revision.activityId,
      reason: rejectionReason.trim()
    });
    return updated;
  }

  async buildActivitySnapshot(activityId: string): Promise<ActivitySnapshot> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: activitySnapshotInclude
    });

    if (!activity) {
      throw new NotFoundException({
        code: "ACTIVITY_NOT_FOUND",
        message: "Activity was not found"
      });
    }

    return {
      activity: {
        cancellationPolicy: activity.cancellationPolicy,
        categoryId: activity.categoryId,
        cityId: activity.cityId,
        destinationId: activity.destinationId,
        description: activity.description,
        durationLabel: activity.durationLabel,
        highlights: activity.highlights,
        importantInfo: activity.importantInfo,
        included: activity.included,
        itinerary: activity.itinerary,
        meetingPoint: activity.meetingPoint,
        notIncluded: activity.notIncluded,
        pricingMode: activity.pricingMode,
        shortDescription: activity.shortDescription,
        slug: activity.slug,
        title: activity.title
      },
      availability: activity.availability.map(availabilitySnapshot),
      media: activity.media.map(mediaSnapshot),
      options: activity.options.map((option) => ({
        availability: option.availability.map(availabilitySnapshot),
        availabilityMode: option.availabilityMode,
        availableDays: option.availableDays,
        dailyCapacity: option.dailyCapacity,
        description: option.description,
        durationLabel: option.durationLabel,
        id: option.id,
        isActive: option.isActive,
        isDefault: option.isDefault,
        meetingPoint: option.meetingPoint,
        meetingTimes: option.meetingTimes,
        pricingTiers: option.pricingTiers.map(optionPricingTierSnapshot),
        slug: option.slug,
        sortOrder: option.sortOrder,
        title: option.title
      })),
      pricing: activity.pricing.map(pricingSnapshot),
      pricingTiers: activity.pricingTiers.map(pricingTierSnapshot)
    };
  }

  async validateActivityRevisionSnapshot(snapshot: unknown): Promise<ActivitySnapshot> {
    if (!snapshot || typeof snapshot !== "object") {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_SNAPSHOT_INVALID",
        message: "Revision snapshot is invalid"
      });
    }

    const value = snapshot as ActivitySnapshot;
    const activity = value.activity;
    const missing: string[] = [];
    if (!activity?.title?.trim()) missing.push("title");
    if (!activity?.slug?.trim()) missing.push("slug");
    if (!activity?.cityId) missing.push("cityId");
    if (!activity?.categoryId) missing.push("categoryId");
    if (!activity?.shortDescription?.trim()) missing.push("shortDescription");
    if (!activity?.description?.trim()) missing.push("description");

    const activeOptionHasPricing = (value.options ?? []).some((option) => {
      const record = option as Record<string, unknown>;
      if (record.isActive === false) return false;
      const tiers = Array.isArray(record.pricingTiers) ? record.pricingTiers : [];
      return tiers.some((tier) => (tier as Record<string, unknown>).isActive !== false);
    });
    const legacyHasPricing = Array.isArray(value.pricing) && value.pricing.some((price) => (price as Record<string, unknown>).isActive !== false);
    if (!activeOptionHasPricing && !legacyHasPricing) missing.push("pricing");

    if (missing.length) {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_SNAPSHOT_INCOMPLETE",
        message: "Revision snapshot is missing required fields",
        details: { missing }
      });
    }

    await this.assertActivityReferences(activity.cityId, activity.categoryId, activity.destinationId);
    return value;
  }

  private async applyActivitySnapshot(
    activityId: string,
    snapshot: ActivitySnapshot,
    actorUserId: string,
    revisionId: string,
    now: Date
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.activity.update({
        where: { id: activityId },
        data: {
          cancellationPolicy: snapshot.activity.cancellationPolicy,
          categoryId: snapshot.activity.categoryId,
          cityId: snapshot.activity.cityId,
          destinationId: snapshot.activity.destinationId,
          description: snapshot.activity.description.trim(),
          durationLabel: snapshot.activity.durationLabel,
          highlights: snapshot.activity.highlights ?? [],
          importantInfo: snapshot.activity.importantInfo,
          included: snapshot.activity.included ?? [],
          itinerary: snapshot.activity.itinerary ?? undefined,
          meetingPoint: snapshot.activity.meetingPoint,
          notIncluded: snapshot.activity.notIncluded ?? [],
          pricingMode: snapshot.activity.pricingMode as never,
          shortDescription: snapshot.activity.shortDescription.trim(),
          slug: snapshot.activity.slug.trim(),
          status: ActivityStatus.PUBLISHED,
          title: snapshot.activity.title.trim()
        }
      });

      await tx.activityPricing.deleteMany({ where: { activityId } });
      if (snapshot.pricing.length) {
        await tx.activityPricing.createMany({
          data: snapshot.pricing.map((price) => ({
            activityId,
            currency: String(price.currency ?? "USD"),
            isActive: Boolean(price.isActive ?? true),
            priceCents: Number(price.priceCents ?? 0),
            priceType: String(price.priceType ?? "per_person")
          }))
        });
      }

      await tx.activityPricingTier.deleteMany({ where: { activityId } });
      if (snapshot.pricingTiers.length) {
        await tx.activityPricingTier.createMany({
          data: snapshot.pricingTiers.map((tier) => ({
            activityId,
            adultPriceCents: Number(tier.adultPriceCents ?? 0),
            childDiscountPercent: new Prisma.Decimal(String(tier.childDiscountPercent ?? 27)),
            childPriceCents: tier.childPriceCents == null ? null : Number(tier.childPriceCents),
            currency: String(tier.currency ?? "USD"),
            isActive: Boolean(tier.isActive ?? true),
            maxTravelers: Number(tier.maxTravelers ?? 1),
            minTravelers: Number(tier.minTravelers ?? 1),
            priceType: String(tier.priceType ?? "per_person")
          }))
        });
      }

      await tx.activityMedia.deleteMany({ where: { activityId } });
      if (snapshot.media.length) {
        await tx.activityMedia.createMany({
          data: snapshot.media.map((media) => ({
            activityId,
            altText: nullableString(media.altText),
            fileId: nullableString(media.fileId),
            isCover: Boolean(media.isCover ?? false),
            sortOrder: Number(media.sortOrder ?? 0),
            url: nullableString(media.url)
          }))
        });
      }

      const existingOptions = await tx.activityOption.findMany({
        where: { activityId },
        include: { bookings: { select: { id: true }, take: 1 } }
      });
      const touchedOptionIds = new Set<string>();

      for (const option of snapshot.options) {
        const record = option as Record<string, unknown>;
        const existing = typeof record.id === "string"
          ? existingOptions.find((item) => item.id === record.id)
          : undefined;
        const optionData = {
          availabilityMode: String(record.availabilityMode ?? AvailabilityMode.SCHEDULED_SESSIONS) as AvailabilityMode,
          availableDays: (record.availableDays ?? undefined) as Prisma.InputJsonValue | undefined,
          dailyCapacity: record.dailyCapacity == null ? null : Number(record.dailyCapacity),
          description: nullableString(record.description),
          durationLabel: nullableString(record.durationLabel),
          isActive: Boolean(record.isActive ?? true),
          isDefault: Boolean(record.isDefault ?? false),
          meetingPoint: nullableString(record.meetingPoint),
          meetingTimes: (record.meetingTimes ?? undefined) as Prisma.InputJsonValue | undefined,
          slug: String(record.slug ?? record.title ?? "option").trim(),
          sortOrder: Number(record.sortOrder ?? 0),
          title: String(record.title ?? "Option").trim()
        };
        const savedOption = existing
          ? await tx.activityOption.update({ where: { id: existing.id }, data: optionData })
          : await tx.activityOption.create({ data: { ...optionData, activityId } });
        touchedOptionIds.add(savedOption.id);

        await tx.activityOptionPricingTier.deleteMany({ where: { optionId: savedOption.id } });
        const pricingTiers = Array.isArray(record.pricingTiers) ? record.pricingTiers : [];
        if (pricingTiers.length) {
          await tx.activityOptionPricingTier.createMany({
            data: pricingTiers.map((rawTier) => {
              const tier = rawTier as Record<string, unknown>;
              return {
                optionId: savedOption.id,
                adultPriceCents: Number(tier.adultPriceCents ?? 0),
                childDiscountPercent: new Prisma.Decimal(String(tier.childDiscountPercent ?? 27)),
                childPriceCents: tier.childPriceCents == null ? null : Number(tier.childPriceCents),
                currency: String(tier.currency ?? "USD"),
                isActive: Boolean(tier.isActive ?? true),
                maxTravelers: Number(tier.maxTravelers ?? 1),
                minTravelers: Number(tier.minTravelers ?? 1),
                priceType: String(tier.priceType ?? "per_person")
              };
            })
          });
        }

        await this.applyAvailabilitySnapshot(tx, activityId, savedOption.id, record.availability);
      }

      for (const option of existingOptions) {
        if (touchedOptionIds.has(option.id)) continue;
        await tx.activityOption.update({
          where: { id: option.id },
          data: { isActive: false }
        });
      }

      await tx.auditLog.create({
        data: {
          action: "ACTIVITY_REVISION_APPLIED",
          actorUserId,
          entityId: revisionId,
          entityType: "ActivityRevision",
          metadata: {
            activityId,
            appliedAt: now.toISOString()
          }
        }
      });
    });
  }

  private async applyAvailabilitySnapshot(
    tx: Prisma.TransactionClient,
    activityId: string,
    optionId: string,
    rawAvailability: unknown
  ) {
    await tx.activityAvailability.updateMany({
      where: { activityId, optionId },
      data: { isActive: false }
    });
    const availability = Array.isArray(rawAvailability) ? rawAvailability : [];

    for (const raw of availability) {
      const item = raw as Record<string, unknown>;
      const id = typeof item.id === "string" ? item.id : undefined;
      const data = {
        capacity: item.capacity == null ? null : Number(item.capacity),
        endDateTime: item.endDateTime ? new Date(String(item.endDateTime)) : null,
        isActive: Boolean(item.isActive ?? true),
        startDateTime: new Date(String(item.startDateTime))
      };

      if (id) {
        const existing = await tx.activityAvailability.findFirst({
          where: { id, activityId, optionId }
        });
        if (existing) {
          await tx.activityAvailability.update({ where: { id }, data });
          continue;
        }
      }

      await tx.activityAvailability.create({
        data: {
          ...data,
          activityId,
          bookedCount: 0,
          optionId
        }
      });
    }
  }

  private async getPartnerPublishedActivity(userId: string, activityId: string) {
    const activity = await this.getPartnerActivity(userId, activityId);
    if (activity.status !== ActivityStatus.PUBLISHED) {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_REQUIRES_PUBLISHED",
        message: "Only published activities use revision workflow"
      });
    }
    return activity;
  }

  private async getPartnerActivity(userId: string, activityId: string) {
    const partner = await this.prisma.partner.findUnique({ where: { userId } });
    if (!partner) {
      throw new ForbiddenException({
        code: "PARTNER_PROFILE_REQUIRED",
        message: "Partner profile is required"
      });
    }

    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, partnerId: partner.id }
    });
    if (!activity) {
      throw new NotFoundException({
        code: "PARTNER_ACTIVITY_NOT_FOUND",
        message: "Activity was not found"
      });
    }
    return activity;
  }

  private async getRevisionForPartner(partnerId: string, activityId: string, revisionId: string) {
    const revision = await this.prisma.activityRevision.findFirst({
      where: {
        activityId,
        id: revisionId,
        partnerId
      },
      include: revisionInclude
    });

    if (!revision) {
      throw new NotFoundException({
        code: "ACTIVITY_REVISION_NOT_FOUND",
        message: "Activity revision was not found"
      });
    }
    return revision;
  }

  private assertRevisionEditable(status: ActivityRevisionStatus) {
    if (!editableRevisionStatuses.has(status)) {
      throw new ForbiddenException({
        code: "ACTIVITY_REVISION_NOT_EDITABLE",
        message: "Only draft or rejected revisions can be edited"
      });
    }
  }

  private assertAdmin(user: AuthenticatedRequestUser) {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException({
        code: "ADMIN_REQUIRED",
        message: "Admin access is required"
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
      this.prisma.category.findFirst({ where: { id: categoryId, isActive: true }, select: { id: true } }),
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
    if (!city || !category || (destinationId && !destination)) {
      throw new BadRequestException({
        code: "ACTIVITY_REVISION_REFERENCES_INVALID",
        message: "Revision city, category, or destination is invalid"
      });
    }
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
        entityType: "ActivityRevision",
        metadata
      }
    });
  }
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pricingSnapshot(price: {
  currency: string;
  id: string;
  isActive: boolean;
  priceCents: number;
  priceType: string;
}) {
  return {
    currency: price.currency,
    id: price.id,
    isActive: price.isActive,
    priceCents: price.priceCents,
    priceType: price.priceType
  };
}

function pricingTierSnapshot(tier: {
  adultPriceCents: number;
  childDiscountPercent: Prisma.Decimal | null;
  childPriceCents: number | null;
  currency: string;
  id: string;
  isActive: boolean;
  maxTravelers: number;
  minTravelers: number;
  priceType: string;
}) {
  return {
    adultPriceCents: tier.adultPriceCents,
    childDiscountPercent: tier.childDiscountPercent == null ? null : Number(tier.childDiscountPercent),
    childPriceCents: tier.childPriceCents,
    currency: tier.currency,
    id: tier.id,
    isActive: tier.isActive,
    maxTravelers: tier.maxTravelers,
    minTravelers: tier.minTravelers,
    priceType: tier.priceType
  };
}

function optionPricingTierSnapshot(tier: {
  adultPriceCents: number;
  childDiscountPercent: Prisma.Decimal | null;
  childPriceCents: number | null;
  currency: string;
  id: string;
  isActive: boolean;
  maxTravelers: number;
  minTravelers: number;
  optionId: string;
  priceType: string;
}) {
  return {
    ...pricingTierSnapshot(tier),
    optionId: tier.optionId
  };
}

function mediaSnapshot(media: {
  altText: string | null;
  fileId: string | null;
  id: string;
  isCover: boolean;
  sortOrder: number;
  url: string | null;
}) {
  return {
    altText: media.altText,
    fileId: media.fileId,
    id: media.id,
    isCover: media.isCover,
    sortOrder: media.sortOrder,
    url: media.url
  };
}

function availabilitySnapshot(availability: {
  bookedCount: number;
  capacity: number | null;
  endDateTime: Date | null;
  id: string;
  isActive: boolean;
  optionId: string | null;
  startDateTime: Date;
}) {
  return {
    bookedCount: availability.bookedCount,
    capacity: availability.capacity,
    endDateTime: availability.endDateTime?.toISOString() ?? null,
    id: availability.id,
    isActive: availability.isActive,
    optionId: availability.optionId,
    startDateTime: availability.startDateTime.toISOString()
  };
}
