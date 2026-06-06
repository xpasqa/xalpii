"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import {
  ArrowRight,
  Compass,
  Heart,
  Star
} from "lucide-react";
import {
  ActivityStatusBadge,
  BookingCard,
  BookingStatusBadge,
  CityCard,
  PaymentStatusBadge
} from "../../../components/domain";
import { ActivityCard } from "../../../components/domain/activity/ActivityCard";
import { SearchBar } from "../../../components/domain/search/SearchBar";
import {
  AuthShell,
  DashboardShell,
  PageHeader,
  PageShell,
  PublicShell
} from "../../../components/layout";
import {
  Badge,
  ButtonCTA,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input
} from "../../../components/ui";

const colors = [
  { name: "Primary", token: "travel.primary", value: "#B92216", className: "bg-travel-primary" },
  {
    name: "Secondary",
    token: "travel.secondary",
    value: "#0071EB",
    className: "bg-travel-secondary"
  },
  { name: "Rating", token: "travel.rating", value: "#FFB800", className: "bg-travel-rating" },
  { name: "Dark", token: "travel.dark", value: "#1A1A1A", className: "bg-travel-dark" },
  { name: "Muted", token: "travel.muted", value: "#6A6A6A", className: "bg-travel-muted" },
  { name: "Border", token: "travel.border", value: "#EAEAEA", className: "bg-travel-border" },
  { name: "Background", token: "travel.bg", value: "#F5F7FA", className: "bg-travel-bg" }
];

const activities = [
  {
    id: "act-bali-waterfall",
    title: "Bali waterfalls, rice terraces, and jungle swing day trip",
    category: "Adventure",
    location: "Ubud, Bali",
    imageUrl:
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1100&q=85",
    duration: "8 hours | Pickup available",
    rating: 4.8,
    reviewCount: 2489,
    price: 625000,
    currency: "IDR",
    href: "#activity-bali-waterfall",
    badge: "Bestseller",
    isFavorite: true
  },
  {
    id: "act-kyoto-tea",
    title: "Kyoto hidden temples and private tea ceremony walk",
    category: "Culture",
    location: "Kyoto, Japan",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1100&q=85",
    duration: "3.5 hours | Small group",
    rating: 4.9,
    reviewCount: 812,
    price: 7400,
    currency: "USD",
    href: "#activity-kyoto-tea",
    badge: "Top rated"
  },
  {
    id: "act-lisbon-sailing",
    title: "Lisbon sunset sailing with local snacks and drinks",
    category: "Water activity",
    location: "Lisbon, Portugal",
    imageUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1100&q=85",
    duration: "2 hours | Free cancellation",
    rating: 4.7,
    reviewCount: 1350,
    price: 3900,
    currency: "USD",
    href: "#activity-lisbon-sailing",
    badge: "Limited spots"
  },
  {
    id: "act-istanbul-food",
    title: "Istanbul two-continent food tour through markets and ferries",
    category: "Food",
    location: "Istanbul, Turkiye",
    imageUrl:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1100&q=85",
    duration: "5 hours | Local guide",
    rating: 4.8,
    reviewCount: 979,
    price: 6800,
    currency: "USD",
    href: "#activity-istanbul-food",
    badge: "New"
  }
];

