import {
  ActivityStatus,
  AvailabilityMode,
  BookingStatus,
  ParticipantType,
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

const ACTIVITY_SLUG = 'mount-batur-sunrise-jeep-hot-spring-kintamani';

const mediaUrls = [
  'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
];

const meetingTimes = ['03:00', '03:30', '04:00'];

const availableDays = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const itinerary = [
  {
    title: 'Early morning pickup',
    subtitle: 'Pickup from selected Bali areas before sunrise',
    durationLabel: '1.5 hours',
    type: 'start',
  },
  {
    title: 'Mount Batur sunrise jeep route',
    subtitle: 'Ride by 4x4 jeep to a scenic sunrise viewpoint',
    durationLabel: '2 hours',
    type: 'activity',
  },
  {
    title: 'Black lava field stop',
    subtitle: 'Explore the volcanic landscape around Mount Batur',
    durationLabel: '1 hour',
    type: 'activity',
  },
  {
    title: 'Local breakfast',
    subtitle: 'Simple breakfast with mountain and lake views',
    durationLabel: '45 minutes',
    type: 'food',
  },
  {
    title: 'Hot spring visit',
    subtitle: 'Relax in a natural hot spring near Lake Batur',
    durationLabel: '1.5 hours',
    type: 'wellness',
  },
  {
    title: 'Return transfer',
    subtitle: 'Drop-off back to selected Bali areas',
    durationLabel: '1.5 hours',
    type: 'end',
  },
];

const option1Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 8900, childPriceCents: 6497 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 7900, childPriceCents: 5767 },
  { minTravelers: 3, maxTravelers: 4, adultPriceCents: 7200, childPriceCents: 5256 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 6600, childPriceCents: 4818 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 6100, childPriceCents: 4453 },
];

const option2Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 11800, childPriceCents: 8614 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 10500, childPriceCents: 7665 },
  { minTravelers: 3, maxTravelers: 4, adultPriceCents: 9600, childPriceCents: 7008 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 8900, childPriceCents: 6497 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 8200, childPriceCents: 5986 },
];

const reviews = [
  {
    email: 'batur.reviewer1@alpii.local',
    fullName: 'Alpii Batur Reviewer 1',
    rating: 5,
    title: 'Amazing sunrise and smooth pickup',
    comment:
      'The early pickup was well coordinated and the sunrise jeep route was beautiful. The black lava field stop made the morning feel unique and memorable.',
    isFeatured: true,
    voucherCode: 'ALPII-BATUR-JEEP-REVIEW-001',
  },
  {
    email: 'batur.reviewer2@alpii.local',
    fullName: 'Alpii Batur Reviewer 2',
    rating: 5,
    title: 'Great Mount Batur experience',
    comment:
      'A very easy way to enjoy Mount Batur without hiking. The jeep driver was friendly, the timing worked well, and the hot spring was a perfect finish.',
    isFeatured: true,
    voucherCode: 'ALPII-BATUR-JEEP-REVIEW-002',
  },
  {
    email: 'batur.reviewer3@alpii.local',
    fullName: 'Alpii Batur Reviewer 3',
    rating: 4,
    title: 'Beautiful morning in Kintamani',
    comment:
      'The views were stunning and the route felt organized. It was a very early start, but the sunrise and hot spring made it worth it.',
    isFeatured: false,
    voucherCode: 'ALPII-BATUR-JEEP-REVIEW-003',
  },
];

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

