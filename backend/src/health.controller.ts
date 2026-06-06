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
        database: "ok"
      };
    } catch {
      throw new ServiceUnavailableException({
        status: "error",
        database: "unavailable"
      });
    }
  }
}
