import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma.service";
import type { JwtUser } from "../types/auth-user";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET")
    });
  }

  async validate(payload: JwtUser) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        partner: true
      }
    });

    if (!user) {
      throw new UnauthorizedException({
        code: "AUTH_USER_NOT_FOUND",
        message: "Authenticated user was not found"
      });
    }

    return user;
  }
}
