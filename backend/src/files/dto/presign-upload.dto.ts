import { Type } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from "class-validator";
import { FileVisibility } from "@prisma/client";

export const fileUploadPurposes = [
  "CITY_IMAGE",
  "CATEGORY_IMAGE",
  "ACTIVITY_IMAGE",
  "PARTNER_DOCUMENT",
  "PROFILE_IMAGE"
] as const;

export type FileUploadPurpose = (typeof fileUploadPurposes)[number];

export class PresignUploadDto {
  @IsString()
  @MaxLength(255)
  originalName!: string;

  @IsString()
  @MaxLength(120)
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  sizeBytes!: number;

  @IsEnum(FileVisibility)
  visibility!: FileVisibility;

  @IsOptional()
  @IsIn(fileUploadPurposes)
  purpose?: FileUploadPurpose;
}
