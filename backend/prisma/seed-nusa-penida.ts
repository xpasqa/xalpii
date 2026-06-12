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

const ACTIVITY_SLUG = 'nusa-penida-one-day-trip-all-inclusive';

const mediaUrls = [
  'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',
];

const meetingTimes = ['07:00', '08:00', '09:00'];

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
    title: 'Bali pickup',
    subtitle: 'Pickup from selected Bali areas',
    durationLabel: '45 minutes',
    type: 'start',
  },
  {
    title: 'Fast boat to Nusa Penida',
    subtitle: 'Board the morning boat to the island',
    durationLabel: '45 minutes',
    type: 'transport',
  },
  {
    title: 'West Nusa Penida viewpoint route',
    subtitle: 'Visit signature cliffs and beaches',
    durationLabel: '4 hours',
    type: 'activity',
  },
  {
    title: 'Local lunch stop',
    subtitle: 'Break for lunch during the route',
    durationLabel: '1 hour',
    type: 'food',
  },
  {
    title: 'Return boat and Bali drop-off',
    subtitle: 'Return to Bali and continue to drop-off',
    durationLabel: '2 hours',
    type: 'end',
  },
];

const option1Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 10080, childPriceCents: 7358 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 10080, childPriceCents: 7358 },
  { minTravelers: 3, maxTravelers: 3, adultPriceCents: 10080, childPriceCents: 7358 },
  { minTravelers: 4, maxTravelers: 4, adultPriceCents: 9500, childPriceCents: 6935 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 8900, childPriceCents: 6497 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 8200, childPriceCents: 5986 },
];

const option2Tiers = [
  { minTravelers: 1, maxTravelers: 1, adultPriceCents: 11850, childPriceCents: 8651 },
  { minTravelers: 2, maxTravelers: 2, adultPriceCents: 11850, childPriceCents: 8651 },
  { minTravelers: 3, maxTravelers: 3, adultPriceCents: 11850, childPriceCents: 8651 },
  { minTravelers: 4, maxTravelers: 4, adultPriceCents: 11200, childPriceCents: 8176 },
  { minTravelers: 5, maxTravelers: 8, adultPriceCents: 10500, childPriceCents: 7665 },
  { minTravelers: 9, maxTravelers: 12, adultPriceCents: 9800, childPriceCents: 7154 },
];

const reviews = [
  {
    email: 'reviewer1@alpii.local',
    fullName: 'Alpii Demo Reviewer 1',
    rating: 5,
    title: 'Smooth and well organized',
    comment:
      'Everything was clear from pickup to the island route. The driver was helpful, the timing worked well, and the viewpoints were worth the trip.',
    isFeatured: true,
    voucherCode: 'ALPII-NP-DEMO-REVIEW-001',
  },
  {
    email: 'reviewer2@alpii.local',
    fullName: 'Alpii Demo Reviewer 2',
    rating: 5,
    title: 'Great first Nusa Penida trip',
    comment:
      'A very easy way to see Nusa Penida without planning everything ourselves. The schedule felt comfortable and the local team was responsive.',
    isFeatured: true,
    voucherCode: 'ALPII-NP-DEMO-REVIEW-002',
  },
  {
    email: 'reviewer3@alpii.local',
    fullName: 'Alpii Demo Reviewer 3',
    rating: 4,
    title: 'Beautiful day with good coordination',
    comment:
      'The island views were beautiful and the transport was handled well. A few stops were busy, but overall the day felt polished and reliable.',
    isFeatured: false,
    voucherCode: 'ALPII-NP-DEMO-REVIEW-003',
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
    where: { slug: 'nusa-penida' },
  });

  if (!destination) {
    throw new Error(
      'Missing destination: slug "nusa-penida". Please seed/create the destination first.',
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
      title: 'Nusa Penida One Day Trip with All-inclusive',
      slug: ACTIVITY_SLUG,
      status: ActivityStatus.PUBLISHED,
      durationLabel: '10 hours',
      pricingMode: PricingMode.GROUP_TIER,
      shortDescription:
        "Visit Nusa Penida's signature cliffs, beaches, and island viewpoints in one polished all-inclusive day trip from Bali.",
      description:
        'Travel from Bali to Nusa Penida for a full-day island route with boat tickets, local transfers, guided coordination, and curated scenic stops included. This experience is designed for travelers who want a smooth one-day island escape with clear logistics, scenic viewpoints, and a comfortable all-inclusive plan.',
      meetingPoint: 'Pickup from selected Bali areas before the fast boat departure.',
      cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund.',
      importantInfo:
        'Pickup time will be confirmed after booking. Please bring comfortable clothes, sunscreen, and a small day bag.',
      highlights: [
        'Explore Nusa Penida in one curated day trip',
        'Visit signature cliffs, beaches, and island viewpoints',
        'Includes local transport and boat ticket coordination',
        'Comfortable option for first-time visitors',
        'Available for private couples, families, and small groups',
      ],
      included: [
        'Pickup and drop-off from selected Bali areas',
        'Fast boat ticket coordination',
        'Private car transport on Nusa Penida',
        'English-speaking local driver',
        'Entry/admission to selected stops',
        'Bottled water',
      ],
      notIncluded: [
        'Personal expenses',
        'Optional photo/video services',
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
      priceCents: 10080,
      priceType: 'per_person',
      isActive: true,
    },
  });

  for (const [index, url] of mediaUrls.entries()) {
    await prisma.activityMedia.create({
      data: {
        activityId: activity.id,
        url,
        altText: `Nusa Penida One Day Trip ${index + 1}`,
        sortOrder: index,
        isCover: index === 0,
      },
    });
  }

  const defaultOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'Standard experience + Ticket only',
      slug: 'standard-experience-ticket-only',
      description:
        'Hike-free island day covering the signature west-side Nusa Penida viewpoints with ticketing and on-island transport coordinated.',
      durationLabel: '10 hours',
      meetingPoint:
        'Pickup from selected Bali hotel areas or meeting point near Sanur Harbor.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 30,
      isDefault: true,
      isActive: true,
      sortOrder: 0,
    },
  });

  const snorkelingOption = await prisma.activityOption.create({
    data: {
      activityId: activity.id,
      title: 'Nusa Penida Tour + Snorkeling',
      slug: 'nusa-penida-tour-snorkeling',
      description:
        'Adds a snorkeling stop to the core island route while keeping transfers, local coordination, and a structured day plan included.',
      durationLabel: '10 hours',
      meetingPoint:
        'Pickup from selected Bali hotel areas or meeting point near Sanur Harbor.',
      meetingTimes: meetingTimes as Prisma.InputJsonValue,
      availabilityMode: AvailabilityMode.ALWAYS_AVAILABLE,
      availableDays: availableDays as Prisma.InputJsonValue,
      dailyCapacity: 20,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
    },
  });

  await createOptionPricingTiers(defaultOption.id, option1Tiers);
  await createOptionPricingTiers(snorkelingOption.id, option2Tiers);

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

    const totalAmountCents = 10080 * 2;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        optionId: defaultOption.id,
        status: BookingStatus.COMPLETED,
        currency: 'USD',
        totalAmountCents,
        travelDate: new Date('2026-06-20T00:00:00.000Z'),
        meetingTime: '07:00',
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

  console.log('Seeded Nusa Penida activity');
  console.log(`Activity slug: ${activity.slug}`);
  console.log('Options created: 2');
  console.log(`Reviews created: ${reviews.length}`);
  console.log(`Rating average: ${ratingAverage}`);
  console.log(`Review count: ${reviewCount}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed Nusa Penida activity');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
