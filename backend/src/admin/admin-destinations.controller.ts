import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { AdminDestinationsService } from "./admin-destinations.service";
import {
  AdminDestinationQueryDto,
  CreateAdminDestinationDto,
  UpdateAdminDestinationDto
} from "./dto/admin-destination.dto";

@Controller("admin/destinations")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminDestinationsController {
  constructor(private readonly destinations: AdminDestinationsService) {}

  @Get()
  async list(@Query() query: AdminDestinationQueryDto) {
    return {
      success: true,
      data: await this.destinations.list(query)
    };
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return {
      success: true,
      data: await this.destinations.get(id)
    };
  }

  @Post()
  async create(
    @Body() dto: CreateAdminDestinationDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.destinations.create(dto, user.id)
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminDestinationDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.destinations.update(id, dto, user.id)
    };
  }

  @Post(":id/deactivate")
  async deactivate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.destinations.deactivate(id, user.id)
    };
  }
}
