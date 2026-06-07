import {
  ActivityStatus,
  PartnerStatus,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus
} from "@prisma/client";
import * as bcrypt from "bcrypt";

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
    title: "Ubud Cooking Class & Market Visit",
    slug: "ubud-cooking-class-market-visit",
    citySlug: "bali",
    categorySlug: "food-cooking",
    shortDescription: "Shop a traditional market, visit a local farm, and cook Balinese dishes.",
    description:
      "Begin with a guided visit to Ubud's morning market before heading to a family compound for a hands-on cooking session. Learn practical techniques, local context, and the stories behind classic Balinese dishes.",
    durationLabel: "3.5 hours",
    meetingPoint: "Ubud Central Market entrance, near the main parking area.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Please share dietary needs before the activity. Comfortable shoes are recommended.",
    ratingAverage: "4.9",
    reviewCount: 1248,
    currency: "IDR",
    priceCents: 54000000,
    coverUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1400&q=80",
    highlights: [
      "Explore Ubud's traditional market with a local host",
      "Cook classic Balinese dishes in a family compound",
      "Enjoy a shared lunch after the cooking session"
    ],
    included: ["Market tour", "Farm visit", "Cooking class", "Lunch", "Recipe notes"],
    notIncluded: ["Hotel transfer", "Personal expenses", "Tips"],
    itinerary: [
      { title: "Ubud Traditional Market", subtitle: "Ingredient walk with your host", durationLabel: "35 minutes" },
      { title: "Local Farm Visit", subtitle: "Fresh herbs, spices, and seasonal produce", durationLabel: "30 minutes" },
      { title: "Family Compound", subtitle: "Welcome drink and cooking setup", durationLabel: "20 minutes" },
      { title: "Cooking Session", subtitle: "Prepare several Balinese dishes", durationLabel: "90 minutes" },
      { title: "Shared Lunch", subtitle: "Sit down together and enjoy the meal", durationLabel: "45 minutes" }
    ]
  },
  {
    title: "Mount Batur Sunrise Jeep Adventure",
    slug: "mount-batur-sunrise-jeep-adventure",
    citySlug: "bali",
    categorySlug: "adventure",
    shortDescription: "Ride by jeep through volcanic landscapes and watch sunrise over Mount Batur.",
    description:
      "Travel before dawn to the Mount Batur area for a guided jeep route across volcanic terrain. Watch the sunrise, visit the black lava field, and close the morning with coffee plantation views.",
    durationLabel: "5 hours",
    meetingPoint: "Hotel pickup is available from selected Bali areas.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Bring a light jacket. Sunrise visibility depends on weather conditions.",
    ratingAverage: "4.8",
    reviewCount: 932,
    currency: "IDR",
    priceCents: 72000000,
    coverUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    highlights: [
      "Watch sunrise from a scenic Mount Batur viewpoint",
      "Cross black lava terrain by jeep",
      "Visit a local coffee plantation after the route"
    ],
    included: ["Jeep ride", "Driver guide", "Coffee plantation visit", "Selected area pickup"],
    notIncluded: ["Breakfast", "Personal expenses", "Tips"],
    itinerary: [
      { title: "Hotel pickup", subtitle: "Early morning pickup from selected locations", type: "start" },
      { title: "Sunrise Jeep Ride", subtitle: "Scenic viewpoint near Mount Batur", durationLabel: "90 minutes" },
      { title: "Black Lava Field", subtitle: "Volcanic landscape photo stops", durationLabel: "45 minutes" },
      { title: "Coffee Plantation", subtitle: "Local coffee and tea tasting", durationLabel: "45 minutes" },
      { title: "Drop-off", subtitle: "Return to your pickup area", type: "end" }
    ]
  },
  {
    title: "Tokyo Tea Ceremony Experience",
    slug: "tokyo-tea-ceremony-experience",
    citySlug: "tokyo",
    categorySlug: "cultural-experience",
    shortDescription: "Join a calm tea ceremony session guided by a Tokyo host.",
    description:
      "Step into a quiet tea room and learn the rhythm, etiquette, and meaning behind Japanese tea ceremony. This compact session is designed for travelers who want a respectful cultural introduction.",
    durationLabel: "75 minutes",
    meetingPoint: "Tea room address near Asakusa Station.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Please arrive 10 minutes early. Socks are recommended.",
    ratingAverage: "4.9",
    reviewCount: 812,
    currency: "USD",
    priceCents: 4800,
    coverUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1400&q=80",
    highlights: ["Learn tea ceremony etiquette", "Taste matcha and seasonal sweets", "Small-group cultural setting"],
    included: ["Tea ceremony host", "Matcha", "Seasonal sweets"],
    notIncluded: ["Hotel transfer", "Kimono rental"],
    itinerary: [
      { title: "Welcome", subtitle: "Introduction to the tea room" },
      { title: "Tea Ceremony", subtitle: "Guided matcha preparation", durationLabel: "50 minutes" },
      { title: "Questions", subtitle: "Short conversation with your host", durationLabel: "15 minutes" }
    ]
  },
  {
    title: "Asakusa Food Walk",
    slug: "asakusa-food-walk",
    citySlug: "tokyo",
    categorySlug: "food-cooking",
    shortDescription: "Taste street food and local snacks around historic Asakusa.",
    description:
      "Follow a local guide through side streets, snack counters, and traditional shops around Asakusa. Learn how food, neighborhood history, and local rituals connect.",
    durationLabel: "2.5 hours",
    meetingPoint: "Kaminarimon Gate, Asakusa.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "The route includes walking and standing tastings.",
    ratingAverage: "4.7",
    reviewCount: 546,
    currency: "USD",
    priceCents: 6900,
    coverUrl:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80",
    highlights: ["Taste local snacks", "Explore Asakusa side streets", "Learn neighborhood context from a guide"],
    included: ["Guide", "Food tastings", "Route notes"],
    notIncluded: ["Extra drinks", "Hotel transfer"],
    itinerary: [
      { title: "Kaminarimon Gate", subtitle: "Meet your guide" },
      { title: "Nakamise Area", subtitle: "Classic street snacks", durationLabel: "45 minutes" },
      { title: "Local Shops", subtitle: "Savory tastings and sweets", durationLabel: "75 minutes" },
      { title: "Asakusa Backstreets", subtitle: "Neighborhood context", durationLabel: "30 minutes" }
    ]
  },
  {
    title: "Paris Hidden Courtyard Walking Tour",
    slug: "paris-hidden-courtyard-walking-tour",
    citySlug: "paris",
    categorySlug: "guided-tour",
    shortDescription: "Walk through quieter Paris passages, courtyards, and local stories.",
    description:
      "Take a measured route through historic passages and hidden courtyards with a guide who connects architecture, daily life, and neighborhood history.",
    durationLabel: "2 hours",
    meetingPoint: "Near Palais Royal, exact point shared after booking.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Wear comfortable shoes and dress for the weather.",
    ratingAverage: "4.8",
    reviewCount: 421,
    currency: "USD",
    priceCents: 5900,
    coverUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
    highlights: ["See hidden passages", "Understand Parisian courtyard history", "Small-group walking pace"],
    included: ["Local guide", "Curated walking route"],
    notIncluded: ["Food and drinks", "Museum entry"],
    itinerary: [
      { title: "Palais Royal", subtitle: "Start the walk" },
      { title: "Covered Passages", subtitle: "Architecture and stories", durationLabel: "50 minutes" },
      { title: "Hidden Courtyards", subtitle: "Quiet residential corners", durationLabel: "50 minutes" }
    ]
  },
  {
    title: "Seine Evening Cruise",
    slug: "seine-evening-cruise",
    citySlug: "paris",
    categorySlug: "water-activity",
    shortDescription: "See Paris from the river during a relaxed evening cruise.",
    description:
      "Board a calm Seine cruise and pass Paris landmarks as the city shifts into evening light. A simple, scenic way to orient yourself in the city.",
    durationLabel: "75 minutes",
    meetingPoint: "Seine river pier near the Eiffel Tower.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Arrive 15 minutes before departure. Seating is first come, first served.",
    ratingAverage: "4.6",
    reviewCount: 1004,
    currency: "USD",
    priceCents: 3200,
    coverUrl:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=80",
    highlights: ["Cruise past major Paris landmarks", "Enjoy evening river views", "Easy meeting point near central Paris"],
    included: ["Cruise ticket", "Audio commentary"],
    notIncluded: ["Hotel transfer", "Food and drinks"],
    itinerary: [
      { title: "Boarding", subtitle: "Meet at the pier" },
      { title: "Seine Cruise", subtitle: "Landmark route along the river", durationLabel: "75 minutes" }
    ]
  },
  {
    title: "Zurich Old Town & Chocolate Walk",
    slug: "zurich-old-town-chocolate-walk",
    citySlug: "zurich",
    categorySlug: "food-cooking",
    shortDescription: "Explore Zurich lanes with chocolate tastings and local context.",
    description:
      "Walk through Zurich's old town with a local host and stop for selected chocolate tastings. The route balances city context with a calm tasting experience.",
    durationLabel: "2 hours",
    meetingPoint: "Zurich HB main hall meeting point.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Some tastings may contain dairy or nuts.",
    ratingAverage: "4.8",
    reviewCount: 388,
    currency: "USD",
    priceCents: 7400,
    coverUrl:
      "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=1400&q=80",
    highlights: ["Taste Swiss chocolate", "Walk Zurich old town", "Learn local food and city history"],
    included: ["Guide", "Chocolate tastings"],
    notIncluded: ["Hotel transfer", "Extra purchases"],
    itinerary: [
      { title: "Zurich HB", subtitle: "Meet your guide" },
      { title: "Old Town Lanes", subtitle: "Historic context", durationLabel: "45 minutes" },
      { title: "Chocolate Stops", subtitle: "Curated tastings", durationLabel: "60 minutes" }
    ]
  },
  {
    title: "Lake Zurich Paddle Experience",
    slug: "lake-zurich-paddle-experience",
    citySlug: "zurich",
    categorySlug: "water-activity",
    shortDescription: "Paddle a calm section of Lake Zurich with a local instructor.",
    description:
      "Enjoy a relaxed paddle session on Lake Zurich with safety briefing, local guidance, and time on the water. Designed for travelers who want a gentle outdoor break.",
    durationLabel: "90 minutes",
    meetingPoint: "Lake Zurich rental point, exact address shared after booking.",
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    importantInfo: "Activity depends on safe weather and lake conditions.",
    ratingAverage: "4.7",
    reviewCount: 214,
    currency: "USD",
    priceCents: 6200,
    coverUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    highlights: ["Paddle Lake Zurich", "Beginner-friendly briefing", "Calm outdoor city escape"],
    included: ["Paddle equipment", "Instructor", "Safety briefing"],
    notIncluded: ["Swimwear", "Locker rental"],
    itinerary: [
      { title: "Check-in", subtitle: "Meet the instructor" },
      { title: "Safety Briefing", subtitle: "Equipment and technique", durationLabel: "20 minutes" },
      { title: "Lake Paddle", subtitle: "Guided water time", durationLabel: "60 minutes" }
    ]
  }
];

