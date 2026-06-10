import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { AdminReviewQueryDto, CreateReviewDto, PublicReviewQueryDto, UpdateAdminReviewDto, UpdateReviewMediaDto } from "./dto/review.dto";
import { ReviewsService } from "./reviews.service";

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get("public/activities/:slug/reviews")
  async publicReviews(@Param("slug") slug: string, @Query() query: PublicReviewQueryDto) {
    return { success: true, data: await this.reviews.publicReviews(slug, query) };
  }

  @Get("reviews/eligible-bookings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async eligible(@CurrentUser() user: AuthenticatedRequestUser) {
    return { success: true, data: await this.reviews.eligibleBookings(user.id) };
  }

  @Get("reviews/my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async my(@CurrentUser() user: AuthenticatedRequestUser) {
    return { success: true, data: await this.reviews.myReviews(user.id) };
  }

  @Post("reviews")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateReviewDto) {
    return { success: true, data: await this.reviews.create(user, dto) };
  }

  @Get("admin/reviews")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async adminReviews(@Query() query: AdminReviewQueryDto) {
    return { success: true, data: await this.reviews.adminReviews(query) };
  }

  @Get("admin/reviews/:id")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async adminReview(@Param("id") id: string) {
    return { success: true, data: await this.reviews.adminReview(id) };
  }

  @Patch("admin/reviews/:id")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateAdminReview(@Param("id") id: string, @CurrentUser() user: AuthenticatedRequestUser, @Body() dto: UpdateAdminReviewDto) {
    return { success: true, data: await this.reviews.updateAdminReview(id, user, dto) };
  }

  @Patch("admin/reviews/:id/media/:mediaId")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateMedia(@Param("id") id: string, @Param("mediaId") mediaId: string, @Body() dto: UpdateReviewMediaDto) {
    return { success: true, data: await this.reviews.updateMedia(id, mediaId, dto) };
  }
}
