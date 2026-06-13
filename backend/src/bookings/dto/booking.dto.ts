import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsArray,
  IsDateString,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";
import { ParticipantType, PickupChoice } from "@prisma/client";

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

export class BookingContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  fullName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phoneNumber!: string;

  @IsBoolean()
  marketingOptIn!: boolean;
}

export class BookingTravelerDto {
  @IsEnum(ParticipantType)
  participantType!: ParticipantType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class BookingPreferencesDto {
  @IsEnum(PickupChoice)
  pickupChoice!: PickupChoice;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequirements?: string;
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

  @ValidateNested()
  @IsDefined()
  @Type(() => BookingContactDto)
  contact!: BookingContactDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => BookingTravelerDto)
  travelers!: BookingTravelerDto[];

  @ValidateNested()
  @IsDefined()
  @Type(() => BookingPreferencesDto)
  preferences!: BookingPreferencesDto;
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
