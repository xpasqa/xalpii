import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePartnerProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