async function createOptionPricingTiers(
  optionId: string,
  tiers: Array<{
    minTravelers: number;
    maxTravelers: number;
    adultPriceCents: number;
    childPriceCents: number;
  }>,
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

async function main() {
  const partner = await prisma.partner.findFirst({
    where: { businessName: 'Alpii Demo Experiences' },
  });

  if (!partner) {
    throw new Error(
      'Missing partner: businessName "Alpii Demo Experiences". Please seed/create the demo partner first.',
    );
  }

  const destination =
    (await prisma.destination.findUnique({
      where: { slug: 'kintamani' },
    })) ??
    (await prisma.destination.findUnique({
      where: { slug: 'bali' },
    }));

  if (!destination) {
    throw new Error(
      'Missing destination: slug "kintamani" or fallback destination slug "bali". Please seed/create destination first.',
    );
  }

  const city = await prisma.city.findUnique({
    where: { slug: 'bali' },
  });

  if (!city) {
    throw new Error('Missing city: slug "bali". Please seed/create the city first.');
  }

  let category = await prisma.category.findUnique({
    where: { slug: 'adventure' },
  });

  if (!category) {
    category = await prisma.category.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  if (!category) {
    throw new Error(
      'Missing category: slug "adventure", and no active category fallback was found.',
    );
  }

  const existingActivity = await prisma.activity.findUnique({
    where: { slug: ACTIVITY_SLUG },
    select: { id: true },
  });

  if (existingActivity) {
    await deleteExistingActivity(existingActivity.id);
  }

  const activity = await prisma.activity.create({
    data: {
      partnerId: partner.id,
      destinationId: destination.id,
      cityId: city.id,
      categoryId: category.id,
      title: 'Mount Batur Sunrise Jeep & Hot Spring from Kintamani',
      slug: ACTIVITY_SLUG,
      status: ActivityStatus.PUBLISHED,
      durationLabel: '8 hours',
      pricingMode: PricingMode.GROUP_TIER,
      shortDescription:
        'Catch sunrise at Mount Batur by 4x4 jeep, explore black lava fields, and relax in a Kintamani hot spring.',
      description:
        'Experience Mount Batur without the hike through a curated sunrise jeep route from Kintamani. This all-inclusive mountain day includes early pickup, 4x4 jeep coordination, sunrise viewpoint access, black lava field stops, simple breakfast, and a relaxing hot spring visit near Lake Batur.',
      meetingPoint: 'Pickup from selected Bali areas or meeting point around Kintamani.',
      cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
      importantInfo:
        'Pickup is very early and will be confirmed after booking. Please bring a jacket, comfortable footwear, swimwear, and a change of clothes.',
      highlights: [
        'Watch sunrise around Mount Batur without hiking',
        'Ride a 4x4 jeep through Kintamani volcanic scenery',
        'Explore Mount Batur black lava fields',
        'Enjoy simple breakfast with mountain views',
        'Relax in a natural hot spring near Lake Batur',
      ],
      included: [
        'Pickup and drop-off from selected Bali areas',
        '4x4 jeep experience',
        'Local jeep driver coordination',
        'Mount Batur viewpoint route',
        'Black lava field visit',
        'Simple breakfast',
        'Hot spring admission',
        'Bottled water',
      ],
      notIncluded: [
        'Personal expenses',
        'Optional photo/video services',
        'Tips and gratuities',
        'Additional meals or drinks',
      ],
      itinerary: itinerary as Prisma.InputJsonValue,
      ratingAverage: new Prisma.Decimal(0),
      reviewCount: 0,
      publishedAt: new Date(),
    },
  });

  await prisma.activityPricing.create({
    data: {
      activityId: activity.id,
      currency: 'USD',
      priceCents: 7900,
      priceType: 'per_person',
      isActive: true,
    },
  });

  for (const [index, url] of mediaUrls.entries()) {
    await prisma.activityMedia.create({
      data: {
        activityId: activity.id,
        url,
        altText: `Mount Batur Sunrise Jeep Hot Spring ${index + 1}`,
        sortOrder: index,
        isCover: index === 0,
      },
    });
  }

  const defaultOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'Sunrise Jeep + Black Lava + Hot Spring',
      slug: 'sunrise-jeep-black-lava-hot-spring',
      description:
        'A complete Mount Batur morning route with sunrise jeep ride, black lava field stop, breakfast, and hot spring visit.',
      durationLabel: '8 hours',
      meetingPoint: 'Pickup from selected Bali hotel areas or meeting point around Kintamani.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
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
      title: 'Private Jeep + Photographer Add-on',
      slug: 'private-jeep-photographer-addon',
      description:
        'A private jeep route with the same Mount Batur sunrise and hot spring experience, plus extra time for assisted photo stops.',
      durationLabel: '8 hours',
      meetingPoint: 'Pickup from selected Bali hotel areas or meeting point around Kintamani.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 12,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
    },
  });

  await createOptionPricingTiers(defaultOption.id, option1Tiers);
  await createOptionPricingTiers(privateOption.id, option2Tiers);

  for (const reviewData of reviews) {
    const user = await prisma.user.upsert({
      where: { email: reviewData.email },
      update: {
        fullName: reviewData.fullName,
      },
      create: {
        email: reviewData.email,
        fullName: reviewData.fullName,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    });

    const totalAmountCents = 7900 * 2;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        optionId: defaultOption.id,
        status: BookingStatus.COMPLETED,
        currency: 'USD',
        totalAmountCents,
        travelDate: new Date('2026-06-22T00:00:00.000Z'),
        meetingTime: '03:30',
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

    await prisma.voucher.create({
      data: {
        bookingId: booking.id,
        code: reviewData.voucherCode,
        status: VoucherStatus.USED,
        qrPayload: `alpii://voucher/${reviewData.voucherCode}`,
        usedAt: new Date(),
      },
    });

    await prisma.review.create({
      data: {
        activityId: activity.id,
        optionId: defaultOption.id,
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

  console.log('Seeded Kintamani Mount Batur activity');
  console.log(`Activity slug: ${activity.slug}`);
  console.log('Options created: 2');
  console.log(`Reviews created: ${reviews.length}`);
  console.log(`Rating average: ${ratingAverage}`);
  console.log(`Review count: ${reviewCount}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed Kintamani Mount Batur activity');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
