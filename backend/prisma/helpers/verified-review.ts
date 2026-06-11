import {
  BookingStatus,
  ParticipantType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ReviewStatus,
  VoucherStatus
} from "@prisma/client";

type VerifiedReviewInput = {
  activityId: string;
  approvedById?: string;
  bookingDate?: Date;
  comment: string;
  currency?: string;
  featured?: boolean;
  optionId?: string;
  rating: number;
  title?: string;
  totalAmountCents: number;
  userId: string;
  voucherCode: string;
};

export async function createVerifiedDemoReview(
  prisma: PrismaClient,
  input: VerifiedReviewInput
) {
  const bookingDate = input.bookingDate ?? daysAgo(14);
  const currency = input.currency ?? "USD";
  const platformFeeCents = Math.round(input.totalAmountCents * 0.15);

  return prisma.booking.create({
    data: {
      activityId: input.activityId,
      bookedAt: bookingDate,
      currency,
      optionId: input.optionId,
      partnerPayoutCents: input.totalAmountCents - platformFeeCents,
      platformFeeCents,
      status: BookingStatus.COMPLETED,
      totalAmountCents: input.totalAmountCents,
      travelDate: bookingDate,
      userId: input.userId,
      participants: {
        create: {
          label: "Adult",
          participantType: ParticipantType.ADULT,
          priceCents: input.totalAmountCents,
          quantity: 1
        }
      },
      payment: {
        create: {
          amountCents: input.totalAmountCents,
          currency,
          paidAt: bookingDate,
          provider: PaymentProvider.DUMMY,
          providerReference: `seed-${input.voucherCode.toLowerCase()}`,
          status: PaymentStatus.PAID
        }
      },
      review: {
        create: {
          activityId: input.activityId,
          approvedAt: bookingDate,
          approvedById: input.approvedById,
          comment: input.comment,
          isFeatured: input.featured ?? false,
          optionId: input.optionId,
          rating: input.rating,
          status: ReviewStatus.APPROVED,
          submittedAt: bookingDate,
          title: input.title,
          userId: input.userId
        }
      },
      voucher: {
        create: {
          code: input.voucherCode,
          qrPayload: JSON.stringify({
            activityId: input.activityId,
            code: input.voucherCode,
            type: "ALPII_DEMO_VOUCHER"
          }),
          status: VoucherStatus.USED,
          usedAt: bookingDate
        }
      }
    },
    include: {
      review: true
    }
  });
}

export async function recalculateSeededActivityRating(
  prisma: PrismaClient,
  activityId: string
) {
  const aggregate = await prisma.review.aggregate({
    where: {
      activityId,
      status: ReviewStatus.APPROVED
    },
    _avg: { rating: true },
    _count: { _all: true }
  });

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      ratingAverage: new Prisma.Decimal(aggregate._avg.rating ?? 0),
      reviewCount: aggregate._count._all
    }
  });
}

export function verifiedReviewVoucherCode(activitySlug: string, index: number) {
  return `DEMO-${activitySlug}-${index + 1}`
    .replace(/[^A-Z0-9-]/gi, "-")
    .toUpperCase()
    .slice(0, 96);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(9, 0, 0, 0);
  return date;
}
