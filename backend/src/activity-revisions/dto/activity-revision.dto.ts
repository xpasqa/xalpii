import { Allow, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateActivityRevisionDto {
  @Allow()
  snapshot!: unknown;
}

export class RejectActivityRevisionDto {
  @IsString()
  @MaxLength(2000)
  rejectionReason!: string;
}

export class ActivityRevisionQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
