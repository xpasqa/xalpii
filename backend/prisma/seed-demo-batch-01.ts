import {
  ActivityStatus,
  AvailabilityMode,
  BookingStatus,
  DestinationType,
  ParticipantType,
  PartnerStatus,
  PaymentProvider,
  PaymentStatus,
  PricingMode,
  Prisma,
  PrismaClient,
  ReviewStatus,
  UserRole,
  UserStatus,
  VoucherStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

const availableDays = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const mediaPools: Record<string, string[]> = {
  tokyo: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1400&q=85',
  ],
  fuji: [
    'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1400&q=85',
  ],
  paris: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1400&q=85',
  ],
};

type DemoActivity = {
  title: string;
  slug: string;
  partnerBusinessName: string;
  partnerEmail: string;
  cityName: string;
  citySlug: string;
  country: string;
  destinationName: string;
  destinationSlug: string;
  countryCode: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  mediaKey: string;
  durationLabel: string;
  basePriceCents: number;
  meetingTimes: string[];
  shortDescription: string;
  description: string;
  meetingPoint: string;
  cancellationPolicy: string;
  importantInfo: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary: Array<{
    title: string;
    subtitle: string;
    durationLabel: string;
    type: string;
  }>;
  optionOneTitle: string;
  optionOneSlug: string;
  optionOneDescription: string;
  optionTwoTitle: string;
  optionTwoSlug: string;
  optionTwoDescription: string;
  reviews: Array<{
    rating: number;
    title: string;
    comment: string;
    isFeatured: boolean;
  }>;
};

