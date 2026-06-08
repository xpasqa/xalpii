import {
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PricingMode,
  Prisma,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVITY_SLUG = "tokyo-shibuya-harajuku-local-food-walk";

const ALL_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

const ACTIVITY_DESCRIPTION =
  "Experience Tokyo through two neighborhoods that show the city’s energy from different angles. Start around Shibuya, where neon screens, busy crossings, station culture, and side streets reveal how Tokyo moves at street level.\n\nContinue toward Harajuku to explore youth culture, creative shops, smaller lanes, casual food stops, and the contrast between modern Tokyo and quieter local corners. Your guide keeps the route easy to follow while sharing context that helps first-time visitors understand the city beyond the obvious landmarks.\n\nChoose a simple walking tour, add curated street food tastings, or upgrade to a private culture and food experience. Each option is designed to be flexible, daily-available, and comfortable for travelers who want a guided Tokyo experience without a rigid group-tour feel.";

function childPrice(adultPriceCents: number, discountPercent = 27) {
  return Math.round(adultPriceCents * (1 - discountPercent / 100));
}

function withMultiplier(value: number, multiplier: number) {
  return Math.round(value * multiplier);
}

async function ensureCity() {
  return prisma.city.upsert({
    where: { slug: "tokyo" },
    update: {
      name: "Tokyo",
      country: "Japan",
      description:
        "Japan’s capital, known for neon crossings, food culture, creative neighborhoods, temples, shopping streets, and local urban experiences.",
      isActive: true,
      sortOrder: 2
    },
    create: {
      name: "Tokyo",
      slug: "tokyo",
      country: "Japan",
      description:
        "Japan’s capital, known for neon crossings, food culture, creative neighborhoods, temples, shopping streets, and local urban experiences.",
      isActive: true,
      sortOrder: 2
    }
  });
}

async function ensureDestinationTree() {
  const japan = await prisma.destination.upsert({
    where: { slug: "japan" },
    update: {
      name: "Japan",
      type: DestinationType.COUNTRY,
      countryCode: "JP",
      isActive: true,
      sortOrder: 2
    },
    create: {
      name: "Japan",
      slug: "japan",
      type: DestinationType.COUNTRY,
      countryCode: "JP",
      isActive: true,
      sortOrder: 2
    }
  });

  return prisma.destination.upsert({
    where: { slug: "tokyo" },
    update: {
      name: "Tokyo",
      type: DestinationType.CITY,
      parentId: japan.id,
      countryCode: "JP",
      description:
        "Japan’s capital, known for neon crossings, food culture, creative neighborhoods, temples, shopping streets, and local urban experiences.",
      isActive: true,
      sortOrder: 1
    },
    create: {
      name: "Tokyo",
      slug: "tokyo",
      type: DestinationType.CITY,
      parentId: japan.id,
      countryCode: "JP",
      description:
        "Japan’s capital, known for neon crossings, food culture, creative neighborhoods, temples, shopping streets, and local urban experiences.",
      isActive: true,
      sortOrder: 1
    }
  });
}

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: "food-culture" },
    update: {
      name: "Food & Culture",
      description: "Guided cultural walks, local food experiences, and neighborhood storytelling.",
      icon: "utensils",
      isActive: true,
      sortOrder: 7
    },
    create: {
      name: "Food & Culture",
      slug: "food-culture",
      description: "Guided cultural walks, local food experiences, and neighborhood storytelling.",
      icon: "utensils",
      isActive: true,
      sortOrder: 7
    }
  });
}

async function getPartner() {
  const user = await prisma.user.findUnique({
    where: { email: "partner@alpii.local" },
    include: { partner: true }
  });

  if (!user?.partner) {
    throw new Error("Partner partner@alpii.local not found. Run prisma seed first.");
  }

  return user.partner;
}

const basePricingTiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 11000 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 8200 },
  { minTravelers: 3, maxTravelers: 3, adultPriceCents: 7400 },
  { minTravelers: 4, maxTravelers: 4, adultPriceCents: 6800 },
  { minTravelers: 5, maxTravelers: 6, adultPriceCents: 6300 },
  { minTravelers: 7, maxTravelers: 9, adultPriceCents: 5900 },
  { minTravelers: 10, maxTravelers: 12, adultPriceCents: 5500 }
];

