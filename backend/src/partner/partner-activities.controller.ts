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
  CreatePartnerActivityOptionDto,
  PartnerActivityQueryDto,
  UpdatePartnerActivityAvailabilityDto,
  UpdatePartnerActivityDto,
  UpdatePartnerActivityMediaDto,
  UpdatePartnerActivityOptionDto,
  UpsertPartnerActivityOptionPricingDto,
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

  @Get("lookups/destinations")
  async destinations() {
    return {
      success: true,
      data: await this.activities.listActiveDestinations()
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

  @Get("activities/:id/pricing")
  async getPricing(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string
  ) {
    return {
      success: true,
      data: await this.activities.getPricing(user.id, id)
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

  @Get("activities/:id/options")
  async listOptions(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string
  ) {
    return {
      success: true,
      data: await this.activities.listOptions(user.id, id)
    };
  }

  @Post("activities/:id/options")
  async createOption(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Body() dto: CreatePartnerActivityOptionDto
  ) {
    return {
      success: true,
      data: await this.activities.createOption(user.id, id, dto)
    };
  }

  @Get("activities/:id/options/:optionId")
  async getOption(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string
  ) {
    return {
      success: true,
      data: await this.activities.getOption(user.id, id, optionId)
    };
  }

  @Patch("activities/:id/options/:optionId")
  async updateOption(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string,
    @Body() dto: UpdatePartnerActivityOptionDto
  ) {
    return {
      success: true,
      data: await this.activities.updateOption(user.id, id, optionId, dto)
    };
  }

  @Delete("activities/:id/options/:optionId")
  async deactivateOption(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string
  ) {
    return {
      success: true,
      data: await this.activities.deactivateOption(user.id, id, optionId)
    };
  }

  @Get("activities/:id/options/:optionId/pricing")
  async getOptionPricing(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string
  ) {
    return {
      success: true,
      data: await this.activities.getOptionPricing(user.id, id, optionId)
    };
  }

  @Put("activities/:id/options/:optionId/pricing")
  async upsertOptionPricing(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string,
    @Body() dto: UpsertPartnerActivityOptionPricingDto
  ) {
    return {
      success: true,
      data: await this.activities.upsertOptionPricing(user.id, id, optionId, dto)
    };
  }

  @Get("activities/:id/options/:optionId/availability")
  async listOptionAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string
  ) {
    return {
      success: true,
      data: await this.activities.listOptionAvailability(user.id, id, optionId)
    };
  }

  @Post("activities/:id/options/:optionId/availability")
  async createOptionAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string,
    @Body() dto: CreatePartnerActivityAvailabilityDto
  ) {
    return {
      success: true,
      data: await this.activities.createOptionAvailability(user.id, id, optionId, dto)
    };
  }

  @Patch("activities/:id/options/:optionId/availability/:availabilityId")
  async updateOptionAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string,
    @Param("availabilityId") availabilityId: string,
    @Body() dto: UpdatePartnerActivityAvailabilityDto
  ) {
    return {
      success: true,
      data: await this.activities.updateOptionAvailability(user.id, id, optionId, availabilityId, dto)
    };
  }

  @Delete("activities/:id/options/:optionId/availability/:availabilityId")
  async deactivateOptionAvailability(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Param("optionId") optionId: string,
    @Param("availabilityId") availabilityId: string
  ) {
    return {
      success: true,
      data: await this.activities.deactivateOptionAvailability(user.id, id, optionId, availabilityId)
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
