# Alpii Database Specification

## 1. Purpose

This document defines the initial PostgreSQL database structure for the Alpii MVP.

The database must support:

- User, partner, admin roles
- City and category management
- Partner activity submission
- Admin activity curation
- Public marketplace listing
- Booking flow
- Dummy payment
- QR voucher
- File metadata for MinIO
- Currency fields from the beginning
- Manual payout tracking
- Review foundation
- Audit logs

The MVP is English only, uses dummy payment, and prepares the structure for Stripe, real email, multi-currency conversion, and translation later.

---

## 2. Database Principles

- Use PostgreSQL.
- Use Prisma as ORM.
- Use UUID as primary ID for business entities.
- Use snake_case for table and column names.
- Use UPPER_SNAKE_CASE for enum values.
- Store money values in integer minor units whenever possible.
  - Example: USD 10.50 should be stored as `1050`.
- Every important table should include:
  - `id`
  - `created_at`
  - `updated_at`
- Use soft delete only where needed.
- Booking must store a price snapshot.
- Public users should only see `PUBLISHED` activities.
- Partner queries must always check ownership.
- Admin actions should be recorded in audit logs.

---

## 3. Core Enums

### UserRole

```txt
USER
PARTNER
ADMIN
SUPER_ADMIN
```

### PartnerStatus

```txt
PENDING
APPROVED
REJECTED
SUSPENDED
```

### ActivityStatus

```txt
DRAFT
PENDING_REVIEW
APPROVED
PUBLISHED
REJECTED
ARCHIVED
```

### BookingStatus

```txt
PENDING_PAYMENT
CONFIRMED
CANCELLED
COMPLETED
REFUNDED
```

### PaymentProvider

```txt
DUMMY
STRIPE
```

### PaymentStatus

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

### VoucherStatus

```txt
ACTIVE
USED
CANCELLED
EXPIRED
```

### FileVisibility

```txt
PUBLIC
PRIVATE
```

### PayoutStatus

```txt
PENDING
PROCESSING
PAID
FAILED
CANCELLED
```

### ReviewStatus

```txt
PENDING
PUBLISHED
HIDDEN
```

---

## 4. Main Tables

## users

Stores all login accounts.

```txt
id uuid primary key
email varchar unique not null
password_hash varchar not null
full_name varchar not null
role UserRole not null default USER
phone varchar nullable
avatar_file_id uuid nullable
is_active boolean not null default true
email_verified_at timestamp nullable
last_login_at timestamp nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Partner and admin are also users.
- Do not create separate auth tables for each role.
- Role-based access should be handled by backend guards.

---

## partners

Stores partner/supplier profile.

```txt
id uuid primary key
user_id uuid unique not null references users(id)
company_name varchar not null
slug varchar unique not null
status PartnerStatus not null default PENDING
contact_name varchar nullable
contact_email varchar nullable
contact_phone varchar nullable
country varchar nullable
city varchar nullable
address text nullable
description text nullable
website_url varchar nullable
logo_file_id uuid nullable
rejection_reason text nullable
approved_at timestamp nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- One user can have one partner profile.
- Partner must be approved before activities can be published.

---

## cities

Stores destination cities.

```txt
id uuid primary key
name varchar not null
slug varchar unique not null
country varchar not null
region varchar nullable
timezone varchar nullable
default_currency varchar not null default 'USD'
hero_file_id uuid nullable
description text nullable
is_active boolean not null default true
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Public city listing should only show active cities.
- Region can be continent or commercial region.

---

## categories

Stores activity categories.

```txt
id uuid primary key
name varchar not null
slug varchar unique not null
description text nullable
icon_file_id uuid nullable
is_active boolean not null default true
sort_order integer not null default 0
created_at timestamp not null
updated_at timestamp not null
```

Examples:

- Guided Tour
- Food Experience
- Water Activity
- Cultural Experience
- Adventure
- Workshop
- Attraction Ticket
- Day Trip

---

## activities

Stores bookable activity products.

```txt
id uuid primary key
partner_id uuid not null references partners(id)
city_id uuid not null references cities(id)
category_id uuid not null references categories(id)
title varchar not null
slug varchar unique not null
short_description text nullable
description text not null
duration_minutes integer nullable
meeting_point text nullable
included text nullable
excluded text nullable
important_info text nullable
cancellation_policy text nullable
min_participants integer not null default 1
max_participants integer nullable
status ActivityStatus not null default DRAFT
rejection_reason text nullable
approved_by_user_id uuid nullable references users(id)
approved_at timestamp nullable
published_at timestamp nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Public users only see `PUBLISHED` activities.
- Partner can edit `DRAFT` and `REJECTED` activities.
- Admin can approve or reject `PENDING_REVIEW` activities.

