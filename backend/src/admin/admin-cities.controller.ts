import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { AdminCitiesService } from "./admin-cities.service";
import {
  AdminCityQueryDto,
  CreateAdminCityDto,
  UpdateAdminCityDto
} from "./dto/admin-city.dto";

@Controller("admin/cities")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminCitiesController {
  constructor(private readonly cities: AdminCitiesService) {}

  @Get()
  async list(@Query() query: AdminCityQueryDto) {
    return {
      success: true,
      data: await this.cities.list(query)
    };
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return {
      success: true,
      data: await this.cities.get(id)
    };
  }

  @Post()
  async create(
    @Body() dto: CreateAdminCityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.cities.create(dto, user.id)
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminCityDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.cities.update(id, dto, user.id)
    };
  }

  @Delete(":id")
  async deactivate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.cities.deactivate(id, user.id)
    };
  }
}
