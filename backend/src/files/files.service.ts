import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileVisibility } from "@prisma/client";
import { randomUUID } from "crypto";
import * as Minio from "minio";
import { PrismaService } from "../prisma.service";
import type { PresignUploadDto } from "./dto/presign-upload.dto";

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const pdfMimeType = "application/pdf";
const imageMaxSizeBytes = 5 * 1024 * 1024;
const pdfMaxSizeBytes = 10 * 1024 * 1024;
const presignExpirySeconds = 15 * 60;

@Injectable()
export class FilesService {
  private readonly minioClient: Minio.Client;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.minioClient = new Minio.Client({
      accessKey: this.requiredConfig("MINIO_ACCESS_KEY", "MINIO_ROOT_USER"),
      endPoint: this.config.get<string>("MINIO_ENDPOINT", "localhost"),
      port: Number(this.config.get<string>("MINIO_PORT", "9000")),
      secretKey: this.requiredConfig("MINIO_SECRET_KEY", "MINIO_ROOT_PASSWORD"),
      useSSL: parseBoolean(this.config.get<string>("MINIO_USE_SSL", "false"))
    });
  }

  async createPresignedUpload(dto: PresignUploadDto, userId: string) {
    this.validateUpload(dto);

    const bucket = this.bucketForVisibility(dto.visibility);
    const objectKey = this.buildObjectKey(dto, userId);
    const publicUrl =
      dto.visibility === FileVisibility.PUBLIC
        ? this.buildPublicUrl(bucket, objectKey)
        : null;

    const fileAsset = await this.prisma.fileAsset.create({
      data: {
        bucket,
        mimeType: dto.mimeType,
        objectKey,
        originalName: dto.originalName.trim(),
        sizeBytes: dto.sizeBytes,
        uploadedById: userId,
        url: publicUrl,
        visibility: dto.visibility
      }
    });

    const uploadUrl = await this.minioClient.presignedPutObject(
      bucket,
      objectKey,
      presignExpirySeconds
    );

    return {
      fileAsset,
      publicUrl,
      uploadUrl
    };
  }

  private validateUpload(dto: PresignUploadDto) {
    if (imageMimeTypes.has(dto.mimeType)) {
      if (dto.sizeBytes > imageMaxSizeBytes) {
        throw new BadRequestException({
          code: "FILE_TOO_LARGE",
          message: "Images must be 5MB or smaller"
        });
      }

      return;
    }

    if (dto.mimeType === pdfMimeType) {
      if (dto.visibility !== FileVisibility.PRIVATE) {
        throw new BadRequestException({
          code: "PDF_MUST_BE_PRIVATE",
          message: "PDF uploads must use private visibility"
        });
      }

      if (dto.sizeBytes > pdfMaxSizeBytes) {
        throw new BadRequestException({
          code: "FILE_TOO_LARGE",
          message: "PDF files must be 10MB or smaller"
        });
      }

      return;
    }

    throw new BadRequestException({
      code: "UNSUPPORTED_MIME_TYPE",
      message: "Unsupported file type"
    });
  }

  private bucketForVisibility(visibility: FileVisibility) {
    const key =
      visibility === FileVisibility.PUBLIC
        ? "MINIO_PUBLIC_BUCKET"
        : "MINIO_PRIVATE_BUCKET";
    const bucket = this.config.get<string>(key);

    if (!bucket) {
      throw new InternalServerErrorException({
        code: "MINIO_BUCKET_MISSING",
        message: `${key} is not configured`
      });
    }

    return bucket;
  }

  private buildObjectKey(dto: PresignUploadDto, userId: string) {
    const purpose = (dto.purpose ?? "PROFILE_IMAGE").toLowerCase();
    const safeName = dto.originalName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${purpose}/${userId}/${randomUUID()}-${safeName || "upload"}`;
  }

  private buildPublicUrl(bucket: string, objectKey: string) {
    const publicBaseUrl = this.config.get<string>("MINIO_PUBLIC_URL");
    if (!publicBaseUrl) {
      return null;
    }

    return `${publicBaseUrl.replace(/\/+$/, "")}/${bucket}/${objectKey}`;
  }

  private requiredConfig(primaryKey: string, fallbackKey: string) {
    const value =
      nonEmpty(this.config.get<string>(primaryKey)) ??
      nonEmpty(this.config.get<string>(fallbackKey));

    if (!value) {
      throw new InternalServerErrorException({
        code: "MINIO_CREDENTIALS_MISSING",
        message: `${primaryKey} or ${fallbackKey} must be configured`
      });
    }

    return value;
  }
}

function parseBoolean(value?: string) {
  return value === "true" || value === "1";
}

function nonEmpty(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