---

## activity_media

Stores gallery images for activities.

```txt
id uuid primary key
activity_id uuid not null references activities(id)
file_id uuid not null references files(id)
alt_text varchar nullable
sort_order integer not null default 0
is_cover boolean not null default false
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- One activity should have one cover image.
- Activity cards should use the cover image.

---

## activity_pricing

Stores activity price.

```txt
id uuid primary key
activity_id uuid not null references activities(id)
currency varchar not null default 'USD'
adult_price_amount integer not null
child_price_amount integer nullable
infant_price_amount integer nullable
platform_fee_percentage numeric(5,2) not null default 15.00
is_active boolean not null default true
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Store amount in minor units.
- Example: USD 100.00 = 10000.
- MVP can use adult price only.
- Keep child and infant price nullable for future.

---

## activity_availability

Stores basic availability.

```txt
id uuid primary key
activity_id uuid not null references activities(id)
start_date date not null
end_date date nullable
start_time time nullable
available_days varchar[] nullable
capacity integer nullable
is_active boolean not null default true
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- MVP can keep availability simple.
- `available_days` can contain values like `MONDAY`, `TUESDAY`, etc.
- More advanced inventory can be added later.

---

## bookings

Stores user bookings.

```txt
id uuid primary key
booking_code varchar unique not null
user_id uuid not null references users(id)
activity_id uuid not null references activities(id)
partner_id uuid not null references partners(id)
selected_date date not null
selected_time time nullable
participant_quantity integer not null default 1
currency varchar not null
unit_price_amount integer not null
subtotal_amount integer not null
platform_fee_percentage numeric(5,2) not null
platform_fee_amount integer not null
partner_net_amount integer not null
total_amount integer not null
booking_status BookingStatus not null default PENDING_PAYMENT
payment_status PaymentStatus not null default PENDING
confirmed_at timestamp nullable
cancelled_at timestamp nullable
completed_at timestamp nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Booking must store price snapshot.
- Do not depend on current activity price after booking is created.
- `total_amount` is what user pays.
- `partner_net_amount` is what partner earns before payout.

---

## booking_participants

Stores participant details if needed.

```txt
id uuid primary key
booking_id uuid not null references bookings(id)
full_name varchar not null
email varchar nullable
phone varchar nullable
participant_type varchar not null default 'ADULT'
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- MVP can create one participant using user data.
- Future can support multiple participant details.

---

## payments

Stores payment records.

```txt
id uuid primary key
booking_id uuid unique not null references bookings(id)
provider PaymentProvider not null default DUMMY
provider_reference varchar nullable
currency varchar not null
amount integer not null
status PaymentStatus not null default PENDING
paid_at timestamp nullable
failed_at timestamp nullable
refunded_at timestamp nullable
metadata jsonb nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- MVP uses `DUMMY` provider.
- Stripe can be added later without changing booking flow.
- Do not confirm booking without payment record.

---

## payment_events

Stores payment event logs.

```txt
id uuid primary key
payment_id uuid nullable references payments(id)
provider PaymentProvider not null
event_type varchar not null
provider_event_id varchar nullable
payload jsonb nullable
created_at timestamp not null
```

Notes:

- Dummy payment should also create event logs.
- Future Stripe webhook payloads should be stored here.

---

## vouchers

Stores QR voucher data.

```txt
id uuid primary key
booking_id uuid unique not null references bookings(id)
voucher_code varchar unique not null
qr_payload text not null
status VoucherStatus not null default ACTIVE
used_at timestamp nullable
used_by_partner_user_id uuid nullable references users(id)
expires_at timestamp nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Voucher is generated after booking is confirmed.
- Partner validates voucher from dashboard.

---

## files

Stores MinIO file metadata.

```txt
id uuid primary key
bucket varchar not null
object_key varchar unique not null
visibility FileVisibility not null
mime_type varchar not null
size_bytes integer not null
original_name varchar nullable
uploaded_by_user_id uuid nullable references users(id)
public_url text nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Public files can have public URL.
- Private files require signed URL.
- All uploads must create file metadata.

---

## reviews

Stores user reviews.

```txt
id uuid primary key
booking_id uuid unique not null references bookings(id)
activity_id uuid not null references activities(id)
user_id uuid not null references users(id)
rating integer not null
comment text nullable
status ReviewStatus not null default PENDING
published_at timestamp nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- Rating should be between 1 and 5.
- User can review only after confirmed or completed booking.

---

## payouts

Tracks manual partner payouts.

```txt
id uuid primary key
partner_id uuid not null references partners(id)
currency varchar not null
total_amount integer not null
status PayoutStatus not null default PENDING
notes text nullable
paid_at timestamp nullable
created_by_user_id uuid nullable references users(id)
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- MVP payout is manual.
- Admin transfers outside system and marks payout as paid.

