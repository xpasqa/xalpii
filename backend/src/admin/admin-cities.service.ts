import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { parseOptionalBoolean, slugify } from "./admin.util";
import type {
  AdminCityQueryDto,
  CreateAdminCityDto,
  UpdateAdminCityDto
} from "./dto/admin-city.dto";

@Injectable()
export class AdminCitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminCityQueryDto) {
    const where: Prisma.CityWhereInput = {};
    const isActive = parseOptionalBoolean(query.isActive);

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.city.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      }
    });
  }

  async get(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      }
    });

    if (!city) {
      throw new NotFoundException({
        code: "CITY_NOT_FOUND",
        message: "City was not found"
      });
    }

    return city;
  }

  async create(dto: CreateAdminCityDto, actorUserId: string) {
    const slug = this.resolveSlug(dto.slug, dto.name);
    await this.assertSlugAvailable(slug);

    const city = await this.prisma.city.create({
      data: {
        country: dto.country.trim(),
        description: this.optionalText(dto.description),
        imageFileId: dto.imageFileId,
        isActive: dto.isActive ?? true,
        name: dto.name.trim(),
        slug,
        sortOrder: dto.sortOrder ?? 0
      }
    });

    await this.audit(actorUserId, "CITY_CREATED", city.id, { slug: city.slug });
    return city;
  }

  async update(id: string, dto: UpdateAdminCityDto, actorUserId: string) {
    await this.get(id);

    const nextSlug =
      dto.slug !== undefined || dto.name !== undefined
        ? this.resolveSlug(dto.slug, dto.name)
        : undefined;

    if (nextSlug) {
      await this.assertSlugAvailable(nextSlug, id);
    }

    const city = await this.prisma.city.update({
      where: { id },
      data: {
        country: dto.country?.trim(),
        description:
          dto.description !== undefined ? this.optionalText(dto.description) : undefined,
        imageFileId: dto.imageFileId,
        isActive: dto.isActive,
        name: dto.name?.trim(),
        slug: nextSlug,
        sortOrder: dto.sortOrder
      }
    });

    await this.audit(actorUserId, "CITY_UPDATED", city.id, { slug: city.slug });
    return city;
  }

  async deactivate(id: string, actorUserId: string) {
    await this.get(id);
    const city = await this.prisma.city.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    await this.audit(actorUserId, "CITY_DEACTIVATED", city.id, { slug: city.slug });
    return city;
  }

  private resolveSlug(slug: string | undefined, fallbackName?: string) {
    const value = slug?.trim() || fallbackName?.trim();
    const resolved = value ? slugify(value) : "";

    if (!resolved) {
      throw new ConflictException({
        code: "CITY_SLUG_REQUIRED",
        message: "City slug could not be generated"
      });
    }

    return resolved;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.city.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException({
        code: "CITY_SLUG_TAKEN",
        message: "City slug is already used"
      });
    }
  }

  private optionalText(value?: string | null) {
    const normalized = value?.trim();
    return normalized || null;
  }

  private async audit(
    actorUserId: string,
    action: string,
    entityId: string,
    metadata?: Prisma.InputJsonValue
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        actorUserId,
        entityId,
        entityType: "CITY",
        metadata
      }
    });
  }
}