const demoActivities: DemoActivity[] = [
  {
    title: 'Tokyo Hidden Food Alley Night Walk',
    slug: 'tokyo-hidden-food-alley-night-walk',
    partnerBusinessName: 'Tokyo Local Expert',
    partnerEmail: 'partner.tokyo-local-expert@alpii.local',
    cityName: 'Tokyo',
    citySlug: 'tokyo',
    country: 'Japan',
    destinationName: 'Tokyo',
    destinationSlug: 'tokyo',
    countryCode: 'JP',
    categoryName: 'Food & Culture',
    categorySlug: 'food-culture',
    categoryIcon: 'utensils',
    mediaKey: 'tokyo',
    durationLabel: '3 hours',
    basePriceCents: 6800,
    meetingTimes: ['17:30', '18:00', '18:30'],
    shortDescription:
      'Explore Tokyo’s tucked-away food alleys with a local host, small bites, and easy cultural context along the way.',
    description:
      'Step into Tokyo after dark with a local expert who knows the small alleys, casual counters, and neighborhood food spots that are easy to miss alone. This curated night walk is designed for travelers who want a relaxed introduction to Tokyo food culture, with simple logistics, friendly guidance, and a route that balances iconic atmosphere with local detail.',
    meetingPoint: 'Meet near Shinjuku Station at a confirmed exit after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Food stops may vary by opening hours and local conditions. Please wear comfortable shoes and let us know about dietary restrictions after booking.',
    highlights: [
      'Walk through atmospheric Tokyo food alleys',
      'Try curated local bites across several stops',
      'Learn simple food etiquette from a local host',
      'Great first-night experience in Tokyo',
      'Small-group friendly route with easy pacing',
    ],
    included: [
      'Local host coordination',
      'Guided walking route',
      'Selected small bites',
      'Basic food etiquette guidance',
      'Restaurant and alley recommendations after the tour',
    ],
    notIncluded: [
      'Extra food and drinks',
      'Hotel pickup and drop-off',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Meet in Shinjuku',
        subtitle: 'Start with a short briefing and route overview',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Hidden alley walk',
        subtitle: 'Explore lantern-lit lanes and local food corners',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Curated tasting stops',
        subtitle: 'Try simple local bites while learning food culture',
        durationLabel: '1.5 hours',
        type: 'food',
      },
      {
        title: 'Local recommendation handoff',
        subtitle: 'Finish with nearby tips for the rest of your evening',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Food Alley Walk',
    optionOneSlug: 'shared-food-alley-walk',
    optionOneDescription:
      'A polished shared evening route through Tokyo food alleys with a local host and curated small bites.',
    optionTwoTitle: 'Private Food Alley Walk',
    optionTwoSlug: 'private-food-alley-walk',
    optionTwoDescription:
      'A private version of the route with more flexible pacing and extra local recommendations.',
    reviews: [
      {
        rating: 5,
        title: 'Perfect first night in Tokyo',
        comment:
          'The walk made Tokyo feel much easier to understand. The host chose great alleys, explained what to order, and kept the evening relaxed.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Local, simple, and memorable',
        comment:
          'We would not have found these small places alone. It felt curated but still casual, which was exactly what we wanted.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great food route with good pacing',
        comment:
          'The alleys were lively and the food stops were fun. A few areas were crowded, but the host handled the flow well.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Tokyo Anime, Arcade & Pop Culture Day',
    slug: 'tokyo-anime-arcade-pop-culture-day',
    partnerBusinessName: 'Tokyo Local Expert',
    partnerEmail: 'partner.tokyo-local-expert@alpii.local',
    cityName: 'Tokyo',
    citySlug: 'tokyo',
    country: 'Japan',
    destinationName: 'Akihabara',
    destinationSlug: 'akihabara',
    countryCode: 'JP',
    categoryName: 'Entertainment',
    categorySlug: 'entertainment',
    categoryIcon: 'sparkles',
    mediaKey: 'tokyo',
    durationLabel: '6 hours',
    basePriceCents: 9200,
    meetingTimes: ['10:00', '11:00', '12:00'],
    shortDescription:
      'Dive into Tokyo’s anime, arcade, gaming, and pop-culture neighborhoods with a local guide who keeps the day easy.',
    description:
      'Spend a playful day exploring Tokyo’s pop-culture side, from anime shops and themed streets to arcades, capsule toys, and gaming corners. This experience is made for first-time visitors who want the fun without getting lost in the options, with a local expert shaping the route around the group’s interests.',
    meetingPoint: 'Meet near Akihabara Station at a confirmed exit after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Arcade spending, merchandise, and optional café entry are not included. Route may be adjusted based on crowd levels and interests.',
    highlights: [
      'Explore Tokyo’s anime and gaming culture',
      'Visit arcades, hobby shops, and capsule toy corners',
      'Get help navigating Akihabara like a first-timer',
      'Flexible route for anime, games, or collectibles',
      'Fun choice for friends, couples, and families',
    ],
    included: [
      'Local guide coordination',
      'Pop-culture walking route',
      'Arcade and shop recommendations',
      'Basic translation support during the route',
      'Small welcome drink',
    ],
    notIncluded: [
      'Arcade game credits',
      'Merchandise purchases',
      'Meals',
      'Optional themed café entry',
      'Hotel pickup and drop-off',
    ],
    itinerary: [
      {
        title: 'Akihabara meetup',
        subtitle: 'Start with your interests and route preference',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Anime and hobby shop route',
        subtitle: 'Browse selected pop-culture stores and collectible corners',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Arcade session',
        subtitle: 'Try classic and modern arcade experiences',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Capsule toys and photo stops',
        subtitle: 'Visit playful local stops and themed streets',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Local tips handoff',
        subtitle: 'Finish with recommendations for cafés and shops',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Pop Culture Day',
    optionOneSlug: 'shared-pop-culture-day',
    optionOneDescription:
      'A shared Tokyo pop-culture route covering anime, arcades, capsule toys, and local recommendations.',
    optionTwoTitle: 'Private Anime & Gaming Route',
    optionTwoSlug: 'private-anime-gaming-route',
    optionTwoDescription:
      'A private route tailored toward anime, gaming, collectibles, or themed café interests.',
    reviews: [
      {
        rating: 5,
        title: 'So much easier with a local',
        comment:
          'Akihabara can feel overwhelming, but the guide made it fun and easy. We found shops and arcades we would have missed.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Great for anime fans',
        comment:
          'The route was flexible and matched what we liked. It felt like exploring with a knowledgeable friend.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Fun and energetic day',
        comment:
          'The arcades and shops were great. It was busy in some places, but the route stayed organized.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Tokyo Tea Ceremony & Old Town Culture Class',
    slug: 'tokyo-tea-ceremony-old-town-culture-class',
    partnerBusinessName: 'Tokyo Local Expert',
    partnerEmail: 'partner.tokyo-local-expert@alpii.local',
    cityName: 'Tokyo',
    citySlug: 'tokyo',
    country: 'Japan',
    destinationName: 'Asakusa',
    destinationSlug: 'asakusa',
    countryCode: 'JP',
    categoryName: 'Culture',
    categorySlug: 'culture',
    categoryIcon: 'landmark',
    mediaKey: 'tokyo',
    durationLabel: '4 hours',
    basePriceCents: 8400,
    meetingTimes: ['09:30', '10:30', '13:30'],
    shortDescription:
      'Experience a calm tea ceremony session and a guided old-town cultural walk through Tokyo’s traditional side.',
    description:
      'Discover a slower side of Tokyo with a tea ceremony class and an old-town cultural walk around historic streets, temple areas, and local craft corners. This experience is designed for travelers who want cultural context, gentle pacing, and a polished introduction to Japanese traditions without feeling formal or intimidating.',
    meetingPoint: 'Meet near Asakusa Station at a confirmed exit after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Please arrive on time for the tea ceremony session. Socks are recommended and modest, comfortable clothing is preferred.',
    highlights: [
      'Join a beginner-friendly tea ceremony class',
      'Explore Tokyo’s old-town atmosphere',
      'Learn cultural context in a relaxed way',
      'Visit temple streets and traditional corners',
      'Ideal for first-time visitors seeking calm culture',
    ],
    included: [
      'Tea ceremony class coordination',
      'Matcha and traditional sweet',
      'Guided old-town walking route',
      'Local cultural explanations',
      'Small-group host support',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Additional food and drinks',
      'Personal shopping',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Asakusa meetup',
        subtitle: 'Meet your local host and walk to the cultural venue',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Tea ceremony class',
        subtitle: 'Learn the basics of matcha preparation and etiquette',
        durationLabel: '1.5 hours',
        type: 'class',
      },
      {
        title: 'Old-town culture walk',
        subtitle: 'Explore traditional streets, temple areas, and local corners',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Local craft and snack tips',
        subtitle: 'Finish with recommendations for nearby shops and cafés',
        durationLabel: '30 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Tea Ceremony & Old Town Walk',
    optionOneSlug: 'tea-ceremony-old-town-walk',
    optionOneDescription:
      'A beginner-friendly tea class followed by a gentle cultural walk around Tokyo’s old-town streets.',
    optionTwoTitle: 'Private Tea Culture Class',
    optionTwoSlug: 'private-tea-culture-class',
    optionTwoDescription:
      'A private cultural session with more time for questions, photos, and old-town recommendations.',
    reviews: [
      {
        rating: 5,
        title: 'Calm and meaningful',
        comment:
          'The tea ceremony was explained clearly and felt welcoming. The old-town walk afterwards gave the experience more context.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Beautiful cultural introduction',
        comment:
          'A lovely way to slow down in Tokyo. The host was patient and the class was perfect for beginners.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Relaxed and well organized',
        comment:
          'The ceremony was peaceful and the walking route was easy. A nice contrast to the busier parts of Tokyo.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Mount Fuji Scenic Day Escape',
    slug: 'mount-fuji-scenic-day-escape',
    partnerBusinessName: 'Tokyo Local Expert',
    partnerEmail: 'partner.tokyo-local-expert@alpii.local',
    cityName: 'Tokyo',
    citySlug: 'tokyo',
    country: 'Japan',
    destinationName: 'Mount Fuji',
    destinationSlug: 'mount-fuji',
    countryCode: 'JP',
    categoryName: 'Nature',
    categorySlug: 'nature',
    categoryIcon: 'mountain',
    mediaKey: 'fuji',
    durationLabel: '10 hours',
    basePriceCents: 14800,
    meetingTimes: ['07:00', '07:30', '08:00'],
    shortDescription:
      'Escape Tokyo for a scenic Mount Fuji day route with lake views, photo stops, and relaxed local coordination.',
    description:
      'Travel from Tokyo toward Mount Fuji for a polished scenic day with viewpoint stops, lake atmosphere, local route coordination, and enough flexibility for weather conditions. This experience is built for travelers who want a comfortable Fuji escape without managing transport, timing, and route choices on their own.',
    meetingPoint: 'Pickup from selected Tokyo areas or a confirmed central meeting point.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Mount Fuji visibility depends on weather and cannot be guaranteed. Please bring a light jacket and comfortable shoes.',
    highlights: [
      'Enjoy a scenic Mount Fuji day escape from Tokyo',
      'Visit curated viewpoints and lake areas',
      'Comfortable option for first-time Japan travelers',
      'Flexible route based on weather and visibility',
      'Great for couples, families, and small groups',
    ],
    included: [
      'Pickup and drop-off from selected Tokyo areas',
      'Private or shared transport coordination',
      'Local driver or host coordination',
      'Curated scenic stops',
      'Bottled water',
    ],
    notIncluded: [
      'Meals and drinks',
      'Optional attraction admission',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Tokyo departure',
        subtitle: 'Pickup or meetup before driving toward Fuji area',
        durationLabel: '2 hours',
        type: 'transport',
      },
      {
        title: 'Fuji viewpoint stop',
        subtitle: 'Visit a scenic area for photos and mountain views',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Lake area visit',
        subtitle: 'Enjoy a relaxed route around a nearby lake area',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Local lunch break',
        subtitle: 'Stop for lunch based on route and group preference',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Return to Tokyo',
        subtitle: 'Drive back and drop off at selected areas',
        durationLabel: '2.5 hours',
        type: 'end',
      },
    ],
    optionOneTitle: 'Fuji Scenic Shared Day',
    optionOneSlug: 'fuji-scenic-shared-day',
    optionOneDescription:
      'A scenic day route from Tokyo with Mount Fuji viewpoints, lake stops, and comfortable shared coordination.',
    optionTwoTitle: 'Private Fuji Scenic Escape',
    optionTwoSlug: 'private-fuji-scenic-escape',
    optionTwoDescription:
      'A private Fuji route with more flexible pacing, photo stops, and pickup coordination.',
    reviews: [
      {
        rating: 5,
        title: 'Beautiful and easy Fuji day',
        comment:
          'The route was smooth and the viewpoints were beautiful. It was much easier than trying to plan the transport ourselves.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Great day outside Tokyo',
        comment:
          'The host adjusted the stops based on the weather and we still had a wonderful day around Fuji and the lake.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Scenic and comfortable',
        comment:
          'Fuji was partly cloudy, but the route was still very enjoyable. The day felt organized and relaxed.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Paris Pastry Baking Class with Local Chef',
    slug: 'paris-pastry-baking-class-with-local-chef',
    partnerBusinessName: 'Paris Memory Travel',
    partnerEmail: 'partner.paris-memory-travel@alpii.local',
    cityName: 'Paris',
    citySlug: 'paris',
    country: 'France',
    destinationName: 'Paris',
    destinationSlug: 'paris',
    countryCode: 'FR',
    categoryName: 'Food & Culture',
    categorySlug: 'food-culture',
    categoryIcon: 'utensils',
    mediaKey: 'paris',
    durationLabel: '3.5 hours',
    basePriceCents: 11200,
    meetingTimes: ['09:00', '10:00', '14:00'],
    shortDescription:
      'Learn classic French pastry techniques in Paris with a local chef and enjoy your handmade creations.',
    description:
      'Join a warm, hands-on pastry baking class in Paris guided by a local chef. Learn approachable techniques, prepare classic French sweets, and enjoy a relaxed tasting session at the end. This experience is designed for travelers who want a memorable Paris moment that feels personal, creative, and easy to join.',
    meetingPoint: 'Meet at the cooking studio address confirmed after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Please arrive 10 minutes early. Let us know about food allergies after booking so the team can confirm available adjustments.',
    highlights: [
      'Bake classic French pastries with a local chef',
      'Hands-on class suitable for beginners',
      'Learn simple techniques you can repeat at home',
      'Enjoy a tasting session after baking',
      'Great indoor experience for couples and families',
    ],
    included: [
      'Local chef instruction',
      'Cooking studio access',
      'Ingredients and baking equipment',
      'Pastry tasting session',
      'Coffee, tea, or water',
      'Recipe notes after class',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Extra drinks',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Studio welcome',
        subtitle: 'Meet your chef and get an overview of the class',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Pastry preparation',
        subtitle: 'Learn ingredients, dough or cream basics, and shaping',
        durationLabel: '1.5 hours',
        type: 'class',
      },
      {
        title: 'Bake and finish',
        subtitle: 'Bake, decorate, and prepare the pastries for tasting',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Tasting session',
        subtitle: 'Enjoy your pastries with coffee or tea',
        durationLabel: '45 minutes',
        type: 'food',
      },
    ],
    optionOneTitle: 'Shared Pastry Baking Class',
    optionOneSlug: 'shared-pastry-baking-class',
    optionOneDescription:
      'A shared hands-on Paris pastry class with a local chef, ingredients, equipment, and tasting included.',
    optionTwoTitle: 'Private Pastry Class',
    optionTwoSlug: 'private-pastry-class',
    optionTwoDescription:
      'A private baking class with a more personal pace, extra chef attention, and flexible group flow.',
    reviews: [
      {
        rating: 5,
        title: 'A favorite Paris memory',
        comment:
          'The chef was kind and clear, and the pastries were delicious. It felt personal and much more memorable than just visiting a bakery.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Fun and beginner friendly',
        comment:
          'We are not expert bakers, but the class was easy to follow. The tasting at the end was lovely.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Sweet and well organized',
        comment:
          'The class was smooth and the chef explained everything well. A nice indoor activity in Paris.',
        isFeatured: false,
      },
    ],
  },
];

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function ensureUser(email: string, fullName: string, role: UserRole) {
  return prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      role,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      fullName,
      role,
      status: UserStatus.ACTIVE,
    },
  });
}

async function ensurePartner(businessName: string, email: string, country: string, city: string) {
  const existing = await prisma.partner.findFirst({
    where: { businessName },
  });

  if (existing) {
    return existing;
  }

  const user = await ensureUser(email, businessName, UserRole.PARTNER);

  return prisma.partner.create({
    data: {
      userId: user.id,
      businessName,
      legalName: businessName,
      status: PartnerStatus.APPROVED,
      country,
      city,
      description: `${businessName} is a curated local experience partner for polished city and cultural trips.`,
    },
  });
}

async function ensureCity(name: string, slug: string, country: string) {
  const existing = await prisma.city.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing;
  }

  return prisma.city.create({
    data: {
      name,
      slug,
      country,
      description: `${name} curated experiences and local activities.`,
      isActive: true,
      sortOrder: 100,
    },
  });
}

async function ensureDestination(name: string, slug: string, countryCode: string) {
  const existing = await prisma.destination.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing;
  }

  return prisma.destination.create({
    data: {
      name,
      slug,
      type: DestinationType.CITY,
      countryCode,
      description: `${name} curated destination for local experiences.`,
      isActive: true,
      sortOrder: 100,
    },
  });
}

async function ensureCategory(name: string, slug: string, icon: string) {
  const existing = await prisma.category.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing;
  }

  return prisma.category.create({
    data: {
      name,
      slug,
      icon,
      description: `${name} experiences curated for travelers.`,
      isActive: true,
      sortOrder: 100,
    },
  });
}

async function deleteExistingActivity(activityId: string) {
  const bookings = await prisma.booking.findMany({
    where: { activityId },
    select: { id: true },
  });

  const bookingIds = bookings.map((booking) => booking.id);

  if (bookingIds.length > 0) {
    const existingReviews = await prisma.review.findMany({
      where: { bookingId: { in: bookingIds } },
      select: { id: true },
    });

    const reviewIds = existingReviews.map((review) => review.id);

    if (reviewIds.length > 0) {
      await prisma.reviewMedia.deleteMany({
        where: { reviewId: { in: reviewIds } },
      });
    }

    await prisma.review.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });

    await prisma.voucher.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });

    await prisma.payment.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });

    await prisma.bookingParticipant.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });

    await prisma.booking.deleteMany({
      where: { id: { in: bookingIds } },
    });
  }

  const options = await prisma.activityOption.findMany({
    where: { activityId },
    select: { id: true },
  });

  const optionIds = options.map((option) => option.id);

  if (optionIds.length > 0) {
    await prisma.activityOptionDateInventory.deleteMany({
      where: { optionId: { in: optionIds } },
    });

    await prisma.activityAvailability.deleteMany({
      where: { optionId: { in: optionIds } },
    });

    await prisma.activityOptionPricingTier.deleteMany({
      where: { optionId: { in: optionIds } },
    });

    await prisma.activityOption.deleteMany({
      where: { id: { in: optionIds } },
    });
  }

  await prisma.activityPricingTier.deleteMany({
    where: { activityId },
  });

  await prisma.activityPricing.deleteMany({
    where: { activityId },
  });

  await prisma.activityMedia.deleteMany({
    where: { activityId },
  });

  await prisma.activityRevision.deleteMany({
    where: { activityId },
  });

  await prisma.activity.delete({
    where: { id: activityId },
  });
}

