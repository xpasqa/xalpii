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
  paris: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1400&q=85',
  ],
  versailles: [
    'https://images.unsplash.com/photo-1599741638634-7f3c17f6e002?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1514477917009-389c76a86b68?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1400&q=85',
  ],
  zurich: [
    'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1508163223045-1880bc36e222?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1400&q=85',
  ],
  swissAlps: [
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85',
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
  mediaUrls?: string[];
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
    title: 'Paris Romantic Seine & Montmartre Memory Walk',
    slug: 'paris-romantic-seine-montmartre-memory-walk',
    partnerBusinessName: 'Paris Memory Travel',
    partnerEmail: 'partner.paris-memory-travel@alpii.local',
    cityName: 'Paris',
    citySlug: 'paris',
    country: 'France',
    destinationName: 'Montmartre',
    destinationSlug: 'montmartre',
    countryCode: 'FR',
    categoryName: 'Romantic Moments',
    categorySlug: 'romantic-moments',
    categoryIcon: 'heart',
    mediaKey: 'paris',
    mediaUrls: [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '4 hours',
    basePriceCents: 8600,
    meetingTimes: ['15:00', '16:00', '17:00'],
    shortDescription:
      'A romantic Paris walking route along the Seine and Montmartre with local stories, photo stops, and soft evening pacing.',
    description:
      'Follow a curated Paris memory walk designed for couples, honeymooners, and travelers who want the city to feel cinematic without rushing. The route blends Seine riverside atmosphere, hidden corners, Montmartre lanes, and local storytelling, with enough time for photos, cafés, and quiet moments along the way.',
    meetingPoint: 'Meet near Pont Neuf or a confirmed central Paris meeting point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'This is a walking experience with stairs and cobblestone streets in Montmartre. Comfortable shoes are recommended.',
    highlights: [
      'Walk along romantic Seine riverside corners',
      'Explore Montmartre lanes with a local host',
      'Enjoy curated photo moments without a rushed shoot',
      'Hear simple stories behind Paris neighborhoods',
      'Ideal for couples, anniversaries, and first Paris visits',
    ],
    included: [
      'Local host coordination',
      'Guided walking route',
      'Curated photo-stop guidance',
      'Small café or pastry recommendation',
      'Paris memory route tips after the walk',
    ],
    notIncluded: [
      'Professional photographer',
      'Meals and drinks',
      'Hotel pickup and drop-off',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Seine riverside meetup',
        subtitle: 'Start with a gentle walk near classic Paris views',
        durationLabel: '45 minutes',
        type: 'start',
      },
      {
        title: 'Hidden passage and courtyard route',
        subtitle: 'Visit quieter corners between major landmarks',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Transfer to Montmartre',
        subtitle: 'Continue toward the hilltop neighborhood',
        durationLabel: '30 minutes',
        type: 'transport',
      },
      {
        title: 'Montmartre memory walk',
        subtitle: 'Explore lanes, viewpoints, and romantic photo corners',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Café recommendation finish',
        subtitle: 'End with local tips for dinner or dessert nearby',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Paris Memory Walk',
    optionOneSlug: 'shared-paris-memory-walk',
    optionOneDescription:
      'A shared romantic route through Seine-side corners and Montmartre lanes with local storytelling.',
    optionTwoTitle: 'Private Couple Memory Walk',
    optionTwoSlug: 'private-couple-memory-walk',
    optionTwoDescription:
      'A private romantic route with slower pacing, more photo time, and personalized café or dinner tips.',
    reviews: [
      {
        rating: 5,
        title: 'Beautiful and personal Paris walk',
        comment:
          'The route felt romantic without being cheesy. We loved the quiet corners and the Montmartre stories.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Perfect anniversary afternoon',
        comment:
          'The pacing was relaxed and the host helped us find beautiful places for photos. It became one of our favorite Paris memories.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Lovely route with great views',
        comment:
          'Montmartre had some stairs, but the views and small lanes were worth it. The experience felt polished.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Paris Louvre, Latin Quarter & Hidden Courtyards',
    slug: 'paris-louvre-latin-quarter-hidden-courtyards',
    partnerBusinessName: 'Paris Memory Travel',
    partnerEmail: 'partner.paris-memory-travel@alpii.local',
    cityName: 'Paris',
    citySlug: 'paris',
    country: 'France',
    destinationName: 'Latin Quarter',
    destinationSlug: 'latin-quarter',
    countryCode: 'FR',
    categoryName: 'Culture',
    categorySlug: 'culture',
    categoryIcon: 'landmark',
    mediaKey: 'paris',
    mediaUrls: [
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '5 hours',
    basePriceCents: 9800,
    meetingTimes: ['09:00', '10:00', '13:00'],
    shortDescription:
      'A cultured Paris route linking the Louvre area, Latin Quarter streets, and hidden courtyards with a local guide.',
    description:
      'Explore Paris beyond a checklist with a local-led cultural route through the Louvre surroundings, riverside crossings, Latin Quarter lanes, and hidden courtyards. This is not a rushed museum tour; it is a thoughtful city walk for travelers who want context, beauty, and quieter discoveries around historic Paris.',
    meetingPoint: 'Meet near the Louvre Pyramid or a confirmed nearby point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'This experience focuses on neighborhood storytelling and exterior routes. Louvre museum entry is not included unless selected as an add-on.',
    highlights: [
      'Explore the Louvre area with cultural context',
      'Cross into the Latin Quarter through scenic routes',
      'Discover hidden courtyards and quiet passages',
      'Learn simple Paris history without a lecture feel',
      'Great for travelers who enjoy culture and walking',
    ],
    included: [
      'Local cultural guide',
      'Guided walking route',
      'Hidden courtyard and passage recommendations',
      'Neighborhood orientation tips',
      'Small bottled water',
    ],
    notIncluded: [
      'Louvre museum ticket',
      'Meals and drinks',
      'Hotel pickup and drop-off',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Louvre area introduction',
        subtitle: 'Start around the palace courtyards and classic views',
        durationLabel: '1 hour',
        type: 'start',
      },
      {
        title: 'Seine crossing',
        subtitle: 'Walk toward the Left Bank with city context',
        durationLabel: '45 minutes',
        type: 'activity',
      },
      {
        title: 'Latin Quarter route',
        subtitle: 'Explore historic streets, bookish corners, and local lanes',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Hidden courtyards',
        subtitle: 'Visit quieter spaces and architectural details',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Café and bookstore tips',
        subtitle: 'Finish with recommendations for the rest of your day',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Cultural City Walk',
    optionOneSlug: 'shared-cultural-city-walk',
    optionOneDescription:
      'A shared Louvre-area and Latin Quarter walking route with hidden courtyards and local context.',
    optionTwoTitle: 'Private Culture & Courtyards Route',
    optionTwoSlug: 'private-culture-courtyards-route',
    optionTwoDescription:
      'A private route with slower pacing, more story time, and flexible focus on architecture, history, or cafés.',
    reviews: [
      {
        rating: 5,
        title: 'Smart and beautiful route',
        comment:
          'We saw familiar Paris areas in a much richer way. The hidden courtyards made the walk feel special.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Great cultural context',
        comment:
          'The guide explained things simply and kept the walk engaging. It was perfect for our first full day in Paris.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Nice balance of famous and hidden',
        comment:
          'The route had great variety and did not feel rushed. Some streets were busy near the Louvre, but it improved quickly.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Versailles Garden & Palace Day Experience',
    slug: 'versailles-garden-palace-day-experience',
    partnerBusinessName: 'Paris Memory Travel',
    partnerEmail: 'partner.paris-memory-travel@alpii.local',
    cityName: 'Paris',
    citySlug: 'paris',
    country: 'France',
    destinationName: 'Versailles',
    destinationSlug: 'versailles',
    countryCode: 'FR',
    categoryName: 'History',
    categorySlug: 'history',
    categoryIcon: 'castle',
    mediaKey: 'versailles',
    mediaUrls: [
      'https://images.unsplash.com/photo-1599741638634-7f3c17f6e002?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1514477917009-389c76a86b68?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '8 hours',
    basePriceCents: 13800,
    meetingTimes: ['08:00', '08:30', '09:00'],
    shortDescription:
      'A polished day from Paris to Versailles with palace coordination, garden time, and comfortable local guidance.',
    description:
      'Travel from Paris to Versailles for a full-day palace and garden experience designed to reduce friction. Your route includes transport coordination, palace entry support, guided context, and enough garden time to enjoy the scale and beauty of Versailles without feeling lost in the crowd.',
    meetingPoint: 'Meet at a confirmed central Paris point or selected pickup area after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Versailles can be busy during peak season. Entry timing and garden access may vary depending on operational schedules.',
    highlights: [
      'Visit Versailles Palace from Paris with easy coordination',
      'Explore grand rooms and royal history context',
      'Enjoy structured time in the gardens',
      'Comfortable day plan for first-time visitors',
      'Optional private pacing for couples and families',
    ],
    included: [
      'Transport coordination from Paris',
      'Versailles palace entry coordination',
      'Garden route guidance',
      'Local host or guide support',
      'Bottled water',
    ],
    notIncluded: [
      'Meals and drinks',
      'Optional musical garden supplement if required',
      'Personal expenses',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Paris departure',
        subtitle: 'Meet your host and travel toward Versailles',
        durationLabel: '1 hour',
        type: 'transport',
      },
      {
        title: 'Palace visit',
        subtitle: 'Enter the palace with route and timing support',
        durationLabel: '2.5 hours',
        type: 'activity',
      },
      {
        title: 'Garden walk',
        subtitle: 'Explore selected garden perspectives and fountains area',
        durationLabel: '2 hours',
        type: 'activity',
      },
      {
        title: 'Lunch break',
        subtitle: 'Free time for lunch or café stop near the estate',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Return to Paris',
        subtitle: 'Travel back to the city after the visit',
        durationLabel: '1 hour',
        type: 'end',
      },
    ],
    optionOneTitle: 'Versailles Shared Day Experience',
    optionOneSlug: 'versailles-shared-day-experience',
    optionOneDescription:
      'A structured shared day from Paris to Versailles with palace and garden coordination.',
    optionTwoTitle: 'Private Versailles Palace & Garden Day',
    optionTwoSlug: 'private-versailles-palace-garden-day',
    optionTwoDescription:
      'A private Versailles day with more flexible pacing, pickup support, and tailored garden time.',
    reviews: [
      {
        rating: 5,
        title: 'Versailles without the stress',
        comment:
          'The day was organized clearly and we did not have to worry about transport or timing. The gardens were a highlight.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Smooth and beautiful day trip',
        comment:
          'The palace was crowded, but the plan helped us move through it comfortably. We loved having garden time included.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great experience with good structure',
        comment:
          'A long but worthwhile day. The coordination made Versailles easier to enjoy.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Zurich Old Town, Lake & Chocolate Tasting',
    slug: 'zurich-old-town-lake-chocolate-tasting',
    partnerBusinessName: 'Zurich Scenic Guide',
    partnerEmail: 'partner.zurich-scenic-guide@alpii.local',
    cityName: 'Zurich',
    citySlug: 'zurich',
    country: 'Switzerland',
    destinationName: 'Zurich Old Town',
    destinationSlug: 'zurich-old-town',
    countryCode: 'CH',
    categoryName: 'Food & Culture',
    categorySlug: 'food-culture',
    categoryIcon: 'utensils',
    mediaKey: 'zurich',
    mediaUrls: [
      'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1508163223045-1880bc36e222?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '4 hours',
    basePriceCents: 11800,
    meetingTimes: ['09:30', '10:30', '14:00'],
    shortDescription:
      'Explore Zurich’s old town, lake views, and Swiss chocolate culture in a refined half-day local route.',
    description:
      'Discover Zurich through a scenic and tasteful route that blends old-town lanes, lake viewpoints, and curated Swiss chocolate tasting. This half-day experience is built for travelers who want the city to feel elegant, easy, and memorable without overplanning the details.',
    meetingPoint: 'Meet near Zurich HB or a confirmed central meeting point after booking.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'This is a walking experience with some cobblestone streets. Chocolate tasting stops may vary by opening hours.',
    highlights: [
      'Walk Zurich’s old-town lanes with local context',
      'Enjoy lake and riverside viewpoints',
      'Taste curated Swiss chocolate selections',
      'Get café and shopping recommendations',
      'Refined half-day route for first-time visitors',
    ],
    included: [
      'Local guide coordination',
      'Guided old-town and lake route',
      'Selected chocolate tasting',
      'Zurich orientation tips',
      'Small bottled water',
    ],
    notIncluded: [
      'Extra food and drinks',
      'Hotel pickup and drop-off',
      'Personal shopping',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Zurich HB meetup',
        subtitle: 'Start with a city orientation and route overview',
        durationLabel: '15 minutes',
        type: 'start',
      },
      {
        title: 'Old town walk',
        subtitle: 'Explore lanes, squares, and historic corners',
        durationLabel: '1.5 hours',
        type: 'activity',
      },
      {
        title: 'Lake and riverside route',
        subtitle: 'Enjoy scenic viewpoints and photo stops',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Chocolate tasting',
        subtitle: 'Sample selected Swiss chocolate with local recommendations',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Café tips finish',
        subtitle: 'End with recommendations for your next Zurich stop',
        durationLabel: '15 minutes',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Zurich Taste & Walk',
    optionOneSlug: 'shared-zurich-taste-walk',
    optionOneDescription:
      'A shared Zurich route covering old town, lake views, and curated chocolate tasting.',
    optionTwoTitle: 'Private Zurich Scenic Tasting Route',
    optionTwoSlug: 'private-zurich-scenic-tasting-route',
    optionTwoDescription:
      'A private Zurich walk with slower pacing, more photo stops, and personalized café recommendations.',
    reviews: [
      {
        rating: 5,
        title: 'Elegant and easy Zurich intro',
        comment:
          'The route was beautiful and the chocolate tasting made it feel special. A perfect first afternoon in Zurich.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Loved the old town details',
        comment:
          'Our guide shared simple stories without making it feel like a lecture. The lake views were lovely.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Nice mix of views and tasting',
        comment:
          'The walk was smooth and the chocolate stops were delicious. Some streets were busy, but the route was enjoyable.',
        isFeatured: false,
      },
    ],
  },
  {
    title: 'Swiss Alps Beginner Ski Day from Zurich',
    slug: 'swiss-alps-beginner-ski-day-from-zurich',
    partnerBusinessName: 'Zurich Scenic Guide',
    partnerEmail: 'partner.zurich-scenic-guide@alpii.local',
    cityName: 'Zurich',
    citySlug: 'zurich',
    country: 'Switzerland',
    destinationName: 'Swiss Alps',
    destinationSlug: 'swiss-alps',
    countryCode: 'CH',
    categoryName: 'Adventure',
    categorySlug: 'adventure',
    categoryIcon: 'mountain-snow',
    mediaKey: 'swissAlps',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85',
    ],
    durationLabel: '10 hours',
    basePriceCents: 22800,
    meetingTimes: ['06:30', '07:00', '07:30'],
    shortDescription:
      'A beginner-friendly Swiss Alps ski day from Zurich with transport, equipment coordination, and easy mountain pacing.',
    description:
      'Leave Zurich for a beginner-friendly ski day in the Swiss Alps, designed for travelers who want a mountain experience without handling every detail. The day includes transport coordination, beginner area support, equipment arrangement guidance, and a scenic schedule that balances snow time with comfort.',
    meetingPoint: 'Pickup from selected Zurich areas or a confirmed central meeting point.',
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
    importantInfo:
      'Ski conditions depend on weather and resort operations. Warm layers, gloves, and waterproof outerwear are recommended.',
    highlights: [
      'Enjoy a beginner-friendly Swiss Alps ski day',
      'Travel from Zurich with easy coordination',
      'Get help with ski equipment arrangement',
      'Designed for first-time or casual skiers',
      'Scenic mountain day with comfortable pacing',
    ],
    included: [
      'Transport coordination from Zurich',
      'Local host or driver coordination',
      'Beginner ski area guidance',
      'Equipment rental coordination support',
      'Bottled water',
    ],
    notIncluded: [
      'Ski pass unless selected as add-on',
      'Equipment rental fee unless selected as add-on',
      'Meals and drinks',
      'Personal insurance',
      'Tips and gratuities',
    ],
    itinerary: [
      {
        title: 'Zurich departure',
        subtitle: 'Meet early and travel toward the mountain area',
        durationLabel: '2 hours',
        type: 'transport',
      },
      {
        title: 'Equipment coordination',
        subtitle: 'Get help arranging beginner ski equipment',
        durationLabel: '1 hour',
        type: 'activity',
      },
      {
        title: 'Beginner ski session',
        subtitle: 'Enjoy gentle slopes or beginner snow area',
        durationLabel: '3 hours',
        type: 'activity',
      },
      {
        title: 'Mountain lunch break',
        subtitle: 'Take time for lunch and scenic views',
        durationLabel: '1 hour',
        type: 'food',
      },
      {
        title: 'Return to Zurich',
        subtitle: 'Travel back after the mountain day',
        durationLabel: '2 hours',
        type: 'end',
      },
    ],
    optionOneTitle: 'Shared Beginner Ski Day',
    optionOneSlug: 'shared-beginner-ski-day',
    optionOneDescription:
      'A shared Alps day from Zurich with beginner ski coordination and mountain route support.',
    optionTwoTitle: 'Private Beginner Ski Escape',
    optionTwoSlug: 'private-beginner-ski-escape',
    optionTwoDescription:
      'A private ski day with flexible pacing, pickup support, and more personalized beginner guidance.',
    reviews: [
      {
        rating: 5,
        title: 'Perfect beginner ski experience',
        comment:
          'We had never skied before and this made the day feel manageable. The mountain views were incredible.',
        isFeatured: true,
      },
      {
        rating: 5,
        title: 'Easy Alps day from Zurich',
        comment:
          'The transport and equipment coordination helped a lot. It was a beautiful day and not stressful.',
        isFeatured: true,
      },
      {
        rating: 4,
        title: 'Great snow day with good support',
        comment:
          'The ski area was beginner friendly and the route was organized. It was a long day, but worth it.',
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
      description: `${businessName} is a curated local experience partner for polished city and scenic trips.`,
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
        travelDate: new Date(`2026-07-${String(15 + index).padStart(2, '0')}T00:00:00.000Z`),
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

  const mediaUrls = item.mediaUrls ?? mediaPools[item.mediaKey] ?? mediaPools.paris;

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
  console.log('Seeded demo batch 02');
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
    console.error('Failed to seed demo batch 02');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
