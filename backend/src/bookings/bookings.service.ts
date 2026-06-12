import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ActivityStatus,
  AvailabilityMode,
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  ParticipantType,
  PricingMode,
  Prisma,
  UserRole,
  VoucherStatus
} from "@prisma/client";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { PrismaService } from "../prisma.service";
import { BASE_CURRENCY } from "../common/money.constants";
import type { AdminBookingQueryDto, CreateBookingDto, PartnerBookingQueryDto } from "./dto/booking.dto";

const platformFeeRate = 0.15;

const bookingInclude = {
  activity: {
    include: {
      category: true,
      city: true,
      media: {
        include: { file: true },
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 1
      },
      partner: true,
      pricing: {
        orderBy: { createdAt: "desc" },
        where: { isActive: true },
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
    }
  },
  option: true,
  availability: true,
  participants: true,
  payment: true,
  user: {
    select: {
      email: true,
      fullName: true,
      id: true
    }
  },
  voucher: true
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedRequestUser, dto: CreateBookingDto) {
    if (user.role === UserRole.PARTNER) {
      throw new ForbiddenException({
        code: "PARTNER_BOOKING_CREATE_FORBIDDEN",
        message: "Partners cannot create traveler bookings from this endpoint"
      });
    }

    const participants = normalizeParticipants(dto.participants);
    const totalQuantity = participants.reduce((sum, item) => sum + item.quantity, 0);

    const activity = await this.prisma.activity.findFirst({
      where: {
        id: dto.activityId,
        status: ActivityStatus.PUBLISHED
      },
      include: {
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
      }
    });

    if (!activity) {
      throw new NotFoundException({
        code: "BOOKING_ACTIVITY_NOT_FOUND",
        message: "Published activity was not found"
      });
    }

    const activeOptions = activity.options.filter((option) => option.isActive);
    const selectedOption = dto.optionId
      ? activeOptions.find((option) => option.id === dto.optionId)
      : activeOptions.find((option) => option.isDefault) ?? activeOptions[0] ?? null;

    if (activeOptions.length > 0 && !selectedOption) {
      throw new BadRequestException({
        code: "BOOKING_OPTION_REQUIRED",
        message: "Select an active package option before booking"
      });
    }

    const optionPricingTiers = selectedOption?.pricingTiers ?? [];
    const simplePricing = activity.pricing[0];
    if (!simplePricing && optionPricingTiers.length === 0) {
      throw new BadRequestException({
        code: "BOOKING_PRICE_UNAVAILABLE",
        message: "Activity option does not have active pricing"
      });
    }

    const nonUsdTier = activity.pricingTiers.find(
      (item) => item.currency.toUpperCase() !== BASE_CURRENCY
    );
    const nonUsdOptionTier = optionPricingTiers.find(
      (item) => item.currency.toUpperCase() !== BASE_CURRENCY
    );
    if (
      (simplePricing && simplePricing.currency.toUpperCase() !== BASE_CURRENCY) ||
      nonUsdTier ||
      nonUsdOptionTier
    ) {
      throw new BadRequestException({
        code: "BOOKING_BASE_CURRENCY_INVALID",
        message: "Activity pricing must use USD before it can be booked"
      });
    }

    const adultQuantity = participants
      .filter((item) => item.participantType === ParticipantType.ADULT)
      .reduce((sum, item) => sum + item.quantity, 0);
    const childQuantity = participants
      .filter((item) => item.participantType === ParticipantType.CHILD)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (adultQuantity < 1 || adultQuantity > 14 || childQuantity > 14 || totalQuantity > 14) {
      throw new BadRequestException({
        code: "BOOKING_PARTICIPANT_LIMIT_INVALID",
        message: "Bookings require 1-14 adults, 0-14 children, and no more than 14 travelers total"
      });
    }

    let availability: Awaited<ReturnType<typeof this.prisma.activityAvailability.findFirst>> = null;
    let travelDate: Date | null = null;
    let meetingTime: string | null = null;
    let alwaysAvailableInventory:
      | {
          capacity: number;
          optionId: string;
          travelDate: Date;
        }
      | null = null;

    if (selectedOption?.availabilityMode === AvailabilityMode.ALWAYS_AVAILABLE) {
      if (!dto.selectedDate) {
        throw new BadRequestException({
          code: "BOOKING_TRAVEL_DATE_REQUIRED",
          message: "Select a travel date for this package option"
        });
      }
      travelDate = normalizeTravelDate(dto.selectedDate);
      assertAllowedTravelDay(travelDate, selectedOption.availableDays);
      meetingTime = normalizeSelectedMeetingTime(dto.meetingTime, selectedOption.meetingTimes);

      if (selectedOption.dailyCapacity && totalQuantity > selectedOption.dailyCapacity) {
        throw new BadRequestException({
          code: "BOOKING_CAPACITY_EXCEEDED",
          message: "Selected package does not have enough daily capacity"
        });
      }

      if (selectedOption.dailyCapacity) {
        alwaysAvailableInventory = {
          capacity: selectedOption.dailyCapacity,
          optionId: selectedOption.id,
          travelDate
        };
      }
    } else if (selectedOption) {
      if (!dto.availabilityId) {
        throw new BadRequestException({
          code: "BOOKING_AVAILABILITY_REQUIRED",
          message: "Select a scheduled session for this package option"
        });
      }
      availability = await this.prisma.activityAvailability.findFirst({
        where: {
          activityId: activity.id,
          id: dto.availabilityId,
          isActive: true,
          optionId: selectedOption.id
        }
      });
    } else if (dto.availabilityId) {
      availability = await this.prisma.activityAvailability.findFirst({
        where: {
          activityId: activity.id,
          id: dto.availabilityId,
          isActive: true
        }
      });
    }

    if (dto.availabilityId && !availability && selectedOption?.availabilityMode !== AvailabilityMode.ALWAYS_AVAILABLE) {
      throw new BadRequestException({
        code: "BOOKING_AVAILABILITY_UNAVAILABLE",
        message: "Selected activity session is not available"
      });
    }

    if (availability?.capacity && availability.bookedCount + totalQuantity > availability.capacity) {
      throw new BadRequestException({
        code: "BOOKING_CAPACITY_EXCEEDED",
        message: "Selected session does not have enough remaining capacity"
      });
    }

    const pricingTiers = optionPricingTiers.length > 0 ? optionPricingTiers : activity.pricingTiers;
    const tier = pricingTiers.find(
      (item) =>
        item.isActive &&
        item.minTravelers <= totalQuantity &&
        item.maxTravelers >= totalQuantity
    );

    if (pricingTiers.length > 0 && !tier) {
      throw new BadRequestException({
        code: "BOOKING_PRICING_TIER_UNAVAILABLE",
        message: `No active pricing tier covers ${totalQuantity} travelers`
      });
    }

    const adultUnitPrice = tier?.adultPriceCents ?? simplePricing!.priceCents;
    const childUnitPrice =
      tier?.childPriceCents == null
        ? tier
          ? null
          : simplePricing!.priceCents
        : tier.childPriceCents;

    if (childQuantity > 0 && childUnitPrice == null) {
      throw new BadRequestException({
        code: "BOOKING_CHILD_NOT_SUPPORTED",
        message: "Selected package option is not available for children"
      });
    }
    const pricedParticipants = participants.map((participant) => ({
      ...participant,
      priceCents:
        participant.participantType === ParticipantType.CHILD
          ? childUnitPrice ?? 0
          : adultUnitPrice
    }));
    const totalAmountCents = pricedParticipants.reduce(
      (sum, item) => sum + item.quantity * item.priceCents,
      0
    );
    const platformFeeCents = Math.round(totalAmountCents * platformFeeRate);
    const partnerPayoutCents = totalAmountCents - platformFeeCents;

    const booking = await this.prisma.$transaction(async (tx) => {
      if (availability) {
        const capacityUpdate = await tx.activityAvailability.updateMany({
          where: {
            id: availability.id,
            OR: [
              { capacity: null },
              {
                bookedCount: {
                  lte: Math.max(0, availability.capacity ?? 0) - totalQuantity
                }
              }
            ]
          },
          data: {
            bookedCount: {
              increment: totalQuantity
            }
          }
        });

        if (capacityUpdate.count !== 1) {
          throw new BadRequestException({
            code: "BOOKING_CAPACITY_EXCEEDED",
            message: "Selected session does not have enough remaining capacity"
          });
        }
      }

      if (alwaysAvailableInventory) {
        await tx.activityOptionDateInventory.upsert({
          where: {
            optionId_travelDate: {
              optionId: alwaysAvailableInventory.optionId,
              travelDate: alwaysAvailableInventory.travelDate
            }
          },
          create: {
            bookedCount: 0,
            capacity: alwaysAvailableInventory.capacity,
            optionId: alwaysAvailableInventory.optionId,
            travelDate: alwaysAvailableInventory.travelDate
          },
          update: {
            capacity: alwaysAvailableInventory.capacity
          }
        });

        const capacityUpdate = await tx.activityOptionDateInventory.updateMany({
          where: {
            optionId: alwaysAvailableInventory.optionId,
            travelDate: alwaysAvailableInventory.travelDate,
            bookedCount: {
              lte: alwaysAvailableInventory.capacity - totalQuantity
            }
          },
          data: {
            bookedCount: {
              increment: totalQuantity
            }
          }
        });

        if (capacityUpdate.count !== 1) {
          throw new BadRequestException({
            code: "BOOKING_CAPACITY_EXCEEDED",
            message: "Selected date does not have enough remaining capacity"
          });
        }
      }

      const created = await tx.booking.create({
        data: {
          activityId: activity.id,
          availabilityId: availability?.id,
          optionId: selectedOption?.id,
          travelDate,
          meetingTime,
          currency: BASE_CURRENCY,
          partnerPayoutCents,
          platformFeeCents,
          status: BookingStatus.PENDING_PAYMENT,
          totalAmountCents,
          userId: user.id,
          participants: {
            create: pricedParticipants.map((participant) => ({
              label: participant.label,
              participantType: participant.participantType,
              priceCents: participant.priceCents,
              quantity: participant.quantity
            }))
          },
          payment: {
            create: {
              amountCents: totalAmountCents,
              currency: BASE_CURRENCY,
              provider: PaymentProvider.DUMMY,
              status: PaymentStatus.PENDING
            }
          }
        },
        include: bookingInclude
      });

      await tx.auditLog.create({
        data: {
          action: "BOOKING_CREATED",
          actorUserId: user.id,
          entityId: created.id,
          entityType: "Booking",
          metadata: {
            activityId: activity.id,
            availabilityMode: selectedOption?.availabilityMode ?? null,
            pricingMode: activity.pricingMode,
            pricingTierId: tier?.id,
            optionId: selectedOption?.id,
            meetingTime,
            travelDate: travelDate?.toISOString(),
            totalAmountCents
          }
        }
      });

      return created;
    });

    return booking;
  }

  async myBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  async getForUser(user: AuthenticatedRequestUser, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude
    });

    if (!booking) {
      throw new NotFoundException({
        code: "BOOKING_NOT_FOUND",
        message: "Booking was not found"
      });
    }

    await this.assertBookingAccess(user, booking);
    return booking;
  }

  async confirmDummyPayment(user: AuthenticatedRequestUser, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: bookingInclude
        }
      }
    });

    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Payment was not found"
      });
    }

    await this.assertBookingOwnerOrAdmin(user, payment.booking);

    if (payment.status === PaymentStatus.PAID) {
      return this.getForUser(user, payment.bookingId);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException({
        code: "PAYMENT_NOT_CONFIRMABLE",
        message: "Only pending dummy payments can be confirmed"
      });
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paidAt: new Date(),
          providerReference: `dummy_${payment.id}`,
          status: PaymentStatus.PAID
        }
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED }
      });

      const existingVoucher = await tx.voucher.findUnique({
        where: { bookingId: payment.bookingId }
      });

      if (!existingVoucher) {
        const code = await this.generateVoucherCode(tx);
        await tx.voucher.create({
          data: {
            bookingId: payment.bookingId,
            code,
            qrPayload: JSON.stringify({
              bookingId: payment.bookingId,
              code,
              provider: "ALPII"
            }),
            status: VoucherStatus.ACTIVE
          }
        });
      }

      await tx.auditLog.create({
        data: {
          action: "DUMMY_PAYMENT_CONFIRMED",
          actorUserId: user.id,
          entityId: payment.id,
          entityType: "Payment",
          metadata: { bookingId: payment.bookingId }
        }
      });

      return tx.booking.findUniqueOrThrow({
        where: { id: payment.bookingId },
        include: bookingInclude
      });
    });

    return booking;
  }

  async failDummyPayment(user: AuthenticatedRequestUser, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: bookingInclude
        }
      }
    });

    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Payment was not found"
      });
    }

    await this.assertBookingOwnerOrAdmin(user, payment.booking);

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED }
      });
      return tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CANCELLED },
        include: bookingInclude
      });
    });
  }

  async getVoucher(user: AuthenticatedRequestUser, code: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
      include: {
        booking: {
          include: bookingInclude
        }
      }
    });

    if (!voucher) {
      throw new NotFoundException({
        code: "VOUCHER_NOT_FOUND",
        message: "Voucher was not found"
      });
    }

    await this.assertBookingAccess(user, voucher.booking);
    return voucher;
  }

  async validateVoucher(user: AuthenticatedRequestUser, code: string) {
    if (user.role === UserRole.USER) {
      throw new ForbiddenException({
        code: "VOUCHER_VALIDATE_FORBIDDEN",
        message: "Only partners and admins can validate vouchers"
      });
    }

    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
      include: {
        booking: {
          include: bookingInclude
        }
      }
    });

    if (!voucher) {
      throw new NotFoundException({
        code: "VOUCHER_NOT_FOUND",
        message: "Voucher was not found"
      });
    }

    await this.assertPartnerOwnsBookingOrAdmin(user, voucher.booking);

    if (voucher.status !== VoucherStatus.ACTIVE || voucher.booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException({
        code: "VOUCHER_NOT_VALIDATABLE",
        message: "Voucher is not active or booking is not confirmed"
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.voucher.update({
        where: { id: voucher.id },
        data: {
          status: VoucherStatus.USED,
          usedAt: new Date()
        }
      });

      await tx.booking.update({
        where: { id: voucher.bookingId },
        data: { status: BookingStatus.COMPLETED }
      });

      await tx.auditLog.create({
        data: {
          action: "VOUCHER_VALIDATED",
          actorUserId: user.id,
          entityId: voucher.id,
          entityType: "Voucher",
          metadata: { bookingId: voucher.bookingId }
        }
      });

      return tx.voucher.findUniqueOrThrow({
        where: { id: voucher.id },
        include: {
          booking: {
            include: bookingInclude
          }
        }
      });
    });
  }

  async partnerBookings(user: AuthenticatedRequestUser, query: PartnerBookingQueryDto) {
    const partner = await this.getPartnerForUser(user.id);
    const where: Prisma.BookingWhereInput = {
      activity: {
        partnerId: partner.id
      }
    };

    if (query.status) {
      where.status = query.status as BookingStatus;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { activity: { title: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { voucher: { code: { contains: search, mode: "insensitive" } } }
      ];
    }

    return this.prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  async adminBookings(query: AdminBookingQueryDto) {
    const where: Prisma.BookingWhereInput = {};
    if (query.status) where.status = query.status as BookingStatus;

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { activity: { title: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { voucher: { code: { contains: search, mode: "insensitive" } } }
      ];
    }

    return this.prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  async adminPayments(query: AdminBookingQueryDto) {
    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status as PaymentStatus;
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { booking: { activity: { title: { contains: search, mode: "insensitive" } } } },
        { booking: { user: { email: { contains: search, mode: "insensitive" } } } }
      ];
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: bookingInclude
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  private async assertBookingAccess(user: AuthenticatedRequestUser, booking: Prisma.BookingGetPayload<{ include: typeof bookingInclude }>) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) return;
    if (booking.userId === user.id) return;
    await this.assertPartnerOwnsBookingOrAdmin(user, booking);
  }

  private async assertBookingOwnerOrAdmin(user: AuthenticatedRequestUser, booking: Prisma.BookingGetPayload<{ include: typeof bookingInclude }>) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) return;
    if (booking.userId === user.id) return;
    throw new ForbiddenException({
      code: "BOOKING_ACCESS_FORBIDDEN",
      message: "You cannot access this booking"
    });
  }

  private async assertPartnerOwnsBookingOrAdmin(user: AuthenticatedRequestUser, booking: Prisma.BookingGetPayload<{ include: typeof bookingInclude }>) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) return;
    if (user.role !== UserRole.PARTNER) {
      throw new ForbiddenException({
        code: "BOOKING_ACCESS_FORBIDDEN",
        message: "You cannot access this booking"
      });
    }

    const partner = await this.getPartnerForUser(user.id);
    if (booking.activity.partnerId !== partner.id) {
      throw new ForbiddenException({
        code: "PARTNER_BOOKING_ACCESS_FORBIDDEN",
        message: "This booking does not belong to your partner account"
      });
    }
  }

  private async getPartnerForUser(userId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { userId }
    });

    if (!partner) {
      throw new ForbiddenException({
        code: "PARTNER_PROFILE_REQUIRED",
        message: "Partner profile is required"
      });
    }

    return partner;
  }

  private async generateVoucherCode(tx: Prisma.TransactionClient) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = `ALP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
        .toString(36)
        .slice(-5)
        .toUpperCase()}`;
      const existing = await tx.voucher.findUnique({ where: { code } });
      if (!existing) return code;
    }

    throw new BadRequestException({
      code: "VOUCHER_CODE_GENERATION_FAILED",
      message: "Unable to generate voucher code"
    });
  }
}

