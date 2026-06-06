# Alpii Engineering Guidelines

## 1. Purpose

This document defines the engineering rules for building Alpii consistently with Codex.

Codex must follow this file together with:

- PRODUCT.md
- DESIGN.md
- SPRINTS.md

Do not create new patterns unless necessary. Reuse existing structure, components, services, and conventions.

---

## 2. Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Custom reusable components
- Server components where appropriate
- Client components only when interactivity is required

### Backend

- NestJS
- TypeScript
- REST API first
- Prisma ORM
- PostgreSQL
- DTO validation
- Role-based access control

### Infrastructure

- Docker Compose
- PostgreSQL
- MinIO
- Redis
- BullMQ prepared for future background jobs

### Payment

- Dummy payment provider for MVP
- Stripe-ready architecture for future implementation

### Email

- Log email provider for MVP
- Real provider prepared for future implementation

Future providers:

- Resend
- SendGrid
- Postmark

---

## 3. Repository Structure

Use this simple structure:

```txt
alpii/
  frontend/
  backend/
  docker-compose.yml
  .env.example
  PRODUCT.md
  DESIGN.md
  ENGINEERING.md
  SPRINTS.md
  README.md
```

Do not introduce a complex monorepo structure unless explicitly requested.

---

## 4. Frontend Structure

Use this structure inside `frontend/src`:

```txt
frontend/src/
  app/
    layout.tsx
    page.tsx
    login/
      page.tsx
    register/
      page.tsx
    things-to-do/
      [citySlug]/
        page.tsx
    activities/
      [activitySlug]/
        page.tsx
    checkout/
      [activitySlug]/
        page.tsx
    dashboard/
      layout.tsx
      page.tsx
      bookings/
        page.tsx
      profile/
        page.tsx
      settings/
        page.tsx
      partner/
        page.tsx
        activities/
          page.tsx
          new/
            page.tsx
          [activityId]/
            page.tsx
        bookings/
          page.tsx
        payouts/
          page.tsx
        scan/
          page.tsx
      admin/
        page.tsx
        cities/
          page.tsx
        categories/
          page.tsx
        activities/
          page.tsx
        partners/
          page.tsx
        bookings/
          page.tsx
        payments/
          page.tsx
        payouts/
          page.tsx
        reviews/
          page.tsx
        settings/
          page.tsx

  components/
    ui/
    layout/
    domain/

  lib/
    api.ts
    auth.ts
    routes.ts
    dashboard-nav.ts
    money.ts
    dates.ts
    constants.ts
    utils.ts

  types/
    user.ts
    partner.ts
    city.ts
    category.ts
    activity.ts
    booking.ts
    payment.ts
    payout.ts
    review.ts
    common.ts
```

---

## 5. Frontend Component Rules

Follow DESIGN.md strictly.

### Component Categories

```txt
components/ui       generic UI components
components/layout   layout and shell components
components/domain   business-specific Alpii components
```

### UI Components

UI components must not import Alpii business types.

Examples:

- Button
- Input
- Textarea
- Select
- Badge
- Card
- Table
- Modal
- Tabs
- EmptyState
- LoadingState
- ErrorState

### Layout Components

Layout components define page structure.

Examples:

- PageShell
- PublicShell
- AuthShell
- DashboardShell
- PageHeader
- PageToolbar
- Section

### Domain Components

Domain components can use Alpii business types.

Examples:

- ActivityCard
- ActivityGallery
- ActivityBookingBox
- ActivityStatusBadge
- BookingCard
- BookingStatusBadge
- VoucherQR
- CityCard
- CityHero
- PartnerStatusBadge
- AdminReviewPanel

---

## 6. Frontend Page Rules

Pages should be thin.

A page should:

- Load data
- Handle route-level composition
- Use PageShell or the correct shell
- Render reusable components

A page should not:

- Define large inline UI blocks repeatedly
- Manually recreate headers, cards, tables, empty states, or badges
- Contain complex business logic that belongs in services or components

### Dashboard Page Pattern