function buildTiers(basePriceCents: number, multiplier = 1) {
  const price = (value: number) => Math.round(value * multiplier);

  return [
    {
      minTravelers: 1,
      maxTravelers: 1,
      adultPriceCents: price(basePriceCents),
      childPriceCents: price(Math.round(basePriceCents * 0.73)),
    },
    {
      minTravelers: 2,
      maxTravelers: 2,
      adultPriceCents: price(Math.round(basePriceCents * 0.95)),
      childPriceCents: price(Math.round(basePriceCents * 0.95 * 0.73)),
    },
    {
      minTravelers: 3,
      maxTravelers: 4,
      adultPriceCents: price(Math.round(basePriceCents * 0.9)),
      childPriceCents: price(Math.round(basePriceCents * 0.9 * 0.73)),
    },
    {
      minTravelers: 5,
      maxTravelers: 8,
      adultPriceCents: price(Math.round(basePriceCents * 0.84)),
      childPriceCents: price(Math.round(basePriceCents * 0.84 * 0.73)),
    },
    {
      minTravelers: 9,
      maxTravelers: 12,
      adultPriceCents: price(Math.round(basePriceCents * 0.78)),
      childPriceCents: price(Math.round(basePriceCents * 0.78 * 0.73)),
    },
  ];
}

