import {
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PartnerStatus,
  PricingMode,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import {
  createVerifiedDemoReview,
  recalculateSeededActivityRating,
  verifiedReviewVoucherCode
} from "./helpers/verified-review";

const prisma = new PrismaClient();

type CitySeed = {
  name: string;
  slug: string;
  country: string;
  description: string;
  sortOrder: number;
};

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
};

type ActivitySeed = {
  title: string;
  slug: string;
  citySlug: string;
  destinationSlug: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  durationLabel: string;
  meetingPoint: string;
  cancellationPolicy: string;
  importantInfo: string;
  ratingAverage: string;
  reviewCount: number;
  currency: string;
  priceCents: number;
  coverUrl: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary: Array<{
    title: string;
    subtitle: string;
    durationLabel?: string;
    type?: string;
  }>;
};

type ActivityOptionSeed = {
  title: string;
  slug: string;
  description?: string;
  durationLabel?: string;
  meetingPoint?: string;
  availabilityMode: AvailabilityMode;
  availableDays?: string[];
  dailyCapacity?: number;
  isDefault?: boolean;
  sortOrder?: number;
  tierMultiplier?: number;
};

const demoPassword = "Password123!";

const cities: CitySeed[] = [
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

const categories: CategorySeed[] = [
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

const activities: ActivitySeed[] = [
  {
    title: "Nusa Penida One Day Trip with All-inclusive",
    slug: "nusa-penida-one-day-trip-all-inclusive",
    citySlug: "bali",
    destinationSlug: "nusa-penida",
    categorySlug: "adventure",
    shortDescription:
      "Visit Nusa Penida's signature cliffs, beaches, and island viewpoints in one polished all-inclusive day trip from Bali.",
    description:
      "Travel from Bali to Nusa Penida for a full-day island route with boat tickets, local transfers, guided coordination, and curated scenic stops included. The experience is designed for travelers who want a smooth one-day island escape with strong logistics, memorable viewpoints, and a clear end-to-end route.",
    durationLabel: "10 hours",
    meetingPoint: "Pickup from selected Bali areas before the fast boat departure.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo:
      "Bring sun protection, comfortable shoes, and a light layer for the boat crossing. Schedule and sea conditions may shift based on weather.",
    ratingAverage: "4.8",
    reviewCount: 932,
    currency: "USD",
    priceCents: 10080,
    coverUrl:
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1400&q=80",
    highlights: [
      "Round-trip transfers from your Bali hotel to the island are included",
      "An English-speaking driver/guide will show you around the island",
      "An Indonesian lunch is included in the price of the tour",
      "Private tour for just you and your party"
    ],
    included: [
      "Pick up and drop off",
      "Indonesian lunch",
      "A private car tour at Nusa Penida Island and Bali with English speaking driver",
      "Entry/Admission",
      "Fastboat return ticket"
    ],
    notIncluded: ["Souvenir photos", "Personal expense", "Gratitude (Optional)", "Insurance"],
    itinerary: [
      {
        title: "Hotel pickup",
        subtitle: "Early pickup from selected Bali areas and transfer to the harbor",
        durationLabel: "60 minutes",
        type: "start"
      },
      {
        title: "Fast boat crossing",
        subtitle: "Board the morning boat to Nusa Penida",
        durationLabel: "45 minutes",
        type: "stop"
      },
      {
        title: "Kelingking viewpoint",
        subtitle: "Scenic cliff viewpoint and photo stop",
        durationLabel: "45 minutes",
        type: "stop"
      },
      {
        title: "Angel's Billabong & Broken Beach",
        subtitle: "Explore the island's dramatic coastal formations",
        durationLabel: "60 minutes",
        type: "activity"
      },
      {
        title: "Local lunch",
        subtitle: "Enjoy an included Indonesian lunch",
        durationLabel: "45 minutes",
        type: "food"
      },
      {
        title: "Crystal Bay",
        subtitle: "Relaxed coastal stop before the return route",
        durationLabel: "45 minutes",
        type: "stop"
      },
      {
        title: "Return to Bali",
        subtitle: "Fast boat and transfer back to your pickup area",
        durationLabel: "2 hours",
        type: "end"
      }
    ]
  }
];

async function main() {
  const demoPasswordHash = await bcrypt.hash(demoPassword, 12);

  await prisma.bookingParticipant.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.review.deleteMany();
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

  const demoUser = await prisma.user.upsert({
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

  const reviewUsers = [
    demoUser,
    await upsertDemoReviewer(
      "reviewer.ayu@alpii.local",
      "Ayu Pradana",
      demoPasswordHash
    ),
    await upsertDemoReviewer(
      "reviewer.daniel@alpii.local",
      "Daniel Hartono",
      demoPasswordHash
    )
  ];

  const partner = await prisma.partner.upsert({
    where: { userId: partnerUser.id },
    update: {
      businessName: "Alpii Demo Experiences",
      status: PartnerStatus.APPROVED
    },
    create: {
      userId: partnerUser.id,
      businessName: "Alpii Demo Experiences",
      legalName: "Alpii Demo Experiences Ltd.",
      status: PartnerStatus.APPROVED,
      country: "Indonesia",
      city: "Bali",
      description: "Demo partner profile for seeded marketplace activities."
    }
  });

  const cityBySlug = new Map<string, string>();
  for (const city of cities) {
    const savedCity = await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city
    });
    cityBySlug.set(savedCity.slug, savedCity.id);
  }

  const categoryBySlug = new Map<string, string>();
  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
    categoryBySlug.set(savedCategory.slug, savedCategory.id);
  }

  const destinationBySlug = await seedDestinations();

  for (const activity of activities) {
    const cityId = cityBySlug.get(activity.citySlug);
    const destinationId = destinationBySlug.get(activity.destinationSlug);
    const categoryId = categoryBySlug.get(activity.categorySlug);

    if (!cityId || !categoryId || !destinationId) {
      throw new Error(`Missing city, category, or destination for activity ${activity.slug}`);
    }

    const savedActivity = await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: {
        partnerId: partner.id,
        cityId,
        destinationId,
        categoryId,
        title: activity.title,
        shortDescription: activity.shortDescription,
        description: activity.description,
        status: ActivityStatus.PUBLISHED,
        durationLabel: activity.durationLabel,
        meetingPoint: activity.meetingPoint,
        cancellationPolicy: activity.cancellationPolicy,
        importantInfo: activity.importantInfo,
        included: activity.included,
        notIncluded: activity.notIncluded,
        highlights: activity.highlights,
        itinerary: activity.itinerary as Prisma.InputJsonValue,
        ratingAverage: new Prisma.Decimal(0),
        reviewCount: 0,
        publishedAt: new Date(),
        pricingMode: PricingMode.GROUP_TIER
      },
      create: {
        partnerId: partner.id,
        cityId,
        destinationId,
        categoryId,
        title: activity.title,
        slug: activity.slug,
        shortDescription: activity.shortDescription,
        description: activity.description,
        status: ActivityStatus.PUBLISHED,
        durationLabel: activity.durationLabel,
        meetingPoint: activity.meetingPoint,
        cancellationPolicy: activity.cancellationPolicy,
        importantInfo: activity.importantInfo,
        included: activity.included,
        notIncluded: activity.notIncluded,
        highlights: activity.highlights,
        itinerary: activity.itinerary as Prisma.InputJsonValue,
        ratingAverage: new Prisma.Decimal(0),
        reviewCount: 0,
        publishedAt: new Date(),
        pricingMode: PricingMode.GROUP_TIER
      }
    });

    await prisma.activityPricing.deleteMany({ where: { activityId: savedActivity.id } });
    await prisma.activityPricingTier.deleteMany({ where: { activityId: savedActivity.id } });
    await prisma.activityMedia.deleteMany({ where: { activityId: savedActivity.id } });
    await prisma.activityAvailability.deleteMany({ where: { activityId: savedActivity.id } });
    await prisma.activityOption.deleteMany({ where: { activityId: savedActivity.id } });

    await prisma.activityPricing.create({
      data: {
        activityId: savedActivity.id,
        currency: activity.currency,
        priceCents: activity.priceCents,
        priceType: "per_person",
        isActive: true
      }
    });

    await prisma.activityPricingTier.createMany({
      data: buildPricingTiers().map((tier) => ({
        activityId: savedActivity.id,
        currency: "USD",
        priceType: "per_person",
        isActive: true,
        ...tier
      }))
    });

    await prisma.activityMedia.create({
      data: {
        activityId: savedActivity.id,
        url: activity.coverUrl,
        altText: activity.title,
        sortOrder: 0,
        isCover: true
      }
    });

    const optionSeeds = buildOptionSeeds(activity);
    const createdOptions: Array<{ id: string; isDefault: boolean }> = [];
    for (const optionSeed of optionSeeds) {
      const option = await prisma.activityOption.create({
        data: {
          activityId: savedActivity.id,
          availabilityMode: optionSeed.availabilityMode,
          availableDays: optionSeed.availableDays ?? undefined,
          dailyCapacity: optionSeed.dailyCapacity,
          description: optionSeed.description ?? activity.shortDescription,
          durationLabel: optionSeed.durationLabel ?? activity.durationLabel,
          isActive: true,
          isDefault: optionSeed.isDefault ?? false,
          meetingPoint: optionSeed.meetingPoint ?? activity.meetingPoint,
          slug: optionSeed.slug,
          sortOrder: optionSeed.sortOrder ?? 0,
          title: optionSeed.title
        }
      });
      createdOptions.push({ id: option.id, isDefault: option.isDefault });

      await prisma.activityOptionPricingTier.createMany({
        data: buildPricingTiers(optionSeed.tierMultiplier ?? 1).map((tier) => ({
          optionId: option.id,
          currency: "USD",
          priceType: "per_person",
          isActive: true,
          ...tier
        }))
      });

      if (optionSeed.availabilityMode === AvailabilityMode.SCHEDULED_SESSIONS) {
        await prisma.activityAvailability.createMany({
          data: [7, 14, 21].map((dayOffset) => {
            const startDateTime = new Date();
            startDateTime.setUTCDate(startDateTime.getUTCDate() + dayOffset);
            startDateTime.setUTCHours(9, 0, 0, 0);

            return {
              activityId: savedActivity.id,
              optionId: option.id,
              startDateTime,
              capacity: 12,
              bookedCount: 0,
              isActive: true
            };
          })
        });
      }
    }

    const defaultOption =
      createdOptions.find((option) => option.isDefault) ?? createdOptions[0];
    if (!defaultOption) {
      throw new Error(`No activity option was created for ${activity.slug}`);
    }

    const demoReviews = [
      {
        rating: 5,
        title: "A smooth island day",
        comment:
          "The transfers, guide coordination, and island route were handled clearly. We could focus on enjoying the viewpoints instead of worrying about logistics.",
        featured: true
      },
      {
        rating: 5,
        title: "Well organized from start to finish",
        comment:
          "Pickup was on time and the day moved at a comfortable pace. Lunch and the return boat were coordinated well, which made the experience feel reliable.",
        featured: true
      },
      {
        rating: 4,
        title: "Beautiful stops and helpful guide",
        comment:
          "The main viewpoints were memorable and our guide gave useful context throughout the day. It was a full schedule, but the organization made it manageable.",
        featured: false
      }
    ];

    for (const [index, review] of demoReviews.entries()) {
      await createVerifiedDemoReview(prisma, {
        activityId: savedActivity.id,
        approvedById: adminUser.id,
        comment: review.comment,
        featured: review.featured,
        optionId: defaultOption.id,
        rating: review.rating,
        title: review.title,
        totalAmountCents: activity.priceCents,
        userId: reviewUsers[index].id,
        voucherCode: verifiedReviewVoucherCode(activity.slug, index)
      });
    }

    await recalculateSeededActivityRating(prisma, savedActivity.id);
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: "SEED_DATABASE",
      entityType: "database",
      metadata: {
        users: 5,
        cities: cities.length,
        categories: categories.length,
        activities: activities.length
      }
    }
  });
}

