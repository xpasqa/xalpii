import type { CurrencyCode } from "./common";
import type { ActivityPricingTier, PricingMode } from "../lib/activity-pricing";

export type TravelActivityAvailability = {
  id: string;
  startDateTime: string;
  endDateTime?: string | null;
  capacity?: number | null;
  bookedCount: number;
  isActive: boolean;
};

export type TravelActivityOption = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  durationLabel?: string | null;
  meetingPoint?: string | null;
  meetingTimes?: string[] | null;
  availabilityMode: "SCHEDULED_SESSIONS" | "ALWAYS_AVAILABLE";
  availableDays?: string[] | null;
  dailyCapacity?: number | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  pricingTiers: ActivityPricingTier[];
  availability: TravelActivityAvailability[];
};

export type TravelCity = {
  slug: string;
  name: string;
  country: string;
  region: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  heroImageUrl: string;
  activityCount: number;
};

export type TravelActivity = {
  id: string;
  slug: string;
  title: string;
  category: string;
  citySlug: string;
  city: string;
  country: string;
  location: string;
  destinationBreadcrumb?: string;
  imageUrl: string;
  gallery: string[];
  duration: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: CurrencyCode;
  pricingMode?: PricingMode;
  pricingTiers?: ActivityPricingTier[];
  availability?: TravelActivityAvailability[];
  options?: TravelActivityOption[];
  badge?: string;
  badgeLabel?: string;
  providerName?: string;
  summary: string;
  description: string;
  fullDescription?: string[];
  highlights?: string[];
  included: string[];
  includes?: string[];
  excluded: string[];
  notIncluded?: string[];
  meetingPoint: string;
  importantInfo: string[];
  whatToBring?: string[];
  notAllowed?: string[];
  cancellationPolicy: string;
  paymentFlexibility?: string;
  durationLabel?: string;
  guideLanguages?: string[];
  groupType?: string;
  dietaryOptions?: string;
  aboutItems?: Array<{
    title: string;
    description: string;
  }>;
  itinerary?: Array<{
    title: string;
    subtitle: string;
    durationLabel?: string;
    type?: "start" | "stop" | "food" | "activity" | "end";
  }>;
};
