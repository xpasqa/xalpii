import { IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole, UserStatus } from "@prisma/client";

export class AdminUserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
