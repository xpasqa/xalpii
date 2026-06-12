import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";
import { ParticipantType } from "@prisma/client";

export class BookingParticipantDto {
  @IsOptional()
  @IsEnum(ParticipantType)
  participantType?: ParticipantType;

  @IsString()
  @MaxLength(80)
  label!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateBookingDto {
  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  availabilityId?: string;

  @IsOptional()
  @IsString()
  optionId?: string;

  @IsOptional()
  @IsDateString()
  selectedDate?: string;

  @IsOptional()
  @IsString()
  meetingTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingParticipantDto)
  participants!: BookingParticipantDto[];
}

export class ValidateVoucherDto {
  @IsString()
  code!: string;
}

export class PartnerBookingQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminBookingQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
