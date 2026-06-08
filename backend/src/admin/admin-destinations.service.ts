import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { DestinationType, Prisma } from "@prisma/client";
import {
  destinationParentInclude,
  formatDestinationBreadcrumb,
  getDestinationBreadcrumb
} from "../destinations/destination.util";
import { PrismaService } from "../prisma.service";
import { parseOptionalBoolean, slugify } from "./admin.util";
import type {
  AdminDestinationQueryDto,
  CreateAdminDestinationDto,
  UpdateAdminDestinationDto
} from "./dto/admin-destination.dto";

const destinationInclude = destinationParentInclude(4) satisfies Prisma.DestinationInclude;

@Injectable()
export class AdminDestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminDestinationQueryDto) {
    const where: Prisma.DestinationWhereInput = {};
    const isActive = parseOptionalBoolean(query.isActive);

    if (query.type) where.type = query.type;
    if (query.parentId) where.parentId = query.parentId;
    if (isActive !== undefined) where.isActive = isActive;

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { countryCode: { contains: search, mode: "insensitive" } }
      ];
    }

    const destinations = await this.prisma.destination.findMany({
      where,
      include: {
        ...destinationInclude,
        _count: {
          select: {
            activities: true,
            children: true
          }
        }
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    return destinations.map(withBreadcrumb);
  }

  async get(id: string) {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
      include: {
        ...destinationInclude,
        children: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
        },
        _count: {
          select: {
            activities: true,
            children: true
          }
        }
      }
    });

    if (!destination) {
      throw new NotFoundException({
        code: "DESTINATION_NOT_FOUND",
        message: "Destination was not found"
      });
    }

    return withBreadcrumb(destination);
  }

  async create(dto: CreateAdminDestinationDto, actorUserId: string) {
    const slug = this.resolveSlug(dto.slug, dto.name);
    await this.assertSlugAvailable(slug);
    await this.assertParentRules(dto.type, dto.parentId ?? null);

    const destination = await this.prisma.destination.create({
      data: {
        countryCode: normalizeNullable(dto.countryCode)?.toUpperCase(),
        description: normalizeNullable(dto.description),
        imageUrl: normalizeNullable(dto.imageUrl),
        isActive: dto.isActive ?? true,
        name: dto.name.trim(),
        parentId: dto.type === DestinationType.COUNTRY ? null : dto.parentId ?? null,
        slug,
        sortOrder: dto.sortOrder ?? 0,
        type: dto.type
      },
      include: destinationInclude
    });

    await this.audit(actorUserId, "DESTINATION_CREATED", destination.id, { slug });
    return withBreadcrumb(destination);
  }

  async update(id: string, dto: UpdateAdminDestinationDto, actorUserId: string) {
    const current = await this.get(id);
    const nextType = dto.type ?? current.type;
    const nextParentId =
      dto.parentId !== undefined
        ? dto.parentId
        : nextType === DestinationType.COUNTRY
        ? null
        : current.parentId ?? null;

    const slug =
      dto.slug !== undefined || dto.name !== undefined
        ? this.resolveSlug(dto.slug, dto.name ?? current.name)
        : undefined;

    if (slug) await this.assertSlugAvailable(slug, id);
    await this.assertParentRules(nextType, nextParentId, id);

    const destination = await this.prisma.destination.update({
      where: { id },
      data: {
        countryCode:
          dto.countryCode !== undefined ? normalizeNullable(dto.countryCode)?.toUpperCase() : undefined,
        description: dto.description !== undefined ? normalizeNullable(dto.description) : undefined,
        imageUrl: dto.imageUrl !== undefined ? normalizeNullable(dto.imageUrl) : undefined,
        isActive: dto.isActive,
        name: dto.name?.trim(),
        parentId: nextType === DestinationType.COUNTRY ? null : nextParentId,
        slug,
        sortOrder: dto.sortOrder,
        type: dto.type
      },
      include: destinationInclude
    });

    await this.audit(actorUserId, "DESTINATION_UPDATED", destination.id, {
      slug: destination.slug
    });
    return withBreadcrumb(destination);
  }

  async deactivate(id: string, actorUserId: string) {
    await this.get(id);
    const destination = await this.prisma.destination.update({
      where: { id },
      data: { isActive: false },
      include: destinationInclude
    });

    await this.audit(actorUserId, "DESTINATION_DEACTIVATED", destination.id, {
      slug: destination.slug
    });
    return withBreadcrumb(destination);
  }

  private resolveSlug(slug: string | undefined, fallbackName?: string) {
    const resolved = slugify(slug?.trim() || fallbackName?.trim() || "");
    if (!resolved) {
      throw new BadRequestException({
        code: "DESTINATION_SLUG_REQUIRED",
        message: "Destination slug could not be generated"
      });
    }
    return resolved;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.destination.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException({
        code: "DESTINATION_SLUG_TAKEN",
        message: "Destination slug is already used"
      });
    }
  }

  private async assertParentRules(
    type: DestinationType,
    parentId: string | null,
    destinationId?: string
  ) {
    if (type === DestinationType.COUNTRY) {
      if (parentId) {
        throw new BadRequestException({
          code: "COUNTRY_PARENT_INVALID",
          message: "Country destinations cannot have a parent"
        });
      }
      return;
    }

    if (!parentId) {
      throw new BadRequestException({
        code: "DESTINATION_PARENT_REQUIRED",
        message: "Region, city, and area destinations require a parent"
      });
    }

    if (destinationId && parentId === destinationId) {
      throw new BadRequestException({
        code: "DESTINATION_PARENT_SELF",
        message: "Destination cannot be its own parent"
      });
    }

    const parent = await this.prisma.destination.findUnique({
      where: { id: parentId },
      include: destinationInclude
    });

    if (!parent) {
      throw new BadRequestException({
        code: "DESTINATION_PARENT_NOT_FOUND",
        message: "Parent destination was not found"
      });
    }

    if (destinationId && getDestinationBreadcrumb(parent).some((item) => item.id === destinationId)) {
      throw new BadRequestException({
        code: "DESTINATION_PARENT_CIRCULAR",
        message: "Parent destination would create a circular hierarchy"
      });
    }
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
        entityType: "DESTINATION",
        metadata
      }
    });
  }
}

function withBreadcrumb<
  TDestination extends {
    id: string;
    name: string;
    slug: string;
    type: DestinationType;
    parent?: unknown;
  }
>(destination: TDestination) {
  const typedDestination = destination as unknown as Parameters<typeof getDestinationBreadcrumb>[0];
  return {
    ...destination,
    breadcrumb: getDestinationBreadcrumb(typedDestination),
    breadcrumbLabel: formatDestinationBreadcrumb(typedDestination)
  };
}

function normalizeNullable(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}