```tsx
<PageShell
  title="Activities"
  description="Manage your activity products."
  actions={<Button>Add Activity</Button>}
>
  {/* Page content */}
</PageShell>
```

### Public Page Pattern

```tsx
<PublicShell>
  <PageShell size="xl">
    {/* Page content */}
  </PageShell>
</PublicShell>
```

### Auth Page Pattern

```tsx
<AuthShell title="Log in to Alpii">
  {/* Auth form */}
</AuthShell>
```

---

## 7. Backend Structure

Use this structure inside `backend/src`:

```txt
backend/src/
  main.ts
  app.module.ts

  modules/
    auth/
    users/
    partners/
    cities/
    categories/
    activities/
    files/
    bookings/
    payments/
    vouchers/
    reviews/
    payouts/
    admin/
    currencies/
    notifications/
    audit-logs/

  common/
    decorators/
    guards/
    interceptors/
    filters/
    pipes/
    types/
    utils/

  prisma/
    prisma.module.ts
    prisma.service.ts
```

Each module should generally contain:

```txt
module-name.module.ts
module-name.controller.ts
module-name.service.ts
dto/
entities/ optional
```

Do not put all logic into one controller or one service.

---

## 8. Naming Conventions

### Frontend

```txt
Components: PascalCase.tsx
Hooks: useSomething.ts
Utilities: camelCase.ts
Types: camelCase.ts
Route segments: kebab-case
```

Examples:

```txt
ActivityCard.tsx
PageShell.tsx
useCurrentUser.ts
formatMoney.ts
things-to-do
```

### Backend

```txt
Modules: kebab-case folders
DTO files: create-activity.dto.ts
Service files: activities.service.ts
Controller files: activities.controller.ts
Enum values: UPPER_SNAKE_CASE
Database tables: snake_case
```

---

## 9. Environment Variables

Use `.env.example` as the source of truth.

Required variables:

```env
# App
NODE_ENV=development
APP_NAME=Alpii

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend
API_PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=alpii
POSTGRES_PASSWORD=alpii_password
POSTGRES_DB=alpii_db
DATABASE_URL=postgresql://alpii:alpii_password@postgres:5432/alpii_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ROOT_USER=alpii_minio
MINIO_ROOT_PASSWORD=alpii_minio_password
MINIO_USE_SSL=false
MINIO_PUBLIC_BUCKET=public
MINIO_PRIVATE_BUCKET=private
MINIO_PUBLIC_URL=http://localhost:9000

# Auth
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Payment
PAYMENT_PROVIDER=dummy
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
EMAIL_PROVIDER=log
RESEND_API_KEY=
EMAIL_FROM=no-reply@alpii.my.id

# Defaults
DEFAULT_CURRENCY=USD
DEFAULT_LOCALE=en
```

Never hardcode secrets in code.

---

## 10. Auth Rules

Use JWT authentication.

Preferred MVP approach:

- Access token
- Refresh token
- httpOnly cookie
- Role-based access control

Roles:

```txt
USER
PARTNER
ADMIN
SUPER_ADMIN
```

Rules:

- Backend is the source of truth for permissions.
- Frontend role checks are only for UI convenience.
- Admin endpoints must use role guards.
- Partner endpoints must check ownership.
- A partner must not access or edit another partner's activities, bookings, files, or payouts.

---

## 11. API Rules

The backend should expose REST APIs.

General API style:

```txt
GET    /resource
GET    /resource/:id
POST   /resource
PATCH  /resource/:id
DELETE /resource/:id
```

Use specific action routes only when necessary:

```txt
PATCH /admin/activities/:id/approve
PATCH /admin/activities/:id/reject
POST  /payments/dummy/confirm
POST  /vouchers/validate
```

Rules:

- Use DTO validation for all request bodies.
- Use consistent error responses.
- Do not expose internal database details unnecessarily.
- Do not trust frontend-calculated prices.
- Price calculation must happen on backend.
- Payment confirmation must happen on backend.
- Booking confirmation must not happen without payment record.

---

## 12. API Response Shape

Use consistent response shapes.

For single resource:

```json
{
  "data": {}
}
```

For list resource:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

For errors:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 13. Frontend API Client

Use a single API client utility:

```txt
frontend/src/lib/api.ts
```

Rules:

- Do not scatter raw fetch calls everywhere.
- Use `apiFetch` or a related wrapper.
- Always use `credentials: "include"` if cookie auth is used.
- Centralize error handling.

Example:

```ts
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
}
```

---

## 14. Prisma Rules

Use Prisma for PostgreSQL.

Rules:

- Use migrations for schema changes.
- Do not manually alter database schema outside migrations.
- Use enum types for statuses and roles.
- Use Decimal for money fields.
- Store currency with every money-related record.
- Store price snapshots in bookings.

Important models should include timestamps:

```txt
created_at
updated_at
```

Use soft delete only where necessary.

---

## 15. Payment Rules

MVP uses dummy payment.

Payment providers:

```txt
DUMMY
STRIPE
```

Payment statuses:

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

Booking statuses:

```txt
PENDING_PAYMENT
CONFIRMED
CANCELLED
COMPLETED
REFUNDED
```

Rules:

- Always create a payment record for a booking.
- Do not confirm booking without paid payment.
- Dummy payment should simulate real payment flow.
- Stripe should be prepared but not implemented fully in MVP.
- Future Stripe implementation must use webhook signature verification.

Suggested endpoints:

```txt
POST /bookings
POST /payments/dummy/confirm
POST /payments/stripe/create-checkout-session future
POST /payments/stripe/webhook future
```

---

## 16. Email and Notification Rules

MVP uses log email provider.

Email providers:

```txt
LOG
RESEND
SENDGRID
POSTMARK
```

Rules:

- Business services should call NotificationService.
- Business services should not call provider implementation directly.
- In MVP, email actions should log to console or database.
- Real sending can be added later without changing business flow.

Future email events:

- User registered
- Password reset
- Booking confirmed
- Payment success
- Activity approved
- Activity rejected
- Payout paid

---

## 17. File Storage Rules

Use MinIO.

Production domain:

```txt
files.alpii.my.id
```

Local URL:

```txt
http://localhost:9000
```

Buckets:

```txt
public
private
```

Rules:

- Public files can be served directly.
- Private files require signed URL.
- Every file must have metadata in the database.
- Validate file MIME type and size.
- Do not trust frontend file metadata only.
- Use object keys that are organized by entity type.

Example object keys:

```txt
cities/{cityId}/hero/{fileId}.jpg
activities/{activityId}/gallery/{fileId}.jpg
categories/{categoryId}/icon/{fileId}.png
partners/{partnerId}/documents/{fileId}.pdf
vouchers/{bookingId}/qr/{fileId}.png
```

File metadata fields:

```txt
id
bucket
object_key
visibility
mime_type
size
original_name
uploaded_by
created_at
```

---

## 18. Currency Rules

Default currency:

```txt
USD
```

MVP may use one currency, but all money records must store currency.

Currency must exist in:

- Activity pricing
- Booking
- Payment
- Payout

Booking must store price snapshot:

```txt
currency
unit_price
quantity
subtotal_amount
platform_fee_amount
total_amount
partner_net_amount
```

Do not implement real-time exchange rate conversion in MVP.

---

## 19. Translation Rules

Default locale:

```txt
en
```

MVP is English only.

Rules:

- Do not implement full multi-language routing yet.
- Do not create translation management UI yet.
- Optional translation tables may be prepared for future use.
- Base fields can remain English in main tables for MVP.

---

## 20. Audit Log Rules

Admin and sensitive actions should be auditable.

Log important events such as:

- Admin approves activity
- Admin rejects activity
- Admin changes platform fee
- Admin marks payout as paid
- Partner submits activity
- Partner validates voucher
- Payment is confirmed
- Booking is cancelled

Audit log fields:

```txt
id
actor_user_id
action
entity_type
entity_id
metadata
created_at
```

---

## 21. Security Rules

Minimum security requirements:

