import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", ".env.local", "../.env.local", "../.env"],
      isGlobal: true
    })
  ],
  controllers: [HealthController],
  providers: [PrismaService]
})
export class AppModule {}
