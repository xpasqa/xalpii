import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PartnerActivitiesController } from "./partner-activities.controller";
import { PartnerActivitiesService } from "./partner-activities.service";
import { PartnerProfileController } from "./partner-profile.controller";
import { PartnerProfileService } from "./partner-profile.service";

@Module({
  controllers: [PartnerProfileController, PartnerActivitiesController],
  providers: [PrismaService, PartnerProfileService, PartnerActivitiesService]
})
export class PartnerModule {}
