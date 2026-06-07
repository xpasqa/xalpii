import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { AdminUsersService } from "./admin-users.service";
import { AdminUserQueryDto } from "./dto/admin-user.dto";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  async list(@Query() query: AdminUserQueryDto) {
    return {
      success: true,
      data: await this.users.list(query)
    };
  }

  @Post(":id/impersonate")
  async impersonate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser
  ) {
    return {
      success: true,
      data: await this.users.impersonate(id, user.id)
    };
  }
}
