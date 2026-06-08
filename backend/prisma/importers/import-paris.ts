import {
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PricingMode,
  Prisma,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVITY_SLUG = "paris-icons-seine-montmartre-city-experience";

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
  "See Paris through the places that make the city unforgettable: the Eiffel Tower area, the Seine, elegant bridges, the Louvre courtyard, Île de la Cité, Notre-Dame, and the village-like streets of Montmartre.\n\nThis experience is designed for first-time visitors who want a curated Paris overview without trying to solve the city alone. Your local host keeps the route realistic, explains the context behind each landmark, and helps you understand how Paris connects through its river, neighborhoods, monuments, cafés, and everyday street life.\n\nChoose a classic walking route, add a Seine cruise, or book a private highlights experience for a more comfortable pace. This is a city experience focused on exterior landmarks, orientation, storytelling, and optional add-on experiences depending on the package selected.";

function childPrice(adultPriceCents: number, discountPercent = 27) {
  return Math.round(adultPriceCents * (1 - discountPercent / 100));
}

function withMultiplier(value: number, multiplier: number) {
  return Math.round(value * multiplier);
}

async function ensureCity() {
  return prisma.city.upsert({
    where: { slug: "paris" },
    update: {
      name: "Paris",
      country: "France",
      description:
        "France’s capital, known for the Eiffel Tower, the Seine, museums, cafés, historic boulevards, fashion, and romantic city walks.",
      isActive: true,
      sortOrder: 3
    },
    create: {
      name: "Paris",
      slug: "paris",
      country: "France",
      description:
        "France’s capital, known for the Eiffel Tower, the Seine, museums, cafés, historic boulevards, fashion, and romantic city walks.",
      isActive: true,
      sortOrder: 3
    }
  });
}

async function ensureDestinationTree() {
  const france = await prisma.destination.upsert({
    where: { slug: "france" },
    update: {
      name: "France",
      type: DestinationType.COUNTRY,
      countryCode: "FR",
      isActive: true,
      sortOrder: 3
    },
    create: {
      name: "France",
      slug: "france",
      type: DestinationType.COUNTRY,
      countryCode: "FR",
      isActive: true,
      sortOrder: 3
    }
  });

  return prisma.destination.upsert({
    where: { slug: "paris" },
    update: {
      name: "Paris",
      type: DestinationType.CITY,
      parentId: france.id,
      countryCode: "FR",
      description:
        "France’s capital city, centered around the Seine and known for world-famous landmarks, museums, cafés, food culture, and local neighborhoods.",
      isActive: true,
      sortOrder: 1
    },
    create: {
      name: "Paris",
      slug: "paris",
      type: DestinationType.CITY,
      parentId: france.id,
      countryCode: "FR",
      description:
        "France’s capital city, centered around the Seine and known for world-famous landmarks, museums, cafés, food culture, and local neighborhoods.",
      isActive: true,
      sortOrder: 1
    }
  });
}

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: "city-highlights" },
    update: {
      name: "City Highlights",
      description: "Curated first-time city experiences covering landmarks, neighborhoods, and local stories.",
      icon: "landmark",
      isActive: true,
      sortOrder: 8
    },
    create: {
      name: "City Highlights",
      slug: "city-highlights",
      description: "Curated first-time city experiences covering landmarks, neighborhoods, and local stories.",
      icon: "landmark",
      isActive: true,
      sortOrder: 8
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
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 14500 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 9800 },
  { minTravelers: 3, maxTravelers: 3, adultPriceCents: 8600 },
  { minTravelers: 4, maxTravelers: 4, adultPriceCents: 7800 },
  { minTravelers: 5, maxTravelers: 6, adultPriceCents: 7100 },
  { minTravelers: 7, maxTravelers: 9, adultPriceCents: 6600 },
  { minTravelers: 10, maxTravelers: 12, adultPriceCents: 6200 }
];

