import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ActivityStatus,
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
      }
    }
  },
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
        }
      }
    });

    if (!activity) {
      throw new NotFoundException({
        code: "BOOKING_ACTIVITY_NOT_FOUND",
        message: "Published activity was not found"
      });
    }

    const simplePricing = activity.pricing[0];
    if (!simplePricing) {
      throw new BadRequestException({
        code: "BOOKING_PRICE_UNAVAILABLE",
        message: "Activity does not have active pricing"
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

    const availability = dto.availabilityId
      ? await this.prisma.activityAvailability.findFirst({
          where: {
            activityId: activity.id,
            id: dto.availabilityId,
            isActive: true
          }
        })
      : null;

    if (dto.availabilityId && !availability) {
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

    const tier =
      activity.pricingMode === PricingMode.GROUP_TIER
        ? activity.pricingTiers.find(
            (item) =>
              item.isActive &&
              item.minTravelers <= totalQuantity &&
              item.maxTravelers >= totalQuantity
          )
        : undefined;

    if (activity.pricingMode === PricingMode.GROUP_TIER && !tier) {
      throw new BadRequestException({
        code: "BOOKING_PRICING_TIER_UNAVAILABLE",
        message: `No active pricing tier covers ${totalQuantity} travelers`
      });
    }

    const adultUnitPrice = tier?.adultPriceCents ?? simplePricing.priceCents;
    const childDiscountPercent = Number(tier?.childDiscountPercent ?? 27);
    const childUnitPrice =
      tier?.childPriceCents ??
      (tier
        ? Math.round(tier.adultPriceCents * (1 - childDiscountPercent / 100))
        : simplePricing.priceCents);
    const pricedParticipants = participants.map((participant) => ({
      ...participant,
      priceCents:
        participant.participantType === ParticipantType.CHILD
          ? childUnitPrice
          : adultUnitPrice
    }));
    const totalAmountCents = pricedParticipants.reduce(
      (sum, item) => sum + item.quantity * item.priceCents,
      0
    );
    const platformFeeCents = Math.round(totalAmountCents * platformFeeRate);
    const partnerPayoutCents = totalAmountCents - platformFeeCents;

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          activityId: activity.id,
          availabilityId: availability?.id,
          currency: tier?.currency ?? simplePricing.currency,
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
              currency: tier?.currency ?? simplePricing.currency,
              provider: PaymentProvider.DUMMY,
              status: PaymentStatus.PENDING
            }
          }
        },
        include: bookingInclude
      });

      if (availability) {
        await tx.activityAvailability.update({
          where: { id: availability.id },
          data: {
            bookedCount: {
              increment: totalQuantity
            }
          }
        });
      }

      await tx.auditLog.create({
        data: {
          action: "BOOKING_CREATED",
          actorUserId: user.id,
          entityId: created.id,
          entityType: "Booking",
          metadata: {
            activityId: activity.id,
            pricingMode: activity.pricingMode,
            pricingTierId: tier?.id,
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
