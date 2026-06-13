# Alpii Product Specification

## Product Summary

Alpii is an MVP marketplace for curated tours, activities, and local experiences. The current product supports the complete demo lifecycle from partner activity creation to public discovery, checkout, dummy payment, voucher validation, booking completion, and verified review moderation.

The current product is web-first and English-only. It is designed to establish a reliable marketplace core before real payments, payouts, notifications, mobile clients, or itinerary products are added.

## Status Legend

- **Implemented**: available in the current application.
- **Planned**: assigned to a named upcoming sprint.
- **Future**: intentionally deferred without a committed implementation sprint.

## Implemented MVP

### Public Marketplace

- Database-backed homepage destinations and activities.
- `/activities` directory for all published activities.
- `/destinations` directory for active destinations that contain published activities.
- Existing `/things-to-do/[citySlug]` destination listing compatibility.
- Activity detail pages with gallery, content sections, itinerary, booking card, and verified reviews.
- Package/option selection after checking availability.
- Date, meeting time, adult, and child traveler selection.
- Always-available and scheduled-session options.
- Display currency selection for USD, IDR, EUR, and CHF.
- Public search backed by API/database data rather than `mock-travel`.

### Checkout

Checkout uses three stacked stages:

1. **Account and contact**
   - A new traveler can create an account inside checkout.
   - An authenticated traveler sees their saved account/contact summary.
   - Contact name, email, and phone are collected.
2. **Activity details**
   - Individual traveler names.
   - Pickup choice and pickup address.
   - Special requirements.
3. **Payment details**
   - Pay-now presentation for MVP.
   - Dummy card details and dummy payment confirmation.

Checkout persists the operational data on the booking. After successful booking and dummy payment, the traveler is redirected to the booking detail page.

Marketing opt-in is supported by the backend persistence model, but there is currently no checkout opt-in control; new checkout bookings store `false`.

### Partner Workspace

- Partner registration and profile management.
- Activity draft creation, editing, submission, and published revision workflow.
- Package/options with descriptions, meeting point overrides, meeting times, availability mode, and capacity.
- Option-level USD group pricing tiers for adults and children.
- Always-available dates and scheduled sessions.
- Media upload using presigned file uploads.
- Booking list with operational information:
  - meeting time
  - traveler names
  - pickup information
  - special requirements
- Voucher code validation and booking completion.

### Admin Workspace

- User management and role-aware dashboard.
- Destination hierarchy, legacy city, and category management.
- Activity curation, editing, approval, publishing, rejection, and archival.
- Published activity change-request review.
- Package/options, pricing, availability, and media review.
- Read-only booking and payment operations.
- Full persisted checkout data visibility.
- Review moderation, public text editing, featuring, hiding, and review-media moderation.

## Core Journeys

### Traveler Journey

```txt
Discover destination or activity
→ open activity detail
→ select date and travelers
→ check availability
→ choose package and meeting time
→ enter checkout
→ create account or continue authenticated
→ enter traveler and pickup details
→ confirm dummy payment
→ receive voucher
→ attend activity
→ partner validates voucher
→ booking becomes completed
→ traveler submits verified review
```

### Partner Journey

```txt
Register partner
→ complete partner profile
→ create activity draft
→ add packages, pricing, availability, meeting times, and media
→ submit for admin review
→ activity is published
→ receive bookings
→ use operational checkout data
→ validate voucher
→ complete tour
```

Published activity edits use a draft revision. The live public activity remains unchanged until an admin approves and applies the revision.

### Admin Journey

```txt
Manage destinations and categories
→ review partner activity
→ edit or approve content
→ publish activity
→ monitor bookings and payments
→ review change requests
→ moderate reviews and review media
```

## Marketplace Models

### Destination Hierarchy

Destinations support:

```txt
COUNTRY → REGION → CITY → AREA
```

Activities prefer `Destination`; the legacy `City` relation remains for backward compatibility.

### Activity Packages

An activity can have multiple `ActivityOption` packages. Each option can define:

- title and description
- duration and meeting point overrides
- local-time meeting options such as `07:00`, `08:00`, `09:00`
- `ALWAYS_AVAILABLE` or `SCHEDULED_SESSIONS`
- available weekdays and daily capacity
- option-level pricing tiers

Meeting times are plain local-time values and are displayed exactly as entered. They are not timezone-converted.

### Pricing and Currency

- Partner-entered pricing uses USD minor units.
- Group tiers select a unit price using total traveler count.
- The backend calculates booking totals, fees, and partner payout snapshots.
- USD is the booking/payment source of truth.
- USD, IDR, EUR, and CHF conversion is display-only using static MVP rates.

### Booking, Payment, and Voucher Lifecycle

```txt
PENDING_PAYMENT
→ dummy payment PAID
→ booking CONFIRMED
→ ACTIVE voucher generated
→ partner validates voucher
→ voucher USED
→ booking COMPLETED
```

Bookings persist package, date/session, meeting time, participant price rows, contact, named travelers, pickup preference/address, and special requirements.

### Verified Reviews

- A review requires a booking owned by the current user.
- The booking must be `COMPLETED`.
- One review is allowed per booking.
- New reviews enter `PENDING_REVIEW`.
- Only `APPROVED` reviews and approved media are public.
- Admins can edit public title/comment text, feature, reject, approve, or hide reviews.
- `ratingAverage` and `reviewCount` are recalculated from approved reviews only.

## Current Limitations

- No real payment gateway or Stripe integration.
- No automated partner payout or reconciliation workflow.
- No transactional email or notification delivery.
- No marketing opt-in control in checkout; persistence defaults to `false`.
- Public search intentionally loads a limited result set.
- Static display FX rates; no live provider or booking FX snapshot.
- Promo-code UI is not backed by a redemption engine.
- Mobile API contract is not finalized.
- No `/api/v1` namespace, Swagger/OpenAPI contract, or native mobile application.
- Production deployment is not completed.

## Planned

- Sprint 12: API contract and mobile readiness.
- Sprint 13: real payment gateway integration.
- Sprint 14: partner revenue and payout operations.
- Sprint 15: email and notification delivery.
- Sprint 16: finance reconciliation.
- Sprint 17: mobile API stabilization.
- Sprint 18: production hardening.

## Future

- Native mobile applications.
- AI or semi-custom itinerary planning.
- Live foreign-exchange provider.
- Real promo-code and campaign engine.
- Automated refunds.
- Multi-vendor bundled checkout.
- Affiliate and loyalty systems.