export default function DesignSystemPage() {
  const [destination, setDestination] = useState("Bali");
  const [date, setDate] = useState("2026-07-18");
  const [participants, setParticipants] = useState("2");

  const searchProps = {
    destination,
    date,
    participants,
    onDestinationChange: setDestination,
    onDateChange: setDate,
    onParticipantsChange: setParticipants,
    onSubmit: () => undefined
  };

  return (
    <main className="min-h-screen bg-white font-interface text-travel-dark">
      <HeroPreview searchProps={searchProps} />

      <div className="mx-auto w-full max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        <PreviewSection
          eyebrow="Foundation"
          title="Typography"
          description="A measured editorial type system for marketplace discovery, product cards, and operational surfaces."
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-travel-lg border border-travel-border bg-white p-7">
              <p className="font-interface text-xs font-medium uppercase tracking-[0.14em] text-travel-primary">
                Plus Jakarta Sans
              </p>
              <h2 className="mt-4 max-w-2xl font-brand text-4xl font-bold leading-[1.12] text-travel-dark sm:text-5xl">
                Discover experiences worth planning the whole trip around.
              </h2>
              <p className="mt-4 font-interface text-sm font-normal leading-6 text-travel-muted">
                Brand, headings, titles, UI banners, activity titles, and SearchBar labels.
              </p>
            </div>
            <div className="rounded-travel-lg border border-travel-border bg-white p-7">
              <p className="font-brand text-xs font-semibold uppercase tracking-[0.14em] text-travel-secondary">
                Onest
              </p>
              <p className="mt-4 font-interface text-lg font-normal leading-8 text-travel-dark">
                Crisp body copy, metadata, numbers, prices, ratings, form input text, and buttons
                for a marketplace that needs to sell clearly without feeling noisy.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Metric label="Rating" value="4.8" />
                <Metric label="Reviews" value="2,489" />
                <Metric label="From" value="Rp625K" />
              </div>
            </div>
          </div>
        </PreviewSection>

        <PreviewSection
          eyebrow="Tokens"
          title="Color Tokens"
          description="Orange drives conversion, blue supports trust, and neutral colors stay quiet around travel imagery."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((color) => (
              <div
                className="overflow-hidden rounded-travel-lg border border-travel-border bg-white"
                key={color.token}
              >
                <div className={`h-20 ${color.className}`} />
                <div className="p-4">
                  <p className="font-brand text-sm font-semibold text-travel-dark">{color.name}</p>
                  <p className="mt-1 font-interface text-xs font-normal text-travel-muted">
                    {color.token}
                  </p>
                  <p className="mt-3 font-interface text-sm font-semibold text-travel-dark">
                    {color.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection
          eyebrow="Actions"
          title="Buttons"
          description="CTA treatments stay direct and commercial, with controlled elevation and refined focus states."
        >
          <div className="rounded-travel-lg border border-travel-border bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
              <ButtonCTA rightIcon={<ArrowRight className="size-4" />}>Book now</ButtonCTA>
              <ButtonCTA leftIcon={<Compass className="size-4" />} variant="secondary">
                Explore cities
              </ButtonCTA>
              <ButtonCTA variant="outline">Compare tours</ButtonCTA>
              <ButtonCTA leftIcon={<Heart className="size-4" />} variant="ghost">
                Save
              </ButtonCTA>
              <ButtonCTA variant="danger">Cancel</ButtonCTA>
              <ButtonCTA isLoading>Checking</ButtonCTA>
              <ButtonCTA disabled>Unavailable</ButtonCTA>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonCTA size="sm">Small</ButtonCTA>
              <ButtonCTA size="md">Medium</ButtonCTA>
              <ButtonCTA size="lg">Large CTA</ButtonCTA>
            </div>
          </div>
        </PreviewSection>

        <PreviewSection
          eyebrow="Discovery"
          title="SearchBar"
          description="A premium booking module with calm inputs, compact labels, and a clear search action."
        >
          <div className="space-y-6">
            <div className="rounded-travel-lg border border-travel-border bg-travel-bg p-5 sm:p-8">
              <SearchBar {...searchProps} />
            </div>
            <div className="max-w-sm rounded-travel-lg border border-travel-border bg-white p-4">
              <SearchBar {...searchProps} />
            </div>
          </div>
        </PreviewSection>

        <PreviewSection
          eyebrow="Marketplace"
          title="Activity Cards"
          description="The core product surface: image-first cards with disciplined metadata, ratings, and price hierarchy."
        >
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} {...activity} />
            ))}
          </div>
        </PreviewSection>

        <PreviewSection
          eyebrow="Shells"
          title="Layout Shell Preview"
          description="Static shells only. These previews validate the global frame without adding auth or dashboard behavior."
        >
          <div className="space-y-6">
            <Card className="border-travel-border shadow-none">
              <CardHeader>
                <CardTitle>PageShell</CardTitle>
                <CardDescription>Focused page frame with a reusable title, summary, and actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <PageShell
                  actions={<ButtonCTA size="sm">Create listing</ButtonCTA>}
                  className="p-0"
                  description="A compact operational surface that still carries the Alpii travel visual language."
                  title="Partner activities"
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Metric label="Bookings" value="124" />
                    <Metric label="Rating" value="4.8" />
                    <Metric label="Revenue" value="$8.4K" />
                  </div>
                </PageShell>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-travel-border shadow-none">
              <CardHeader>
                <CardTitle>PublicShell</CardTitle>
                <CardDescription>Travel marketplace chrome with a stronger brand and CTA treatment.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[460px] overflow-hidden border-t border-travel-border">
                  <PublicShell>
                    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
                      <div>
                        <Badge variant="warning">Curated by Alpii</Badge>
                        <h2 className="mt-4 max-w-2xl font-brand text-4xl font-bold leading-tight text-travel-dark">
                          Book unforgettable local experiences.
                        </h2>
                        <p className="mt-4 max-w-xl font-interface text-base leading-7 text-travel-muted">
                          Image-rich discovery, clear prices, and confident CTAs for high-intent travelers.
                        </p>
                        <ButtonCTA className="mt-6" rightIcon={<ArrowRight className="size-4" />}>
                          Start exploring
                        </ButtonCTA>
                      </div>
                      <img
                        alt="Traveler overlooking tropical cliffs"
                        className="aspect-[4/3] rounded-travel-lg object-cover shadow-travel-card"
                        src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85"
                      />
                    </section>
                  </PublicShell>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <AuthShell
                description="Static preview shell for future login and registration flows."
                title="Welcome back"
              >
                <div className="space-y-4">
                  <Input placeholder="Email address" />
                  <Input placeholder="Password" type="password" />
                  <ButtonCTA fullWidth>Continue</ButtonCTA>
                </div>
              </AuthShell>

              <DashboardShell>
                <PageHeader
                  actions={<ButtonCTA size="sm" variant="outline">Export</ButtonCTA>}
                  description="Compact operational layout with travel-native accents."
                  title="Overview"
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <BookingCard
                    activityTitle="Sunrise food walk"
                    bookingCode="BK-1042"
                    bookingStatus="CONFIRMED"
                    currency="USD"
                    date="2026-07-12"
                    guestName="Maya Chen"
                    paymentStatus="PAID"
                    totalMinor={4800}
                  />
                  <CityCard
                    activityCount={42}
                    country="Indonesia"
                    imageUrl="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85"
                    name="Bali"
                  />
                </div>
              </DashboardShell>
            </div>

            <Card className="border-travel-border shadow-none">
              <CardHeader>
                <CardTitle>Status Badges</CardTitle>
                <CardDescription>Existing domain badges preserved for future product workflows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <ActivityStatusBadge status="DRAFT" />
                  <ActivityStatusBadge status="PENDING_REVIEW" />
                  <ActivityStatusBadge status="APPROVED" />
                  <ActivityStatusBadge status="PUBLISHED" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <BookingStatusBadge status="PENDING_PAYMENT" />
                  <BookingStatusBadge status="CONFIRMED" />
                  <BookingStatusBadge status="COMPLETED" />
                  <BookingStatusBadge status="CANCELLED" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <PaymentStatusBadge status="PENDING" />
                  <PaymentStatusBadge status="PAID" />
                  <PaymentStatusBadge status="FAILED" />
                  <PaymentStatusBadge status="REFUNDED" />
                </div>
              </CardContent>
            </Card>
          </div>
        </PreviewSection>
      </div>
    </main>
  );
}

