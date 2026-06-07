import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequestUser } from "../auth/types/auth-user";
import { UpdatePartnerProfileDto } from "./dto/update-partner-profile.dto";
import { PartnerProfileService } from "./partner-profile.service";

@Controller("partner/profile")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
export class PartnerProfileController {
  constructor(private readonly partnerProfile: PartnerProfileService) {}

  @Get()
  async get(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      success: true,
      data: await this.partnerProfile.getProfile(user.id)
    };
  }

  @Patch()
  async update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdatePartnerProfileDto
  ) {
    return {
      success: true,
      data: await this.partnerProfile.updateProfile(user.id, dto)
    };
  }
}
