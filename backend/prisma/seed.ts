import { DestinationType, PartnerStatus, PrismaClient, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const demoPassword = "Password123!";

const cities = [
  {
    name: "Bali",
    slug: "bali",
    country: "Indonesia",
    description: "Island culture, rice terraces, beaches, temples, and local food experiences.",
    sortOrder: 1
  },
  {
    name: "Tokyo",
    slug: "tokyo",
    country: "Japan",
    description: "Layered city life, food walks, craft workshops, temples, and modern culture.",
    sortOrder: 2
  },
  {
    name: "Paris",
    slug: "paris",
    country: "France",
    description: "Museums, river cruises, intimate food moments, and historic walking routes.",
    sortOrder: 3
  },
  {
    name: "Zurich",
    slug: "zurich",
    country: "Switzerland",
    description: "Old town lanes, lakeside experiences, chocolate stops, and alpine access.",
    sortOrder: 4
  },
  {
    name: "Dubai",
    slug: "dubai",
    country: "United Arab Emirates",
    description: "Desert conservation, skyline views, food culture, and refined outdoor experiences.",
    sortOrder: 5
  },
  {
    name: "Cape Town",
    slug: "cape-town",
    country: "South Africa",
    description: "Coastal views, mountain routes, local markets, and nature-led city escapes.",
    sortOrder: 6
  }
];

const categories = [
  {
    name: "Cultural Experience",
    slug: "cultural-experience",
    description: "Local traditions, heritage, rituals, and cultural moments.",
    icon: "landmark",
    sortOrder: 1
  },
  {
    name: "Food & Cooking",
    slug: "food-cooking",
    description: "Market visits, cooking classes, tastings, and local dining.",
    icon: "utensils",
    sortOrder: 2
  },
  {
    name: "Adventure",
    slug: "adventure",
    description: "Outdoor activities, scenic routes, and active experiences.",
    icon: "mountain",
    sortOrder: 3
  },
  {
    name: "Water Activity",
    slug: "water-activity",
    description: "Lakes, coastlines, paddling, cruises, and gentle water adventures.",
    icon: "waves",
    sortOrder: 4
  },
  {
    name: "Guided Tour",
    slug: "guided-tour",
    description: "Expert-led walks, city routes, and structured discovery.",
    icon: "map",
    sortOrder: 5
  },
  {
    name: "Workshop",
    slug: "workshop",
    description: "Hands-on classes, craft sessions, and skill-led local activities.",
    icon: "brush",
    sortOrder: 6
  }
];

async function main() {
  const demoPasswordHash = await bcrypt.hash(demoPassword, 12);

  await clearMarketplaceDemoData();

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@alpii.local" },
    update: {
      fullName: "Alpii Admin",
      passwordHash: demoPasswordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      email: "admin@alpii.local",
      passwordHash: demoPasswordHash,
      fullName: "Alpii Admin",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: "partner@alpii.local" },
    update: {
      fullName: "Alpii Demo Partner",
      passwordHash: demoPasswordHash,
      role: UserRole.PARTNER,
      status: UserStatus.ACTIVE
    },
    create: {
      email: "partner@alpii.local",
      passwordHash: demoPasswordHash,
      fullName: "Alpii Demo Partner",
      role: UserRole.PARTNER,
      status: UserStatus.ACTIVE
    }
  });

  await prisma.user.upsert({
    where: { email: "user@alpii.local" },
    update: {
      fullName: "Alpii Demo User",
      passwordHash: demoPasswordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    },
    create: {
      email: "user@alpii.local",
      passwordHash: demoPasswordHash,
      fullName: "Alpii Demo User",
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    }
  });

  await prisma.partner.upsert({
    where: { userId: partnerUser.id },
    update: {
      businessName: "Alpii Demo Experiences",
      legalName: "Alpii Demo Experiences Ltd.",
      status: PartnerStatus.APPROVED,
      country: "Indonesia",
      city: "Bali",
      description: "Demo partner profile for local development."
    },
    create: {
      userId: partnerUser.id,
      businessName: "Alpii Demo Experiences",
      legalName: "Alpii Demo Experiences Ltd.",
      status: PartnerStatus.APPROVED,
      country: "Indonesia",
      city: "Bali",
      description: "Demo partner profile for local development."
    }
  });

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  await seedDestinations();

  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: "SEED_MASTER_DATA",
      entityType: "database",
      metadata: {
        users: 3,
        cities: cities.length,
        categories: categories.length,
        activities: 0
      }
    }
  });

  console.log("Seeded master data only. No activities, bookings, vouchers, payments, or reviews were created.");
}

