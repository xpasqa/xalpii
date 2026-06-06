# Alpii Sprint Plan

## Sprint Philosophy

Build Alpii in focused, sequential sprints.

Each sprint should produce a working vertical slice or a stable foundation for the next sprint. Avoid building advanced features before the marketplace core is stable.

The MVP goal is to support this complete flow:

```txt
Partner creates activity
→ Admin approves activity
→ User discovers activity
→ User books activity
→ User completes dummy payment
→ User receives QR voucher
→ Partner validates voucher
→ Admin tracks booking and payout
```

---

## Sprint 0: Project Foundation

### Goal

Create a stable local development foundation with Docker, frontend, backend, database, storage, and basic health checks.

### Scope

- Repository structure
- Docker Compose
- Next.js frontend setup
- NestJS backend setup
- PostgreSQL
- Prisma
- MinIO
- Redis
- Environment variables
- Basic health endpoint
- README setup instructions

### Deliverables

```txt
frontend/
backend/
docker-compose.yml
.env.example
README.md
```

Docker services:

```txt
postgres
redis
minio
backend
frontend
```

Local ports:

```txt
Frontend: http://localhost:3000
Backend: http://localhost:4000
PostgreSQL: localhost:5432
MinIO API: http://localhost:9000
MinIO Console: http://localhost:9001
Redis: localhost:6379
```

Backend endpoint:

```txt
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "alpii-api"
}
```

### Acceptance Criteria

- `docker compose up -d` runs successfully.
- Frontend opens on port 3000.
- Backend opens on port 4000.
- `/health` returns status ok.
- PostgreSQL is reachable from backend.
- MinIO public and private buckets are created.
- Redis container is running.

---

## Sprint 1: Auth and Role-Based Dashboard Foundation

### Goal

Allow users, partners, and admins to register/login and access the correct dashboard shell based on role.

### Scope

- User registration
- Login
- Logout
- Current user endpoint
- Role-based access control
- User role
- Partner role
- Admin role
- Super admin role prepared
- DashboardShell
- Role-based dashboard navigation
- Protected frontend routes

### Roles

```txt
USER
PARTNER
ADMIN
SUPER_ADMIN
```

### Frontend Routes

```txt
/login
/register
/dashboard
/dashboard/partner
/dashboard/admin
/dashboard/profile
```

### Backend Modules

```txt
auth
users
partners
```

### API Endpoints

```txt
POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/me
```

### Deliverables

- Auth pages using AuthShell.
- Dashboard pages using DashboardShell.
- Navigation changes by role.
- Backend protects role-specific routes.
- Partner registration creates user with partner role.
- Admin user can be seeded.

### Acceptance Criteria

- User can register and login.
- Partner can register and login.
- Admin can login using seeded account.
- User sees user dashboard navigation.
- Partner sees partner dashboard navigation.
- Admin sees admin dashboard navigation.
- Unauthorized users cannot access dashboard pages.
- Frontend uses shared apiFetch utility.

---

## Sprint 2: Admin Master Data and File Storage

### Goal

Allow admins to create marketplace master data and upload/manage public files through MinIO.

### Scope

- City CRUD
- Category CRUD
- File metadata table
- MinIO upload flow
- Public/private bucket support
- Public image serving
- Admin city page
- Admin category page

### Backend Modules

```txt
cities
categories
files
admin
```

### Database Models

```txt
cities
categories
files
```

### Frontend Routes

```txt
/dashboard/admin/cities
/dashboard/admin/categories
```

### API Endpoints

```txt
GET /cities
GET /cities/:slug
POST /admin/cities
PATCH /admin/cities/:id
DELETE /admin/cities/:id

GET /categories
POST /admin/categories
PATCH /admin/categories/:id
DELETE /admin/categories/:id

POST /files/presign-upload
POST /files/confirm-upload
GET /files/:id/signed-url
```

### File Rules

Buckets:

```txt
public
private
```

Visibility:

```txt
PUBLIC
PRIVATE
```

Public use cases:

```txt
city images
category icons
activity images
```

Private use cases:

```txt
partner documents
internal documents
private vouchers if needed
```

### Deliverables

- Admin can create/edit/delete cities.
- Admin can create/edit/delete categories.
- Admin can upload city image.
- Admin can upload category icon/image.
- Uploaded files are stored in MinIO.
- File metadata is stored in database.

### Acceptance Criteria

- City list renders in admin dashboard.
- Category list renders in admin dashboard.
- Public city/category data can be fetched without login.
- Admin-only mutation endpoints are protected.
- File upload stores object in MinIO and metadata in database.
- Public file URL can be displayed on frontend.

---

## Sprint 3: Partner Activity Submission and Admin Curation

### Goal

Allow partners to create activities and submit them for admin approval.

### Scope

- Partner profile
- Activity draft creation
- Activity editing
- Activity image gallery
- Activity pricing with currency
- Activity availability basic
- Activity submission for review
- Admin activity review
- Admin approve/reject activity
- Public visibility only for published activities

### Activity Statuses

```txt
DRAFT
PENDING_REVIEW
APPROVED
PUBLISHED
REJECTED
ARCHIVED
```

