import { Module } from "@nestjs/common";
import { ActivityRevisionsService } from "../activity-revisions/activity-revisions.service";
import { PartnerActivityRevisionsController } from "../activity-revisions/partner-activity-revisions.controller";
import { PrismaService } from "../prisma.service";
import { PartnerActivitiesController } from "./partner-activities.controller";
import { PartnerActivitiesService } from "./partner-activities.service";
import { PartnerProfileController } from "./partner-profile.controller";
import { PartnerProfileService } from "./partner-profile.service";

@Module({
  controllers: [
    PartnerProfileController,
    PartnerActivitiesController,
    PartnerActivityRevisionsController
  ],
  providers: [
    PrismaService,
    PartnerProfileService,
    PartnerActivitiesService,
    ActivityRevisionsService
  ]
})
export class PartnerModule {}
