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

const ACTIVITY_SLUG = 'gwk-cultural-park-kecak-dance-ticket-experience';

const mediaUrls = [
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1400&q=85',
];

const meetingTimes = ['14:00', '15:00', '16:00'];

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
    title: 'Bali pickup or GWK meeting point',
    subtitle: 'Start from selected Bali areas or meet directly at GWK',
    durationLabel: '45 minutes',
    type: 'start',
  },
  {
    title: 'Explore GWK Cultural Park',
    subtitle: 'Walk through the cultural park, plazas, and iconic statue area',
    durationLabel: '2 hours',
    type: 'activity',
  },
  {
    title: 'Cultural photo stops',
    subtitle: 'Enjoy scenic viewpoints and curated photo moments around the park',
    durationLabel: '1 hour',
    type: 'activity',
  },
  {
    title: 'Kecak dance ticket coordination',
    subtitle: 'Proceed to the evening performance area with ticket support',
    durationLabel: '30 minutes',
    type: 'ticket',
  },
  {
    title: 'Watch Kecak dance performance',
    subtitle: 'Experience one of Bali’s signature cultural performances',
    durationLabel: '1 hour',
    type: 'show',
  },
  {
    title: 'Return transfer',
    subtitle: 'Drop-off back to selected Bali areas',
    durationLabel: '45 minutes',
    type: 'end',
  },
];

const option1Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 4500, childPriceCents: 3285 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 4200, childPriceCents: 3066 },
  { minTravelers: 3, maxTravelers: 4, adultPriceCents: 3900, childPriceCents: 2847 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 3600, childPriceCents: 2628 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 3300, childPriceCents: 2409 },
];

const option2Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 7800, childPriceCents: 5694 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 7200, childPriceCents: 5256 },
  { minTravelers: 3, maxTravelers: 4, adultPriceCents: 6800, childPriceCents: 4964 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 6200, childPriceCents: 4526 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 5700, childPriceCents: 4161 },
];

const reviews = [
  {
    email: 'gwk.reviewer1@alpii.local',
    fullName: 'Alpii GWK Reviewer 1',
    rating: 5,
    title: 'Easy cultural evening in Bali',
    comment:
      'The ticket coordination was simple and the GWK area was easy to explore. The Kecak performance made the evening feel memorable and cultural.',
    isFeatured: true,
    voucherCode: 'ALPII-GWK-KECAK-REVIEW-001',
  },
  {
    email: 'gwk.reviewer2@alpii.local',
    fullName: 'Alpii GWK Reviewer 2',
    rating: 5,
    title: 'Great for first-time visitors',
    comment:
      'A comfortable way to visit GWK and watch a Balinese performance without arranging everything separately. The timing and pickup were smooth.',
    isFeatured: true,
    voucherCode: 'ALPII-GWK-KECAK-REVIEW-002',
  },
  {
    email: 'gwk.reviewer3@alpii.local',
    fullName: 'Alpii GWK Reviewer 3',
    rating: 4,
    title: 'Beautiful park and nice performance',
    comment:
      'GWK was impressive and the show was enjoyable. It was a bit busy near the performance time, but overall the experience felt organized.',
    isFeatured: false,
    voucherCode: 'ALPII-GWK-KECAK-REVIEW-003',
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
      where: { slug: 'gwk' },
    })) ??
    (await prisma.destination.findUnique({
      where: { slug: 'bali' },
    }));

  if (!destination) {
    throw new Error(
      'Missing destination: slug "gwk" or fallback destination slug "bali". Please seed/create destination first.',
    );
  }

  const city = await prisma.city.findUnique({
    where: { slug: 'bali' },
  });

  if (!city) {
    throw new Error('Missing city: slug "bali". Please seed/create the city first.');
  }

  let category = await prisma.category.findUnique({
    where: { slug: 'culture' },
  });

  if (!category) {
    category = await prisma.category.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  if (!category) {
    throw new Error(
      'Missing category: slug "culture", and no active category fallback was found.',
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
      title: 'GWK Cultural Park & Kecak Dance Ticket Experience',
      slug: ACTIVITY_SLUG,
      status: ActivityStatus.PUBLISHED,
      durationLabel: '5 hours',
      pricingMode: PricingMode.GROUP_TIER,
      shortDescription:
        'Explore GWK Cultural Park and enjoy a coordinated ticket experience for Bali’s iconic Kecak dance performance.',
      description:
        'Spend an easy cultural afternoon and evening at Garuda Wisnu Kencana Cultural Park with ticket coordination, curated park exploration, scenic photo stops, and access support for a Kecak dance performance. This experience is designed for travelers who want a simple, polished, and cultural Bali evening without managing the logistics themselves.',
      meetingPoint: 'Pickup from selected Bali areas or direct meeting point at GWK Cultural Park.',
      cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
      importantInfo:
        'Performance timing may vary by operational schedule and will be confirmed after booking. Please arrive on time and wear comfortable walking shoes.',
      highlights: [
        'Explore Garuda Wisnu Kencana Cultural Park',
        'See one of Bali’s most iconic cultural landmarks',
        'Enjoy coordinated Kecak dance ticket support',
        'Get curated time for scenic photo stops',
        'A comfortable cultural evening for couples, families, and groups',
      ],
      included: [
        'GWK Cultural Park entry coordination',
        'Kecak dance ticket coordination',
        'Pickup and drop-off for selected package option',
        'Local host or driver coordination',
        'Bottled water',
      ],
      notIncluded: [
        'Personal expenses',
        'Meals and drinks',
        'Optional photo/video services',
        'Tips and gratuities',
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
      priceCents: 4200,
      priceType: 'per_person',
      isActive: true,
    },
  });

  for (const [index, url] of mediaUrls.entries()) {
    await prisma.activityMedia.create({
      data: {
        activityId: activity.id,
        url,
        altText: `GWK Cultural Park Kecak Dance Ticket ${index + 1}`,
        sortOrder: index,
        isCover: index === 0,
      },
    });
  }

  const defaultOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'GWK Entry + Kecak Dance Ticket',
      slug: 'gwk-entry-kecak-dance-ticket',
      description:
        'Ticket-focused experience with GWK Cultural Park entry coordination and Kecak dance performance access support.',
      durationLabel: '5 hours',
      meetingPoint: 'Direct meeting point at GWK Cultural Park or selected nearby pickup point.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 40,
      isDefault: true,
      isActive: true,
      sortOrder: 0,
    },
  });

  const transferOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'GWK + Kecak Dance with Private Transfer',
      slug: 'gwk-kecak-dance-private-transfer',
      description:
        'Includes GWK and Kecak dance ticket coordination plus private pickup and drop-off from selected Bali areas.',
      durationLabel: '5 hours',
      meetingPoint: 'Pickup from selected Bali hotel areas.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 24,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
    },
  });

  await createOptionPricingTiers(defaultOption.id, option1Tiers);
  await createOptionPricingTiers(transferOption.id, option2Tiers);

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

    const totalAmountCents = 4200 * 2;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        optionId: defaultOption.id,
        status: BookingStatus.COMPLETED,
        currency: 'USD',
        totalAmountCents,
        travelDate: new Date('2026-06-23T00:00:00.000Z'),
        meetingTime: '15:00',
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

  console.log('Seeded GWK Kecak activity');
  console.log(`Activity slug: ${activity.slug}`);
  console.log('Options created: 2');
  console.log(`Reviews created: ${reviews.length}`);
  console.log(`Rating average: ${ratingAverage}`);
  console.log(`Review count: ${reviewCount}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed GWK Kecak activity');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