---

## payout_items

Links bookings to payouts.

```txt
id uuid primary key
payout_id uuid not null references payouts(id)
booking_id uuid not null references bookings(id)
amount integer not null
created_at timestamp not null
```

Notes:

- One payout can contain multiple bookings.
- A booking should not be included in multiple paid payouts.

---

## platform_fee_settings

Stores global platform fee configuration.

```txt
id uuid primary key
name varchar not null
fee_percentage numeric(5,2) not null
is_active boolean not null default true
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- MVP can use one active global fee.
- Default recommended fee is 15%.

---

## audit_logs

Stores important system/admin actions.

```txt
id uuid primary key
actor_user_id uuid nullable references users(id)
action varchar not null
entity_type varchar not null
entity_id uuid nullable
metadata jsonb nullable
created_at timestamp not null
```

Examples:

- `ACTIVITY_APPROVED`
- `ACTIVITY_REJECTED`
- `BOOKING_CONFIRMED`
- `VOUCHER_USED`
- `PAYOUT_MARKED_PAID`
- `CITY_CREATED`
- `CATEGORY_CREATED`

---

## activity_translations Optional Future

Prepared for future multi-language content.

```txt
id uuid primary key
activity_id uuid not null references activities(id)
locale varchar not null
title varchar not null
short_description text nullable
description text not null
included text nullable
excluded text nullable
important_info text nullable
cancellation_policy text nullable
created_at timestamp not null
updated_at timestamp not null
```

Notes:

- MVP does not need to use this table.
- Default content is English on the main `activities` table.
- Future logic can use translation if available, otherwise fallback to English.

---

## city_translations Optional Future

```txt
id uuid primary key
city_id uuid not null references cities(id)
locale varchar not null
name varchar not null
description text nullable
created_at timestamp not null
updated_at timestamp not null
```

---

## category_translations Optional Future

```txt
id uuid primary key
category_id uuid not null references categories(id)
locale varchar not null
name varchar not null
description text nullable
created_at timestamp not null
updated_at timestamp not null
```

---

## 5. Recommended MVP Build Order

### Migration 1: Foundation

- users
- partners
- files
- audit_logs

### Migration 2: Marketplace Master Data

- cities
- categories
- city_translations optional
- category_translations optional

### Migration 3: Activities

- activities
- activity_media
- activity_pricing
- activity_availability
- activity_translations optional

### Migration 4: Booking and Payment

- bookings
- booking_participants
- payments
- payment_events
- vouchers

### Migration 5: Operations

- reviews
- payouts
- payout_items
- platform_fee_settings

---

## 6. Important Indexes

Recommended indexes:

```txt
users.email unique
partners.user_id unique
partners.slug unique
cities.slug unique
categories.slug unique
activities.slug unique
activities.status
activities.city_id
activities.category_id
activities.partner_id
bookings.user_id
bookings.partner_id
bookings.activity_id
bookings.booking_status
payments.booking_id unique
payments.status
vouchers.booking_id unique
vouchers.voucher_code unique
files.object_key unique
reviews.booking_id unique
payouts.partner_id
```

---

## 7. MVP Seed Data

Initial seed data should include:

### Admin User

```txt
email: admin@alpii.local
role: SUPER_ADMIN
```

### Platform Fee

```txt
name: Default Platform Fee
fee_percentage: 15.00
is_active: true
```

### Categories

```txt
Guided Tour
Food Experience
Water Activity
Cultural Experience
Adventure
Workshop
Attraction Ticket
Day Trip
```

### Cities

```txt
Bali
Paris
Tokyo
Dubai
Zurich
```

---

## 8. Data Integrity Rules

- A booking must have one payment.
- A confirmed booking must have one voucher.
- A public activity must have status `PUBLISHED`.
- An activity must belong to one partner, one city, and one category.
- Partner users can only update their own partner profile and activities.
- Admin can review all activities.
- Public users cannot see draft, rejected, archived, or pending activities.
- Payment confirmation must happen on the backend.
- Dummy payment should still create a payment event.
- QR voucher validation must update voucher status and audit log.

---

## 9. Future Database Extensions

Later phases may add:

- regions
- itinerary templates
- itinerary items
- multi-activity cart
- exchange_rates
- user_currency_preferences
- language_preferences
- activity_tags
- guide_assignments
- refund_requests
- coupons
- affiliate_tracking
- notification_logs
- email_templates
- webhook_logs
