import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import {
  CreatePartnerActivityAvailabilityDto,
  CreatePartnerActivityDto,
  CreatePartnerActivityMediaDto,
  PartnerActivityQueryDto,
  UpdatePartnerActivityAvailabilityDto,
  UpdatePartnerActivityDto,
  UpdatePartnerActivityMediaDto,
  UpsertPartnerActivityPricingDto
} from "./dto/partner-activity.dto";
import { PartnerActivitiesService } from "./partner-activities.service";

@Controller("partner")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
export class PartnerActivitiesController {
  constructor(private readonly activities: PartnerActivitiesService) {}

  @Get("lookups/cities")
  async cities() {
    return {
      success: true,
      data: await this.activities.listActiveCities()
    };
  }

  @Get("lookups/categories")
  async categories() {
    return {
      success: true,
      data: await this.activities.listActiveCategories()
    };
  }

  @Get("activities")
  async list(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: PartnerActivityQueryDto
  ) {
    return {
      success: true,
      data: await this.activities.list(user.id, query)
    };
  }

  @Post("activities")
  async create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreatePartnerActivityDto
  ) {
    return {
      success: true,
      data: await this.activities.create(user.id, dto)
    };
  }

  @Get("activities/:id")
  async get(@CurrentUser() user: AuthenticatedRequestUser, @Param("id") id: string) {
    return {
      success: true,
      data: await this.activities.get(user.id, id)
    };
  }

  @Patch("activities/:id")
  async update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Body() dto: UpdatePartnerActivityDto
  ) {
    return {
      success: true,
      data: await this.activities.update(user.id, id, dto)
    };
  }

  @Post("activities/:id/submit")
  async submit(@CurrentUser() user: AuthenticatedRequestUser, @Param("id") id: string) {
    return {
      success: true,
      data: await this.activities.submit(user.id, id)
    };
  }

  @Put("activities/:id/pricing")
  async pricing(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Body() dto: UpsertPartnerActivityPricingDto
  ) {
    return {
      success: true,
      data: await this.activities.upsertPricing(user.id, id, dto)
    };
  }

  @Get("activities/:id/availability")
  async listAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string
  ) {
    return {
      success: true,
      data: await this.activities.listAvailability(user.id, id)
    };
  }

  @Post("activities/:id/availability")
  async createAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Body() dto: CreatePartnerActivityAvailabilityDto
  ) {
    return {
      success: true,
      data: await this.activities.createAvailability(user.id, id, dto)
    };
  }

  @Patch("activities/:id/availability/:availabilityId")
  async updateAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("availabilityId") availabilityId: string,
    @Body() dto: UpdatePartnerActivityAvailabilityDto
  ) {
    return {
      success: true,
      data: await this.activities.updateAvailability(user.id, id, availabilityId, dto)
    };
  }

  @Delete("activities/:id/availability/:availabilityId")
  async deactivateAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("availabilityId") availabilityId: string
  ) {
    return {
      success: true,
      data: await this.activities.deactivateAvailability(user.id, id, availabilityId)
    };
  }

  @Get("activities/:id/media")
  async listMedia(@CurrentUser() user: AuthenticatedRequestUser, @Param("id") id: string) {
    return {
      success: true,
      data: await this.activities.listMedia(user.id, id)
    };
  }

  @Post("activities/:id/media")
  async createMedia(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Body() dto: CreatePartnerActivityMediaDto
  ) {
    return {
      success: true,
      data: await this.activities.createMedia(user.id, id, dto)
    };
  }

  @Patch("activities/:id/media/:mediaId")
  async updateMedia(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("mediaId") mediaId: string,
    @Body() dto: UpdatePartnerActivityMediaDto
  ) {
    return {
      success: true,
      data: await this.activities.updateMedia(user.id, id, mediaId, dto)
    };
  }

  @Delete("activities/:id/media/:mediaId")
  async deleteMedia(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("mediaId") mediaId: string
  ) {
    return {
      success: true,
      data: await this.activities.deleteMedia(user.id, id, mediaId)
    };
  }
}
