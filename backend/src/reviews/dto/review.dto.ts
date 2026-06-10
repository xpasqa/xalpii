import { IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ReviewMediaStatus, ReviewStatus } from "@prisma/client";

export class ReviewMediaInputDto {
  @IsOptional()
  @IsUUID()
  fileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  sortOrder?: number;
}

export class CreateReviewDto {
  @IsUUID()
  bookingId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  comment!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewMediaInputDto)
  media?: ReviewMediaInputDto[];
}

export class PublicReviewQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsIn(["featured", "newest", "highest", "lowest"])
  sort?: "featured" | "newest" | "highest" | "lowest";
}

export class AdminReviewQueryDto {
  @IsOptional()
  @IsIn(Object.values(ReviewStatus))
  status?: ReviewStatus;

  @IsOptional()
  @IsUUID()
  activityId?: string;

  @IsOptional()
  @IsString()
  rating?: string;

  @IsOptional()
  @IsString()
  isFeatured?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class UpdateAdminReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  adminEditedTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  adminEditedComment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  moderationNote?: string;

  @IsOptional()
  isFeatured?: boolean;

  @IsOptional()
  @IsIn(Object.values(ReviewStatus))
  status?: ReviewStatus;
}

export class UpdateReviewMediaDto {
  @IsOptional()
  @IsIn(Object.values(ReviewMediaStatus))
  status?: ReviewMediaStatus;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  altText?: string;
}
