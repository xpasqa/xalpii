import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { ActivityRevisionsService } from "./activity-revisions.service";
import { UpdateActivityRevisionDto } from "./dto/activity-revision.dto";

@Controller("partner/activities/:activityId/revisions")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
export class PartnerActivityRevisionsController {
  constructor(private readonly revisions: ActivityRevisionsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("activityId") activityId: string
  ) {
    return {
      success: true,
      data: await this.revisions.createPartnerRevision(user.id, activityId)
    };
  }

  @Get("current")
  async current(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("activityId") activityId: string
  ) {
    return {
      success: true,
      data: await this.revisions.getPartnerCurrentRevision(user.id, activityId)
    };
  }

  @Get(":revisionId")
  async get(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("activityId") activityId: string,
    @Param("revisionId") revisionId: string
  ) {
    return {
      success: true,
      data: await this.revisions.getPartnerRevision(user.id, activityId, revisionId)
    };
  }

  @Patch(":revisionId")
  async update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("activityId") activityId: string,
    @Param("revisionId") revisionId: string,
    @Body() dto: UpdateActivityRevisionDto
  ) {
    return {
      success: true,
      data: await this.revisions.updatePartnerRevision(user.id, activityId, revisionId, dto.snapshot)
    };
  }

  @Post(":revisionId/submit")
  async submit(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("activityId") activityId: string,
    @Param("revisionId") revisionId: string
  ) {
    return {
      success: true,
      data: await this.revisions.submitPartnerRevision(user.id, activityId, revisionId)
    };
  }

  @Post(":revisionId/cancel")
  async cancel(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("activityId") activityId: string,
    @Param("revisionId") revisionId: string
  ) {
    return {
      success: true,
      data: await this.revisions.cancelPartnerRevision(user.id, activityId, revisionId)
    };
  }
}
