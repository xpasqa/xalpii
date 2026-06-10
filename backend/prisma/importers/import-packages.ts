import {
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PartnerStatus,
  PricingMode,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = "admin@alpii.local";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function atHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

async function main() {
  console.log("Importing 1 Alpii package...");

  const adminUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!adminUser) {
    throw new Error(`Admin user not found: ${adminEmail}`);
  }

  const partner = await prisma.partner.upsert({
    where: {
      userId: adminUser.id,
    },
    update: {
      businessName: "Alpii Curated Experiences",
      legalName: "Alpii Europe GmbH",
      status: PartnerStatus.APPROVED,
      country: "Japan",
      city: "Tokyo",
      description:
        "Curated local experiences by Alpii for trusted, easy, and memorable travel.",
    },
    create: {
      userId: adminUser.id,
      businessName: "Alpii Curated Experiences",
      legalName: "Alpii Europe GmbH",
      status: PartnerStatus.APPROVED,
      country: "Japan",
      city: "Tokyo",
      description:
        "Curated local experiences by Alpii for trusted, easy, and memorable travel.",
    },
  });

  const city = await prisma.city.upsert({
    where: {
      slug: "tokyo",
    },
    update: {
      name: "Tokyo",
      country: "Japan",
      description:
        "Tokyo blends tradition, food, pop culture, shopping, and modern city energy.",
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: "Tokyo",
      slug: "tokyo",
      country: "Japan",
      description:
        "Tokyo blends tradition, food, pop culture, shopping, and modern city energy.",
      isActive: true,
      sortOrder: 1,
    },
  });

  const destination = await prisma.destination.upsert({
    where: {
      slug: "tokyo-city",
    },
    update: {
      name: "Tokyo City",
      type: DestinationType.CITY,
      countryCode: "JP",
      description:
        "A curated Tokyo destination covering culture, food, shopping, and iconic neighborhoods.",
      imageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: "Tokyo City",
      slug: "tokyo-city",
      type: DestinationType.CITY,
      countryCode: "JP",
      description:
        "A curated Tokyo destination covering culture, food, shopping, and iconic neighborhoods.",
      imageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
      isActive: true,
      sortOrder: 1,
    },
  });

  const category = await prisma.category.upsert({
    where: {
      slug: "city-experience",
    },
    update: {
      name: "City Experience",
      description: "Curated city experiences with local guidance.",
      icon: "city",
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: "City Experience",
      slug: "city-experience",
      description: "Curated city experiences with local guidance.",
      icon: "city",
      isActive: true,
      sortOrder: 1,
    },
  });

  const existingActivity = await prisma.activity.findUnique({
    where: {
      slug: "tokyo-local-culture-day",
    },
  });

  if (existingActivity) {
    await prisma.review.deleteMany({
      where: {
        activityId: existingActivity.id,
      },
    });

    await prisma.activityAvailability.deleteMany({
      where: {
        activityId: existingActivity.id,
      },
    });

    const existingOptions = await prisma.activityOption.findMany({
      where: {
        activityId: existingActivity.id,
      },
      select: {
        id: true,
      },
    });

    if (existingOptions.length > 0) {
      await prisma.activityOptionDateInventory.deleteMany({
        where: {
          optionId: {
            in: existingOptions.map((option) => option.id),
          },
        },
      });

      await prisma.activityOptionPricingTier.deleteMany({
        where: {
          optionId: {
            in: existingOptions.map((option) => option.id),
          },
        },
      });
    }

    await prisma.activityOption.deleteMany({
      where: {
        activityId: existingActivity.id,
      },
    });

    await prisma.activityPricingTier.deleteMany({
      where: {
        activityId: existingActivity.id,
      },
    });

    await prisma.activityPricing.deleteMany({
      where: {
        activityId: existingActivity.id,
      },
    });

    await prisma.activityMedia.deleteMany({
      where: {
        activityId: existingActivity.id,
      },
    });
  }

  const activity = await prisma.activity.upsert({
    where: {
      slug: "tokyo-local-culture-day",
    },
    update: {
      partnerId: partner.id,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: "Tokyo Local Culture Day",
      shortDescription:
        "A curated Tokyo day experience with culture, food, and iconic city highlights.",
      description:
        "Discover Tokyo through handpicked local neighborhoods, cultural stops, food moments, and modern city highlights. This package is designed for travelers who want a smooth local experience without planning stress.",
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.TIERED,
      durationLabel: "1 day",
      meetingPoint: "Hotel lobby or nearest station in central Tokyo",
      cancellationPolicy:
        "Free cancellation up to 24 hours before the experience starts.",
      importantInfo:
        "The final route may be adjusted by the guide based on weather, traffic, and real-time conditions.",
      included: [
        "Private local guide",
        "Curated destination plan",
        "Hotel pickup in central Tokyo",
        "Basic travel support during the trip",
      ],
      notIncluded: [
        "Meals and drinks",
        "Entrance tickets",
        "Personal expenses",
        "Public transport or private transport unless selected",
      ],
      highlights: [
        "Explore traditional and modern Tokyo in one day",
        "Visit handpicked neighborhoods without planning stress",
        "Flexible destination-based itinerary",
        "Local guidance for food, culture, and photo spots",
      ],
      itinerary: [
        {
          order: 1,
          title: "Asakusa",
          description:
            "Explore Tokyo’s traditional side with temples, local streets, and cultural atmosphere.",
        },
        {
          order: 2,
          title: "Ueno or Akihabara",
          description:
            "Choose between relaxed local culture or Tokyo’s electric pop-culture district.",
        },
        {
          order: 3,
          title: "Shibuya",
          description:
            "Experience Tokyo’s modern city energy, shopping streets, and iconic crossing.",
        },
      ],
      ratingAverage: 4.8,
      reviewCount: 3,
      publishedAt: new Date(),
    },
    create: {
      partnerId: partner.id,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: "Tokyo Local Culture Day",
      slug: "tokyo-local-culture-day",
      shortDescription:
        "A curated Tokyo day experience with culture, food, and iconic city highlights.",
      description:
        "Discover Tokyo through handpicked local neighborhoods, cultural stops, food moments, and modern city highlights. This package is designed for travelers who want a smooth local experience without planning stress.",
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.TIERED,
      durationLabel: "1 day",
      meetingPoint: "Hotel lobby or nearest station in central Tokyo",
      cancellationPolicy:
        "Free cancellation up to 24 hours before the experience starts.",
      importantInfo:
        "The final route may be adjusted by the guide based on weather, traffic, and real-time conditions.",
      included: [
        "Private local guide",
        "Curated destination plan",
        "Hotel pickup in central Tokyo",
        "Basic travel support during the trip",
      ],
      notIncluded: [
        "Meals and drinks",
        "Entrance tickets",
        "Personal expenses",
        "Public transport or private transport unless selected",
      ],
      highlights: [
        "Explore traditional and modern Tokyo in one day",
        "Visit handpicked neighborhoods without planning stress",
        "Flexible destination-based itinerary",
        "Local guidance for food, culture, and photo spots",
      ],
      itinerary: [
        {
          order: 1,
          title: "Asakusa",
          description:
            "Explore Tokyo’s traditional side with temples, local streets, and cultural atmosphere.",
        },
        {
          order: 2,
          title: "Ueno or Akihabara",
          description:
            "Choose between relaxed local culture or Tokyo’s electric pop-culture district.",
        },
        {
          order: 3,
          title: "Shibuya",
          description:
            "Experience Tokyo’s modern city energy, shopping streets, and iconic crossing.",
        },
      ],
      ratingAverage: 4.8,
      reviewCount: 3,
      publishedAt: new Date(),
    },
  });

  await prisma.activityMedia.createMany({
    data: [
      {
        activityId: activity.id,
        url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        altText: "Tokyo city view",
        isCover: true,
        sortOrder: 0,
      },
      {
        activityId: activity.id,
        url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
        altText: "Tokyo street at night",
        isCover: false,
        sortOrder: 1,
      },
    ],
  });

  await prisma.activityPricing.create({
    data: {
      activityId: activity.id,
      currency: "USD",
      priceCents: 18000,
      priceType: "starts_from",
      isActive: true,
    },
  });

  await prisma.activityPricingTier.createMany({
    data: [
      {
        activityId: activity.id,
        currency: "USD",
        minTravelers: 1,
        maxTravelers: 1,
        adultPriceCents: 18000,
        childPriceCents: 13000,
        priceType: "per_person",
        isActive: true,
      },
      {
        activityId: activity.id,
        currency: "USD",
        minTravelers: 2,
        maxTravelers: 3,
        adultPriceCents: 15000,
        childPriceCents: 11000,
        priceType: "per_person",
        isActive: true,
      },
      {
        activityId: activity.id,
        currency: "USD",
        minTravelers: 4,
        maxTravelers: 6,
        adultPriceCents: 12500,
        childPriceCents: 9000,
        priceType: "per_person",
        isActive: true,
      },
    ],
  });

  const standardOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: "Standard Local Experience",
      slug: "standard-local-experience",
      description:
        "Best for first-time travelers who want a smooth Tokyo introduction.",
      durationLabel: "1 day",
      meetingPoint: "Hotel lobby or nearest station",
      availabilityMode: AvailabilityMode.SCHEDULED_SESSIONS,
      availableDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      dailyCapacity: 8,
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.activityOptionPricingTier.createMany({
    data: [
      {
        optionId: standardOption.id,
        currency: "USD",
        minTravelers: 1,
        maxTravelers: 1,
        adultPriceCents: 18000,
        childPriceCents: 13000,
        priceType: "per_person",
        isActive: true,
      },
      {
        optionId: standardOption.id,
        currency: "USD",
        minTravelers: 2,
        maxTravelers: 3,
        adultPriceCents: 15000,
        childPriceCents: 11000,
        priceType: "per_person",
        isActive: true,
      },
      {
        optionId: standardOption.id,
        currency: "USD",
        minTravelers: 4,
        maxTravelers: 6,
        adultPriceCents: 12500,
        childPriceCents: 9000,
        priceType: "per_person",
        isActive: true,
      },
    ],
  });

  const premiumOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: "Premium Private Experience",
      slug: "premium-private-experience",
      description:
        "More flexible pace with extra personal guidance and route adjustment.",
      durationLabel: "1 day",
      meetingPoint: "Hotel lobby",
      availabilityMode: AvailabilityMode.SCHEDULED_SESSIONS,
      availableDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      dailyCapacity: 6,
      isDefault: false,
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.activityOptionPricingTier.createMany({
    data: [
      {
        optionId: premiumOption.id,
        currency: "USD",
        minTravelers: 1,
        maxTravelers: 1,
        adultPriceCents: 26000,
        childPriceCents: 19000,
        priceType: "per_person",
        isActive: true,
      },
      {
        optionId: premiumOption.id,
        currency: "USD",
        minTravelers: 2,
        maxTravelers: 3,
        adultPriceCents: 22000,
        childPriceCents: 16000,
        priceType: "per_person",
        isActive: true,
      },
      {
        optionId: premiumOption.id,
        currency: "USD",
        minTravelers: 4,
        maxTravelers: 6,
        adultPriceCents: 18000,
        childPriceCents: 13000,
        priceType: "per_person",
        isActive: true,
      },
    ],
  });

  const today = new Date();
  const options = [
    { option: standardOption, capacity: 8 },
    { option: premiumOption, capacity: 6 },
  ];

  for (const item of options) {
    for (let i = 1; i <= 14; i++) {
      const startDate = atHour(addDays(today, i), 9);
      const endDate = atHour(addDays(today, i), 17);

      await prisma.activityOptionDateInventory.upsert({
        where: {
          optionId_travelDate: {
            optionId: item.option.id,
            travelDate: startDate,
          },
        },
        update: {
          capacity: item.capacity,
          bookedCount: 0,
        },
        create: {
          optionId: item.option.id,
          travelDate: startDate,
          capacity: item.capacity,
          bookedCount: 0,
        },
      });

      await prisma.activityAvailability.create({
        data: {
          activityId: activity.id,
          optionId: item.option.id,
          startDateTime: startDate,
          endDateTime: endDate,
          capacity: item.capacity,
          bookedCount: 0,
          isActive: true,
        },
      });
    }
  }

  await prisma.review.createMany({
    data: [
      {
        userId: adminUser.id,
        activityId: activity.id,
        rating: 5,
        title: "Very smooth Tokyo experience",
        comment:
          "The route felt local but still covered the important highlights. Very easy and enjoyable.",
        status: "APPROVED",
      },
      {
        userId: adminUser.id,
        activityId: activity.id,
        rating: 5,
        title: "Perfect for first time Tokyo",
        comment:
          "We did not have to think too much. The guide helped us enjoy the city with zero stress.",
        status: "APPROVED",
      },
      {
        userId: adminUser.id,
        activityId: activity.id,
        rating: 4,
        title: "Great balance",
        comment:
          "Good mix between culture, food, and city highlights. The itinerary was flexible.",
        status: "APPROVED",
      },
    ],
  });

  console.log("Imported package:", activity.title);
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Package import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
