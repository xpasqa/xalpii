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
import { AdminCategoriesService } from "./admin-categories.service";
import {
  AdminCategoryQueryDto,
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto
} from "./dto/admin-category.dto";

@Controller("admin/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminCategoriesController {
  constructor(private readonly categories: AdminCategoriesService) {}

  @Get()
  async list(@Query() query: AdminCategoryQueryDto) {
    return {
      success: true,
      data: await this.categories.list(query)
    };
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return {
      success: true,
      data: await this.categories.get(id)
    };
  }

  @Post()
  async create(
    @Body() dto: CreateAdminCategoryDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.categories.create(dto, user.id)
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminCategoryDto,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.categories.update(id, dto, user.id)
    };
  }

  @Delete(":id")
  async deactivate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.categories.deactivate(id, user.id)
    };
  }
}
