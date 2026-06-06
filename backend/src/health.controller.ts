import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        service: "alpii-api",
        database: "ok"
      };
    } catch {
      throw new ServiceUnavailableException({
        code: "DATABASE_UNAVAILABLE",
        message: "Database is unavailable",
        details: {
          database: "unavailable"
        }
      });
    }
  }
}
