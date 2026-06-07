import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { BookingsService } from "./bookings.service";
import { AdminBookingQueryDto, CreateBookingDto, PartnerBookingQueryDto, ValidateVoucherDto } from "./dto/booking.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post("bookings")
  async create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateBookingDto) {
    return {
      success: true,
      data: await this.bookings.create(user, dto)
    };
  }

  @Get("bookings/my")
  async myBookings(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      success: true,
      data: await this.bookings.myBookings(user.id)
    };
  }

  @Get("bookings/:id")
  async get(@CurrentUser() user: AuthenticatedRequestUser, @Param("id") id: string) {
    return {
      success: true,
      data: await this.bookings.getForUser(user, id)
    };
  }

  @Post("payments/:paymentId/dummy-confirm")
  async confirmPayment(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("paymentId") paymentId: string
  ) {
    return {
      success: true,
      data: await this.bookings.confirmDummyPayment(user, paymentId)
    };
  }

  @Post("payments/:paymentId/dummy-fail")
  async failPayment(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("paymentId") paymentId: string
  ) {
    return {
      success: true,
      data: await this.bookings.failDummyPayment(user, paymentId)
    };
  }

  @Get("vouchers/:code")
  async getVoucher(@CurrentUser() user: AuthenticatedRequestUser, @Param("code") code: string) {
    return {
      success: true,
      data: await this.bookings.getVoucher(user, code)
    };
  }

  @Post("vouchers/validate")
  @Roles(UserRole.PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async validateVoucher(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: ValidateVoucherDto
  ) {
    return {
      success: true,
      data: await this.bookings.validateVoucher(user, dto.code.trim())
    };
  }

  @Get("partner/bookings")
  @Roles(UserRole.PARTNER)
  async partnerBookings(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: PartnerBookingQueryDto
  ) {
    return {
      success: true,
      data: await this.bookings.partnerBookings(user, query)
    };
  }

  @Get("admin/bookings")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async adminBookings(@Query() query: AdminBookingQueryDto) {
    return {
      success: true,
      data: await this.bookings.adminBookings(query)
    };
  }

  @Get("admin/payments")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async adminPayments(@Query() query: AdminBookingQueryDto) {
    return {
      success: true,
      data: await this.bookings.adminPayments(query)
    };
  }
}
