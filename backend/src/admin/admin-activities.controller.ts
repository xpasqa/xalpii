import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { AdminActivitiesService } from "./admin-activities.service";
import {
  AdminActivityQueryDto,
  CreateAdminActivityAvailabilityDto,
  CreateAdminActivityMediaDto,
  RejectAdminActivityDto,
  UpdateAdminActivityAvailabilityDto,
  UpdateAdminActivityDto,
  UpdateAdminActivityMediaDto,
  UpsertAdminActivityPricingDto
} from "./dto/admin-activity.dto";

@Controller("admin/activities")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminActivitiesController {
  constructor(private readonly activities: AdminActivitiesService) {}

  @Get()
  async list(@Query() query: AdminActivityQueryDto) {
    return {
      success: true,
      data: await this.activities.list(query)
    };
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return {
      success: true,
      data: await this.activities.get(id)
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminActivityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.update(id, user.id, dto)
    };
  }

  @Put(":id/pricing")
  async upsertPricing(
    @Param("id") id: string,
    @Body() dto: UpsertAdminActivityPricingDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.upsertPricing(id, user.id, dto)
    };
  }

  @Get(":id/availability")
  async listAvailability(@Param("id") id: string) {
    return {
      success: true,
      data: await this.activities.listAvailability(id)
    };
  }

  @Post(":id/availability")
  async createAvailability(
    @Param("id") id: string,
    @Body() dto: CreateAdminActivityAvailabilityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.createAvailability(id, user.id, dto)
    };
  }

  @Patch(":id/availability/:availabilityId")
  async updateAvailability(
    @Param("id") id: string,
    @Param("availabilityId") availabilityId: string,
    @Body() dto: UpdateAdminActivityAvailabilityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.updateAvailability(id, availabilityId, user.id, dto)
    };
  }

  @Delete(":id/availability/:availabilityId")
  async deactivateAvailability(
    @Param("id") id: string,
    @Param("availabilityId") availabilityId: string,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.deactivateAvailability(id, availabilityId, user.id)
    };
  }

  @Get(":id/media")
  async listMedia(@Param("id") id: string) {
    return {
      success: true,
      data: await this.activities.listMedia(id)
    };
  }

  @Post(":id/media")
  async createMedia(
    @Param("id") id: string,
    @Body() dto: CreateAdminActivityMediaDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.createMedia(id, user.id, dto)
    };
  }

  @Patch(":id/media/:mediaId")
  async updateMedia(
    @Param("id") id: string,
    @Param("mediaId") mediaId: string,
    @Body() dto: UpdateAdminActivityMediaDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.updateMedia(id, mediaId, user.id, dto)
    };
  }

  @Delete(":id/media/:mediaId")
  async deleteMedia(
    @Param("id") id: string,
    @Param("mediaId") mediaId: string,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.deleteMedia(id, mediaId, user.id)
    };
  }

  @Post(":id/approve")
  async approve(@Param("id") id: string, @CurrentUser() user: AuthenticatedRequestUser) {
    return {
      success: true,
      data: await this.activities.approve(id, user.id)
    };
  }

  @Post(":id/publish")
  async publish(@Param("id") id: string, @CurrentUser() user: AuthenticatedRequestUser) {
    return {
      success: true,
      data: await this.activities.publish(id, user.id)
    };
  }

  @Post(":id/reject")
  async reject(
    @Param("id") id: string,
    @Body() dto: RejectAdminActivityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.reject(id, user.id, dto.reason)
    };
  }

  @Post(":id/request-revision")
  async requestRevision(
    @Param("id") id: string,
    @Body() dto: RejectAdminActivityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.activities.requestRevision(id, user.id, dto.reason)
    };
  }

  @Post(":id/archive")
  async archive(@Param("id") id: string, @CurrentUser() user: AuthenticatedRequestUser) {
    return {
      success: true,
      data: await this.activities.archive(id, user.id)
    };
  }
}