async function main() {
  const demoPasswordHash = await bcrypt.hash(demoPassword, 12);

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

  for (const activity of activities) {
    const cityId = cityBySlug.get(activity.citySlug);
    const categoryId = categoryBySlug.get(activity.categorySlug);

    if (!cityId || !categoryId) {
      throw new Error(`Missing city or category for activity ${activity.slug}`);
    }

    const savedActivity = await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: {
        partnerId: partner.id,
        cityId,
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
        ratingAverage: new Prisma.Decimal(activity.ratingAverage),
        reviewCount: activity.reviewCount,
        publishedAt: new Date()
      },
      create: {
        partnerId: partner.id,
        cityId,
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
        ratingAverage: new Prisma.Decimal(activity.ratingAverage),
        reviewCount: activity.reviewCount,
        publishedAt: new Date()
      }
    });

    await prisma.activityPricing.deleteMany({ where: { activityId: savedActivity.id } });
    await prisma.activityMedia.deleteMany({ where: { activityId: savedActivity.id } });
    await prisma.activityAvailability.deleteMany({ where: { activityId: savedActivity.id } });

    await prisma.activityPricing.create({
      data: {
        activityId: savedActivity.id,
        currency: activity.currency,
        priceCents: activity.priceCents,
        priceType: "per_person",
        isActive: true
      }
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

    await prisma.activityAvailability.createMany({
      data: [7, 14, 21].map((dayOffset) => {
        const startDateTime = new Date();
        startDateTime.setUTCDate(startDateTime.getUTCDate() + dayOffset);
        startDateTime.setUTCHours(9, 0, 0, 0);

        return {
          activityId: savedActivity.id,
          startDateTime,
          capacity: 12,
          bookedCount: 0,
          isActive: true
        };
      })
    });
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: "SEED_DATABASE",
      entityType: "database",
      metadata: {
        users: 3,
        cities: cities.length,
        categories: categories.length,
        activities: activities.length
      }
    }
  });
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
