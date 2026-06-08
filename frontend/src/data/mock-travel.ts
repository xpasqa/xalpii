import type { CurrencyCode } from "../types/common";
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

export const categories = [
  "Cultural Experience",
  "Food & Cooking",
  "Adventure",
  "Water Activity",
  "Guided Tour",
  "Workshop"
];

export const cities: TravelCity[] = [
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Southeast Asia",
    description:
      "A layered island of temple rituals, green terraces, volcanic landscapes, and coastal escapes.",
    shortDescription: "Temple villages, rice terraces, surf breaks, and volcano mornings.",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85",
    heroImageUrl:
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1600&q=85",
    activityCount: 20
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "East Asia",
    description:
      "A city of precise rituals, neon neighborhoods, quiet gardens, and unforgettable food streets.",
    shortDescription: "Tea rooms, market walks, creative districts, and deep local food culture.",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=85",
    heroImageUrl:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85",
    activityCount: 22
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    region: "Western Europe",
    description:
      "Classic boulevards, hidden courtyards, refined museums, neighborhood kitchens, and evening river light.",
    shortDescription: "Courtyards, galleries, patisseries, and river evenings with local guides.",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
    heroImageUrl:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=85",
    activityCount: 16
  },
  {
    slug: "zurich",
    name: "Zurich",
    country: "Switzerland",
    region: "Central Europe",
    description:
      "Lakeside calm, alpine gateways, historic lanes, design shops, and polished Swiss food traditions.",
    shortDescription: "Old town walks, lake activities, chocolate stops, and mountain access.",
    imageUrl:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=85",
    heroImageUrl:
      "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1600&q=85",
    activityCount: 12
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    description:
      "Desert landscapes, modern architecture, waterfront dining, and polished city experiences.",
    shortDescription: "Desert evenings, skyline views, souks, and refined city tours.",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
    heroImageUrl:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=85",
    activityCount: 18
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    region: "Southern Africa",
    description:
      "Coastal routes, mountain viewpoints, vineyard culture, and deeply scenic local experiences.",
    shortDescription: "Mountain views, coastal drives, food culture, and ocean air.",
    imageUrl:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=85",
    heroImageUrl:
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1600&q=85",
    activityCount: 14
  }
];

