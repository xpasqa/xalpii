import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { AdminActivitiesController } from "./admin-activities.controller";
import { AdminActivitiesService } from "./admin-activities.service";
import { AdminCategoriesController } from "./admin-categories.controller";
import { AdminCategoriesService } from "./admin-categories.service";
import { AdminCitiesController } from "./admin-cities.controller";
import { AdminCitiesService } from "./admin-cities.service";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminCitiesController,
    AdminCategoriesController,
    AdminActivitiesController,
    AdminUsersController
  ],
  providers: [
    PrismaService,
    AdminCitiesService,
    AdminCategoriesService,
    AdminActivitiesService,
    AdminUsersService
  ]
})
export class AdminModule {}
