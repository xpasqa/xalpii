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
    title: 'Istanbul Grand Bazaar, Mosque & Food Trail',
    slug: 'istanbul-grand-bazaar-mosque-food-trail',
    partnerBusinessName: 'Istanbul Heritage Walks',
    partnerEmail: 'partner.istanbul-heritage-walks@alpii.local',
    cityName: 'Istanbul',
    citySlug: 'istanbul',
    country: 'Türkiye',
    destinationName: 'Grand Bazaar',
    destinationSlug: 'grand-bazaar',
    countryCode: 'TR',
    categoryName: 'Food & Culture',
    categorySlug: 'food-culture',
    categoryIcon: 'utensils',
    mediaUrls: [
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '5 hours',
    basePriceCents: 7800,
    meetingTimes: ['09:00', '10:00', '14:00'],
    shortDescription:
      'Explore Istanbul’s Grand Bazaar, historic mosque areas, and local food stops in one textured heritage walking route.',
    description:
      'Step into Istanbul’s layered history with a curated walking route through the Grand Bazaar atmosphere, mosque courtyards, old city lanes, and selected food stops. This experience is designed for travelers who want a rich cultural introduction to Istanbul with clear pacing, local context, and flavors that make the city easier to understand.',
    meetingPoint: 'Meet near Sultanahmet or a confirmed old city meeting point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Modest clothing is recommended for mosque areas. Food stops may vary by opening hours and local conditions.',
    highlights: [
      'Explore the Grand Bazaar with local orientation',
      'Visit historic mosque areas with cultural context',
      'Taste selected local snacks along the route',
      'Walk old city lanes with a heritage-focused guide',
      'Great first-day Istanbul experience',
    ],
    included: [
      'Local guide coordination',
      'Guided old city walking route',
      'Selected local food tastings',
      'Grand Bazaar orientation',
      'Bottled water',
    ],
    notIncluded: [
      'Full meals and extra drinks',
      'Personal shopping',
      'Hotel pickup and drop-off',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Old city meetup',
        subtitle: 'Meet your guide and begin with Istanbul route context',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Mosque and heritage area',
        subtitle: 'Walk around historic mosque courtyards and old city corners',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Grand Bazaar orientation',
        subtitle: 'Explore lanes, colors, craft corners, and market culture',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Food trail stops',
        subtitle: 'Try curated local bites and learn simple food traditions',
        durationLabel: '1.5 hours',
        type: 'food',
      },
      {
        title: 'Local tips finish',
        subtitle: 'End with recommendations for hammam, cafés, and shops',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Bazaar & Food Trail',
    optionOneSlug: 'shared-bazaar-food-trail',
    optionOneDescription:
      'A shared Istanbul old city walk with Grand Bazaar orientation, mosque-area context, and selected food tastings.',
    optionTwoTitle: 'Private Istanbul Heritage Food Walk',
    optionTwoSlug: 'private-istanbul-heritage-food-walk',
    optionTwoDescription:
      'A private heritage route with slower pacing, more market time, and flexible food preferences.',
    reviews: [
      {
        rating: 5,
        title: 'Best introduction to Istanbul',
        comment:
          'The guide made the bazaar and old city feel easy to understand. The food stops were simple but memorable.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Colorful, local, and organized',
        comment:
          'We loved the mix of mosque areas, market lanes, and snacks. It felt rich but not rushed.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great old city route',
        comment:
          'The bazaar was busy, but the guide handled it well and showed us quieter corners too.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Istanbul Bosphorus Sunset Cruise Experience',
    slug: 'istanbul-bosphorus-sunset-cruise-experience',
    partnerBusinessName: 'Istanbul Heritage Walks',
    partnerEmail: 'partner.istanbul-heritage-walks@alpii.local',
    cityName: 'Istanbul',
    citySlug: 'istanbul',
    country: 'Türkiye',
    destinationName: 'Bosphorus',
    destinationSlug: 'bosphorus',
    countryCode: 'TR',
    categoryName: 'Cruise',
    categorySlug: 'cruise',
    categoryIcon: 'ship',
    mediaUrls: [
      'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '3 hours',
    basePriceCents: 9200,
    meetingTimes: ['16:30', '17:00', '17:30'],
    shortDescription:
      'Watch Istanbul glow from the Bosphorus with sunset cruise coordination, skyline views, and relaxed waterfront pacing.',
    description:
      'Enjoy Istanbul from the water on a curated Bosphorus sunset cruise experience. The route highlights the city’s skyline, bridges, waterfront mansions, and golden-hour atmosphere with easy meeting coordination and a polished plan for travelers who want a memorable evening without handling boat logistics.',
    meetingPoint: 'Meet at the confirmed pier location after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Cruise timing may vary by season, weather, and operator schedule. Please bring a light jacket for the evening breeze.',
    highlights: [
      'Cruise along the Bosphorus during sunset',
      'See Istanbul skyline and bridge views from the water',
      'Enjoy a relaxed golden-hour evening plan',
      'Easy pier coordination included',
      'Great for couples, families, and first-time visitors',
    ],
    included: [
      'Cruise ticket coordination',
      'Pier meeting support',
      'Bosphorus route guidance',
      'Tea or soft drink when available',
      'Local recommendations after the cruise',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Full dinner unless selected as add-on',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Pier check-in',
        subtitle: 'Meet at the confirmed pier and board with support',
        durationLabel: '30 minutes',
        type: 'start',
      },
      {
        title: 'Bosphorus cruise',
        subtitle: 'Sail past waterfront views, bridges, and skyline moments',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Sunset photo time',
        subtitle: 'Enjoy golden-hour views and relaxed deck moments',
        durationLabel: '45 minutes',
        type: 'activity',
      },
      {
        title: 'Return to pier',
        subtitle: 'Finish with dinner and neighborhood recommendations',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Bosphorus Sunset Cruise',
    optionOneSlug: 'shared-bosphorus-sunset-cruise',
    optionOneDescription:
      'A shared sunset cruise experience with pier coordination and scenic Bosphorus views.',
    optionTwoTitle: 'Private Bosphorus Evening Cruise',
    optionTwoSlug: 'private-bosphorus-evening-cruise',
    optionTwoDescription:
      'A private or premium-style Bosphorus cruise setup with more flexible pacing and photo time.',
    reviews: [
      {
        rating: 5,
        title: 'Beautiful sunset on the water',
        comment:
          'The views were stunning and the meeting point was easy. It was one of our most relaxing evenings in Istanbul.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Perfect Bosphorus experience',
        comment:
          'Everything was smooth and the timing was great for photos. The city looks magical from the water.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Lovely evening cruise',
        comment:
          'It was a little breezy, but the skyline and bridge views were worth it. Very well coordinated.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Istanbul Turkish Coffee & Mosaic Lamp Class',
    slug: 'istanbul-turkish-coffee-mosaic-lamp-class',
    partnerBusinessName: 'Istanbul Heritage Walks',
    partnerEmail: 'partner.istanbul-heritage-walks@alpii.local',
    cityName: 'Istanbul',
    citySlug: 'istanbul',
    country: 'Türkiye',
    destinationName: 'Istanbul Old City',
    destinationSlug: 'istanbul-old-city',
    countryCode: 'TR',
    categoryName: 'Creative Class',
    categorySlug: 'creative-class',
    categoryIcon: 'palette',
    mediaUrls: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '3.5 hours',
    basePriceCents: 6800,
    meetingTimes: ['10:00', '13:00', '16:00'],
    shortDescription:
      'Learn Turkish coffee culture and craft a colorful mosaic lamp in a relaxed Istanbul creative class.',
    description:
      'Slow down in Istanbul with a hands-on cultural class that blends Turkish coffee tradition and mosaic lamp making. This experience is designed for travelers who want something creative, cozy, and memorable, with guided instruction, cultural context, and a handmade keepsake to remember the city.',
    meetingPoint: 'Meet at the confirmed workshop location in Istanbul after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Lamp drying or packaging details may vary by workshop. Please arrive on time so the class can begin smoothly.',
    highlights: [
      'Learn Turkish coffee preparation and culture',
      'Create your own mosaic lamp design',
      'Enjoy a relaxed indoor creative class',
      'Take home a handmade Istanbul keepsake',
      'Beginner-friendly and great for couples or families',
    ],
    included: [
      'Workshop instructor',
      'Turkish coffee session',
      'Mosaic lamp materials',
      'Tools and workspace',
      'Tea or coffee during class',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Shipping for finished lamp if needed',
      'Extra food and drinks',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Workshop welcome',
        subtitle: 'Meet your instructor and choose your design direction',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Turkish coffee session',
        subtitle: 'Learn coffee preparation, serving style, and cultural context',
        durationLabel: '45 minutes',
        type: 'class',
      },
      {
        title: 'Mosaic lamp making',
        subtitle: 'Arrange colorful glass pieces and build your lamp design',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Final details and wrap-up',
        subtitle: 'Finish your piece and receive care or pickup instructions',
        durationLabel: '30 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Coffee & Mosaic Class',
    optionOneSlug: 'shared-coffee-mosaic-class',
    optionOneDescription:
      'A shared creative class with Turkish coffee culture and mosaic lamp making included.',
    optionTwoTitle: 'Private Coffee & Lamp Workshop',
    optionTwoSlug: 'private-coffee-lamp-workshop',
    optionTwoDescription:
      'A private workshop with more instructor attention, flexible pacing, and extra design support.',
    reviews: [
      {
        rating: 5,
        title: 'Creative and memorable',
        comment:
          'The lamp class was fun and the Turkish coffee part made it feel cultural. We loved having something handmade to take home.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Perfect indoor Istanbul activity',
        comment:
          'The instructor was patient and the workshop was cozy. It was a nice break from walking around the city.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Fun class with a nice keepsake',
        comment:
          'The mosaic part took focus but was enjoyable. The coffee session was a lovely touch.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Cappadocia Hot Air Balloon & Valley Adventure',
    slug: 'cappadocia-hot-air-balloon-valley-adventure',
    partnerBusinessName: 'Istanbul Heritage Walks',
    partnerEmail: 'partner.istanbul-heritage-walks@alpii.local',
    cityName: 'Istanbul',
    citySlug: 'istanbul',
    country: 'Türkiye',
    destinationName: 'Cappadocia',
    destinationSlug: 'cappadocia',
    countryCode: 'TR',
    categoryName: 'Adventure',
    categorySlug: 'adventure',
    categoryIcon: 'mountain',
    mediaUrls: [
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1570993492881-25240ce854f4?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1602154663343-89fe0bf541ab?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '12 hours',
    basePriceCents: 24500,
    meetingTimes: ['04:30', '05:00', '05:30'],
    shortDescription:
      'Experience Cappadocia’s iconic balloon morning and valley landscapes with smooth coordination and scenic route planning.',
    description:
      'Discover Cappadocia through an unforgettable early morning balloon experience and a curated valley adventure. This package is built for travelers who want the signature sunrise atmosphere, fairytale rock formations, and local route coordination in one polished day plan. Balloon operation depends on weather and aviation approval.',
    meetingPoint: 'Pickup from selected Cappadocia hotel areas or confirmed local meeting point.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Hot air balloon flights are weather-dependent and subject to official approval. If flights are cancelled, the team will coordinate available alternatives according to local policy.',
    highlights: [
      'Join a signature Cappadocia balloon morning experience',
      'See sunrise over unique valley landscapes',
      'Explore curated valley viewpoints after the flight',
      'Comfortable early pickup coordination',
      'Bucket-list experience with local route support',
    ],
    included: [
      'Hotel pickup from selected Cappadocia areas',
      'Balloon experience coordination',
      'Local driver or host coordination',
      'Valley viewpoint route',
      'Light breakfast or refreshment when available',
      'Bottled water',
    ],
    notIncluded: [
      'Flights to Cappadocia',
      'Accommodation',
      'Meals not listed',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Early pickup',
        subtitle: 'Pickup before sunrise from selected Cappadocia areas',
        durationLabel: '45 minutes',
        type: 'start',
      },
      {
        title: 'Balloon preparation',
        subtitle: 'Arrive at launch area and receive operator briefing',
        durationLabel: '1 hour',
        type: 'class',
      },
      {
        title: 'Hot air balloon experience',
        subtitle: 'Enjoy the sunrise flight or operator-led balloon program',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Valley viewpoint route',
        subtitle: 'Visit scenic rock formations and photo stops',
        durationLabel: '3 hours',
        type: 'activity',
      },
      {
        title: 'Local lunch break',
        subtitle: 'Free time for lunch during the route',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Return transfer',
        subtitle: 'Drop-off back to selected Cappadocia areas',
        durationLabel: '1 hour',
        type: 'end',
      },
    ],
    optionOneTitle: 'Balloon Morning & Valley Route',
    optionOneSlug: 'balloon-morning-valley-route',
    optionOneDescription:
      'A Cappadocia balloon morning with valley route coordination and selected local transfers.',
    optionTwoTitle: 'Private Cappadocia Valley Adventure',
    optionTwoSlug: 'private-cappadocia-valley-adventure',
    optionTwoDescription:
      'A premium private route with flexible valley stops, photo pacing, and balloon coordination support.',
    reviews: [
      {
        rating: 5,
        title: 'Unforgettable Cappadocia morning',
        comment:
          'The sunrise was magical and the valley stops after were beautiful. The early pickup was well organized.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Bucket-list experience',
        comment:
          'Everything felt smooth and the scenery was incredible. The team explained the weather process clearly.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Beautiful and well coordinated',
        comment:
          'It was an early start, but worth it. The valley route gave the day more depth after the balloon experience.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'London Royal Landmarks & Hidden Alleys Walk',
    slug: 'london-royal-landmarks-hidden-alleys-walk',
    partnerBusinessName: 'London Local Moments',
    partnerEmail: 'partner.london-local-moments@alpii.local',
    cityName: 'London',
    citySlug: 'london',
    country: 'United Kingdom',
    destinationName: 'Westminster',
    destinationSlug: 'westminster',
    countryCode: 'GB',
    categoryName: 'City Highlights',
    categorySlug: 'city-highlights',
    categoryIcon: 'building',
    mediaUrls: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '4 hours',
    basePriceCents: 8900,
    meetingTimes: ['09:00', '10:00', '14:00'],
    shortDescription:
      'Walk London’s royal landmarks, classic viewpoints, and tucked-away alleys with a local guide and easy city pacing.',
    description:
      'Get a polished introduction to London through a route that blends royal landmarks, historic streets, classic viewpoints, and hidden alleys that many first-time visitors miss. This walk is designed to feel iconic but not generic, with local stories, photo stops, and practical tips for the rest of your London stay.',
    meetingPoint: 'Meet near Westminster Station or a confirmed central London point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'This is a walking experience and route order may vary based on security closures, crowds, and weather. Comfortable shoes are recommended.',
    highlights: [
      'See London royal landmarks with local context',
      'Explore hidden alleys and quieter historic corners',
      'Capture classic London photo moments',
      'Learn practical city tips from a local host',
      'Great first-day orientation walk',
    ],
    included: [
      'Local guide coordination',
      'Guided royal landmarks walking route',
      'Hidden alley and viewpoint stops',
      'London orientation tips',
      'Small bottled water',
    ],
    notIncluded: [
      'Attraction entry tickets',
      'Meals and drinks',
      'Hotel pickup and drop-off',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Westminster meetup',
        subtitle: 'Start near classic London landmarks and route overview',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Royal landmarks route',
        subtitle: 'Walk past iconic royal and government areas',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Hidden alleys and historic corners',
        subtitle: 'Explore quieter streets and local stories',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Classic photo viewpoints',
        subtitle: 'Stop for selected London photo moments',
        durationLabel: '45 minutes',
        type: 'activity',
      },
      {
        title: 'Local tips finish',
        subtitle: 'End with recommendations for pubs, cafés, and next stops',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Royal London Walk',
    optionOneSlug: 'shared-royal-london-walk',
    optionOneDescription:
      'A shared London walk covering royal landmarks, hidden alleys, and classic city viewpoints.',
    optionTwoTitle: 'Private London Landmarks Route',
    optionTwoSlug: 'private-london-landmarks-route',
    optionTwoDescription:
      'A private London route with flexible pacing, more photo stops, and personalized local recommendations.',
    reviews: [
      {
        rating: 5,
        title: 'Great first London walk',
        comment:
          'The route mixed famous landmarks with quieter alleys. It helped us understand the city quickly.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Iconic but not boring',
        comment:
          'We saw the classic spots but also learned small local details. The pacing was very comfortable.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Useful and beautiful route',
        comment:
          'Some landmark areas were crowded, but the hidden streets balanced it nicely.',
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
      description: `${businessName} is a curated local experience partner for polished city, heritage, and cultural trips.`,
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
        travelDate: new Date(`2026-08-${String(1 + index).padStart(2, '0')}T00:00:00.000Z`),
        meetingTime: index === 0 ? '09:00' : index === 1 ? '14:00' : '17:00',
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
  console.log('Seeded demo batch 05');
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
    console.error('Failed to seed demo batch 05');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
