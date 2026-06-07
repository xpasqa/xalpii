import { Type } from "class-transformer";
import {
  Allow,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from "class-validator";
import { ActivityStatus } from "@prisma/client";

export class PartnerActivityQueryDto {
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CreatePartnerActivityDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsString()
  cityId!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  @MaxLength(500)
  shortDescription!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  durationLabel?: string;

  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @IsOptional()
  @IsString()
  importantInfo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  included?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notIncluded?: string[];

  @IsOptional()
  @Allow()
  itinerary?: unknown;
}

export class UpdatePartnerActivityDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  durationLabel?: string;

  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @IsOptional()
  @IsString()
  importantInfo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  included?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notIncluded?: string[];

  @IsOptional()
  @Allow()
  itinerary?: unknown;
}

export class UpsertPartnerActivityPricingDto {
  @IsString()
  @MaxLength(3)
  currency!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsString()
  @MaxLength(80)
  priceType!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePartnerActivityAvailabilityDto {
  @IsDateString()
  startDateTime!: string;

  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePartnerActivityAvailabilityDto {
  @IsOptional()
  @IsDateString()
  startDateTime?: string;

  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePartnerActivityMediaDto {
  @IsOptional()
  @IsString()
  fileAssetId?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  altText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

export class UpdatePartnerActivityMediaDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  altText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}
