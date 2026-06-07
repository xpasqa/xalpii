import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PublicMarketplaceController } from "./public-marketplace.controller";
import { PublicMarketplaceService } from "./public-marketplace.service";

@Module({
  controllers: [PublicMarketplaceController],
  providers: [PrismaService, PublicMarketplaceService]
})
export class PublicMarketplaceModule {}
