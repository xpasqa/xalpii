export type PricingMode = "SIMPLE" | "GROUP_TIER";

export type ActivityPricingTier = {
  id?: string;
  currency: string;
  minTravelers: number;
  maxTravelers: number;
  adultPriceCents: number;
  childPriceCents?: number | null;
  childDiscountPercent?: string | number | null;
  priceType: string;
  isActive: boolean;
};

export type PricingEstimate = {
  adultLineTotalCents: number;
  adultUnitPriceCents: number;
  childLineTotalCents: number;
  childUnitPriceCents: number;
  currency: string;
  tier?: ActivityPricingTier;
  totalAmountCents: number;
  totalTravelers: number;
};

export function calculatePricingEstimate(input: {
  adults: number;
  children: number;
  pricingMode?: PricingMode;
  pricingTiers?: ActivityPricingTier[];
  simplePrice?: { currency: string; priceCents: number } | null;
}): PricingEstimate | null {
  const adults = Math.max(1, Math.floor(input.adults));
  const children = Math.max(0, Math.floor(input.children));
  const totalTravelers = adults + children;
  const tier =
    input.pricingMode === "GROUP_TIER"
      ? input.pricingTiers?.find(
          (item) =>
            item.isActive &&
            item.minTravelers <= totalTravelers &&
            item.maxTravelers >= totalTravelers
        )
      : undefined;

  if (input.pricingMode === "GROUP_TIER" && !tier) return null;
  if (!tier && !input.simplePrice) return null;

  const adultUnitPriceCents = tier?.adultPriceCents ?? input.simplePrice!.priceCents;
  const childUnitPriceCents =
    tier?.childPriceCents == null
      ? tier
        ? null
        : adultUnitPriceCents
      : tier.childPriceCents;
  if (children > 0 && childUnitPriceCents == null) return null;
  const adultLineTotalCents = adults * adultUnitPriceCents;
  const childLineTotalCents = children * (childUnitPriceCents ?? 0);

  return {
    adultLineTotalCents,
    adultUnitPriceCents,
    childLineTotalCents,
    childUnitPriceCents: childUnitPriceCents ?? 0,
    currency: "USD",
    tier,
    totalAmountCents: adultLineTotalCents + childLineTotalCents,
    totalTravelers
  };
}

export function remainingCapacity(
  availability?: { bookedCount?: number; capacity?: number | null } | null
) {
  if (!availability?.capacity) return 14;
  return Math.max(0, Math.min(14, availability.capacity - (availability.bookedCount ?? 0)));
}

export function travelerSummary(adults: number, children: number) {
  const parts = [`${adults} ${adults === 1 ? "Adult" : "Adults"}`];
  if (children > 0) parts.push(`${children} ${children === 1 ? "Child" : "Children"}`);
  return parts.join(", ");
}
