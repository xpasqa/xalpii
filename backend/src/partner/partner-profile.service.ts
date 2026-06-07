import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import type { UpdatePartnerProfileDto } from "./dto/update-partner-profile.dto";

@Injectable()
export class PartnerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            id: true
          }
        }
      }
    });

    if (!partner) {
      throw new NotFoundException({
        code: "PARTNER_PROFILE_NOT_FOUND",
        message: "Partner profile was not found"
      });
    }

    return partner;
  }

  async updateProfile(userId: string, dto: UpdatePartnerProfileDto) {
    await this.getProfile(userId);

    return this.prisma.partner.update({
      where: { userId },
      data: this.toUpdateData(dto),
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            id: true
          }
        }
      }
    });
  }

  private toUpdateData(dto: UpdatePartnerProfileDto): Prisma.PartnerUpdateInput {
    const data: Prisma.PartnerUpdateInput = {};

    if (dto.businessName !== undefined) {
      data.businessName = dto.businessName.trim();
    }

    for (const key of [
      "legalName",
      "phone",
      "country",
      "city",
      "address",
      "description"
    ] as const) {
      if (dto[key] !== undefined) {
        data[key] = normalizeText(dto[key]);
      }
    }

    return data;
  }
}

function normalizeText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