async function clearMarketplaceDemoData() {
  await prisma.reviewMedia.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingParticipant.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.activityRevision.deleteMany();
  await prisma.activityOptionDateInventory.deleteMany();
  await prisma.activityAvailability.deleteMany();
  await prisma.activityOptionPricingTier.deleteMany();
  await prisma.activityOption.deleteMany();
  await prisma.activityPricingTier.deleteMany();
  await prisma.activityPricing.deleteMany();
  await prisma.activityMedia.deleteMany();
  await prisma.activity.deleteMany();
}

async function seedDestinations() {
  const destinationBySlug = new Map<string, string>();

  async function upsertDestination(input: {
    name: string;
    slug: string;
    type: DestinationType;
    parentSlug?: string;
    countryCode?: string;
    description?: string;
    sortOrder?: number;
  }) {
    const parentId = input.parentSlug ? destinationBySlug.get(input.parentSlug) : null;
    if (input.parentSlug && !parentId) {
      throw new Error(`Missing parent destination ${input.parentSlug} for ${input.slug}`);
    }

    const saved = await prisma.destination.upsert({
      where: { slug: input.slug },
      update: {
        countryCode: input.countryCode,
        description: input.description,
        isActive: true,
        name: input.name,
        parentId,
        sortOrder: input.sortOrder ?? 0,
        type: input.type
      },
      create: {
        countryCode: input.countryCode,
        description: input.description,
        isActive: true,
        name: input.name,
        parentId,
        slug: input.slug,
        sortOrder: input.sortOrder ?? 0,
        type: input.type
      }
    });

    destinationBySlug.set(saved.slug, saved.id);
  }

  await upsertDestination({
    name: "Indonesia",
    slug: "indonesia",
    type: DestinationType.COUNTRY,
    countryCode: "ID",
    sortOrder: 1
  });
  await upsertDestination({
    name: "Bali",
    slug: "bali",
    type: DestinationType.REGION,
    parentSlug: "indonesia",
    description: "Island culture, beaches, rice terraces, and local experiences.",
    sortOrder: 1
  });
  await upsertDestination({ name: "Ubud", slug: "ubud", type: DestinationType.AREA, parentSlug: "bali", sortOrder: 1 });
  await upsertDestination({ name: "Kuta", slug: "kuta", type: DestinationType.AREA, parentSlug: "bali", sortOrder: 2 });
  await upsertDestination({ name: "Canggu", slug: "canggu", type: DestinationType.AREA, parentSlug: "bali", sortOrder: 3 });
  await upsertDestination({ name: "Seminyak", slug: "seminyak", type: DestinationType.AREA, parentSlug: "bali", sortOrder: 4 });
  await upsertDestination({ name: "Kintamani", slug: "kintamani", type: DestinationType.AREA, parentSlug: "bali", sortOrder: 5 });
  await upsertDestination({ name: "Nusa Penida", slug: "nusa-penida", type: DestinationType.AREA, parentSlug: "bali", sortOrder: 6 });

  await upsertDestination({ name: "Japan", slug: "japan", type: DestinationType.COUNTRY, countryCode: "JP", sortOrder: 2 });
  await upsertDestination({ name: "Tokyo", slug: "tokyo", type: DestinationType.CITY, parentSlug: "japan", sortOrder: 1 });

  await upsertDestination({ name: "France", slug: "france", type: DestinationType.COUNTRY, countryCode: "FR", sortOrder: 3 });
  await upsertDestination({ name: "Paris", slug: "paris", type: DestinationType.CITY, parentSlug: "france", sortOrder: 1 });

  await upsertDestination({ name: "Switzerland", slug: "switzerland", type: DestinationType.COUNTRY, countryCode: "CH", sortOrder: 4 });
  await upsertDestination({ name: "Zurich", slug: "zurich", type: DestinationType.CITY, parentSlug: "switzerland", sortOrder: 1 });
  await upsertDestination({ name: "Interlaken", slug: "interlaken", type: DestinationType.CITY, parentSlug: "switzerland", sortOrder: 2 });

  await upsertDestination({
    name: "United Arab Emirates",
    slug: "united-arab-emirates",
    type: DestinationType.COUNTRY,
    countryCode: "AE",
    sortOrder: 5
  });
  await upsertDestination({ name: "Dubai", slug: "dubai", type: DestinationType.CITY, parentSlug: "united-arab-emirates", sortOrder: 1 });

  await upsertDestination({ name: "South Africa", slug: "south-africa", type: DestinationType.COUNTRY, countryCode: "ZA", sortOrder: 6 });
  await upsertDestination({ name: "Cape Town", slug: "cape-town", type: DestinationType.CITY, parentSlug: "south-africa", sortOrder: 1 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