### Backend Modules

```txt
partners
activities
files
admin
currencies
audit-logs
```

### Database Models

```txt
partners
activities
activity_media
activity_pricing
activity_availability
activity_translations optional
```

### Frontend Routes

```txt
/dashboard/partner
/dashboard/partner/activities
/dashboard/partner/activities/new
/dashboard/partner/activities/[activityId]
/dashboard/admin/activities
```

### API Endpoints

```txt
GET /partner/profile
PATCH /partner/profile

GET /partner/activities
POST /partner/activities
GET /partner/activities/:id
PATCH /partner/activities/:id
POST /partner/activities/:id/submit

GET /admin/activities
GET /admin/activities/:id
POST /admin/activities/:id/approve
POST /admin/activities/:id/reject
POST /admin/activities/:id/publish
POST /admin/activities/:id/archive
```

### Deliverables

- Partner can create activity as draft.
- Partner can upload activity images.
- Partner can add pricing and currency.
- Partner can add basic availability.
- Partner can submit activity for review.
- Admin can view pending submissions.
- Admin can approve or reject activity.
- Approved activity can be published.

### Acceptance Criteria

- Partner can only manage own activities.
- Partner cannot approve own activity.
- Public API only returns published activities.
- Admin can reject with reason.
- Rejected activity can be edited and resubmitted.
- Activity cards can render using real activity data.

---

## Sprint 4: Public Marketplace Frontend

### Goal

Build the public marketplace experience so users can browse cities and activities.

### Scope

- Homepage
- City listing page
- Activity listing by city
- Activity detail page
- Activity cards
- City cards
- Basic category filter
- Basic search placeholder
- Responsive public UI
- SEO-friendly slugs

### Frontend Routes

```txt
/
/things-to-do/[citySlug]
/activities/[activitySlug]
```

### Backend API

```txt
GET /cities
GET /cities/:slug
GET /activities
GET /activities/:slug
GET /categories
```

### Public Components

```txt
PublicShell
PageShell
HeroSearch
CityCard
CityHero
CategoryPill
ActivityCard
ActivityGrid
ActivityGallery
ActivityBookingBox
```

### Activity Card Data

- Image
- Title
- City
- Category
- Duration
- Rating placeholder
- Price from
- CTA/link

### Activity Detail Data

- Gallery
- Title
- City
- Category
- Duration
- Description
- Included
- Excluded
- Meeting point
- Important information
- Price
- Availability
- Booking CTA
- Partner/operator info

### Deliverables

- Homepage looks like a travel marketplace.
- City page lists published activities.
- Activity detail page renders real activity data.
- User can click from homepage to city to activity detail.
- Activity detail has booking CTA.

### Acceptance Criteria

- Only published activities appear publicly.
- Public pages use PublicShell and PageShell.
- No duplicated card/header patterns.
- Mobile layout is usable.
- Empty state appears if city has no activities.

---

## Sprint 5: Booking, Dummy Payment, and QR Voucher

### Goal

Allow users to book an activity end-to-end using dummy payment and receive a QR voucher.

### Scope

- Booking creation
- Participant quantity
- Selected date
- Price calculation
- Booking price snapshot
- Dummy payment creation
- Dummy payment confirmation
- Booking confirmation
- QR voucher generation
- User booking dashboard
- Booking detail page

### Booking Statuses

```txt
PENDING_PAYMENT
CONFIRMED
CANCELLED
COMPLETED
REFUNDED
```

### Payment Providers

```txt
DUMMY
STRIPE
```

### Payment Statuses

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

### Voucher Statuses

```txt
ACTIVE
USED
CANCELLED
EXPIRED
```

### Backend Modules

```txt
bookings
payments
vouchers
notifications
currencies
```

### Database Models

```txt
bookings
booking_participants
payments
payment_events
vouchers
```

### Frontend Routes

```txt
/checkout/[activitySlug]
/booking/success/[bookingId]
/dashboard/bookings
/dashboard/bookings/[bookingId]
```

### API Endpoints

```txt
POST /bookings
GET /bookings/my
GET /bookings/:id

POST /payments/dummy/confirm
GET /payments/:id

GET /vouchers/:bookingId
```

### Dummy Payment Flow

```txt
User creates booking
→ system creates payment with provider DUMMY
→ payment status is PENDING
→ booking status is PENDING_PAYMENT
→ user clicks Confirm Dummy Payment
→ payment status becomes PAID
→ booking status becomes CONFIRMED
→ QR voucher is generated
```

### Deliverables

- User can start checkout from activity detail.
- User can create booking.
- Dummy payment record is created.
- User can confirm dummy payment.
- Booking becomes confirmed.
- QR voucher is generated.
- User can view booking in dashboard.

### Acceptance Criteria

- Booking cannot be confirmed without payment record.
- Booking stores price snapshot.
- Payment stores provider and status.
- Voucher is only active after booking is confirmed.
- User can only view own bookings.
- Activity partner can later see related bookings.

---

## Sprint 6: Partner Operations and Admin Operations

### Goal

