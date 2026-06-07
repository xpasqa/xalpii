import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterPartnerDto } from "./dto/register-partner.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { AuthenticatedRequestUser } from "./types/auth-user";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      data: await this.auth.register(dto)
    };
  }

  @Post("register-partner")
  async registerPartner(@Body() dto: RegisterPartnerDto) {
    return {
      success: true,
      data: await this.auth.registerPartner(dto)
    };
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return {
      success: true,
      data: await this.auth.login(dto)
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      success: true,
      data: await this.auth.getMe(user)
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateProfileDto
  ) {
    return {
      success: true,
      data: await this.auth.updateMe(user.id, dto)
    };
  }

  @Post("logout")
  logout() {
    return {
      success: true,
      data: {
        ok: true
      }
    };
  }
}