const options = [
  {
    title: "Paris Icons Walking Tour",
    slug: "paris-icons-walking-tour",
    description:
      "A curated walking overview of central Paris covering exterior landmark stops, orientation, city stories, and photo-friendly viewpoints around the Eiffel Tower area, Seine, Louvre, and Notre-Dame.",
    durationLabel: "4 hours",
    dailyCapacity: 18,
    multiplier: 1,
    isDefault: true,
    sortOrder: 0
  },
  {
    title: "Paris Icons + Seine Cruise",
    slug: "paris-icons-seine-cruise",
    description:
      "Combine the Paris highlights walking route with a Seine cruise experience for a more complete first-time Paris overview from both the street and the river.",
    durationLabel: "5.5 hours",
    dailyCapacity: 16,
    multiplier: 1.38,
    isDefault: false,
    sortOrder: 1
  },
  {
    title: "Private Paris Highlights Experience",
    slug: "private-paris-highlights-experience",
    description:
      "A private version of the Paris highlights experience with a flexible pace, extra photo time, smoother transitions, and a route adjusted around your group’s interests.",
    durationLabel: "5 hours",
    dailyCapacity: 10,
    multiplier: 1.85,
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
      url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
      altText: "Paris Eiffel Tower and city view",
      isCover: true,
      sortOrder: 0
    },
    {
      url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80",
      altText: "Paris street and Seine atmosphere",
      isCover: false,
      sortOrder: 1
    },
    {
      url: "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=1600&q=80",
      altText: "Paris architecture and landmark walk",
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
      priceCents: 6200,
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
          "Meet your guide near Trocadéro or central Paris depending on the selected package. The exact meeting point will be shown on your voucher after booking.",
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
          "Meet your guide near Trocadéro or central Paris depending on the selected package. The exact meeting point will be shown on your voucher after booking.",
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
      title: "Paris Icons, Seine & Montmartre City Experience",
      shortDescription:
        "See Paris essentials in one curated experience: Eiffel Tower area, Seine views, Louvre courtyard, Notre-Dame, and Montmartre atmosphere.",
      description: ACTIVITY_DESCRIPTION,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.GROUP_TIER,
      ratingAverage: new Prisma.Decimal("4.7"),
      reviewCount: 1248,
      durationLabel: "4 - 5.5 hours",
      meetingPoint:
        "Meet your guide near Trocadéro or central Paris depending on the selected package. The exact meeting point will be shown on your voucher after booking.",
      cancellationPolicy: "Cancel up to 24 hours before the activity starts for a full refund.",
      importantInfo:
        "This experience focuses on exterior landmarks, orientation, and local storytelling. Eiffel Tower, Louvre, or Notre-Dame entry tickets are not included unless explicitly stated in a future package. Bring comfortable walking shoes and weather-appropriate clothing.",
      highlights: [
        "See Paris’s classic first-time highlights in one curated route",
        "Enjoy Eiffel Tower views, Seine river scenery, and elegant Paris bridges",
        "Visit the Louvre courtyard and learn how the city grew around its landmarks",
        "Explore Notre-Dame and Île de la Cité from the outside with local context",
        "End with Montmartre atmosphere and Sacré-Cœur views depending on route timing"
      ],
      included: [
        "Local host or guide",
        "Curated Paris highlights walking route",
        "Landmark storytelling and city orientation",
        "Seine cruise for selected package",
        "Private guide for selected package"
      ],
      notIncluded: [
        "Hotel pickup",
        "Public transportation tickets",
        "Eiffel Tower entry ticket",
        "Louvre Museum entry ticket",
        "Notre-Dame tower or interior access",
        "Food and drinks",
        "Tips"
      ],
      publishedAt: new Date()
    },
    create: {
      partnerId: partner.id,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: "Paris Icons, Seine & Montmartre City Experience",
      slug: ACTIVITY_SLUG,
      shortDescription:
        "See Paris essentials in one curated experience: Eiffel Tower area, Seine views, Louvre courtyard, Notre-Dame, and Montmartre atmosphere.",
      description: ACTIVITY_DESCRIPTION,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.GROUP_TIER,
      ratingAverage: new Prisma.Decimal("4.7"),
      reviewCount: 1248,
      durationLabel: "4 - 5.5 hours",
      meetingPoint:
        "Meet your guide near Trocadéro or central Paris depending on the selected package. The exact meeting point will be shown on your voucher after booking.",
      cancellationPolicy: "Cancel up to 24 hours before the activity starts for a full refund.",
      importantInfo:
        "This experience focuses on exterior landmarks, orientation, and local storytelling. Eiffel Tower, Louvre, or Notre-Dame entry tickets are not included unless explicitly stated in a future package. Bring comfortable walking shoes and weather-appropriate clothing.",
      highlights: [
        "See Paris’s classic first-time highlights in one curated route",
        "Enjoy Eiffel Tower views, Seine river scenery, and elegant Paris bridges",
        "Visit the Louvre courtyard and learn how the city grew around its landmarks",
        "Explore Notre-Dame and Île de la Cité from the outside with local context",
        "End with Montmartre atmosphere and Sacré-Cœur views depending on route timing"
      ],
      included: [
        "Local host or guide",
        "Curated Paris highlights walking route",
        "Landmark storytelling and city orientation",
        "Seine cruise for selected package",
        "Private guide for selected package"
      ],
      notIncluded: [
        "Hotel pickup",
        "Public transportation tickets",
        "Eiffel Tower entry ticket",
        "Louvre Museum entry ticket",
        "Notre-Dame tower or interior access",
        "Food and drinks",
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
        destination: "paris",
        city: "paris",
        options: options.length,
        pricingTiersPerOption: basePricingTiers.length,
        baseCurrency: "USD"
      }
    }
  });

  console.log("Imported Paris activity successfully.");
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