function normalizeParticipants(participants: CreateBookingDto["participants"]) {
  const normalized = participants
    .map((participant) => ({
      label: participant.label.trim() || "Adult",
      participantType:
        participant.participantType ??
        (participant.label.trim().toLowerCase().startsWith("child")
          ? ParticipantType.CHILD
          : ParticipantType.ADULT),
      quantity: participant.quantity
    }))
    .filter((participant) => participant.quantity > 0);

  if (!normalized.length) {
    throw new BadRequestException({
      code: "BOOKING_PARTICIPANTS_REQUIRED",
      message: "At least one participant is required"
    });
  }

  return normalized;
}

const weekdayByIndex = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];

function normalizeTravelDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException({
      code: "BOOKING_TRAVEL_DATE_INVALID",
      message: "Travel date is invalid"
    });
  }

  // MVP convention: always-available inventory is keyed by UTC midnight for the ISO YYYY-MM-DD selected by the traveler.
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function assertAllowedTravelDay(date: Date, availableDays: Prisma.JsonValue | null) {
  if (!Array.isArray(availableDays) || availableDays.length === 0) return;
  const allowed = new Set(
    availableDays
      .filter((day): day is string => typeof day === "string")
      .map((day) => day.toUpperCase())
  );
  const weekday = weekdayByIndex[date.getUTCDay()];

  if (!allowed.has(weekday)) {
    throw new BadRequestException({
      code: "BOOKING_TRAVEL_DAY_UNAVAILABLE",
      message: "Selected date is not available for this package option"
    });
  }
}

function normalizeSelectedMeetingTime(value: string | undefined, availableMeetingTimes: Prisma.JsonValue | null) {
  const configuredTimes = Array.isArray(availableMeetingTimes)
    ? availableMeetingTimes.filter((item): item is string => typeof item === "string")
    : [];

  if (!configuredTimes.length) {
    return value?.trim() || null;
  }

  const normalized = value?.trim();
  if (!normalized) {
    throw new BadRequestException({
      code: "BOOKING_MEETING_TIME_REQUIRED",
      message: "Select a meeting time for this package option"
    });
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized) || !configuredTimes.includes(normalized)) {
    throw new BadRequestException({
      code: "BOOKING_MEETING_TIME_UNAVAILABLE",
      message: "Selected meeting time is not available for this package option"
    });
  }

  return normalized;
}