async function createOptionPricingTiers(
  optionId: string,
  tiers: ReturnType<typeof buildTiers>,
) {
  for (const tier of tiers) {
    await prisma.activityOptionPricingTier.create({
      data: {
        optionId,
        currency: 'USD',
        priceType: 'per_person',
        minTravelers: tier.minTravelers,
        maxTravelers: tier.maxTravelers,
        adultPriceCents: tier.adultPriceCents,
        childPriceCents: tier.childPriceCents,
        childDiscountPercent: new Prisma.Decimal(27),
        isActive: true,
      },
    });
  }
}

async function createReviews(activityId: string, optionId: string, activitySlug: string, basePriceCents: number, reviews: DemoActivity['reviews']) {
  for (const [index, reviewData] of reviews.entries()) {
    const reviewerNumber = index + 1;
    const email = `${activitySlug}.reviewer${reviewerNumber}@alpii.local`;
    const fullName = `${toTitleCaseFromSlug(activitySlug)} Reviewer ${reviewerNumber}`;

    const user = await ensureUser(email, fullName, UserRole.USER);
    const totalAmountCents = basePriceCents * 2;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId,
        optionId,
        status: BookingStatus.COMPLETED,
        currency: 'USD',
        totalAmountCents,
        travelDate: new Date(`2026-07-${String(10 + index).padStart(2, '0')}T00:00:00.000Z`),
        meetingTime: index === 0 ? '10:00' : index === 1 ? '14:00' : '18:00',
      },
    });

    await prisma.bookingParticipant.create({
      data: {
        bookingId: booking.id,
        participantType: ParticipantType.ADULT,
        label: 'Adult',
        quantity: 2,
        priceCents: totalAmountCents,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: PaymentProvider.DUMMY,
        status: PaymentStatus.PAID,
        currency: 'USD',
        amountCents: totalAmountCents,
        paidAt: new Date(),
      },
    });

    const voucherCode = `ALPII-${activitySlug.toUpperCase().replace(/-/g, '_')}-${reviewerNumber}`;

    await prisma.voucher.create({
      data: {
        bookingId: booking.id,
        code: voucherCode,
        status: VoucherStatus.USED,
        qrPayload: `alpii://voucher/${voucherCode}`,
        usedAt: new Date(),
      },
    });

    await prisma.review.create({
      data: {
        activityId,
        optionId,
        userId: user.id,
        bookingId: booking.id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        status: ReviewStatus.APPROVED,
        isFeatured: reviewData.isFeatured,
        approvedAt: new Date(),
      },
    });
  }
}

