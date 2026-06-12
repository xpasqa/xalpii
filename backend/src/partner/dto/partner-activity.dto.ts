import { Type } from "class-transformer";
import {
  Allow,
  IsArray,
  IsBoolean,
  Equals,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";
import { ActivityStatus, AvailabilityMode, PricingMode } from "@prisma/client";

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

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  destinationId?: string;

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
  destinationId?: string;

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

export class ActivityPricingTierDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(14)
  minTravelers!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(14)
  maxTravelers!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  adultPriceCents!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  childPriceCents?: number;

  @IsOptional()
  @IsBoolean()
  childAllowed?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  childDiscountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertPartnerActivityPricingDto {
  @IsOptional()
  @IsEnum(PricingMode)
  pricingMode?: PricingMode;

  @IsString()
  @Equals("USD", { message: "Partner pricing currency must be USD" })
  @MaxLength(3)
  currency!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  priceCents?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  priceType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityPricingTierDto)
  tiers?: ActivityPricingTierDto[];
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

export class CreatePartnerActivityOptionDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

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
  @IsArray()
  @IsString({ each: true })
  meetingTimes?: string[];

  @IsOptional()
  @IsEnum(AvailabilityMode)
  availabilityMode?: AvailabilityMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dailyCapacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdatePartnerActivityOptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

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
  @IsArray()
  @IsString({ each: true })
  meetingTimes?: string[];

  @IsOptional()
  @IsEnum(AvailabilityMode)
  availabilityMode?: AvailabilityMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dailyCapacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpsertPartnerActivityOptionPricingDto {
  @IsString()
  @Equals("USD", { message: "Partner pricing currency must be USD" })
  @MaxLength(3)
  currency!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  priceType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityPricingTierDto)
  tiers!: ActivityPricingTierDto[];
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
