import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { parseOptionalBoolean, slugify } from "./admin.util";
import type {
  AdminCategoryQueryDto,
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto
} from "./dto/admin-category.dto";

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminCategoryQueryDto) {
    const where: Prisma.CategoryWhereInput = {};
    const isActive = parseOptionalBoolean(query.isActive);

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { icon: { contains: search, mode: "insensitive" } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.category.findMany({
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
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      }
    });

    if (!category) {
      throw new NotFoundException({
        code: "CATEGORY_NOT_FOUND",
        message: "Category was not found"
      });
    }

    return category;
  }

  async create(dto: CreateAdminCategoryDto, actorUserId: string) {
    const slug = this.resolveSlug(dto.slug, dto.name);
    await this.assertSlugAvailable(slug);

    const category = await this.prisma.category.create({
      data: {
        description: this.optionalText(dto.description),
        icon: this.optionalText(dto.icon),
        isActive: dto.isActive ?? true,
        name: dto.name.trim(),
        slug,
        sortOrder: dto.sortOrder ?? 0
      }
    });

    await this.audit(actorUserId, "CATEGORY_CREATED", category.id, {
      slug: category.slug
    });
    return category;
  }

  async update(id: string, dto: UpdateAdminCategoryDto, actorUserId: string) {
    await this.get(id);

    const nextSlug =
      dto.slug !== undefined || dto.name !== undefined
        ? this.resolveSlug(dto.slug, dto.name)
        : undefined;

    if (nextSlug) {
      await this.assertSlugAvailable(nextSlug, id);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        description:
          dto.description !== undefined ? this.optionalText(dto.description) : undefined,
        icon: dto.icon !== undefined ? this.optionalText(dto.icon) : undefined,
        isActive: dto.isActive,
        name: dto.name?.trim(),
        slug: nextSlug,
        sortOrder: dto.sortOrder
      }
    });

    await this.audit(actorUserId, "CATEGORY_UPDATED", category.id, {
      slug: category.slug
    });
    return category;
  }

  async deactivate(id: string, actorUserId: string) {
    await this.get(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    await this.audit(actorUserId, "CATEGORY_DEACTIVATED", category.id, {
      slug: category.slug
    });
    return category;
  }

  private resolveSlug(slug: string | undefined, fallbackName?: string) {
    const value = slug?.trim() || fallbackName?.trim();
    const resolved = value ? slugify(value) : "";

    if (!resolved) {
      throw new ConflictException({
        code: "CATEGORY_SLUG_REQUIRED",
        message: "Category slug could not be generated"
      });
    }

    return resolved;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException({
        code: "CATEGORY_SLUG_TAKEN",
        message: "Category slug is already used"
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
        entityType: "CATEGORY",
        metadata
      }
    });
  }
}
