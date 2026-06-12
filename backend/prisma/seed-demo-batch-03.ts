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
    title: 'Mount Rigi Scenic Hiking & Cable Car Trip',
    slug: 'mount-rigi-scenic-hiking-cable-car-trip',
    partnerBusinessName: 'Zurich Scenic Guide',
    partnerEmail: 'partner.zurich-scenic-guide@alpii.local',
    cityName: 'Zurich',
    citySlug: 'zurich',
    country: 'Switzerland',
    destinationName: 'Mount Rigi',
    destinationSlug: 'mount-rigi',
    countryCode: 'CH',
    categoryName: 'Nature',
    categorySlug: 'nature',
    categoryIcon: 'mountain',
    mediaUrls: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '9 hours',
    basePriceCents: 16800,
    meetingTimes: ['07:30', '08:00', '08:30'],
    shortDescription:
      'Enjoy a scenic Mount Rigi day from Zurich with easy transport, lake views, cable car coordination, and a gentle hiking route.',
    description:
      'Travel from Zurich to one of Switzerland’s most scenic mountain areas for a relaxed Mount Rigi day trip. This experience combines smooth transport coordination, cable car or mountain rail planning, panoramic viewpoints, and a gentle hiking route designed for travelers who want Alpine scenery without a difficult trek.',
    meetingPoint: 'Pickup from selected Zurich areas or a confirmed central meeting point.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Mountain weather can change quickly. Please bring comfortable shoes, warm layers, and a light rain jacket.',
    highlights: [
      'Visit Mount Rigi on a curated scenic day from Zurich',
      'Enjoy cable car or mountain rail coordination',
      'Follow a gentle beginner-friendly hiking route',
      'See lake and Alpine viewpoints',
      'Comfortable option for couples, families, and small groups',
    ],
    included: [
      'Transport coordination from Zurich',
      'Local host or driver coordination',
      'Cable car or mountain rail route support',
      'Gentle hiking route guidance',
      'Bottled water',
    ],
    notIncluded: [
      'Mountain lift ticket unless selected as add-on',
      'Meals and drinks',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Zurich departure',
        subtitle: 'Meet your host and travel toward the Mount Rigi area',
        durationLabel: '1.5 hours',
        type: 'transport',
      },
      {
        title: 'Mountain ascent',
        subtitle: 'Continue by cable car or mountain rail with scenic views',
        durationLabel: '1 hour',
        type: 'transport',
      },
      {
        title: 'Panoramic viewpoint',
        subtitle: 'Enjoy Alpine scenery and lake views from the mountain area',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Gentle hiking route',
        subtitle: 'Walk an easy scenic trail with photo stops',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Mountain lunch break',
        subtitle: 'Free time for lunch or café stop',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Return to Zurich',
        subtitle: 'Descend and travel back to the city',
        durationLabel: '2 hours',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Mount Rigi Scenic Day',
    optionOneSlug: 'shared-mount-rigi-scenic-day',
    optionOneDescription:
      'A shared Mount Rigi scenic day with mountain route support, viewpoints, and gentle hiking.',
    optionTwoTitle: 'Private Mount Rigi Cable Car Trip',
    optionTwoSlug: 'private-mount-rigi-cable-car-trip',
    optionTwoDescription:
      'A private Mount Rigi day with flexible pacing, more photo stops, and personalized hiking comfort.',
    reviews: [
      {
        rating: 5,
        title: 'Beautiful Swiss mountain day',
        comment:
          'The views were incredible and the route felt easy to follow. It was a perfect mountain day without feeling too intense.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Smooth and scenic from Zurich',
        comment:
          'Everything was coordinated well from the city to the mountain. The cable car and hiking route were highlights.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great views and relaxed pacing',
        comment:
          'The mountain weather changed a bit, but the day was still beautiful and well organized.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Zurich Photography Walk & Local Café Route',
    slug: 'zurich-photography-walk-local-cafe-route',
    partnerBusinessName: 'Zurich Scenic Guide',
    partnerEmail: 'partner.zurich-scenic-guide@alpii.local',
    cityName: 'Zurich',
    citySlug: 'zurich',
    country: 'Switzerland',
    destinationName: 'Zurich',
    destinationSlug: 'zurich',
    countryCode: 'CH',
    categoryName: 'Photography',
    categorySlug: 'photography',
    categoryIcon: 'camera',
    mediaUrls: [
      'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1508163223045-1880bc36e222?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '3.5 hours',
    basePriceCents: 9800,
    meetingTimes: ['09:00', '10:00', '15:00'],
    shortDescription:
      'Capture Zurich’s old-town corners, lake views, and local café atmosphere with a relaxed guided photography walk.',
    description:
      'Explore Zurich through a visual route designed for travelers who enjoy beautiful corners, easy photo moments, and local café culture. The walk includes old-town lanes, lake or river viewpoints, composition tips, and a relaxed café stop that makes the city feel polished but personal.',
    meetingPoint: 'Meet near Zurich HB or a confirmed central meeting point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Bring your phone or camera fully charged. This is not a professional photoshoot, but the host will help you find good angles and locations.',
    highlights: [
      'Discover photogenic Zurich old-town corners',
      'Capture lake and riverside views',
      'Get simple composition and framing tips',
      'Enjoy a relaxed local café stop',
      'Great for solo travelers, couples, and content creators',
    ],
    included: [
      'Local host coordination',
      'Guided photography walking route',
      'Simple photo composition tips',
      'One coffee or tea',
      'Zurich café and viewpoint recommendations',
    ],
    notIncluded: [
      'Professional photographer',
      'Edited photo files',
      'Extra food and drinks',
      'Hotel pickup and drop-off',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Zurich meetup',
        subtitle: 'Start with route briefing and photo style preference',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Old-town photo route',
        subtitle: 'Walk through charming lanes, corners, and historic details',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Lake and river viewpoints',
        subtitle: 'Capture scenic views and calm city moments',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Local café stop',
        subtitle: 'Slow down with a coffee or tea and local tips',
        durationLabel: '45 minutes',
        type: 'food',
      },
    ],
    optionOneTitle: 'Shared Zurich Photo Walk',
    optionOneSlug: 'shared-zurich-photo-walk',
    optionOneDescription:
      'A shared visual walk through Zurich with photo corners, simple tips, and a local café stop.',
    optionTwoTitle: 'Private Zurich Content Route',
    optionTwoSlug: 'private-zurich-content-route',
    optionTwoDescription:
      'A private route with more flexible pacing, extra photo stops, and content-focused local recommendations.',
    reviews: [
      {
        rating: 5,
        title: 'Beautiful photo corners',
        comment:
          'The route was relaxed and the host knew exactly where to stop. Zurich felt elegant and easy to capture.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Perfect for a slow city morning',
        comment:
          'We loved the café stop and the old-town route. It felt personal without being too formal.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Nice walk with helpful tips',
        comment:
          'The photo tips were simple but useful. A few spots were busy, but the guide adjusted well.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Bali Temple, Rice Terrace & Waterfall Day',
    slug: 'bali-temple-rice-terrace-waterfall-day',
    partnerBusinessName: 'Bali Culture Trip',
    partnerEmail: 'partner.bali-culture-trip@alpii.local',
    cityName: 'Bali',
    citySlug: 'bali',
    country: 'Indonesia',
    destinationName: 'Ubud',
    destinationSlug: 'ubud',
    countryCode: 'ID',
    categoryName: 'Culture',
    categorySlug: 'culture',
    categoryIcon: 'landmark',
    mediaUrls: [
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '10 hours',
    basePriceCents: 7600,
    meetingTimes: ['07:30', '08:00', '08:30'],
    shortDescription:
      'See Bali’s cultural side in one curated day with a temple visit, rice terrace views, waterfall stop, and local coordination.',
    description:
      'Spend a full day exploring Bali’s classic cultural route with a comfortable plan that combines temple atmosphere, green rice terraces, a waterfall stop, and flexible local guidance. This experience is built for travelers who want a polished Bali day without managing routes, tickets, and timing by themselves.',
    meetingPoint: 'Pickup from selected Bali hotel areas.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Please wear comfortable clothes and bring swimwear if you want to enjoy the waterfall area. Sarong may be required for temple visits.',
    highlights: [
      'Visit a curated Balinese temple stop',
      'Enjoy scenic rice terrace viewpoints',
      'Stop at a refreshing waterfall area',
      'Comfortable full-day route with local driver coordination',
      'Great for first-time Bali visitors',
    ],
    included: [
      'Pickup and drop-off from selected Bali areas',
      'Private car transport',
      'Local driver coordination',
      'Entry/admission to selected stops',
      'Bottled water',
    ],
    notIncluded: [
      'Meals and drinks',
      'Optional swing or photo services',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Hotel pickup',
        subtitle: 'Start from selected Bali hotel areas',
        durationLabel: '1 hour',
        type: 'start',
      },
      {
        title: 'Temple visit',
        subtitle: 'Explore a Balinese temple with cultural context',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Rice terrace viewpoint',
        subtitle: 'Walk through green terraces and scenic photo areas',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Local lunch stop',
        subtitle: 'Break for lunch during the route',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Waterfall stop',
        subtitle: 'Visit a refreshing waterfall area before return',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Hotel drop-off',
        subtitle: 'Return to selected Bali areas',
        durationLabel: '1.5 hours',
        type: 'end',
      },
    ],
    optionOneTitle: 'Temple, Terrace & Waterfall Route',
    optionOneSlug: 'temple-terrace-waterfall-route',
    optionOneDescription:
      'A classic Bali cultural day route with temple visit, rice terrace stop, waterfall, and private car coordination.',
    optionTwoTitle: 'Private Bali Culture Day',
    optionTwoSlug: 'private-bali-culture-day',
    optionTwoDescription:
      'A private version with flexible pacing, extra photo time, and optional café or craft village stop.',
    reviews: [
      {
        rating: 5,
        title: 'Best first Bali day',
        comment:
          'The route had everything we wanted: temple, rice terrace, and waterfall. It felt smooth and not stressful.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Beautiful and well planned',
        comment:
          'Our driver was helpful and the timing worked well. The rice terrace and waterfall were highlights.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great Bali overview',
        comment:
          'A few places were busy, but the day was organized and the stops were worth it.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Bali Sunrise Mount Batur Hiking Adventure',
    slug: 'bali-sunrise-mount-batur-hiking-adventure',
    partnerBusinessName: 'Bali Culture Trip',
    partnerEmail: 'partner.bali-culture-trip@alpii.local',
    cityName: 'Bali',
    citySlug: 'bali',
    country: 'Indonesia',
    destinationName: 'Mount Batur',
    destinationSlug: 'mount-batur',
    countryCode: 'ID',
    categoryName: 'Adventure',
    categorySlug: 'adventure',
    categoryIcon: 'mountain',
    mediaUrls: [
      'https://images.unsplash.com/photo-1604844582188-cc4b2a6d9b88?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '9 hours',
    basePriceCents: 6900,
    meetingTimes: ['01:30', '02:00', '02:30'],
    shortDescription:
      'Hike Mount Batur before sunrise with local guide coordination, breakfast, and comfortable Bali pickup support.',
    description:
      'Begin before dawn and hike Mount Batur with local guide coordination for a sunrise view over Bali’s volcanic landscape. This adventure is designed for travelers who want the classic Mount Batur hiking experience with clear logistics, early pickup support, and a simple post-hike breakfast plan.',
    meetingPoint: 'Pickup from selected Bali hotel areas before dawn.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'This hike requires moderate fitness and starts very early. Please bring a jacket, proper shoes, and a small day bag.',
    highlights: [
      'Hike Mount Batur for sunrise',
      'Experience Bali’s volcanic landscape with a local guide',
      'Enjoy simple breakfast after the climb',
      'Early pickup and return coordination included',
      'Classic Bali adventure for active travelers',
    ],
    included: [
      'Pickup and drop-off from selected Bali areas',
      'Local hiking guide coordination',
      'Mount Batur hiking route support',
      'Simple breakfast',
      'Flashlight support',
      'Bottled water',
    ],
    notIncluded: [
      'Personal expenses',
      'Extra meals and drinks',
      'Tips and gratuities',
      'Personal hiking equipment',
    ],
    itinerary: [
      {
        title: 'Early pickup',
        subtitle: 'Pickup from selected Bali hotel areas',
        durationLabel: '1.5 hours',
        type: 'start',
      },
      {
        title: 'Mount Batur hike',
        subtitle: 'Begin the guided hike before sunrise',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Sunrise viewpoint',
        subtitle: 'Watch sunrise from the mountain area',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Breakfast and descent',
        subtitle: 'Enjoy simple breakfast and hike back down',
        durationLabel: '2 hours',
        type: 'food',
      },
      {
        title: 'Return transfer',
        subtitle: 'Drive back to selected Bali areas',
        durationLabel: '2 hours',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Mount Batur Sunrise Hike',
    optionOneSlug: 'shared-mount-batur-sunrise-hike',
    optionOneDescription:
      'A shared Mount Batur sunrise hiking experience with pickup, guide coordination, and simple breakfast.',
    optionTwoTitle: 'Private Mount Batur Hiking Adventure',
    optionTwoSlug: 'private-mount-batur-hiking-adventure',
    optionTwoDescription:
      'A private hiking setup with flexible pacing, private guide coordination, and pickup support.',
    reviews: [
      {
        rating: 5,
        title: 'Worth the early wake up',
        comment:
          'The hike was challenging but manageable, and the sunrise was beautiful. Pickup and guide coordination were smooth.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Classic Bali adventure',
        comment:
          'Everything was clear from pickup to the descent. The guide was patient and the views were amazing.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Beautiful but early',
        comment:
          'It was a very early start, but the sunrise made it worth it. Bring a jacket because it gets cold.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Bali Surf Beginner Class in Canggu',
    slug: 'bali-surf-beginner-class-in-canggu',
    partnerBusinessName: 'Bali Culture Trip',
    partnerEmail: 'partner.bali-culture-trip@alpii.local',
    cityName: 'Bali',
    citySlug: 'bali',
    country: 'Indonesia',
    destinationName: 'Canggu',
    destinationSlug: 'canggu',
    countryCode: 'ID',
    categoryName: 'Water Sports',
    categorySlug: 'water-sports',
    categoryIcon: 'waves',
    mediaUrls: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '2.5 hours',
    basePriceCents: 5200,
    meetingTimes: ['07:00', '09:00', '15:30'],
    shortDescription:
      'Learn the basics of surfing in Canggu with beginner-friendly coaching, board coordination, and beach support.',
    description:
      'Start your Bali surf journey with a beginner-friendly lesson in Canggu. This experience includes basic beach instruction, board coordination, warm-up guidance, and water practice with a local surf coach. It is designed for first-timers who want a safe, fun, and easy introduction to Bali’s surf culture.',
    meetingPoint: 'Meet at the confirmed Canggu beach point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Lesson timing may adjust based on tides and surf conditions. Please bring swimwear, towel, sunscreen, and a change of clothes.',
    highlights: [
      'Beginner-friendly surf lesson in Canggu',
      'Learn basic safety, paddling, and standing technique',
      'Board coordination included',
      'Local surf coach support',
      'Great for solo travelers, couples, and friends',
    ],
    included: [
      'Local surf coach',
      'Surfboard coordination',
      'Basic beach instruction',
      'Water practice session',
      'Rash guard when available',
    ],
    notIncluded: [
      'Hotel pickup and drop-off',
      'Meals and drinks',
      'Personal insurance',
      'Photo or video services',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Beach meetup',
        subtitle: 'Meet your coach at the confirmed Canggu beach point',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Safety and basics',
        subtitle: 'Learn beach safety, board handling, and basic technique',
        durationLabel: '30 minutes',
        type: 'class',
      },
      {
        title: 'Water practice',
        subtitle: 'Practice paddling, timing, and standing with coach support',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Cool down and tips',
        subtitle: 'Finish with feedback and local beach recommendations',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Beginner Surf Class',
    optionOneSlug: 'shared-beginner-surf-class',
    optionOneDescription:
      'A shared beginner surf class in Canggu with board coordination, instruction, and water practice.',
    optionTwoTitle: 'Private Beginner Surf Coaching',
    optionTwoSlug: 'private-beginner-surf-coaching',
    optionTwoDescription:
      'A private beginner surf lesson with more coach attention, flexible pacing, and personalized feedback.',
    reviews: [
      {
        rating: 5,
        title: 'Fun first surf lesson',
        comment:
          'The coach made us feel comfortable and safe. It was a great first experience surfing in Bali.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Perfect for beginners',
        comment:
          'The lesson was clear and not intimidating. We actually managed to stand up a few times.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Good beach session',
        comment:
          'The water was busy, but the coach helped us find space and gave useful tips.',
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
      description: `${businessName} is a curated local experience partner for polished city, nature, and cultural trips.`,
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
        travelDate: new Date(`2026-07-${String(20 + index).padStart(2, '0')}T00:00:00.000Z`),
        meetingTime: index === 0 ? '08:00' : index === 1 ? '10:00' : '15:00',
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
  console.log('Seeded demo batch 03');
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
    console.error('Failed to seed demo batch 03');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