async function upsertDemoReviewer(
  email: string,
  fullName: string,
  passwordHash: string
) {
  return prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    },
    create: {
      email,
      fullName,
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    }
  });
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
    return saved;
  }

  await upsertDestination({ name: "Indonesia", slug: "indonesia", type: DestinationType.COUNTRY, countryCode: "ID", sortOrder: 1 });
  await upsertDestination({ name: "Bali", slug: "bali", type: DestinationType.REGION, parentSlug: "indonesia", description: "Island culture, beaches, rice terraces, and local experiences.", sortOrder: 1 });
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

  await upsertDestination({ name: "United Arab Emirates", slug: "united-arab-emirates", type: DestinationType.COUNTRY, countryCode: "AE", sortOrder: 5 });
  await upsertDestination({ name: "Dubai", slug: "dubai", type: DestinationType.CITY, parentSlug: "united-arab-emirates", sortOrder: 1 });

  await upsertDestination({ name: "South Africa", slug: "south-africa", type: DestinationType.COUNTRY, countryCode: "ZA", sortOrder: 6 });
  await upsertDestination({ name: "Cape Town", slug: "cape-town", type: DestinationType.CITY, parentSlug: "south-africa", sortOrder: 1 });

  return destinationBySlug;
}

function buildOptionSeeds(activity: ActivitySeed): ActivityOptionSeed[] {
  if (activity.slug === "nusa-penida-one-day-trip-all-inclusive") {
    return [
      {
        title: "Standard experience + Ticket only",
        slug: "standard-experience-ticket-only",
        description:
          "Hike-free island day covering the signature west-side Nusa Penida viewpoints with ticketing and on-island transport coordinated.",
        availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
        availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        dailyCapacity: 30,
        isDefault: true,
        sortOrder: 0,
        tierMultiplier: 1
      },
      {
        title: "Nusa Penida Tour + Snorkeling",
        slug: "nusa-penida-tour-snorkeling",
        description:
          "Adds a snorkeling stop to the core island route while keeping transfers, local coordination, and a structured day plan included.",
        availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
        availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        dailyCapacity: 20,
        sortOrder: 1,
        tierMultiplier: 1
      }
    ];
  }

  return [
    {
      title: "Standard experience",
      slug: "standard-experience",
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      dailyCapacity: 12,
      isDefault: true,
      sortOrder: 0
    }
  ];
}

function buildPricingTiers(multiplier = 1) {
  const tiers = [
    { minTravelers: 1, maxTravelers: 1, adultPriceCents: 16221, childPriceCents: 11841 },
    { minTravelers: 2, maxTravelers: 2, adultPriceCents: 10080, childPriceCents: 7358 },
    { minTravelers: 3, maxTravelers: 3, adultPriceCents: 10080, childPriceCents: 7358 },
    { minTravelers: 4, maxTravelers: 4, adultPriceCents: 9960, childPriceCents: 7271 },
    { minTravelers: 5, maxTravelers: 6, adultPriceCents: 9720, childPriceCents: 7096 },
    { minTravelers: 7, maxTravelers: 9, adultPriceCents: 9480, childPriceCents: 6920 },
    { minTravelers: 10, maxTravelers: 12, adultPriceCents: 9240, childPriceCents: 6745 }
  ];

  return tiers.map((tier) => ({
    ...tier,
    adultPriceCents: Math.round(tier.adultPriceCents * multiplier),
    childPriceCents: Math.round(tier.childPriceCents * multiplier),
    childDiscountPercent: new Prisma.Decimal(27)
  }));
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
