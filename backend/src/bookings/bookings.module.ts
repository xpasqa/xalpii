import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

@Module({
  controllers: [BookingsController],
  providers: [PrismaService, BookingsService]
})
export class BookingsModule {}
