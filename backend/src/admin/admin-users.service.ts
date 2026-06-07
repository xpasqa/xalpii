import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import type { AdminUserQueryDto } from "./dto/admin-user.dto";

const adminUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  partner: {
    select: {
      id: true,
      businessName: true,
      status: true
    }
  }
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async list(query: AdminUserQueryDto) {
    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { partner: { businessName: { contains: search, mode: "insensitive" } } }
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: adminUserSelect,
      orderBy: { createdAt: "desc" }
    });
  }

  async impersonate(targetUserId: string, actorUserId: string) {
    if (targetUserId === actorUserId) {
      throw new BadRequestException({
        code: "ADMIN_IMPERSONATE_SELF",
        message: "You are already signed in as this user"
      });
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: adminUserSelect
    });

    if (!targetUser) {
      throw new NotFoundException({
        code: "ADMIN_USER_NOT_FOUND",
        message: "User was not found"
      });
    }

    if (targetUser.status !== UserStatus.ACTIVE) {
      throw new BadRequestException({
        code: "ADMIN_IMPERSONATE_INACTIVE_USER",
        message: "Only active users can be impersonated"
      });
    }

    await this.prisma.auditLog.create({
      data: {
        action: "ADMIN_USER_IMPERSONATED",
        actorUserId,
        entityId: targetUser.id,
        entityType: "USER",
        metadata: {
          email: targetUser.email,
          role: targetUser.role
        }
      }
    });

    const accessToken = await this.jwt.signAsync({
      email: targetUser.email,
      role: targetUser.role,
      sub: targetUser.id
    });

    return {
      accessToken,
      user: targetUser
    };
  }
}