- Validate all inputs
- Use DTO validation in NestJS
- Use role guards
- Use ownership guards for partner resources
- Use CORS whitelist
- Use httpOnly cookies for auth when possible
- Use rate limiting for auth endpoints
- Verify file upload MIME type and size
- Do not expose private MinIO files publicly
- Do not trust frontend price calculation
- Do not expose secrets to frontend

Frontend environment variables exposed to browser must start with:

```txt
NEXT_PUBLIC_
```

Backend secrets must never use `NEXT_PUBLIC_`.

---

## 22. Formatting Rules

Use shared utilities for formatting.

Frontend:

```txt
formatMoney
formatDate
formatDuration
```

Rules:

- Do not manually format money in components.
- Do not manually format dates in components.
- Use consistent formatting across public pages and dashboards.

---

## 23. Status Badge Rules

Do not manually create status badges in pages.

Use domain-specific components:

```txt
ActivityStatusBadge
BookingStatusBadge
PaymentStatusBadge
PartnerStatusBadge
PayoutStatusBadge
```

Each status badge should centralize:

- Label
- Variant
- Description if needed

---

## 24. Empty, Loading, and Error Rules

Use shared state components:

```txt
EmptyState
LoadingState
ErrorState
```

Do not create custom empty/loading/error blocks repeatedly inside pages.

Examples:

```txt
No activities yet
No bookings yet
No payouts yet
Failed to load activities
Loading bookings
```

---

## 25. Dashboard Navigation Rules

Dashboard navigation must be config-driven.

Use:

```txt
frontend/src/lib/dashboard-nav.ts
```

Navigation should be based on role:

```txt
USER
PARTNER
ADMIN
SUPER_ADMIN
```

Do not hardcode dashboard menu separately in multiple files.

---

## 26. Route Constants

Use route constants in:

```txt
frontend/src/lib/routes.ts
```

Example:

```ts
export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  partnerDashboard: "/dashboard/partner",
  adminDashboard: "/dashboard/admin",
  city: (slug: string) => `/things-to-do/${slug}`,
  activity: (slug: string) => `/activities/${slug}`,
  checkout: (slug: string) => `/checkout/${slug}`,
};
```

Do not scatter hardcoded URLs everywhere.

---

## 27. Docker Rules

Docker services for local development:

```txt
postgres
redis
minio
backend
frontend
```

Ports:

```txt
Frontend: 3000
Backend: 4000
PostgreSQL: 5432
Redis: 6379
MinIO API: 9000
MinIO Console: 9001
```

Rules:

- `docker compose up -d` should start the full local environment.
- Backend should expose `GET /health`.
- Frontend should run on `0.0.0.0:3000`.
- Backend should listen on `0.0.0.0:4000`.
- MinIO should create `public` and `private` buckets.
- Public bucket should be readable for public assets.

---

## 28. Health Check

Backend must provide:

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

---

## 29. Testing Strategy

MVP should include basic tests where practical.

Priority:

- Auth service
- Activity approval flow
- Booking creation
- Dummy payment confirmation
- Voucher validation
- Price calculation

Do not block MVP progress by overbuilding tests, but keep business logic testable.

---

## 30. Codex Instructions

When using Codex, always instruct it to:

```txt
Read PRODUCT.md, DESIGN.md, ENGINEERING.md, and SPRINTS.md first.
Follow these documents strictly.
Do not create new architecture unless necessary.
Do not duplicate existing components.
Do not hardcode repeated UI patterns.
Use PageShell, PublicShell, AuthShell, and DashboardShell consistently.
Use shared UI components from components/ui.
Use domain components from components/domain.
Use route constants and apiFetch.
Keep pages thin.
Keep backend modules separated.
Use DTO validation and role guards.
Keep payment dummy for now but Stripe-ready.
Keep email as log provider for now but provider-ready.
```

---

## 31. Engineering Principle

Build clean foundations first.

Avoid overengineering, but do not build throwaway code.

Every implementation should be:

```txt
Consistent
Reusable
Role-safe
Payment-ready
File-storage-ready
Currency-ready
Dashboard-ready
```
