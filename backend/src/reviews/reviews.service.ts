import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, Prisma, ReviewMediaStatus, ReviewStatus } from "@prisma/client";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { PrismaService } from "../prisma.service";
import type { AdminReviewQueryDto, CreateReviewDto, PublicReviewQueryDto, UpdateAdminReviewDto, UpdateReviewMediaDto } from "./dto/review.dto";

const reviewInclude = {
  activity: { select: { id: true, title: true, slug: true } },
  booking: { select: { id: true, status: true, travelDate: true, bookedAt: true } },
  media: { include: { file: true }, orderBy: { sortOrder: "asc" } },
  option: { select: { id: true, title: true } },
  user: { select: { id: true, fullName: true, email: true } }
} satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async eligibleBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId, status: BookingStatus.COMPLETED, review: null },
      include: {
        activity: { include: { media: { include: { file: true }, take: 1, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } } },
        option: true,
        payment: true,
        voucher: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async myReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: reviewInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  async create(user: AuthenticatedRequestUser, dto: CreateReviewDto) {
    if ((dto.media?.length ?? 0) > 5) {
      throw new BadRequestException({ code: "REVIEW_MEDIA_LIMIT", message: "Upload up to 5 review photos" });
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { review: true }
    });

    if (!booking) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking was not found" });
    if (booking.userId !== user.id) throw new ForbiddenException({ code: "REVIEW_BOOKING_FORBIDDEN", message: "You can only review your own booking" });
    if (booking.status !== BookingStatus.COMPLETED) throw new BadRequestException({ code: "REVIEW_BOOKING_NOT_COMPLETED", message: "You can review after the service is completed" });
    if (booking.review) throw new BadRequestException({ code: "REVIEW_ALREADY_EXISTS", message: "This booking already has a review" });

    const fileIds = (dto.media ?? []).map((item) => item.fileId).filter((item): item is string => Boolean(item));
    if (fileIds.length) {
      const files = await this.prisma.fileAsset.findMany({ where: { id: { in: fileIds } } });
      if (files.length !== fileIds.length || files.some((file) => !file.mimeType?.startsWith("image/"))) {
        throw new BadRequestException({ code: "REVIEW_MEDIA_INVALID", message: "Review media must be uploaded image files" });
      }
    }

    const review = await this.prisma.review.create({
      data: {
        activityId: booking.activityId,
        bookingId: booking.id,
        comment: dto.comment.trim(),
        optionId: booking.optionId,
        rating: dto.rating,
        status: ReviewStatus.PENDING_REVIEW,
        title: dto.title?.trim() || null,
        userId: user.id,
        media: {
          create: (dto.media ?? []).map((item, index) => ({
            altText: item.altText?.trim() || null,
            fileId: item.fileId,
            sortOrder: item.sortOrder ?? index,
            status: ReviewMediaStatus.PENDING,
            url: item.url?.trim() || null
          }))
        }
      },
      include: reviewInclude
    });

    return { review, message: "Your review has been submitted and will appear after moderation." };
  }

  async publicReviews(slug: string, query: PublicReviewQueryDto) {
    const activity = await this.prisma.activity.findUnique({ where: { slug }, select: { id: true, ratingAverage: true, reviewCount: true } });
    if (!activity) throw new NotFoundException({ code: "ACTIVITY_NOT_FOUND", message: "Activity was not found" });
    const page = positiveInt(query.page, 1);
    const limit = Math.min(positiveInt(query.limit, 10), 30);
    const sort = query.sort ?? "featured";
    const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
      sort === "highest" ? [{ rating: "desc" }, { submittedAt: "desc" }] :
      sort === "lowest" ? [{ rating: "asc" }, { submittedAt: "desc" }] :
      sort === "newest" ? [{ submittedAt: "desc" }] :
      [{ isFeatured: "desc" }, { submittedAt: "desc" }];

    const where = { activityId: activity.id, status: ReviewStatus.APPROVED };
    const [reviews, total, distributionRows, featured] = await Promise.all([
      this.prisma.review.findMany({ where, include: publicReviewInclude(), orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({ by: ["rating"], where, _count: { _all: true } }),
      this.prisma.review.findMany({ where: { ...where, isFeatured: true }, include: publicReviewInclude(), orderBy: [{ submittedAt: "desc" }], take: 3 })
    ]);

    return {
      ratingAverage: Number(activity.ratingAverage),
      reviewCount: activity.reviewCount,
      distribution: distributionRows.reduce((acc, row) => ({ ...acc, [row.rating]: row._count._all }), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
      featured: featured.map(toPublicReview),
      reviews: reviews.map(toPublicReview),
      pagination: { page, limit, total, pageCount: Math.ceil(total / limit) }
    };
  }

  async adminReviews(query: AdminReviewQueryDto) {
    const page = positiveInt(query.page, 1);
    const limit = Math.min(positiveInt(query.limit, 20), 50);
    const where: Prisma.ReviewWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.activityId) where.activityId = query.activityId;
    if (query.rating) where.rating = Number(query.rating);
    if (query.isFeatured === "true") where.isFeatured = true;
    if (query.isFeatured === "false") where.isFeatured = false;
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        { activity: { title: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } }
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({ where, include: reviewInclude, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      this.prisma.review.count({ where })
    ]);
    return { items, pagination: { page, limit, total, pageCount: Math.ceil(total / limit) } };
  }

  async adminReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id }, include: reviewInclude });
    if (!review) throw new NotFoundException({ code: "REVIEW_NOT_FOUND", message: "Review was not found" });
    return review;
  }

  async updateAdminReview(id: string, admin: AuthenticatedRequestUser, dto: UpdateAdminReviewDto) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: "REVIEW_NOT_FOUND", message: "Review was not found" });
    if (dto.isFeatured && (dto.status ?? existing.status) !== ReviewStatus.APPROVED) {
      throw new BadRequestException({ code: "FEATURE_REQUIRES_APPROVED", message: "Only approved reviews can be featured" });
    }
    const status = dto.status;
    const data: Prisma.ReviewUpdateInput = {
      adminEditedComment: dto.adminEditedComment,
      adminEditedTitle: dto.adminEditedTitle,
      moderationNote: dto.moderationNote,
      isFeatured: dto.isFeatured
    };
    if (status) {
      data.status = status;
      if (status === ReviewStatus.APPROVED) {
        data.approvedAt = new Date();
        data.approvedBy = { connect: { id: admin.id } };
      } else {
        data.isFeatured = false;
        if (status === ReviewStatus.REJECTED) data.rejectedAt = new Date();
        if (status === ReviewStatus.HIDDEN) data.hiddenAt = new Date();
      }
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const review = await tx.review.update({ where: { id }, data, include: reviewInclude });
      if (status === ReviewStatus.APPROVED) await tx.reviewMedia.updateMany({ where: { reviewId: id, status: ReviewMediaStatus.PENDING }, data: { status: ReviewMediaStatus.APPROVED } });
      if (status && status !== existing.status) await this.recalculateActivityRating(existing.activityId, tx);
      return review;
    });
    return updated;
  }

  async updateMedia(reviewId: string, mediaId: string, dto: UpdateReviewMediaDto) {
    const media = await this.prisma.reviewMedia.findFirst({ where: { id: mediaId, reviewId } });
    if (!media) throw new NotFoundException({ code: "REVIEW_MEDIA_NOT_FOUND", message: "Review media was not found" });
    return this.prisma.reviewMedia.update({ where: { id: mediaId }, data: { altText: dto.altText, status: dto.status } });
  }

  async recalculateActivityRating(activityId: string, tx: Prisma.TransactionClient = this.prisma) {
    const aggregate = await tx.review.aggregate({ where: { activityId, status: ReviewStatus.APPROVED }, _avg: { rating: true }, _count: { _all: true } });
    await tx.activity.update({ where: { id: activityId }, data: { ratingAverage: aggregate._avg.rating ?? 0, reviewCount: aggregate._count._all } });
  }
}

function publicReviewInclude() {
  return {
    media: { where: { status: ReviewMediaStatus.APPROVED }, include: { file: true }, orderBy: { sortOrder: "asc" } },
    option: { select: { title: true } },
    user: { select: { fullName: true } }
  } satisfies Prisma.ReviewInclude;
}

function toPublicReview(review: Prisma.ReviewGetPayload<{ include: ReturnType<typeof publicReviewInclude> }>) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.adminEditedTitle ?? review.title,
    comment: review.adminEditedComment ?? review.comment,
    reviewerName: review.user.fullName,
    reviewerInitials: review.user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    submittedAt: review.submittedAt,
    createdAt: review.createdAt,
    isFeatured: review.isFeatured,
    verifiedBooking: true,
    optionTitle: review.option?.title ?? null,
    media: review.media.map((item) => ({ id: item.id, url: item.url ?? item.file?.url, altText: item.altText, sortOrder: item.sortOrder }))
  };
}

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
