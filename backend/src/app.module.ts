import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { FilesModule } from "./files/files.module";
import { HealthController } from "./health.controller";
import { PartnerModule } from "./partner/partner.module";
import { PrismaService } from "./prisma.service";
import { PublicMarketplaceModule } from "./public/public-marketplace.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", ".env.local", "../.env.local", "../.env"],
      isGlobal: true
    }),
    AuthModule,
    AdminModule,
    BookingsModule,
    FilesModule,
    PartnerModule,
    PublicMarketplaceModule
  ],
  controllers: [HealthController],
  providers: [PrismaService]
})
export class AppModule {}