export const activities: TravelActivity[] = [
  {
    id: "act-ubud-cooking",
    slug: "ubud-cooking-class-market-visit",
    title: "Ubud Cooking Class & Market Visit",
    category: "Food & Cooking",
    citySlug: "bali",
    city: "Bali",
    country: "Indonesia",
    location: "Ubud, Bali",
    imageUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "4 hours",
    rating: 4.9,
    reviewCount: 1248,
    price: 8000,
    currency: "USD",
    badge: "Bestseller",
    badgeLabel: "Popular choice",
    providerName: "Alpii Local Hosts",
    summary: "Shop a village market, cook Balinese classics, and sit down for a shared local meal.",
    description:
      "Begin at a morning market with a local host, learning how herbs, spices, and fresh produce shape Balinese cooking. Continue to a family kitchen in Ubud for a hands-on class covering sauces, satay, vegetables, and dessert before sharing the full meal together.",
    fullDescription: [
      "Start your morning with a guided walk through a traditional Ubud market, where your host introduces the ingredients, herbs, and spice pastes that shape Balinese home cooking.",
      "Continue to a family compound for a hands-on cooking session. Prepare classic dishes with local techniques, then sit down together for a relaxed shared meal."
    ],
    highlights: [
      "Shop for fresh ingredients at a traditional Ubud market",
      "Cook Balinese classics in a family kitchen",
      "Learn local spice techniques from a friendly host",
      "Share a full lunch or dinner after the class"
    ],
    included: ["Market walk with host", "Hands-on cooking class", "Recipe booklet", "Lunch or dinner"],
    excluded: ["Hotel pickup", "Alcoholic drinks", "Personal expenses"],
    meetingPoint: "Meet outside Ubud Palace main gate. Your host will carry an Alpii sign.",
    importantInfo: ["Vegetarian options are available", "Wear comfortable shoes for the market walk"],
    whatToBring: ["Comfortable shoes", "Reusable water bottle"],
    notAllowed: ["Large luggage", "Outside alcohol"],
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    paymentFlexibility: "Keep your travel plans flexible — book your spot and pay nothing today.",
    durationLabel: "3 - 3.5 hours",
    guideLanguages: ["English"],
    groupType: "Private or small groups available",
    dietaryOptions:
      "Vegetarian, pescatarian, dairy-free and other diets supported. Please inform the activity provider of any dietary needs when booking.",
    itinerary: [
      {
        title: "Ubud Traditional Market",
        subtitle: "Meet your host and explore fresh produce, herbs, and local spices.",
        durationLabel: "35 minutes",
        type: "start"
      },
      {
        title: "Local Farm Visit",
        subtitle: "See where key ingredients grow and learn how they are used in Balinese kitchens.",
        durationLabel: "30 minutes",
        type: "stop"
      },
      {
        title: "Family Compound",
        subtitle: "Arrive at a local home setting for tea, introductions, and preparation.",
        durationLabel: "20 minutes",
        type: "stop"
      },
      {
        title: "Cooking Session",
        subtitle: "Prepare sauces, vegetables, satay, and dessert with step-by-step guidance.",
        durationLabel: "2 hours",
        type: "activity"
      },
      {
        title: "Shared Lunch",
        subtitle: "Sit down together and enjoy the dishes you prepared.",
        durationLabel: "45 minutes",
        type: "food"
      }
    ]
  },
  {
    id: "act-batur-jeep",
    slug: "mount-batur-sunrise-jeep-adventure",
    title: "Mount Batur Sunrise Jeep Adventure",
    category: "Adventure",
    citySlug: "bali",
    city: "Bali",
    country: "Indonesia",
    location: "Kintamani, Bali",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "6 hours",
    rating: 4.8,
    reviewCount: 2104,
    price: 8000,
    currency: "USD",
    badge: "Top rated",
    badgeLabel: "Likely to sell out",
    providerName: "Batur Ridge Guides",
    summary: "Ride by jeep across volcanic tracks for sunrise views over Mount Batur.",
    description:
      "Travel before dawn into the Kintamani highlands and continue by jeep across black lava fields. Watch sunrise from a scenic viewpoint, stop for photos, and learn about the volcano landscape from your local driver-guide.",
    fullDescription: [
      "Head into the Kintamani highlands before sunrise and continue by jeep across volcanic tracks shaped by Mount Batur's lava fields.",
      "Your driver-guide takes you to a scenic viewpoint for sunrise, photo stops, and local context about the surrounding caldera landscape."
    ],
    highlights: [
      "Watch sunrise from a volcanic viewpoint",
      "Ride across black lava fields by jeep",
      "Learn about Mount Batur from a local driver-guide",
      "Visit a coffee plantation after the sunrise route"
    ],
    included: ["Jeep driver-guide", "Sunrise viewpoint access", "Coffee or tea", "Safety briefing"],
    excluded: ["Breakfast", "Personal insurance", "Tips"],
    meetingPoint: "Kintamani meeting point shared after booking. Hotel pickup is not included in this preview.",
    importantInfo: ["Bring a light jacket", "Activity depends on weather and volcanic access conditions"],
    whatToBring: ["Warm layer", "Closed shoes", "Camera"],
    notAllowed: ["Sandals", "Drones without permission"],
    cancellationPolicy: "Cancel up to 24 hours in advance for a full refund.",
    paymentFlexibility: "Keep your travel plans flexible — book your spot and pay nothing today.",
    durationLabel: "5 - 6 hours",
    guideLanguages: ["English"],
    groupType: "Small groups available",
    dietaryOptions: "Light snacks may be available. Please inform the activity provider of dietary needs when booking.",
    itinerary: [
      {
        title: "Hotel pickup",
        subtitle: "Meet your driver early and travel toward the Kintamani highlands.",
        durationLabel: "1 hour",
        type: "start"
      },
      {
        title: "Sunrise Jeep Ride",
        subtitle: "Ride by jeep to a viewpoint overlooking Mount Batur and the caldera.",
        durationLabel: "1.5 hours",
        type: "activity"
      },
      {
        title: "Black Lava Field",
        subtitle: "Explore volcanic tracks and stop for photos on the lava landscape.",
        durationLabel: "45 minutes",
        type: "stop"
      },
      {
        title: "Coffee Plantation",
        subtitle: "Pause for coffee or tea and learn about local highland crops.",
        durationLabel: "45 minutes",
        type: "food"
      },
      {
        title: "Drop-off",
        subtitle: "Return to the meeting point or selected local drop-off area.",
        durationLabel: "1 hour",
        type: "end"
      }
    ]
  },
  {
    id: "act-tokyo-tea",
    slug: "tokyo-tea-ceremony-experience",
    title: "Tokyo Tea Ceremony Experience",
    category: "Cultural Experience",
    citySlug: "tokyo",
    city: "Tokyo",
    country: "Japan",
    location: "Akasaka, Tokyo",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "90 minutes",
    rating: 4.9,
    reviewCount: 876,
    price: 6200,
    currency: "USD",
    badge: "Limited spots",
    summary: "Learn the calm rhythm of matcha preparation in a small Tokyo tea room.",
    description:
      "Step into a quiet tea room for an introduction to Japanese tea ceremony etiquette, tools, and movement. Your host demonstrates traditional preparation before guiding you through whisking your own bowl of matcha.",
    included: ["Tea ceremony host", "Matcha and sweets", "Small-group instruction"],
    excluded: ["Hotel transfer", "Kimono rental", "Additional food"],
    meetingPoint: "Meet at the tea room entrance near Akasaka Station Exit 2.",
    importantInfo: ["Please arrive 10 minutes early", "Socks are recommended"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-asakusa-food",
    slug: "asakusa-food-walk",
    title: "Asakusa Food Walk",
    category: "Food & Cooking",
    citySlug: "tokyo",
    city: "Tokyo",
    country: "Japan",
    location: "Asakusa, Tokyo",
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1505069446780-4ef442b5207f?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "3 hours",
    rating: 4.8,
    reviewCount: 1421,
    price: 8800,
    currency: "USD",
    badge: "Popular",
    summary: "Taste snacks, sweets, and izakaya bites around historic Asakusa.",
    description:
      "Follow a local guide through side streets around Senso-ji, tasting classic snacks and casual neighborhood dishes while learning how old Tokyo food culture still shapes the area.",
    included: ["Local guide", "Five food tastings", "One non-alcoholic drink"],
    excluded: ["Extra drinks", "Hotel pickup", "Souvenirs"],
    meetingPoint: "Meet by the Kaminarimon gate information board.",
    importantInfo: ["Come hungry", "Some tastings may contain seafood or gluten"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-paris-courtyards",
    slug: "paris-hidden-courtyard-walking-tour",
    title: "Paris Hidden Courtyard Walking Tour",
    category: "Guided Tour",
    citySlug: "paris",
    city: "Paris",
    country: "France",
    location: "Le Marais, Paris",
    imageUrl:
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "2.5 hours",
    rating: 4.7,
    reviewCount: 934,
    price: 4900,
    currency: "USD",
    badge: "New",
    summary: "Explore private-feeling passages, courtyards, and design corners in Le Marais.",
    description:
      "Move through a curated route of quiet courtyards, historic facades, and small design addresses with a guide who connects architecture, neighborhood stories, and contemporary Paris culture.",
    included: ["Licensed guide", "Curated walking route", "Neighborhood recommendations"],
    excluded: ["Museum entry", "Food and drinks", "Transport tickets"],
    meetingPoint: "Meet outside Saint-Paul metro station at street level.",
    importantInfo: ["Comfortable walking shoes recommended", "Route includes cobblestones"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-seine-cruise",
    slug: "seine-evening-cruise",
    title: "Seine Evening Cruise",
    category: "Water Activity",
    citySlug: "paris",
    city: "Paris",
    country: "France",
    location: "Seine River, Paris",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1471623432079-b009d30b6729?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "75 minutes",
    rating: 4.6,
    reviewCount: 3110,
    price: 3400,
    currency: "USD",
    badge: "Evening pick",
    summary: "See Paris landmarks from the water as the city lights come on.",
    description:
      "Board an evening river cruise for a relaxed view of Paris icons from the Seine. The route is designed for golden-hour light and easy sightseeing without a packed schedule.",
    included: ["Cruise ticket", "Audio commentary", "Reserved boarding window"],
    excluded: ["Hotel transfer", "Food and drinks", "Guide on board"],
    meetingPoint: "Meet at the river pier listed on your booking confirmation.",
    importantInfo: ["Boarding closes 10 minutes before departure", "Outdoor decks depend on weather"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-zurich-chocolate",
    slug: "zurich-old-town-chocolate-walk",
    title: "Zurich Old Town & Chocolate Walk",
    category: "Guided Tour",
    citySlug: "zurich",
    city: "Zurich",
    country: "Switzerland",
    location: "Old Town, Zurich",
    imageUrl:
      "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "3 hours",
    rating: 4.8,
    reviewCount: 684,
    price: 7200,
    currency: "USD",
    badge: "Top rated",
    summary: "Walk Zurich lanes with chocolate tastings and local stories along the way.",
    description:
      "Explore Zurich's old town on foot with stops at selected chocolate makers, lake viewpoints, and historic lanes. The experience balances classic sightseeing with refined local tastings.",
    included: ["Local guide", "Chocolate tastings", "Old town route"],
    excluded: ["Tram tickets", "Additional purchases", "Hotel pickup"],
    meetingPoint: "Meet near Zurich HB main station clock.",
    importantInfo: ["Bring weather-appropriate clothing", "Contains dairy and nuts"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-lake-zurich-paddle",
    slug: "lake-zurich-paddle-experience",
    title: "Lake Zurich Paddle Experience",
    category: "Water Activity",
    citySlug: "zurich",
    city: "Zurich",
    country: "Switzerland",
    location: "Lake Zurich",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "2 hours",
    rating: 4.7,
    reviewCount: 392,
    price: 6400,
    currency: "USD",
    badge: "Limited spots",
    summary: "Paddle a calm lake route with skyline and alpine views.",
    description:
      "Meet lakeside for a short briefing before paddling a scenic route on Lake Zurich. The pace is relaxed, with time for photos and orientation from a local instructor.",
    included: ["Paddle equipment", "Instructor briefing", "Dry bag"],
    excluded: ["Swimwear", "Hotel transfer", "Personal insurance"],
    meetingPoint: "Meet at the lakeside rental station near Bellevue.",
    importantInfo: ["Basic swimming ability required", "Route may change with wind conditions"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-dubai-desert-evening",
    slug: "dubai-desert-evening-experience",
    title: "Dubai Desert Evening Experience",
    category: "Adventure",
    citySlug: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    location: "Dubai Desert Conservation Reserve",
    imageUrl:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "5 hours",
    rating: 4.8,
    reviewCount: 1180,
    price: 9600,
    currency: "USD",
    badge: "Bestseller",
    summary: "Move from city skyline to desert light with a curated evening route.",
    description:
      "Leave the city for a polished desert evening with scenic stops, sunset views, and a relaxed dinner setting designed for first-time visitors who want a premium introduction to Dubai's desert landscape.",
    included: ["Desert driver-guide", "Sunset viewpoint", "Dinner setting"],
    excluded: ["Private transfer upgrades", "Alcoholic drinks", "Personal expenses"],
    meetingPoint: "Meet at the designated city pickup point shared after booking.",
    importantInfo: ["Bring sunglasses", "Route may change during extreme weather"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-cape-town-table-mountain",
    slug: "cape-town-table-mountain-coastal-drive",
    title: "Cape Town Table Mountain & Coastal Drive",
    category: "Guided Tour",
    citySlug: "cape-town",
    city: "Cape Town",
    country: "South Africa",
    location: "Table Mountain, Cape Town",
    imageUrl:
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1484318571209-661cf29a69fa?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "4.5 hours",
    rating: 4.9,
    reviewCount: 812,
    price: 8400,
    currency: "USD",
    badge: "Top rated",
    summary: "Pair Table Mountain viewpoints with a scenic coastal route and local stories.",
    description:
      "See Cape Town from its most iconic viewpoint before continuing along a refined coastal route with stops chosen for photography, local context, and a calm introduction to the city.",
    included: ["Local guide", "Scenic route", "Photo stops"],
    excluded: ["Cableway ticket", "Meals", "Hotel pickup"],
    meetingPoint: "Meet near the lower Table Mountain cableway station.",
    importantInfo: ["Cableway operation depends on wind", "Bring a light layer"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-bali-canggu-surf",
    slug: "canggu-private-surf-session",
    title: "Canggu Private Surf Session",
    category: "Water Activity",
    citySlug: "bali",
    city: "Bali",
    country: "Indonesia",
    location: "Canggu, Bali",
    imageUrl:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "2 hours",
    rating: 4.8,
    reviewCount: 736,
    price: 6500,
    currency: "USD",
    badge: "New",
    summary: "A focused surf session with a local instructor on a beginner-friendly Canggu break.",
    description:
      "Meet your instructor near the beach for a practical surf briefing, warm-up, and guided water time. The session is designed for first-time and progressing surfers who want a calm, confidence-building experience.",
    included: ["Surf instructor", "Board rental", "Rash guard"],
    excluded: ["Hotel pickup", "Meals", "Personal insurance"],
    meetingPoint: "Meet at the beach access point shared after booking.",
    importantInfo: ["Basic swimming ability required", "Timing may shift with tide conditions"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  },
  {
    id: "act-tokyo-ceramics",
    slug: "tokyo-ceramics-studio-workshop",
    title: "Tokyo Ceramics Studio Workshop",
    category: "Workshop",
    citySlug: "tokyo",
    city: "Tokyo",
    country: "Japan",
    location: "Setagaya, Tokyo",
    imageUrl:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1100&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1523419409543-a5e549c1faa8?auto=format&fit=crop&w=900&q=85"
    ],
    duration: "2.5 hours",
    rating: 4.9,
    reviewCount: 524,
    price: 7400,
    currency: "USD",
    badge: "Limited spots",
    summary: "Shape a small ceramic piece in a quiet Tokyo studio with a local maker.",
    description:
      "Join a small studio session covering basic clay handling, shaping, and finishing. Your host guides each step while sharing the design language behind everyday Japanese ceramics.",
    included: ["Studio host", "Clay and tools", "Firing arrangement"],
    excluded: ["Shipping", "Hotel transfer", "Additional pieces"],
    meetingPoint: "Meet at the studio entrance near Setagaya-Daita Station.",
    importantInfo: ["Finished ceramics are fired after the workshop", "Shipping can be arranged later"],
    cancellationPolicy: "Free cancellation up to 24 hours before the activity starts."
  }
];

export function getCityBySlug(slug: string) {
  return cities.find((city) => city.slug === slug);
}

export function getActivityBySlug(slug: string) {
  return activities.find((activity) => activity.slug === slug);
}

export function getActivitiesByCity(citySlug: string) {
  return activities.filter((activity) => activity.citySlug === citySlug);
}

export function getFeaturedActivities(limit = 4) {
  return activities.slice(0, limit);
}
