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
  mediaUrls: string[];
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
    title: 'Bali Cooking Class & Local Market Visit',
    slug: 'bali-cooking-class-local-market-visit',
    partnerBusinessName: 'Bali Culture Trip',
    partnerEmail: 'partner.bali-culture-trip@alpii.local',
    cityName: 'Bali',
    citySlug: 'bali',
    country: 'Indonesia',
    destinationName: 'Ubud',
    destinationSlug: 'ubud',
    countryCode: 'ID',
    categoryName: 'Food & Culture',
    categorySlug: 'food-culture',
    categoryIcon: 'utensils',
    mediaUrls: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '5 hours',
    basePriceCents: 6200,
    meetingTimes: ['08:00', '09:00', '10:00'],
    shortDescription:
      'Visit a local Bali market, learn Balinese ingredients, and cook a traditional meal in a relaxed hands-on class.',
    description:
      'Start with a guided local market visit to learn the ingredients behind Balinese cooking, then continue to a hands-on class where you prepare a traditional meal with friendly local instruction. This experience is designed for travelers who want a warm cultural food moment, practical cooking tips, and an easy half-day plan in Bali.',
    meetingPoint: 'Pickup from selected Ubud areas or direct meeting point confirmed after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Please inform us about allergies or dietary restrictions after booking. The market visit may vary by local opening hours.',
    highlights: [
      'Visit a local Bali market with guided ingredient explanation',
      'Cook traditional Balinese dishes in a hands-on class',
      'Learn spices, sauces, and simple cooking techniques',
      'Enjoy the meal you prepare after class',
      'Great cultural food experience for couples and families',
    ],
    included: [
      'Local market visit',
      'Cooking instructor',
      'Ingredients and cooking equipment',
      'Meal after class',
      'Recipe notes',
      'Bottled water',
    ],
    notIncluded: [
      'Hotel pickup outside selected areas',
      'Extra drinks',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Market meetup',
        subtitle: 'Meet your host and explore local ingredients',
        durationLabel: '1 hour',
        type: 'start',
      },
      {
        title: 'Cooking preparation',
        subtitle: 'Learn spices, sauces, and traditional cooking basics',
        durationLabel: '1 hour',
        type: 'class',
      },
      {
        title: 'Hands-on cooking class',
        subtitle: 'Prepare several Balinese dishes with local instruction',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Shared meal',
        subtitle: 'Enjoy the dishes you prepared together',
        durationLabel: '1 hour',
        type: 'food',
      },
    ],
    optionOneTitle: 'Shared Market & Cooking Class',
    optionOneSlug: 'shared-market-cooking-class',
    optionOneDescription:
      'A shared Bali market visit and hands-on cooking class with meal and recipe notes included.',
    optionTwoTitle: 'Private Balinese Cooking Class',
    optionTwoSlug: 'private-balinese-cooking-class',
    optionTwoDescription:
      'A private cooking experience with flexible pacing, more chef attention, and optional dietary adjustment.',
    reviews: [
      {
        rating: 5,
        title: 'Warm and delicious experience',
        comment:
          'The market visit made the class feel very local. The cooking was easy to follow and the food was delicious.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Best cultural food activity',
        comment:
          'We learned so much about Balinese ingredients and had a great meal afterwards. Everything felt friendly and organized.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Fun class with local flavor',
        comment:
          'The class was relaxed and tasty. The market was a bit busy, but that made it feel authentic.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Dubai Desert Safari, Camel Ride & Sunset Dinner',
    slug: 'dubai-desert-safari-camel-ride-sunset-dinner',
    partnerBusinessName: 'Dubai Premium Experience',
    partnerEmail: 'partner.dubai-premium-experience@alpii.local',
    cityName: 'Dubai',
    citySlug: 'dubai',
    country: 'United Arab Emirates',
    destinationName: 'Dubai Desert',
    destinationSlug: 'dubai-desert',
    countryCode: 'AE',
    categoryName: 'Adventure',
    categorySlug: 'adventure',
    categoryIcon: 'mountain',
    mediaUrls: [
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '6 hours',
    basePriceCents: 9800,
    meetingTimes: ['14:30', '15:00', '15:30'],
    shortDescription:
      'Experience a premium Dubai desert evening with dune route, camel ride, sunset photos, and dinner camp coordination.',
    description:
      'Leave the city for a polished Dubai desert safari experience featuring a scenic dune route, short camel ride, sunset photo time, and dinner camp coordination. This package is made for travelers who want the classic desert evening with smoother logistics, comfortable pickup, and a curated premium feel.',
    meetingPoint: 'Pickup from selected Dubai hotel areas.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Desert activities depend on weather and operator safety conditions. Please wear comfortable clothes and avoid heavy meals before dune driving.',
    highlights: [
      'Enjoy a scenic Dubai desert safari route',
      'Take a short camel ride experience',
      'Capture sunset photos in the dunes',
      'Relax with dinner camp coordination',
      'Comfortable pickup and drop-off included',
    ],
    included: [
      'Pickup and drop-off from selected Dubai areas',
      'Desert safari vehicle coordination',
      'Short camel ride',
      'Sunset photo stop',
      'Dinner camp access',
      'Bottled water',
    ],
    notIncluded: [
      'Premium camp upgrades',
      'Personal expenses',
      'Quad bike or buggy add-ons',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Dubai pickup',
        subtitle: 'Pickup from selected Dubai hotel areas',
        durationLabel: '1 hour',
        type: 'start',
      },
      {
        title: 'Desert safari route',
        subtitle: 'Drive through the dunes with scenic stops',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Camel ride and sunset photos',
        subtitle: 'Enjoy a short camel ride and golden-hour photo time',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Desert dinner camp',
        subtitle: 'Relax at camp with dinner coordination',
        durationLabel: '2 hours',
        type: 'food',
      },
      {
        title: 'Return to Dubai',
        subtitle: 'Drop-off back to selected hotel areas',
        durationLabel: '1 hour',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Desert Safari Evening',
    optionOneSlug: 'shared-desert-safari-evening',
    optionOneDescription:
      'A shared Dubai desert evening with safari route, camel ride, sunset stop, and dinner camp coordination.',
    optionTwoTitle: 'Private Premium Desert Safari',
    optionTwoSlug: 'private-premium-desert-safari',
    optionTwoDescription:
      'A private premium desert route with flexible pacing, upgraded vehicle coordination, and more photo time.',
    reviews: [
      {
        rating: 5,
        title: 'Beautiful sunset desert evening',
        comment:
          'The pickup was smooth and the sunset in the dunes was amazing. Dinner camp was well coordinated too.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Classic Dubai done well',
        comment:
          'Everything felt organized and comfortable. The camel ride and sunset photos were our favorite parts.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great desert experience',
        comment:
          'The desert was beautiful and the flow was good. It was a little busy at camp, but still enjoyable.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Dubai Skyline, Marina & Premium City Tour',
    slug: 'dubai-skyline-marina-premium-city-tour',
    partnerBusinessName: 'Dubai Premium Experience',
    partnerEmail: 'partner.dubai-premium-experience@alpii.local',
    cityName: 'Dubai',
    citySlug: 'dubai',
    country: 'United Arab Emirates',
    destinationName: 'Dubai Marina',
    destinationSlug: 'dubai-marina',
    countryCode: 'AE',
    categoryName: 'City Highlights',
    categorySlug: 'city-highlights',
    categoryIcon: 'building',
    mediaUrls: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '5 hours',
    basePriceCents: 12500,
    meetingTimes: ['09:00', '10:00', '15:00'],
    shortDescription:
      'See Dubai’s skyline, Marina, premium city viewpoints, and modern icons in one polished private-friendly route.',
    description:
      'Explore Dubai’s modern side with a premium city route covering skyline viewpoints, Dubai Marina atmosphere, waterfront stops, and curated photo moments. This experience is ideal for travelers who want a comfortable introduction to Dubai’s scale, design, and luxury city energy without planning transfers between districts.',
    meetingPoint: 'Pickup from selected Dubai hotel areas.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Route order may vary depending on traffic, weather, and local access conditions. Comfortable walking shoes are recommended.',
    highlights: [
      'Explore Dubai skyline and waterfront viewpoints',
      'Visit Dubai Marina with local route coordination',
      'Enjoy curated photo stops around modern Dubai',
      'Comfortable premium city tour pacing',
      'Great for first-time visitors and short stays',
    ],
    included: [
      'Pickup and drop-off from selected Dubai areas',
      'Private or shared transport coordination',
      'Local driver or host support',
      'Curated city photo stops',
      'Bottled water',
    ],
    notIncluded: [
      'Attraction tickets unless selected as add-on',
      'Meals and drinks',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Hotel pickup',
        subtitle: 'Start from selected Dubai hotel areas',
        durationLabel: '30 minutes',
        type: 'start',
      },
      {
        title: 'Skyline viewpoint route',
        subtitle: 'Visit curated modern city photo stops',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Dubai Marina walk',
        subtitle: 'Explore waterfront views and premium city atmosphere',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Café or mall stop',
        subtitle: 'Take a short refreshment break during the route',
        durationLabel: '45 minutes',
        type: 'food',
      },
      {
        title: 'Final viewpoint and drop-off',
        subtitle: 'Finish with a final stop before return transfer',
        durationLabel: '45 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Dubai Premium City Route',
    optionOneSlug: 'shared-dubai-premium-city-route',
    optionOneDescription:
      'A polished shared Dubai city route covering skyline, Marina, and curated modern photo stops.',
    optionTwoTitle: 'Private Dubai Skyline & Marina Tour',
    optionTwoSlug: 'private-dubai-skyline-marina-tour',
    optionTwoDescription:
      'A private premium Dubai city tour with flexible pacing, hotel pickup, and personalized photo stops.',
    reviews: [
      {
        rating: 5,
        title: 'Great Dubai overview',
        comment:
          'The route helped us understand the city quickly. Marina and skyline photo stops were excellent.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Premium and comfortable',
        comment:
          'Transport was smooth and the pacing was relaxed. A perfect way to see modern Dubai in a short time.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Nice city route',
        comment:
          'Traffic slowed us down a little, but the stops were well chosen and the experience felt polished.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Dubai Jet Ski Adventure at Jumeirah Beach',
    slug: 'dubai-jet-ski-adventure-at-jumeirah-beach',
    partnerBusinessName: 'Dubai Premium Experience',
    partnerEmail: 'partner.dubai-premium-experience@alpii.local',
    cityName: 'Dubai',
    citySlug: 'dubai',
    country: 'United Arab Emirates',
    destinationName: 'Jumeirah Beach',
    destinationSlug: 'jumeirah-beach',
    countryCode: 'AE',
    categoryName: 'Water Sports',
    categorySlug: 'water-sports',
    categoryIcon: 'waves',
    mediaUrls: [
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '1.5 hours',
    basePriceCents: 14500,
    meetingTimes: ['09:00', '11:00', '15:00'],
    shortDescription:
      'Ride a jet ski along Jumeirah Beach with safety briefing, equipment coordination, and skyline photo moments.',
    description:
      'Add adrenaline to your Dubai trip with a jet ski session from Jumeirah Beach. This experience includes safety briefing coordination, equipment support, and a guided water route designed to capture Dubai’s beach energy and skyline views in a fun, premium-feeling session.',
    meetingPoint: 'Meet at the confirmed Jumeirah Beach watersports center after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Jet ski route depends on weather and water conditions. Please bring swimwear, towel, valid ID, and arrive on time for safety briefing.',
    highlights: [
      'Ride a jet ski from Jumeirah Beach',
      'Enjoy Dubai skyline views from the water',
      'Safety briefing and equipment coordination included',
      'Great short adventure for active travelers',
      'Premium beach experience with easy logistics',
    ],
    included: [
      'Jet ski session coordination',
      'Safety briefing',
      'Life jacket',
      'Watersports team support',
      'Basic route guidance',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Photo/video package',
      'Personal insurance',
      'Meals and drinks',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Beach center check-in',
        subtitle: 'Arrive at the confirmed watersports meeting point',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Safety briefing',
        subtitle: 'Receive instructions, equipment, and route overview',
        durationLabel: '15 minutes',
        type: 'class',
      },
      {
        title: 'Jet ski water session',
        subtitle: 'Ride along the Jumeirah coastal route',
        durationLabel: '45 minutes',
        type: 'activity',
      },
      {
        title: 'Return and cool down',
        subtitle: 'Return equipment and finish with beach recommendations',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Jet Ski Session',
    optionOneSlug: 'shared-jet-ski-session',
    optionOneDescription:
      'A coordinated Jumeirah Beach jet ski session with safety briefing and water route support.',
    optionTwoTitle: 'Premium Jet Ski Photo Route',
    optionTwoSlug: 'premium-jet-ski-photo-route',
    optionTwoDescription:
      'A premium jet ski session with more route time and assisted skyline photo moments.',
    reviews: [
      {
        rating: 5,
        title: 'So much fun on the water',
        comment:
          'The briefing was clear and the ride was exciting. Seeing Dubai from the water was amazing.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Great short adventure',
        comment:
          'Everything was easy to find and well organized. Perfect activity when you want something energetic but not a full day.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Fun and well managed',
        comment:
          'The ride was great and the team was helpful. Water was a little choppy, but still safe and enjoyable.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Dubai Old Souk, Creek & Emirati Culture Walk',
    slug: 'dubai-old-souk-creek-emirati-culture-walk',
    partnerBusinessName: 'Dubai Premium Experience',
    partnerEmail: 'partner.dubai-premium-experience@alpii.local',
    cityName: 'Dubai',
    citySlug: 'dubai',
    country: 'United Arab Emirates',
    destinationName: 'Dubai Creek',
    destinationSlug: 'dubai-creek',
    countryCode: 'AE',
    categoryName: 'Culture',
    categorySlug: 'culture',
    categoryIcon: 'landmark',
    mediaUrls: [
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '4 hours',
    basePriceCents: 7200,
    meetingTimes: ['09:00', '10:00', '16:00'],
    shortDescription:
      'Explore Dubai’s old souks, creek crossing, and Emirati cultural roots with a local-led walking route.',
    description:
      'Step away from the skyline and discover old Dubai through souk lanes, creek atmosphere, heritage corners, and simple cultural storytelling. This walk is designed for travelers who want to understand Dubai beyond the modern towers, with a route that feels local, textured, and easy to follow.',
    meetingPoint: 'Meet near Al Fahidi or a confirmed Dubai Creek area meeting point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'This is a walking experience through active market areas. Modest comfortable clothing and walking shoes are recommended.',
    highlights: [
      'Walk through old Dubai souks and heritage areas',
      'Experience Dubai Creek atmosphere',
      'Learn simple Emirati culture and trade history',
      'Enjoy local market colors and photo moments',
      'Great contrast to modern Dubai sightseeing',
    ],
    included: [
      'Local guide coordination',
      'Guided old Dubai walking route',
      'Creek crossing coordination',
      'Cultural storytelling',
      'Bottled water',
    ],
    notIncluded: [
      'Shopping and personal expenses',
      'Meals and drinks',
      'Hotel pickup and drop-off',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Heritage area meetup',
        subtitle: 'Meet your host and start with old Dubai context',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Old souk walk',
        subtitle: 'Explore market lanes, spices, textiles, and local trade stories',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Dubai Creek crossing',
        subtitle: 'Cross the creek and experience the historic waterway',
        durationLabel: '45 minutes',
        type: 'transport',
      },
      {
        title: 'Emirati culture route',
        subtitle: 'Visit heritage corners and learn cultural context',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Local tips finish',
        subtitle: 'End with recommendations for cafés, markets, and museums',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Old Dubai Culture Walk',
    optionOneSlug: 'shared-old-dubai-culture-walk',
    optionOneDescription:
      'A shared walking route through old souks, creek atmosphere, and Emirati heritage corners.',
    optionTwoTitle: 'Private Creek & Culture Walk',
    optionTwoSlug: 'private-creek-culture-walk',
    optionTwoDescription:
      'A private old Dubai route with slower pacing, more market time, and personalized cultural context.',
    reviews: [
      {
        rating: 5,
        title: 'Loved seeing old Dubai',
        comment:
          'This gave us a completely different view of the city. The souks and creek crossing were memorable.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Great cultural contrast',
        comment:
          'After seeing the skyline, this walk helped us understand Dubai better. The guide kept it easy and interesting.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Colorful and well guided',
        comment:
          'The markets were busy, but the route was clear and the cultural stories were helpful.',
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
      description: `${businessName} is a curated local experience partner for polished city, culture, and adventure trips.`,
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

async function createReviews(
  activityId: string,
  optionId: string,
  activitySlug: string,
  basePriceCents: number,
  reviews: DemoActivity['reviews'],
) {
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
        travelDate: new Date(`2026-07-${String(25 + index).padStart(2, '0')}T00:00:00.000Z`),
        meetingTime: index === 0 ? '09:00' : index === 1 ? '15:00' : '18:00',
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

  for (const [index, url] of item.mediaUrls.entries()) {
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
  console.log('Seeded demo batch 04');
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
    console.error('Failed to seed demo batch 04');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
