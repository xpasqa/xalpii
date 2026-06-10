import {
  ActivityStatus,
  AvailabilityMode,
  DestinationType,
  PricingMode,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

const reviewUserEmail = "admin@alpii.local";
const vendorEmail = "tokyo.vendor@alpii.local";

type PackageInput = {
  title: string;
  slug: string;
  citySlug: string;
  cityName: string;
  country: string;
  destinationSlug: string;
  destinationName: string;
  countryCode: string;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  shortDescription: string;
  description: string;
  durationLabel: string;
  meetingPoint: string;
  cancellationPolicy: string;
  importantInfo: string;
  included: string[];
  notIncluded: string[];
  highlights: string[];
  itinerary: Array<{
    order: number;
    title: string;
    description: string;
  }>;
  currency: string;
  basePriceCents: number;
  ratingAverage: number;
  reviewCount: number;
  media: Array<{
    url: string;
    altText: string;
    isCover: boolean;
  }>;
  pricingTiers: Array<{
    minTravelers: number;
    maxTravelers: number;
    adultPriceCents: number;
    childPriceCents: number | null;
  }>;
  options: Array<{
    title: string;
    slug: string;
    description: string;
    durationLabel: string;
    meetingPoint: string;
    dailyCapacity: number;
    isDefault: boolean;
    sortOrder: number;
    pricingTiers: Array<{
      minTravelers: number;
      maxTravelers: number;
      adultPriceCents: number;
      childPriceCents: number | null;
    }>;
  }>;
  reviews: Array<{
    rating: number;
    title: string;
    comment: string;
  }>;
};

const packages: PackageInput[] = [
  {
    title: "Tokyo Hidden Food Alley Night Walk",
    slug: "tokyo-hidden-food-alley-night-walk",
    citySlug: "tokyo",
    cityName: "Tokyo",
    country: "Japan",
    destinationSlug: "tokyo-city",
    destinationName: "Tokyo City",
    countryCode: "JP",
    categorySlug: "food-experience",
    categoryName: "Food Experience",
    categoryIcon: "utensils",
    shortDescription:
      "Explore Tokyo’s hidden food alleys, izakaya streets, and local night flavors.",
    description:
      "A curated Tokyo night food experience through local alleys, small izakaya-style streets, hidden food corners, and atmospheric neighborhoods. This package is built for travelers who want a trusted local food route without the stress of choosing places alone.",
    durationLabel: "4 hours",
    meetingPoint: "Shinjuku Station East Exit or agreed central Tokyo point",
    cancellationPolicy:
      "Free cancellation up to 24 hours before the experience starts.",
    importantInfo:
      "Food preferences and allergies should be shared before the trip. Exact stops may change depending on crowd level, opening hours, and local conditions.",
    included: [
      "Local food guide",
      "Curated night food route",
      "3 to 4 recommended food stops",
      "Basic translation support",
      "Local neighborhood guidance",
    ],
    notIncluded: [
      "Food and drinks unless selected in package option",
      "Hotel pickup",
      "Personal expenses",
      "Transportation to meeting point",
    ],
    highlights: [
      "Discover hidden Tokyo food alleys",
      "Try local street food and izakaya-style bites",
      "Explore Shinjuku and nearby night neighborhoods",
      "Perfect for first-time Tokyo food lovers",
    ],
    itinerary: [
      {
        order: 1,
        title: "Meet at Shinjuku",
        description:
          "Start with a short briefing and introduction to Tokyo’s local food culture.",
      },
      {
        order: 2,
        title: "Omoide Yokocho Food Alley",
        description:
          "Walk through narrow local food alleys filled with small eateries and nostalgic night atmosphere.",
      },
      {
        order: 3,
        title: "Kabukicho Side Streets",
        description:
          "Explore energetic night streets and discover food spots that are easier with a local guide.",
      },
      {
        order: 4,
        title: "Golden Gai Area Walk",
        description:
          "End around one of Tokyo’s most atmospheric nightlife areas with photo-friendly streets.",
      },
    ],
    currency: "USD",
    basePriceCents: 8500,
    ratingAverage: 4.9,
    reviewCount: 3,
    media: [
      {
        url: "https://images.unsplash.com/photo-1554797589-7241bb691973",
        altText: "Tokyo food street at night",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
        altText: "Tokyo night street",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989",
        altText: "Tokyo urban night view",
        isCover: false,
      },
    ],
    pricingTiers: [
      {
        minTravelers: 1,
        maxTravelers: 1,
        adultPriceCents: 8500,
        childPriceCents: 6000,
      },
      {
        minTravelers: 2,
        maxTravelers: 3,
        adultPriceCents: 7000,
        childPriceCents: 5000,
      },
      {
        minTravelers: 4,
        maxTravelers: 6,
        adultPriceCents: 6000,
        childPriceCents: 4500,
      },
    ],
    options: [
      {
        title: "Guided Walk Only",
        slug: "guided-walk-only",
        description:
          "Best for travelers who want a local food route and prefer to pay food costs directly.",
        durationLabel: "4 hours",
        meetingPoint: "Shinjuku Station East Exit",
        dailyCapacity: 8,
        isDefault: true,
        sortOrder: 1,
        pricingTiers: [
          {
            minTravelers: 1,
            maxTravelers: 1,
            adultPriceCents: 8500,
            childPriceCents: 6000,
          },
          {
            minTravelers: 2,
            maxTravelers: 3,
            adultPriceCents: 7000,
            childPriceCents: 5000,
          },
          {
            minTravelers: 4,
            maxTravelers: 6,
            adultPriceCents: 6000,
            childPriceCents: 4500,
          },
        ],
      },
      {
        title: "Food Included Package",
        slug: "food-included-package",
        description:
          "Includes selected local bites at curated stops for a more complete experience.",
        durationLabel: "4 hours",
        meetingPoint: "Shinjuku Station East Exit",
        dailyCapacity: 6,
        isDefault: false,
        sortOrder: 2,
        pricingTiers: [
          {
            minTravelers: 1,
            maxTravelers: 1,
            adultPriceCents: 13500,
            childPriceCents: 9500,
          },
          {
            minTravelers: 2,
            maxTravelers: 3,
            adultPriceCents: 11500,
            childPriceCents: 8000,
          },
          {
            minTravelers: 4,
            maxTravelers: 6,
            adultPriceCents: 10000,
            childPriceCents: 7000,
          },
        ],
      },
    ],
    reviews: [
      {
        rating: 5,
        title: "Best food night in Tokyo",
        comment:
          "The route felt local and exciting. We found places we would never discover alone.",
      },
      {
        rating: 5,
        title: "Easy and delicious",
        comment:
          "Very smooth experience. The guide helped us understand what to order and where to go.",
      },
      {
        rating: 5,
        title: "Perfect first night",
        comment:
          "Great way to start our Tokyo trip. The alleys and food stops were memorable.",
      },
    ],
  },
  {
    title: "Mount Fuji Scenic Day Escape",
    slug: "mount-fuji-scenic-day-escape",
    citySlug: "tokyo",
    cityName: "Tokyo",
    country: "Japan",
    destinationSlug: "mount-fuji-area",
    destinationName: "Mount Fuji Area",
    countryCode: "JP",
    categorySlug: "scenic-adventure",
    categoryName: "Scenic Adventure",
    categoryIcon: "mountain",
    shortDescription:
      "A scenic day escape from Tokyo to Mount Fuji viewpoints, lake areas, and nature stops.",
    description:
      "A curated Mount Fuji day trip designed for travelers who want scenic views, beautiful photo spots, and a relaxed nature escape from Tokyo. The route focuses on destination highlights while allowing the local guide to adjust based on weather and visibility.",
    durationLabel: "1 day",
    meetingPoint: "Tokyo hotel lobby or major central Tokyo station",
    cancellationPolicy:
      "Free cancellation up to 24 hours before the experience starts.",
    importantInfo:
      "Mount Fuji visibility depends on weather. The guide may adjust the route to maximize scenic value and traveler comfort.",
    included: [
      "Private local guide",
      "Curated Mount Fuji area route",
      "Hotel pickup in central Tokyo",
      "Basic travel support",
      "Photo spot recommendations",
    ],
    notIncluded: [
      "Meals and drinks",
      "Entrance tickets",
      "Private vehicle unless selected",
      "Personal expenses",
    ],
    highlights: [
      "Escape Tokyo for Mount Fuji scenery",
      "Visit lake and mountain viewpoint areas",
      "Flexible route based on weather visibility",
      "Great for couples, families, and photo lovers",
    ],
    itinerary: [
      {
        order: 1,
        title: "Depart from Tokyo",
        description:
          "Meet your guide and begin the day trip from central Tokyo toward the Mount Fuji area.",
      },
      {
        order: 2,
        title: "Lake Kawaguchi Area",
        description:
          "Enjoy scenic lake views with Mount Fuji in the background when weather allows.",
      },
      {
        order: 3,
        title: "Fuji Viewpoint Stop",
        description:
          "Visit a selected viewpoint or photo area based on visibility and local conditions.",
      },
      {
        order: 4,
        title: "Local Nature and Souvenir Stop",
        description:
          "Relax around a nature or local shopping stop before returning to Tokyo.",
      },
    ],
    currency: "USD",
    basePriceCents: 19000,
    ratingAverage: 4.8,
    reviewCount: 3,
    media: [
      {
        url: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f",
        altText: "Mount Fuji scenic view",
        isCover: true,
      },
      {
        url: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65",
        altText: "Mount Fuji mountain view",
        isCover: false,
      },
      {
        url: "https://images.unsplash.com/photo-1528164344705-47542687000d",
        altText: "Japan scenic temple and mountain",
        isCover: false,
      },
    ],
    pricingTiers: [
      {
        minTravelers: 1,
        maxTravelers: 1,
        adultPriceCents: 19000,
        childPriceCents: 14000,
      },
      {
        minTravelers: 2,
        maxTravelers: 3,
        adultPriceCents: 16000,
        childPriceCents: 11500,
      },
      {
        minTravelers: 4,
        maxTravelers: 6,
        adultPriceCents: 13500,
        childPriceCents: 9500,
      },
    ],
    options: [
      {
        title: "Public Transport Scenic Day",
        slug: "public-transport-scenic-day",
        description:
          "A guided Mount Fuji day using public transport with flexible scenic stops.",
        durationLabel: "1 day",
        meetingPoint: "Major central Tokyo station",
        dailyCapacity: 8,
        isDefault: true,
        sortOrder: 1,
        pricingTiers: [
          {
            minTravelers: 1,
            maxTravelers: 1,
            adultPriceCents: 19000,
            childPriceCents: 14000,
          },
          {
            minTravelers: 2,
            maxTravelers: 3,
            adultPriceCents: 16000,
            childPriceCents: 11500,
          },
          {
            minTravelers: 4,
            maxTravelers: 6,
            adultPriceCents: 13500,
            childPriceCents: 9500,
          },
        ],
      },
      {
        title: "Private Car Scenic Day",
        slug: "private-car-scenic-day",
        description:
          "A more comfortable Mount Fuji day escape with private vehicle arrangement.",
        durationLabel: "1 day",
        meetingPoint: "Central Tokyo hotel lobby",
        dailyCapacity: 5,
        isDefault: false,
        sortOrder: 2,
        pricingTiers: [
          {
            minTravelers: 1,
            maxTravelers: 1,
            adultPriceCents: 36000,
            childPriceCents: 26000,
          },
          {
            minTravelers: 2,
            maxTravelers: 3,
            adultPriceCents: 28500,
            childPriceCents: 21000,
          },
          {
            minTravelers: 4,
            maxTravelers: 5,
            adultPriceCents: 24000,
            childPriceCents: 17500,
          },
        ],
      },
    ],
    reviews: [
      {
        rating: 5,
        title: "Beautiful Fuji escape",
        comment:
          "The trip was relaxed and scenic. The guide adjusted the route because of the weather and it worked well.",
      },
      {
        rating: 5,
        title: "Great day outside Tokyo",
        comment:
          "Perfect balance between nature, lake views, and easy travel. Very memorable.",
      },
      {
        rating: 4,
        title: "Smooth and flexible",
        comment:
          "Fuji visibility changed during the day, but the guide found great alternative spots.",
      },
    ],
  },
];

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

async function clearActivityChildren(activityId: string) {
  const existingOptions = await prisma.activityOption.findMany({
    where: { activityId },
    select: { id: true },
  });

  const optionIds = existingOptions.map((option) => option.id);

  await prisma.review.deleteMany({
    where: { activityId },
  });

  await prisma.activityAvailability.deleteMany({
    where: { activityId },
  });

  if (optionIds.length > 0) {
    await prisma.activityOptionDateInventory.deleteMany({
      where: {
        optionId: {
          in: optionIds,
        },
      },
    });

    await prisma.activityOptionPricingTier.deleteMany({
      where: {
        optionId: {
          in: optionIds,
        },
      },
    });
  }

  await prisma.activityOption.deleteMany({
    where: { activityId },
  });

  await prisma.activityPricingTier.deleteMany({
    where: { activityId },
  });

  await prisma.activityPricing.deleteMany({
    where: { activityId },
  });

  await prisma.activityMedia.deleteMany({
    where: { activityId },
  });
}

async function importPackage(input: PackageInput, partnerId: string, reviewUserId: string) {
  const city = await prisma.city.upsert({
    where: {
      slug: input.citySlug,
    },
    update: {
      name: input.cityName,
      country: input.country,
      isActive: true,
    },
    create: {
      name: input.cityName,
      slug: input.citySlug,
      country: input.country,
      description: `${input.cityName} curated travel experiences by Alpii.`,
      isActive: true,
      sortOrder: 1,
    },
  });

  const destination = await prisma.destination.upsert({
    where: {
      slug: input.destinationSlug,
    },
    update: {
      name: input.destinationName,
      type: DestinationType.CITY,
      countryCode: input.countryCode,
      isActive: true,
    },
    create: {
      name: input.destinationName,
      slug: input.destinationSlug,
      type: DestinationType.CITY,
      countryCode: input.countryCode,
      description: `${input.destinationName} curated destination for Alpii experiences.`,
      imageUrl: input.media[0]?.url,
      isActive: true,
      sortOrder: 1,
    },
  });

  const category = await prisma.category.upsert({
    where: {
      slug: input.categorySlug,
    },
    update: {
      name: input.categoryName,
      icon: input.categoryIcon,
      isActive: true,
    },
    create: {
      name: input.categoryName,
      slug: input.categorySlug,
      description: `${input.categoryName} packages and curated experiences.`,
      icon: input.categoryIcon,
      isActive: true,
      sortOrder: 1,
    },
  });

  const existingActivity = await prisma.activity.findUnique({
    where: {
      slug: input.slug,
    },
  });

  if (existingActivity) {
    await clearActivityChildren(existingActivity.id);
  }

  const activity = await prisma.activity.upsert({
    where: {
      slug: input.slug,
    },
    update: {
      partnerId,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: input.title,
      shortDescription: input.shortDescription,
      description: input.description,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.TIERED,
      durationLabel: input.durationLabel,
      meetingPoint: input.meetingPoint,
      cancellationPolicy: input.cancellationPolicy,
      importantInfo: input.importantInfo,
      included: input.included,
      notIncluded: input.notIncluded,
      highlights: input.highlights,
      itinerary: input.itinerary,
      ratingAverage: input.ratingAverage,
      reviewCount: input.reviewCount,
      publishedAt: new Date(),
    },
    create: {
      partnerId,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: input.title,
      slug: input.slug,
      shortDescription: input.shortDescription,
      description: input.description,
      status: ActivityStatus.PUBLISHED,
      pricingMode: PricingMode.TIERED,
      durationLabel: input.durationLabel,
      meetingPoint: input.meetingPoint,
      cancellationPolicy: input.cancellationPolicy,
      importantInfo: input.importantInfo,
      included: input.included,
      notIncluded: input.notIncluded,
      highlights: input.highlights,
      itinerary: input.itinerary,
      ratingAverage: input.ratingAverage,
      reviewCount: input.reviewCount,
      publishedAt: new Date(),
    },
  });

  await prisma.activityMedia.createMany({
    data: input.media.map((media, index) => ({
      activityId: activity.id,
      url: media.url,
      altText: media.altText,
      isCover: media.isCover,
      sortOrder: index,
    })),
  });

  await prisma.activityPricing.create({
    data: {
      activityId: activity.id,
      currency: input.currency,
      priceCents: input.basePriceCents,
      priceType: "starts_from",
      isActive: true,
    },
  });

  await prisma.activityPricingTier.createMany({
    data: input.pricingTiers.map((tier) => ({
      activityId: activity.id,
      currency: input.currency,
      minTravelers: tier.minTravelers,
      maxTravelers: tier.maxTravelers,
      adultPriceCents: tier.adultPriceCents,
      childPriceCents: tier.childPriceCents,
      priceType: "per_person",
      isActive: true,
    })),
  });

  const today = new Date();

  for (const optionInput of input.options) {
    const option = await prisma.activityOption.create({
      data: {
        activityId: activity.id,
        title: optionInput.title,
        slug: optionInput.slug,
        description: optionInput.description,
        durationLabel: optionInput.durationLabel,
        meetingPoint: optionInput.meetingPoint,
        availabilityMode: AvailabilityMode.SCHEDULED_SESSIONS,
        availableDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        dailyCapacity: optionInput.dailyCapacity,
        isDefault: optionInput.isDefault,
        isActive: true,
        sortOrder: optionInput.sortOrder,
      },
    });

    await prisma.activityOptionPricingTier.createMany({
      data: optionInput.pricingTiers.map((tier) => ({
        optionId: option.id,
        currency: input.currency,
        minTravelers: tier.minTravelers,
        maxTravelers: tier.maxTravelers,
        adultPriceCents: tier.adultPriceCents,
        childPriceCents: tier.childPriceCents,
        priceType: "per_person",
        isActive: true,
      })),
    });

    for (let i = 1; i <= 14; i++) {
      const startDate = atHour(addDays(today, i), 9);
      const endDate = atHour(addDays(today, i), 17);

      await prisma.activityOptionDateInventory.upsert({
        where: {
          optionId_travelDate: {
            optionId: option.id,
            travelDate: startDate,
          },
        },
        update: {
          capacity: optionInput.dailyCapacity,
          bookedCount: 0,
        },
        create: {
          optionId: option.id,
          travelDate: startDate,
          capacity: optionInput.dailyCapacity,
          bookedCount: 0,
        },
      });

      await prisma.activityAvailability.create({
        data: {
          activityId: activity.id,
          optionId: option.id,
          startDateTime: startDate,
          endDateTime: endDate,
          capacity: optionInput.dailyCapacity,
          bookedCount: 0,
          isActive: true,
        },
      });
    }
  }

  await prisma.review.createMany({
    data: input.reviews.map((review) => ({
      userId: reviewUserId,
      activityId: activity.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: "APPROVED",
    })),
  });

  console.log(`Imported package: ${activity.title}`);
}

async function main() {
  console.log("Importing package 1 and 4...");

  const reviewUser = await prisma.user.findUnique({
    where: {
      email: reviewUserEmail,
    },
  });

  if (!reviewUser) {
    throw new Error(`Review user not found: ${reviewUserEmail}`);
  }

  const vendorUser = await prisma.user.findUnique({
    where: {
      email: vendorEmail,
    },
    include: {
      partner: true,
    },
  });

  if (!vendorUser || !vendorUser.partner) {
    throw new Error(`Vendor partner not found: ${vendorEmail}. Run import:vendors first.`);
  }

  for (const packageInput of packages) {
    await importPackage(packageInput, vendorUser.partner.id, reviewUser.id);
  }

  console.log("Done. Package 1 and 4 imported.");
}

main()
  .catch((error) => {
    console.error("Package import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
