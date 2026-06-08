import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { ActivityRevisionsService } from "./activity-revisions.service";
import {
  ActivityRevisionQueryDto,
  RejectActivityRevisionDto
} from "./dto/activity-revision.dto";

@Controller("admin/activity-revisions")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminActivityRevisionsController {
  constructor(private readonly revisions: ActivityRevisionsService) {}

  @Get()
  async list(@Query() query: ActivityRevisionQueryDto) {
    return {
      success: true,
      data: await this.revisions.listAdminRevisions(query)
    };
  }

  @Get(":revisionId")
  async get(@Param("revisionId") revisionId: string) {
    return {
      success: true,
      data: await this.revisions.getAdminRevision(revisionId)
    };
  }

  @Post(":revisionId/approve")
  async approve(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("revisionId") revisionId: string
  ) {
    return {
      success: true,
      data: await this.revisions.approveAdminRevision(revisionId, user)
    };
  }

  @Post(":revisionId/reject")
  async reject(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("revisionId") revisionId: string,
    @Body() dto: RejectActivityRevisionDto
  ) {
    return {
      success: true,
      data: await this.revisions.rejectAdminRevision(revisionId, user, dto.rejectionReason)
    };
  }
}
