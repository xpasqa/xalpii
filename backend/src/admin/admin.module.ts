import { Module } from "@nestjs/common";
import { AdminActivityRevisionsController } from "../activity-revisions/admin-activity-revisions.controller";
import { ActivityRevisionsService } from "../activity-revisions/activity-revisions.service";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { AdminActivitiesController } from "./admin-activities.controller";
import { AdminActivitiesService } from "./admin-activities.service";
import { AdminCategoriesController } from "./admin-categories.controller";
import { AdminCategoriesService } from "./admin-categories.service";
import { AdminCitiesController } from "./admin-cities.controller";
import { AdminCitiesService } from "./admin-cities.service";
import { AdminDestinationsController } from "./admin-destinations.controller";
import { AdminDestinationsService } from "./admin-destinations.service";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminCitiesController,
    AdminDestinationsController,
    AdminCategoriesController,
    AdminActivitiesController,
    AdminActivityRevisionsController,
    AdminUsersController
  ],
  providers: [
    PrismaService,
    AdminCitiesService,
    AdminDestinationsService,
    AdminCategoriesService,
    AdminActivitiesService,
    ActivityRevisionsService,
    AdminUsersService
  ]
})
export class AdminModule {}
