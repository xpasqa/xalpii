import {
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PricingMode,
  Prisma,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVITY_SLUG = "zurich-old-town-lake-swiss-culture-city-experience";

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
  "Discover Zurich through its old town lanes, riverside views, lakefront atmosphere, historic churches, Swiss culture, and everyday city rhythm. This experience is designed for first-time visitors who want an easy and curated introduction to Switzerland’s largest city without rushing from one landmark to another.\n\nYour local host will guide you through the city’s walkable center, from the medieval streets of Niederdorf and the Limmat riverfront to classic viewpoints, elegant shopping streets, and the calm scenery around Lake Zurich. Along the way, you will hear simple stories about Swiss daily life, local traditions, banking history, chocolate culture, and how Zurich balances old-world charm with modern city living.\n\nChoose a classic old town walking route, add a lake-view extension, or book a private culture experience for a slower and more personal pace. This is an exterior city experience focused on orientation, storytelling, viewpoints, and local context.";

function childPrice(adultPriceCents: number, discountPercent = 27) {
  return Math.round(adultPriceCents * (1 - discountPercent / 100));
}

function withMultiplier(value: number, multiplier: number) {
  return Math.round(value * multiplier);
}

async function ensureCity() {
  return prisma.city.upsert({
    where: { slug: "zurich" },
    update: {
      name: "Zurich",
      country: "Switzerland",
      description:
        "Switzerland’s largest city, known for its old town, Lake Zurich, riverside walks, museums, finance, chocolate, and alpine access.",
      isActive: true,
      sortOrder: 4
    },
    create: {
      name: "Zurich",
      slug: "zurich",
      country: "Switzerland",
      description:
        "Switzerland’s largest city, known for its old town, Lake Zurich, riverside walks, museums, finance, chocolate, and alpine access.",
      isActive: true,
      sortOrder: 4
    }
  });
}

async function ensureDestinationTree() {
  const switzerland = await prisma.destination.upsert({
    where: { slug: "switzerland" },
    update: {
      name: "Switzerland",
      type: DestinationType.COUNTRY,
      countryCode: "CH",
      isActive: true,
      sortOrder: 4
    },
    create: {
      name: "Switzerland",
      slug: "switzerland",
      type: DestinationType.COUNTRY,
      countryCode: "CH",
      isActive: true,
      sortOrder: 4
    }
  });

  return prisma.destination.upsert({
    where: { slug: "zurich" },
    update: {
      name: "Zurich",
      type: DestinationType.CITY,
      parentId: switzerland.id,
      countryCode: "CH",
      description:
        "A Swiss city combining old town streets, Lake Zurich, the Limmat river, museums, shopping, chocolate culture, and easy access to alpine scenery.",
      isActive: true,
      sortOrder: 1
    },
    create: {
      name: "Zurich",
      slug: "zurich",
      type: DestinationType.CITY,
      parentId: switzerland.id,
      countryCode: "CH",
      description:
        "A Swiss city combining old town streets, Lake Zurich, the Limmat river, museums, shopping, chocolate culture, and easy access to alpine scenery.",
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
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 16500 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 11800 },
  { minTravelers: 3, maxTravelers: 3, adultPriceCents: 10200 },
  { minTravelers: 4, maxTravelers: 4, adultPriceCents: 9400 },
  { minTravelers: 5, maxTravelers: 6, adultPriceCents: 8600 },
  { minTravelers: 7, maxTravelers: 9, adultPriceCents: 7900 },
  { minTravelers: 10, maxTravelers: 12, adultPriceCents: 7400 }
];

const options = [
  {
    title: "Zurich Old Town Walking Tour",
    slug: "zurich-old-town-walking-tour",
    description:
      "A curated walk through Zurich’s old town, covering Niederdorf lanes, the Limmat riverfront, historic churches, hidden corners, and local stories about Swiss city life.",
    durationLabel: "3 hours",
    dailyCapacity: 18,
    multiplier: 1,
    isDefault: true,
    sortOrder: 0
  },
  {
    title: "Old Town + Lake Zurich View Walk",
    slug: "old-town-lake-zurich-view-walk",
    description:
      "Extend the classic old town route toward Lake Zurich, combining historic streets, riverside scenery, lakefront views, photo stops, and relaxed orientation around central Zurich.",
    durationLabel: "4 hours",
    dailyCapacity: 16,
    multiplier: 1.25,
    isDefault: false,
    sortOrder: 1
  },
  {
    title: "Private Zurich Culture Experience",
    slug: "private-zurich-culture-experience",
    description:
      "A private version of the Zurich highlights experience with a flexible pace, extra time for photos, deeper local context, and a route adjusted around your group’s interests.",
    durationLabel: "4.5 hours",
    dailyCapacity: 10,
    multiplier: 1.75,
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
      url: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1600&q=80",
      altText: "Zurich old town and river view",
      isCover: true,
      sortOrder: 0
    },
    {
      url: "https://images.unsplash.com/photo-1550503736-c1a2c9033c03?auto=format&fit=crop&w=1600&q=80",
      altText: "Lake Zurich and Swiss city atmosphere",
      isCover: false,
      sortOrder: 1
    },
    {
      url: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1600&q=80",
      altText: "Swiss old town architecture and walking experience",
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
      priceCents: 7400,
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
          "Meet your guide near Zurich Hauptbahnhof or the old town. The exact meeting point will be shown on your voucher after booking.",
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
          "Meet your guide near Zurich Hauptbahnhof or the old town. The exact meeting point will be shown on your voucher after booking.",
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
      title: "Zurich Old Town, Lake & Swiss Culture City Experience",
      shortDescription:
        "Explore Zurich’s old town, Limmat riverfront, Lake Zurich views, Swiss culture, and local city stories in one curated experience.",
      description: ACTIVITY_DESCRIPTION,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.GROUP_TIER,
      ratingAverage: new Prisma.Decimal("4.9"),
      reviewCount: 517,
      durationLabel: "3 - 4.5 hours",
      meetingPoint:
        "Meet your guide near Zurich Hauptbahnhof or the old town. The exact meeting point will be shown on your voucher after booking.",
      cancellationPolicy: "Cancel up to 24 hours before the activity starts for a full refund.",
      importantInfo:
        "This is a walking-focused city experience. Bring comfortable shoes and weather-appropriate clothing. Public transportation, museum entry, food, drinks, and paid attractions are not included unless explicitly stated in a selected package.",
      highlights: [
        "Walk through Zurich’s old town and historic riverside streets",
        "See the Limmat river, classic churches, elegant lanes, and local viewpoints",
        "Enjoy Lake Zurich atmosphere and Swiss city scenery depending on selected option",
        "Learn about Swiss culture, chocolate, finance, daily life, and city history",
        "Choose between a classic walk, lake-view route, or private culture experience"
      ],
      included: [
        "Local host or guide",
        "Curated Zurich walking route",
        "Old town and riverside orientation",
        "Lake Zurich view route for selected package",
        "Private guide for selected package"
      ],
      notIncluded: [
        "Hotel pickup",
        "Public transportation tickets",
        "Museum or attraction entry tickets",
        "Food and drinks",
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
      title: "Zurich Old Town, Lake & Swiss Culture City Experience",
      slug: ACTIVITY_SLUG,
      shortDescription:
        "Explore Zurich’s old town, Limmat riverfront, Lake Zurich views, Swiss culture, and local city stories in one curated experience.",
      description: ACTIVITY_DESCRIPTION,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.GROUP_TIER,
      ratingAverage: new Prisma.Decimal("4.9"),
      reviewCount: 517,
      durationLabel: "3 - 4.5 hours",
      meetingPoint:
        "Meet your guide near Zurich Hauptbahnhof or the old town. The exact meeting point will be shown on your voucher after booking.",
      cancellationPolicy: "Cancel up to 24 hours before the activity starts for a full refund.",
      importantInfo:
        "This is a walking-focused city experience. Bring comfortable shoes and weather-appropriate clothing. Public transportation, museum entry, food, drinks, and paid attractions are not included unless explicitly stated in a selected package.",
      highlights: [
        "Walk through Zurich’s old town and historic riverside streets",
        "See the Limmat river, classic churches, elegant lanes, and local viewpoints",
        "Enjoy Lake Zurich atmosphere and Swiss city scenery depending on selected option",
        "Learn about Swiss culture, chocolate, finance, daily life, and city history",
        "Choose between a classic walk, lake-view route, or private culture experience"
      ],
      included: [
        "Local host or guide",
        "Curated Zurich walking route",
        "Old town and riverside orientation",
        "Lake Zurich view route for selected package",
        "Private guide for selected package"
      ],
      notIncluded: [
        "Hotel pickup",
        "Public transportation tickets",
        "Museum or attraction entry tickets",
        "Food and drinks",
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
        destination: "zurich",
        city: "zurich",
        options: options.length,
        pricingTiersPerOption: basePricingTiers.length,
        baseCurrency: "USD"
      }
    }
  });

  console.log("Imported Zurich activity successfully.");
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