Give partners and admins the tools to manage bookings, voucher validation, revenue, and manual payouts.

### Scope

- Partner booking list
- Partner booking detail
- QR voucher validation
- Mark voucher as used
- Mark booking as completed
- Partner revenue overview
- Admin all bookings
- Admin all payments
- Platform fee tracking
- Manual payout tracking
- Basic review system
- Audit logs

### Backend Modules

```txt
bookings
vouchers
payments
payouts
reviews
audit-logs
admin
```

### Database Models

```txt
payouts
reviews
audit_logs
platform_fees
```

### Frontend Routes

```txt
/dashboard/partner/bookings
/dashboard/partner/bookings/[bookingId]
/dashboard/partner/scan
/dashboard/partner/payouts

/dashboard/admin/bookings
/dashboard/admin/payments
/dashboard/admin/payouts
/dashboard/admin/reviews
```

### API Endpoints

```txt
GET /partner/bookings
GET /partner/bookings/:id
POST /partner/vouchers/validate
POST /partner/vouchers/:code/use
POST /partner/bookings/:id/complete

GET /admin/bookings
GET /admin/payments
GET /admin/payouts
POST /admin/payouts/:id/mark-paid

POST /reviews
GET /reviews/activity/:activityId
PATCH /admin/reviews/:id/status
```

### Manual Payout Flow

```txt
Booking is confirmed
→ partner net revenue is recorded
→ admin sees pending payout
→ admin transfers money manually outside system
→ admin marks payout as paid
```

### Deliverables

- Partner can see bookings for own activities.
- Partner can validate voucher code.
- Partner can mark voucher as used.
- Partner can mark booking as completed.
- Admin can view all bookings and payments.
- Admin can track manual payouts.
- User can leave basic review.
- Admin can moderate review status.
- Important admin actions are logged.

### Acceptance Criteria

- Partner cannot access bookings from other partners.
- Voucher cannot be used twice.
- Cancelled voucher cannot be used.
- Payout status can be updated by admin.
- Review can only be created by user with valid booking.
- Audit log records admin payout and activity approval actions.

---

## Sprint 7: Stabilization and Demo Polish

### Goal

Stabilize the MVP, polish critical UI, improve demo flow, and fix bugs before presentation or user testing.

### Scope

- UI consistency check
- Dashboard polish
- Error state polish
- Loading state polish
- Empty state polish
- Seed data
- Demo data
- Basic test coverage
- API error handling
- README update
- Deployment checklist

### Demo Data

Prepare sample:

```txt
Admin user
Partner user
Regular user
3 cities
6 categories
10 activities
3 bookings
2 confirmed bookings
1 used voucher
1 pending payout
```

### Deliverables

- Seed script
- Demo-ready marketplace pages
- Demo-ready dashboards
- Clean README
- Known limitations documented
- Deployment checklist documented

### Acceptance Criteria

- End-to-end flow works without manual database edits.
- Demo can be completed from homepage to voucher validation.
- UI follows DESIGN.md.
- Product behavior follows PRODUCT.md.
- Code structure follows ENGINEERING.md.
- No critical broken routes.

---

## Fast Demo Path

If a demo is needed quickly, compress the work into 3 fast sprints.

### Fast Sprint A: Foundation and Auth

```txt
Docker
Next.js
NestJS
PostgreSQL
MinIO
Auth
Roles
Dashboard shells
Admin seed
```

### Fast Sprint B: Supply and Marketplace

```txt
Cities
Categories
Partner activity creation
Admin approval
Homepage
City page
Activity detail
```

### Fast Sprint C: Booking Demo

```txt
Checkout
Dummy payment
Booking confirmation
QR voucher
User dashboard
Partner booking list
Voucher validation
```

This fast path is acceptable for a prototype, but the full Sprint 0–7 plan should still be completed for a proper MVP.

---

## Development Rules During Sprints

- Read PRODUCT.md, DESIGN.md, and ENGINEERING.md before starting each sprint.
- Do not create new UI patterns if a shared component exists.
- Do not duplicate PageShell, DashboardShell, Button, Card, Table, or StatusBadge logic.
- Backend must be the source of truth for permissions.
- Public pages must only show published activities.
- Booking must not be confirmed without a payment record.
- Payment must use provider abstraction, even for dummy payment.
- Email should use notification abstraction, even if provider is LOG only.
- Currency must be stored in pricing, booking, payment, and payout records.
- File uploads must store metadata in the database.
- All admin and partner mutation endpoints must be protected.
- Partner resources must enforce ownership checks.

---

## MVP Completion Definition

The MVP is complete when the following flow works:

```txt
Admin logs in
→ Admin creates city and category
→ Partner registers
→ Partner creates activity
→ Partner uploads images
→ Partner submits activity
→ Admin approves and publishes activity
→ User browses city page
→ User opens activity detail
→ User creates booking
→ User confirms dummy payment
→ System generates QR voucher
→ User sees booking and voucher in dashboard
→ Partner sees booking
→ Partner validates voucher
→ Partner marks booking completed
→ Admin sees booking, payment, and payout tracking
```
