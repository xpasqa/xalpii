import { IsEnum, IsOptional, IsString } from "class-validator";
import { ActivityStatus } from "@prisma/client";
import {
  CreatePartnerActivityOptionDto,
  CreatePartnerActivityAvailabilityDto,
  CreatePartnerActivityMediaDto,
  UpdatePartnerActivityOptionDto,
  UpdatePartnerActivityAvailabilityDto,
  UpdatePartnerActivityDto,
  UpdatePartnerActivityMediaDto,
  UpsertPartnerActivityPricingDto,
  UpsertPartnerActivityOptionPricingDto
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
  destinationId?: string;

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

export class CreateAdminActivityOptionDto extends CreatePartnerActivityOptionDto {}

export class UpdateAdminActivityOptionDto extends UpdatePartnerActivityOptionDto {}

export class UpsertAdminActivityOptionPricingDto extends UpsertPartnerActivityOptionPricingDto {}