function HeroPreview({
  searchProps
}: {
  searchProps: ComponentProps<typeof SearchBar>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-travel-border bg-white">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-5 font-interface text-sm font-medium text-travel-primary">
            Design system preview
          </p>
          <h1 className="max-w-4xl font-brand text-5xl font-bold leading-[1.06] text-travel-dark sm:text-6xl lg:text-[68px]">
            Premium travel UI kit for Alpii experiences.
          </h1>
          <p className="mt-6 max-w-2xl font-interface text-lg font-normal leading-8 text-travel-muted">
            A conversion-focused component foundation for image-rich discovery, decisive CTAs, and
            trustworthy activity cards. Mock data only.
          </p>
          <div className="mt-9">
            <SearchBar {...searchProps} />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-interface text-sm font-normal text-travel-muted">
            <span>Trusted partners</span>
            <span>Clear availability</span>
            <span>Commercial CTA patterns</span>
          </div>
        </div>

        <div className="relative min-h-[500px]">
          <img
            alt="A premium travel activity scene"
            className="absolute right-0 top-0 h-[420px] w-[82%] rounded-travel-lg object-cover shadow-travel"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85"
          />
          <div className="absolute bottom-6 left-0 w-[70%] overflow-hidden rounded-travel-lg border border-travel-border bg-white shadow-travel-card">
            <img
              alt="Ocean activity"
              className="aspect-[4/3] w-full object-cover"
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85"
            />
            <div className="p-4">
              <p className="font-interface text-xs font-medium text-travel-muted">
                Bali | Bestseller
              </p>
              <p className="mt-1 font-brand text-lg font-bold text-travel-dark">
                Private surf lesson with local beach guide
              </p>
              <div className="mt-3 flex items-center gap-1 font-interface text-sm">
                <Star className="size-4 fill-travel-rating text-travel-rating" />
                <span className="font-semibold">4.9</span>
                <span className="text-travel-muted">(1,204)</span>
              </div>
            </div>
          </div>
          <div className="absolute right-5 top-8 rounded-travel-lg border border-travel-border bg-white px-4 py-3 shadow-travel-card">
            <p className="font-interface text-xs font-normal text-travel-muted">From</p>
            <p className="font-interface text-xl font-bold text-travel-dark">Rp450K</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewSection({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="font-interface text-xs font-medium uppercase tracking-[0.14em] text-travel-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-brand text-3xl font-bold text-travel-dark sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl font-interface text-base font-normal leading-7 text-travel-muted">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-travel-md border border-travel-border bg-white p-4">
      <p className="font-interface text-xs font-medium uppercase tracking-[0.12em] text-travel-muted">
        {label}
      </p>
      <p className="mt-2 font-interface text-2xl font-semibold text-travel-dark">{value}</p>
    </div>
  );
}
