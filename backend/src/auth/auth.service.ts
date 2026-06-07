import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PartnerStatus, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterPartnerDto } from "./dto/register-partner.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { AuthenticatedRequestUser, JwtUser } from "./types/auth-user";

const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    await this.assertEmailAvailable(email);

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName.trim(),
        role: UserRole.USER,
        status: UserStatus.ACTIVE
      },
      select: safeUserSelect
    });

    return {
      user,
      accessToken: await this.signAccessToken(user)
    };
  }

  async registerPartner(dto: RegisterPartnerDto) {
    const email = this.normalizeEmail(dto.email);
    await this.assertEmailAvailable(email);

    const passwordHash = await this.hashPassword(dto.password);
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.PARTNER,
          status: UserStatus.ACTIVE
        },
        select: safeUserSelect
      });

      const partner = await tx.partner.create({
        data: {
          userId: user.id,
          businessName: dto.businessName.trim(),
          status: PartnerStatus.PENDING_REVIEW
        }
      });

      return { user, partner };
    });

    return {
      ...result,
      accessToken: await this.signAccessToken(result.user)
    };
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user?.passwordHash) {
      throw this.invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw this.invalidCredentials();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        code: "AUTH_USER_DISABLED",
        message: "User account is inactive or suspended"
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return {
      user: safeUser,
      accessToken: await this.signAccessToken(safeUser)
    };
  }

  async getMe(user: AuthenticatedRequestUser) {
    if (user.role !== UserRole.PARTNER) {
      return {
        user
      };
    }

    return {
      user
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const data: { fullName?: string; email?: string } = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }

    if (dto.email !== undefined) {
      const email = this.normalizeEmail(dto.email);
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        },
        select: { id: true }
      });

      if (existingUser) {
        throw new ConflictException({
          code: "AUTH_EMAIL_TAKEN",
          message: "Email is already registered"
        });
      }

      data.email = email;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        ...safeUserSelect,
        partner: true
      }
    });

    return {
      user
    };
  }

  private async assertEmailAvailable(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      throw new ConflictException({
        code: "AUTH_EMAIL_TAKEN",
        message: "Email is already registered"
      });
    }
  }

  private async hashPassword(password: string) {
    const rounds = this.config.get<number>("BCRYPT_SALT_ROUNDS", 12);
    return bcrypt.hash(password, rounds);
  }

  private async signAccessToken(user: Pick<JwtUser, "email" | "role"> & { id: string }) {
    const payload: JwtUser = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return this.jwt.signAsync(payload);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private invalidCredentials() {
    return new UnauthorizedException({
      code: "AUTH_INVALID_CREDENTIALS",
      message: "Invalid email or password"
    });
  }
}