async function seedActivity(item: DemoActivity) {
  const partner = await ensurePartner(
    item.partnerBusinessName,
    item.partnerEmail,
    item.country,
    item.cityName,
  );

  const city = await ensureCity(item.cityName, item.citySlug, item.country);
  const destination = await ensureDestination(item.destinationName, item.destinationSlug, item.countryCode);
  const category = await ensureCategory(item.categoryName, item.categorySlug, item.categoryIcon);

  const existingActivity = await prisma.activity.findUnique({
    where: { slug: item.slug },
    select: { id: true },
  });

  if (existingActivity) {
    await deleteExistingActivity(existingActivity.id);
  }

  const activity = await prisma.activity.create({
    data: {
      partnerId: partner.id,
      cityId: city.id,
      destinationId: destination.id,
      categoryId: category.id,
      title: item.title,
      slug: item.slug,
      status: ActivityStatus.PUBLISHED,
      durationLabel: item.durationLabel,
      pricingMode: PricingMode.GROUP_TIER,
      shortDescription: item.shortDescription,
      description: item.description,
      meetingPoint: item.meetingPoint,
      cancellationPolicy: item.cancellationPolicy,
      importantInfo: item.importantInfo,
      highlights: item.highlights,
      included: item.included,
      notIncluded: item.notIncluded,
      itinerary: item.itinerary as Prisma.InputJsonValue,
      ratingAverage: new Prisma.Decimal(0),
      reviewCount: 0,
      publishedAt: new Date(),
    },
  });

  await prisma.activityPricing.create({
    data: {
      activityId: activity.id,
      currency: 'USD',
      priceCents: item.basePriceCents,
      priceType: 'per_person',
      isActive: true,
    },
  });

  const mediaUrls = mediaPools[item.mediaKey] ?? mediaPools.tokyo;

  for (const [index, url] of mediaUrls.entries()) {
    await prisma.activityMedia.create({
      data: {
        activityId: activity.id,
        url,
        altText: `${item.title} ${index + 1}`,
        sortOrder: index,
        isCover: index === 0,
      },
    });
  }

  const defaultOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: item.optionOneTitle,
      slug: item.optionOneSlug,
      description: item.optionOneDescription,
      durationLabel: item.durationLabel,
      meetingPoint: item.meetingPoint,
      meetingTimes: item.meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 24,
      isDefault: true,
      isActive: true,
      sortOrder: 0,
    },
  });

  const privateOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: item.optionTwoTitle,
      slug: item.optionTwoSlug,
      description: item.optionTwoDescription,
      durationLabel: item.durationLabel,
      meetingPoint: item.meetingPoint,
      meetingTimes: item.meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 12,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
    },
  });

  await createOptionPricingTiers(defaultOption.id, buildTiers(item.basePriceCents));
  await createOptionPricingTiers(privateOption.id, buildTiers(item.basePriceCents, 1.35));

  await createReviews(activity.id, defaultOption.id, item.slug, item.basePriceCents, item.reviews);

  const approvedReviewAggregate = await prisma.review.aggregate({
    where: {
      activityId: activity.id,
      status: ReviewStatus.APPROVED,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const ratingAverage = approvedReviewAggregate._avg.rating ?? 0;
  const reviewCount = approvedReviewAggregate._count.rating;

  await prisma.activity.update({
    where: { id: activity.id },
    data: {
      ratingAverage: new Prisma.Decimal(ratingAverage),
      reviewCount,
    },
  });

  return {
    slug: activity.slug,
    ratingAverage,
    reviewCount,
  };
}

async function main() {
  const results = [];

  for (const item of demoActivities) {
    const result = await seedActivity(item);
    results.push(result);
    console.log(`Seeded: ${result.slug}`);
  }

  console.log('');
  console.log('Seeded demo batch 01');
  console.log(`Activities created: ${results.length}`);
  console.log(`Options created: ${results.length * 2}`);
  console.log(`Reviews created: ${results.length * 3}`);
  console.log('Slugs:');
  for (const result of results) {
    console.log(`- ${result.slug} | rating ${result.ratingAverage} | reviews ${result.reviewCount}`);
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed demo batch 01');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
