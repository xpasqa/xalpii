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

const ACTIVITY_SLUG = 'ubud-yoga-wellness-day-retreat';

const mediaUrls = [
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1512291313931-d4291048e7b6?auto=format&fit=crop&w=1400&q=85',
];

const meetingTimes = ['07:30', '08:30', '09:30'];

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
    title: 'Ubud pickup',
    subtitle: 'Pickup from selected Ubud areas',
    durationLabel: '30 minutes',
    type: 'start',
  },
  {
    title: 'Morning yoga session',
    subtitle: 'Guided yoga flow in a calm wellness setting',
    durationLabel: '1.5 hours',
    type: 'activity',
  },
  {
    title: 'Healthy brunch',
    subtitle: 'Enjoy a light plant-forward meal after practice',
    durationLabel: '1 hour',
    type: 'food',
  },
  {
    title: 'Rice terrace and village walk',
    subtitle: 'Gentle scenic walk through Ubud’s green surroundings',
    durationLabel: '1.5 hours',
    type: 'activity',
  },
  {
    title: 'Sound healing or meditation',
    subtitle: 'Close the retreat with a relaxing guided session',
    durationLabel: '1 hour',
    type: 'wellness',
  },
  {
    title: 'Drop-off',
    subtitle: 'Return to selected Ubud areas',
    durationLabel: '30 minutes',
    type: 'end',
  },
];

const option1Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 7800, childPriceCents: 5694 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 7400, childPriceCents: 5402 },
  { minTravelers: 3, maxTravelers: 4, adultPriceCents: 6900, childPriceCents: 5037 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 6400, childPriceCents: 4672 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 5900, childPriceCents: 4307 },
];

const option2Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 11500, childPriceCents: 8395 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 10800, childPriceCents: 7884 },
  { minTravelers: 3, maxTravelers: 4, adultPriceCents: 9900, childPriceCents: 7227 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 9200, childPriceCents: 6716 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 8500, childPriceCents: 6205 },
];

const reviews = [
  {
    email: 'yoga.reviewer1@alpii.local',
    fullName: 'Alpii Yoga Reviewer 1',
    rating: 5,
    title: 'Peaceful and beautifully arranged',
    comment:
      'The yoga session was calm, the brunch was fresh, and the whole day felt easy to follow. It was a lovely way to experience Ubud beyond the usual tourist route.',
    isFeatured: true,
    voucherCode: 'ALPII-UBUD-YOGA-REVIEW-001',
  },
  {
    email: 'yoga.reviewer2@alpii.local',
    fullName: 'Alpii Yoga Reviewer 2',
    rating: 5,
    title: 'Perfect slow day in Ubud',
    comment:
      'Everything was organized smoothly from pickup to the final meditation. The pace was relaxed and the wellness setting felt very authentic.',
    isFeatured: true,
    voucherCode: 'ALPII-UBUD-YOGA-REVIEW-002',
  },
  {
    email: 'yoga.reviewer3@alpii.local',
    fullName: 'Alpii Yoga Reviewer 3',
    rating: 4,
    title: 'Relaxing retreat with great local touches',
    comment:
      'A very relaxing day with friendly guidance and beautiful surroundings. The walking part was a nice addition after the yoga session.',
    isFeatured: false,
    voucherCode: 'ALPII-UBUD-YOGA-REVIEW-003',
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

  const destination = await prisma.destination.findUnique({
    where: { slug: 'ubud' },
  });

  const fallbackDestination = destination
    ? null
    : await prisma.destination.findUnique({
        where: { slug: 'bali' },
      });

  if (!destination && !fallbackDestination) {
    throw new Error(
      'Missing destination: slug "ubud" or fallback destination slug "bali". Please seed/create destination first.',
    );
  }

  const city = await prisma.city.findUnique({
    where: { slug: 'bali' },
  });

  if (!city) {
    throw new Error('Missing city: slug "bali". Please seed/create the city first.');
  }

  let category = await prisma.category.findUnique({
    where: { slug: 'wellness' },
  });

  if (!category) {
    category = await prisma.category.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  if (!category) {
    throw new Error(
      'Missing category: slug "wellness", and no active category fallback was found.',
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
      destinationId: (destination ?? fallbackDestination)!.id,
      cityId: city.id,
      categoryId: category.id,
      title: 'Ubud Yoga & Wellness Day Retreat',
      slug: ACTIVITY_SLUG,
      status: ActivityStatus.PUBLISHED,
      durationLabel: '6 hours',
      pricingMode: PricingMode.GROUP_TIER,
      shortDescription:
        'Slow down in Ubud with a curated yoga, brunch, village walk, and meditation day retreat.',
      description:
        'Spend a peaceful day in Ubud with a guided yoga session, healthy brunch, gentle scenic walk, and a calming meditation or sound healing experience. This retreat is designed for travelers who want a polished wellness escape with easy logistics, local atmosphere, and a slower rhythm in Bali’s cultural heart.',
      meetingPoint: 'Pickup from selected Ubud areas before the morning session.',
      cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
      importantInfo:
        'Pickup time will be confirmed after booking. Please wear comfortable clothes and bring a refillable water bottle.',
      highlights: [
        'Join a guided yoga session in Ubud',
        'Enjoy a healthy brunch after practice',
        'Take a gentle scenic walk through green surroundings',
        'Relax with meditation or sound healing',
        'Ideal for couples, solo travelers, and small groups',
      ],
      included: [
        'Pickup and drop-off from selected Ubud areas',
        'Guided yoga session',
        'Healthy brunch',
        'Village or rice terrace walk coordination',
        'Meditation or sound healing session',
        'Bottled water',
      ],
      notIncluded: [
        'Personal expenses',
        'Additional spa treatments',
        'Tips and gratuities',
        'Meals not listed in package',
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
      priceCents: 7800,
      priceType: 'per_person',
      isActive: true,
    },
  });

  for (const [index, url] of mediaUrls.entries()) {
    await prisma.activityMedia.create({
      data: {
        activityId: activity.id,
        url,
        altText: `Ubud Yoga Wellness Day Retreat ${index + 1}`,
        sortOrder: index,
        isCover: index === 0,
      },
    });
  }

  const defaultOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'Yoga, brunch & meditation',
      slug: 'yoga-brunch-meditation',
      description:
        'A balanced Ubud wellness day with yoga practice, healthy brunch, a light walk, and meditation or sound healing.',
      durationLabel: '6 hours',
      meetingPoint: 'Pickup from selected Ubud hotel areas or meeting point near central Ubud.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 18,
      isDefault: true,
      isActive: true,
      sortOrder: 0,
    },
  });

  const privateOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'Private wellness retreat with spa add-on',
      slug: 'private-wellness-retreat-spa-addon',
      description:
        'A more private wellness setup with the core yoga retreat plus extra time for a curated spa-style relaxation add-on.',
      durationLabel: '7 hours',
      meetingPoint: 'Pickup from selected Ubud hotel areas or meeting point near central Ubud.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 10,
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

    const totalAmountCents = 7400 * 2;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        optionId: defaultOption.id,
        status: BookingStatus.COMPLETED,
        currency: 'USD',
        totalAmountCents,
        travelDate: new Date('2026-06-21T00:00:00.000Z'),
        meetingTime: '08:30',
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

  console.log('Seeded Ubud Yoga activity');
  console.log(`Activity slug: ${activity.slug}`);
  console.log('Options created: 2');
  console.log(`Reviews created: ${reviews.length}`);
  console.log(`Rating average: ${ratingAverage}`);
  console.log(`Review count: ${reviewCount}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed Ubud Yoga activity');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