const options = [
  {
    title: "Shibuya & Harajuku Walking Tour",
    slug: "shibuya-harajuku-walking-tour",
    description:
      "A relaxed guided walk through two of Tokyo’s most iconic neighborhoods, covering Shibuya Crossing, hidden side streets, Harajuku culture, and local lifestyle stories.",
    durationLabel: "2.5 hours",
    dailyCapacity: 18,
    multiplier: 1,
    isDefault: true,
    sortOrder: 0
  },
  {
    title: "Street Food Tasting Walk",
    slug: "street-food-tasting-walk",
    description:
      "Explore Shibuya and Harajuku with curated local snack stops, casual food tastings, and a guide who explains Tokyo’s food habits, youth culture, and neighborhood rhythm.",
    durationLabel: "3.5 hours",
    dailyCapacity: 14,
    multiplier: 1.35,
    isDefault: false,
    sortOrder: 1
  },
  {
    title: "Private Local Culture + Food Experience",
    slug: "private-local-culture-food-experience",
    description:
      "A private version of the Tokyo walk with a flexible pace, deeper local context, selected food stops, and a more personal guide-led experience for couples, families, or small groups.",
    durationLabel: "4 hours",
    dailyCapacity: 10,
    multiplier: 1.8,
    isDefault: false,
    sortOrder: 2
  }
];

async function upsertMedia(activityId: string) {
  await prisma.activityMedia.deleteMany({
    where: { activityId }
  });

  const media = [
    {
      url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
      altText: "Tokyo skyline and city lights",
      isCover: true,
      sortOrder: 0
    },
    {
      url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1600&q=80",
      altText: "Tokyo street and neighborhood atmosphere",
      isCover: false,
      sortOrder: 1
    },
    {
      url: "https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=1600&q=80",
      altText: "Japanese food and local dining experience",
      isCover: false,
      sortOrder: 2
    }
  ];

  for (const item of media) {
    await prisma.activityMedia.create({
      data: {
        activityId,
        url: item.url,
        altText: item.altText,
        isCover: item.isCover,
        sortOrder: item.sortOrder
      }
    });
  }
}

async function upsertLegacyActivityPricing(activityId: string) {
  await prisma.activityPricing.deleteMany({
    where: { activityId }
  });

  await prisma.activityPricing.create({
    data: {
      activityId,
      currency: "USD",
      priceCents: 5500,
      priceType: "per_person",
      isActive: true
    }
  });

  await prisma.activityPricingTier.deleteMany({
    where: { activityId }
  });

  for (const tier of basePricingTiers) {
    const adultPriceCents = tier.adultPriceCents;
    const childPriceCents = childPrice(adultPriceCents);

    await prisma.activityPricingTier.create({
      data: {
        activityId,
        currency: "USD",
        minTravelers: tier.minTravelers,
        maxTravelers: tier.maxTravelers,
        adultPriceCents,
        childPriceCents,
        childDiscountPercent: new Prisma.Decimal(27),
        priceType: "per_person",
        isActive: true
      }
    });
  }
}

async function upsertOptions(activityId: string) {
  await prisma.activityOption.updateMany({
    where: { activityId },
    data: { isDefault: false }
  });

  for (const item of options) {
    const option = await prisma.activityOption.upsert({
      where: {
        activityId_slug: {
          activityId,
          slug: item.slug
        }
      },
      update: {
        title: item.title,
        description: item.description,
        durationLabel: item.durationLabel,
        meetingPoint:
          "Meet your guide near Shibuya Station. The exact meeting point will be shown on your voucher after booking.",
        availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
        availableDays: ALL_DAYS,
        dailyCapacity: item.dailyCapacity,
        isDefault: item.isDefault,
        isActive: true,
        sortOrder: item.sortOrder
      },
      create: {
        activityId,
        title: item.title,
        slug: item.slug,
        description: item.description,
        durationLabel: item.durationLabel,
        meetingPoint:
          "Meet your guide near Shibuya Station. The exact meeting point will be shown on your voucher after booking.",
        availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
        availableDays: ALL_DAYS,
        dailyCapacity: item.dailyCapacity,
        isDefault: item.isDefault,
        isActive: true,
        sortOrder: item.sortOrder
      }
    });

    await prisma.activityOptionPricingTier.deleteMany({
      where: { optionId: option.id }
    });

    for (const tier of basePricingTiers) {
      const adultPriceCents = withMultiplier(tier.adultPriceCents, item.multiplier);
      const childPriceCents = childPrice(adultPriceCents);

      await prisma.activityOptionPricingTier.create({
        data: {
          optionId: option.id,
          currency: "USD",
          minTravelers: tier.minTravelers,
          maxTravelers: tier.maxTravelers,
          adultPriceCents,
          childPriceCents,
          childDiscountPercent: new Prisma.Decimal(27),
          priceType: "per_person",
          isActive: true
        }
      });
    }
  }
}

