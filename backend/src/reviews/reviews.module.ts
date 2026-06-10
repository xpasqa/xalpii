import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  controllers: [ReviewsController],
  providers: [PrismaService, ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
