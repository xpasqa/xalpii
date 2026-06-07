import { IsEnum, IsOptional, IsString } from "class-validator";
import { ActivityStatus } from "@prisma/client";
import {
  CreatePartnerActivityAvailabilityDto,
  CreatePartnerActivityMediaDto,
  UpdatePartnerActivityAvailabilityDto,
  UpdatePartnerActivityDto,
  UpdatePartnerActivityMediaDto,
  UpsertPartnerActivityPricingDto
} from "../../partner/dto/partner-activity.dto";

export class AdminActivityQueryDto {
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  partnerId?: string;
}

export class RejectAdminActivityDto {
  @IsString()
  reason!: string;
}

export class UpdateAdminActivityDto extends UpdatePartnerActivityDto {}

export class UpsertAdminActivityPricingDto extends UpsertPartnerActivityPricingDto {}

export class CreateAdminActivityAvailabilityDto extends CreatePartnerActivityAvailabilityDto {}

export class UpdateAdminActivityAvailabilityDto extends UpdatePartnerActivityAvailabilityDto {}

export class CreateAdminActivityMediaDto extends CreatePartnerActivityMediaDto {}

export class UpdateAdminActivityMediaDto extends UpdatePartnerActivityMediaDto {}
