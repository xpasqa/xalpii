# Alpii Engineering Guidelines

## Purpose

This document describes the current architecture and engineering rules for Alpii. It must be read together with `PRODUCT.md`, `DESIGN.md`, `DATABASE.md`, and `SPRINTS.md`.

## Current Architecture

### Frontend

- Next.js 15 App Router.
- TypeScript.
- Tailwind CSS.
- Server components for route/data composition where practical.
- Client components for forms, authentication state, selectors, dialogs, checkout, and dashboard interactions.
- Domain API clients under `frontend/src/lib`.

### Backend

- NestJS REST API.
- TypeScript.
- Prisma ORM.
- PostgreSQL.
- DTO validation using Nest validation.
- JWT authentication.
- Role guards for `USER`, `PARTNER`, `ADMIN`, and `SUPER_ADMIN`.

### Infrastructure

- Docker Compose infrastructure.
- PostgreSQL 16.
- Redis 7.
- MinIO object storage with public/private buckets.
- Presigned MinIO upload flow.
- Local PostgreSQL host port defaults to `5433`.

Redis is available as infrastructure but background job processing is not yet a product workflow.

## Repository Structure

```txt
alpii/
  frontend/
  backend/
  docker/
  docker-compose.infra.yml
  docker-compose.yml
  PRODUCT.md
  DESIGN.md
  ENGINEERING.md
  DATABASE.md
  SPRINTS.md
```

Do not introduce a more complex monorepo framework unless an upcoming requirement justifies it.

## Frontend Boundaries

```txt
frontend/src/
  app/                 route composition
  components/ui/       generic UI
  components/layout/   application shells and layout
  components/domain/   Alpii business UI
  lib/                 API clients, auth, money, mapping, utilities
```

Rules:

- Pages should remain thin and compose domain components.
- Generic UI must not import booking/activity/partner domain rules.
- API calls belong in `lib` clients rather than reusable presentational components.
- Public production paths must not use `mock-travel` as fallback data.
- Empty/error states are preferable to silently leaking mock marketplace content.

## Backend Modules

The implemented backend includes:

- auth
- admin users, cities, destinations, categories, and activities
- partner profile and activity management
- activity revisions
- public marketplace
- files/presigned uploads
- bookings, payments, and vouchers
- reviews and moderation

Prisma access is centralized through `PrismaService`.

## Authentication and Authorization

- Access tokens are JWTs.
- Email is normalized to lowercase.
- Passwords are hashed.
- DTO validation is applied globally.
- Partner queries must verify partner ownership.
- User booking/review queries must verify user ownership.
- Admin and super-admin access use role decorators and guards.

Checkout account creation reuses the implemented:

```txt
POST /auth/register
```

Guest/anonymous booking is not supported. A booking always belongs to a user account.

## Public Data Sources

The public marketplace is database-backed:

- Homepage featured destinations use `Destination` data.
- `/activities` uses published activities from the public API.
- `/destinations` uses active destinations with published activities.
- Activity detail uses the public activity API.
- Public search queries API/database results.

`mock-travel` must not be used by production public routes. Mock data may remain for isolated design-system or development examples only.

## Source-of-Truth Rules

The backend is the source of truth for:

- published activity visibility
- package ownership and active status
- availability and capacity
- meeting-time validation
- option/tier selection
- USD booking price calculation
- platform fee and partner payout snapshots
- booking and payment status
- voucher creation and validation
- review eligibility
- approved review aggregate rating/count

The frontend must not submit a trusted total. It submits selections and participants; the backend recalculates the total.

## Pricing and Money

- Base/accounting currency is USD.
- Prices are stored as integer USD minor units.
- Option-level group tiers are preferred.
- Legacy activity-level pricing remains a compatibility fallback.
- Display conversion to USD, IDR, EUR, or CHF occurs in the frontend using static MVP rates.
- Admin booking/payment views use base USD amounts.

Production FX snapshots and a live FX provider are planned, not implemented.

## Availability and Meeting Times

Options support:

- `ALWAYS_AVAILABLE`
- `SCHEDULED_SESSIONS`

Always-available capacity is tracked by option/date inventory. Scheduled sessions use `ActivityAvailability.bookedCount`.

`meetingTimes` are configured as local-time strings. A booking stores the selected `meetingTime` string. Do not parse or timezone-convert values such as `07:00`; display them exactly as configured.

## Booking Transactions

Booking creation performs validation and persistence transactionally:

- published activity and active option
- date/session requirements
- meeting time
- traveler quantities and capacity
- matching option pricing tier
- participant price snapshot
- contact
- named travelers
- pickup preference/address
- special requirements
- pending dummy payment

Repeated dummy-payment confirmation is idempotent and must not create duplicate vouchers.

## Files

- Upload metadata is stored in `FileAsset`.
- The backend issues MinIO presigned upload URLs.
- Public activity/review media can reference a `FileAsset` or URL.
- Deleting activity media does not implicitly delete the stored file object.
- Review media requires moderation before public display.

## Reviews

- `Review.bookingId` is required and unique.
- The booking must be owned by the reviewer and be `COMPLETED`.
- New reviews are `PENDING_REVIEW`.
- Only `APPROVED` reviews count publicly.
- Rating aggregate recalculation runs when public review status changes.
- Parallel duplicate submissions must resolve to a domain conflict, not a raw Prisma error.

## API Conventions

Current APIs are unversioned REST endpoints. Existing modules commonly return:

```json
{
  "success": true,
  "data": {}
}
```

Planned Sprint 12 work:

- `/api/v1` contract
- Swagger/OpenAPI
- consistent pagination/filter schemas
- standard error envelope
- mobile-oriented DTO stability

Do not document those items as implemented until the contract migration is complete.

## Environment and Deployment

Local services:

```txt
Frontend:  http://localhost:3000
Backend:   http://localhost:4000
Postgres:  localhost:5433
Redis:     localhost:6379
MinIO API: http://localhost:9000
MinIO UI:  http://localhost:9001
```

Planned production domains:

```txt
alpii.my.id
www.alpii.my.id
api.alpii.my.id
files.alpii.my.id
```

Production deployment, TLS, secrets management, observability, backup/restore testing, and CDN configuration are not yet implemented.

## Testing and Change Rules

- Run Prisma validation after schema edits.
- Use migrations for database changes.
- Run backend and frontend builds before completing feature sprints.
- Keep old booking records readable when adding optional relations.
- Preserve unrelated dirty worktree changes.
- Do not expose partner/customer private information beyond the role’s operational need.