async function main() {
  const partner = await getPartner();
  const city = await ensureCity();
  const destination = await ensureDestinationTree();
  const category = await ensureCategory();

  const activity = await prisma.activity.upsert({
    where: { slug: ACTIVITY_SLUG },
    update: {
      partnerId: partner.id,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: "Tokyo Shibuya, Harajuku & Local Food Walk",
      shortDescription:
        "Discover Tokyo’s city rhythm through Shibuya, Harajuku, local streets, cultural stories, and optional food tastings.",
      description: ACTIVITY_DESCRIPTION,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.GROUP_TIER,
      ratingAverage: new Prisma.Decimal("4.8"),
      reviewCount: 684,
      durationLabel: "2.5 - 4 hours",
      meetingPoint:
        "Meet your guide near Shibuya Station. The exact meeting point will be shown on your voucher after booking.",
      cancellationPolicy: "Cancel up to 24 hours before the activity starts for a full refund.",
      importantInfo:
        "Bring comfortable walking shoes and weather-appropriate clothing. Food tastings are included only when selected in your package option. The route may be adjusted slightly depending on local crowd levels and weather.",
      highlights: [
        "Walk through Shibuya and Harajuku with a local guide",
        "See Tokyo’s famous crossing, side streets, and creative neighborhood corners",
        "Learn about local food habits, youth culture, and everyday city life",
        "Choose between walking-only, street food, or private experience options",
        "Enjoy a flexible daily-available activity without fixed partner session updates"
      ],
      included: [
        "Local guide",
        "Guided walking route",
        "Cultural storytelling",
        "Food tastings for selected packages",
        "Private guide for selected package"
      ],
      notIncluded: [
        "Hotel pickup",
        "Public transportation tickets",
        "Extra food and drinks outside selected package",
        "Personal expenses",
        "Tips"
      ],
      publishedAt: new Date()
    },
    create: {
      partnerId: partner.id,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: "Tokyo Shibuya, Harajuku & Local Food Walk",
      slug: ACTIVITY_SLUG,
      shortDescription:
        "Discover Tokyo’s city rhythm through Shibuya, Harajuku, local streets, cultural stories, and optional food tastings.",
      description: ACTIVITY_DESCRIPTION,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.GROUP_TIER,
      ratingAverage: new Prisma.Decimal("4.8"),
      reviewCount: 684,
      durationLabel: "2.5 - 4 hours",
      meetingPoint:
        "Meet your guide near Shibuya Station. The exact meeting point will be shown on your voucher after booking.",
      cancellationPolicy: "Cancel up to 24 hours before the activity starts for a full refund.",
      importantInfo:
        "Bring comfortable walking shoes and weather-appropriate clothing. Food tastings are included only when selected in your package option. The route may be adjusted slightly depending on local crowd levels and weather.",
      highlights: [
        "Walk through Shibuya and Harajuku with a local guide",
        "See Tokyo’s famous crossing, side streets, and creative neighborhood corners",
        "Learn about local food habits, youth culture, and everyday city life",
        "Choose between walking-only, street food, or private experience options",
        "Enjoy a flexible daily-available activity without fixed partner session updates"
      ],
      included: [
        "Local guide",
        "Guided walking route",
        "Cultural storytelling",
        "Food tastings for selected packages",
        "Private guide for selected package"
      ],
      notIncluded: [
        "Hotel pickup",
        "Public transportation tickets",
        "Extra food and drinks outside selected package",
        "Personal expenses",
        "Tips"
      ],
      publishedAt: new Date()
    }
  });

  await upsertMedia(activity.id);
  await upsertLegacyActivityPricing(activity.id);
  await upsertOptions(activity.id);

  await prisma.auditLog.create({
    data: {
      action: "IMPORT_DEMO_ACTIVITY",
      entityType: "activity",
      entityId: activity.id,
      metadata: {
        slug: ACTIVITY_SLUG,
        destination: "tokyo",
        city: "tokyo",
        options: options.length,
        pricingTiersPerOption: basePricingTiers.length,
        baseCurrency: "USD"
      }
    }
  });

  console.log("Imported Tokyo activity successfully.");
  console.log(`Activity: ${activity.title}`);
  console.log(`Slug: ${activity.slug}`);
  console.log(`Options: ${options.length}`);
  console.log(`Pricing tiers per option: ${basePricingTiers.length}`);
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
