# Alpii Database Specification

## Current State

Alpii uses PostgreSQL through Prisma. UUIDs are used for business entities, tables and mapped columns use snake_case, and money is stored as integer minor units.

The current schema supports:

- authentication and roles
- partner activity lifecycle
- destination hierarchy
- activity packages/options
- option pricing and availability
- published revisions
- booking, dummy payment, and vouchers
- persisted checkout contact/traveler data
- verified reviews and media moderation
- payout records and audit logs

## Core Rules

- Public queries return only `PUBLISHED` activities.
- Partner mutation queries verify ownership.
- Pricing and booking totals use USD minor units.
- Backend calculations are authoritative.
- Booking rows retain price and participant snapshots.
- Meeting times are local-time strings and are not timezone-converted.
- Admin mutations should create audit events where the module supports them.

## Identity and Access

### User

Stores login identity:

- unique email
- nullable password hash for compatibility
- full name
- `UserRole`
- `UserStatus`
- timestamps

Roles:

```txt
USER
PARTNER
ADMIN
SUPER_ADMIN
```

### Partner

One-to-one with a partner user. Stores business/legal identity, status, contact/address fields, description, activities, revisions, and payout relations.

## Marketplace Master Data

### Destination

Hierarchical destination:

- `COUNTRY`
- `REGION`
- `CITY`
- `AREA`

Each destination can have a parent and children. Public destination pages use active destinations that contain published activities.

### City

Legacy flat city model retained for backward compatibility. `Activity.cityId` remains required in the current schema while new UI and public metadata prefer `Activity.destinationId`.

Do not remove `City` until all legacy activity/admin/public contracts have been migrated.

### Category

Stores name, slug, description, icon, active state, and sort order.

## Activity Catalog

### Activity

Core fields include:

- partner, legacy city, optional destination, and category relations
- title and unique slug
- short/full descriptions
- lifecycle status
- pricing mode
- duration and policy fields
- JSON highlights, includes, exclusions, and itinerary
- rating average/count
- publish timestamps

An activity can have multiple media rows, packages/options, pricing fallbacks, availability rows, bookings, reviews, and revisions.

### ActivityMedia

Gallery item with optional `FileAsset` or URL, alt text, order, and cover flag.

### ActivityOption

Bookable package/variant with:

- title and option slug unique within the activity
- description
- duration and meeting-point overrides
- `meetingTimes` JSON
- availability mode
- available weekdays
- daily capacity
- default/active/sort state

If `meetingTimes` is configured, booking creation requires one of the configured values. Values such as `07:00` are stored and displayed as local-time text, not converted through UTC.

### ActivityOptionPricingTier

Preferred pricing model for new flows:

- USD currency
- minimum/maximum total travelers
- adult price cents
- optional child price cents
- optional discount metadata
- per-person price type
- active state

The service rejects invalid or overlapping active tiers.

### ActivityPricing and ActivityPricingTier

Legacy activity-level simple and tier pricing. These remain as backward-compatible fallbacks when option-level pricing is absent.

### ActivityAvailability

Scheduled session:

- activity and optional option relation
- start/end date-time
- capacity
- booked count
- active state

Scheduled bookings require an active matching availability row.

### ActivityOptionDateInventory

Per-option/per-date inventory for `ALWAYS_AVAILABLE` packages. The unique `(optionId, travelDate)` row tracks copied capacity and booked count.

Dates are normalized consistently for inventory lookup. If daily capacity is null, the option is treated as unlimited for MVP.

### ActivityRevision

Stores a complete proposed JSON snapshot for edits to a published activity. Draft/pending/rejected revisions do not affect live public data. Applying an approved revision updates live records while preserving booking references.

## Booking Domain

### Booking

Stores:

- user, activity, option, and optional availability
- travel date
- selected local `meetingTime`
- pickup choice/address
- special requirements
- status and timestamps
- USD currency and total snapshot
- platform fee and partner payout snapshots

Old bookings may have null checkout-detail relations/fields. All booking UIs must handle this gracefully.

### BookingParticipant

Commercial participant line:

- `ADULT` or `CHILD`
- label
- quantity
- unit price cents

This is the pricing snapshot used to explain the booking total.

### BookingContact

Optional one-to-one relation for backward compatibility with old bookings. New checkout bookings create it with:

- full name
- email
- phone number
- marketing opt-in

The current checkout UI stores `marketingOptIn = false` because the opt-in control is not implemented.

### BookingTraveler

Individual named traveler rows:

- participant type
- first name
- last name
- sort order

Backend validation requires adult/child row counts to match the participant quantities submitted for a new booking.

### PickupChoice

```txt
PICKUP
MEET_AT_POINT
```

`pickupAddress` is required when `PICKUP` is selected. Special requirements are limited by the booking DTO.

## Payment and Fulfillment

### Payment

One-to-one with booking. Stores provider, status, amount/currency, provider reference, payment timestamp, and audit timestamps.

Current implemented provider:

```txt
DUMMY
```

`STRIPE` exists in the enum for future integration but is not implemented.

### Voucher

One-to-one with booking. Stores unique code, QR payload, status, and use timestamp. Dummy payment confirmation creates one voucher idempotently.

Partner/admin validation changes:

```txt
Voucher ACTIVE → USED
Booking CONFIRMED → COMPLETED
```

## Reviews

### Review

Verified review fields include:

- user
- activity
- required unique booking
- optional activity option
- rating, title, and comment
- moderation status
- featured flag
- admin-edited public title/comment
- moderation metadata and timestamps

Rules:

- Booking belongs to the review user.
- Booking status is `COMPLETED`.
- One review per booking.
- Only `APPROVED` reviews count toward `Activity.ratingAverage` and `reviewCount`.

### ReviewMedia

Optional file/URL media with sort order and moderation status:

```txt
PENDING
APPROVED
REJECTED
HIDDEN
```

Only approved media is returned publicly.

## Storage and Operations

### FileAsset

Stores MinIO/object metadata:

- bucket and unique object key
- optional URL
- public/private visibility
- MIME type, size, original name
- uploader

It is referenced by activity media, review media, and legacy city images.

### AuditLog

Stores actor, action, entity type/id, metadata, and timestamp for operational traceability.

### Payout

The schema stores partner, currency, amount, status, reference, notes, and payment timestamp.

Payout automation and real transfer integration are not implemented. This model is a foundation for planned partner revenue work.

## Money and Currency

- Base currency: USD.
- Amount fields use cents.
- Option pricing must be USD for MVP.
- Booking, payment, fee, and payout snapshots remain USD.
- Frontend conversion to IDR/EUR/CHF is display-only using static rates.
- The backend never trusts a frontend total.

## Status Lifecycles

Activity:

```txt
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED
```

Revision requests and rejected/archive states are also supported.

Booking:

```txt
PENDING_PAYMENT → CONFIRMED → COMPLETED
```

Payment:

```txt
PENDING → PAID
```

Voucher:

```txt
ACTIVE → USED
```

Review:

```txt
PENDING_REVIEW → APPROVED
```

Reviews can also be rejected or hidden by admins.
