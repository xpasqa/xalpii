# Alpii Sprint Plan

## Status Legend

- **Implemented**: merged into the current application and represented in the codebase.
- **Planned**: next sequenced work with a defined goal and scope.
- **Future**: intentionally deferred and not yet scheduled as an implementation.

## Implemented Sprints

### Sprint 0 — Foundation

Project structure, Docker infrastructure, Next.js, NestJS, PostgreSQL, Prisma, Redis, MinIO, environment examples, and health checks.

### Sprint 1 — Public Visual Flow

Initial homepage, destination/city listing, activity detail, checkout placeholder, shared public shell, and design-system route using mock content.

### Sprint 2 — Public Polish

Production-quality public layout, compact search, destination cards, activity cards, city pages, navigation, footer, responsiveness, and conversion-oriented visual hierarchy.

### Sprint 3 — Prisma Schema and Seed

Core marketplace models, enums, migrations, database health integration, deterministic users/partners/master data, and activity seed foundation.

### Sprint 4 — Authentication

JWT authentication, bcrypt password hashing, registration/login/current-user endpoints, role guards/decorators, frontend auth clients, protected dashboard shells, and role redirects.

### Sprint 5 — Admin Master Data

Admin CRUD for cities and categories with tables, dialogs, filtering, activation state, and dashboard navigation.

### Sprint 6 — Files and Partner Profile

MinIO presigned uploads, `FileAsset` metadata, partner profile APIs, partner profile frontend, and upload helpers.

### Sprint 7 — Partner Activity Submission

Partner-owned activity drafts, content editing, pricing, availability, media, submission for review, lookups, and partner activity pages.

### Sprint 8 — Admin Curation and Public API

Admin activity review/status transitions, public marketplace read APIs, public pages connected to database data, and mock fallback removal from primary marketplace flows.

### Sprint 8.5 — Dashboard Refinement

Full-width dashboard shell, icon rail navigation, table-first admin CRUD, dialogs, destination management, partner builder UX, and shared admin/partner activity-editing language.

### Sprint 9 — Booking, Dummy Payment, and Voucher

Backend booking creation, participant price snapshots, 15% platform fee calculation, dummy payment confirmation, voucher generation, user bookings, partner bookings, validation, and admin read-only booking/payment views.

### Sprint 9.6 — Advanced Group Pricing

Adult/child participant types, traveler-count pricing tiers, backend tier selection, partner tier builder, and public/checkout price breakdown.

### Sprint 9.7 — USD Base Currency

USD minor-unit source of truth, normalized seed prices, display currency selector, static USD/IDR/EUR/CHF conversion, and USD accounting labels.

### Sprint 9.8 — Activity Options and Always Available

Package options, option-level pricing tiers, meeting-point/duration overrides, always-available weekdays/capacity, scheduled sessions, option selection, checkout option persistence, and admin option review.

Supporting increments also implemented:

- Published activity revision snapshots and admin apply/reject workflow.
- Always-available per-date inventory safety.
- Destination hierarchy foundation.
- Exact local meeting-time string configuration and booking persistence.

### Sprint 10A — Review Backend Integrity

Required unique booking-backed reviews, completed-booking eligibility, review/media moderation statuses, verified seed data, approved-only rating aggregation, and backend review/admin/public endpoints.

### Sprint 10B — Review Frontend, Admin, and Public UX

Review API client, public verified-review section, user review submission flow, media upload support, admin moderation UI, featuring, hiding, public text editing, and media moderation.

### Sprint 11A — Checkout UI Redesign

Three-stage checkout, compact editable stage summaries, sticky booking summary, payment presentation, responsive styling, and final Book Now flow.

### Sprint 11B — Account Creation Inside Checkout

Checkout account registration through the existing auth API, token persistence, authenticated contact summary, and continuation without leaving checkout.

### Sprint 11B.5 — Public Data-Source Cleanup

Database-backed `/activities`, `/destinations`, homepage destinations, and search. Removed public `mock-travel` leakage and preserved exact meeting-time display.

### Sprint 11C — Checkout Data Persistence

Persisted booking contact, named travelers, pickup choice/address, special requirements, marketing opt-in field, meeting time, and role-appropriate user/partner/admin display.

## Current MVP Milestone

The implemented vertical slice is:

```txt
Partner creates activity and packages
→ Admin reviews and publishes
→ Traveler discovers activity
→ Traveler selects option/date/time/travelers
→ Traveler creates account inside checkout
→ Booking persists traveler and operational data
→ Dummy payment confirms
→ Voucher is generated
→ Partner validates voucher
→ Booking completes
→ Traveler submits verified review
→ Admin moderates review
→ Approved review appears publicly
```

## Planned Sprints

### Sprint 12 — API Contract and Mobile Readiness

**Goal**

Stabilize a documented backend contract that web and future mobile clients can consume safely.

**Scope**

- Introduce `/api/v1`.
- Standard response and error envelopes.
- Stable pagination, filtering, and sorting contracts.
- Swagger/OpenAPI generation.
- Mobile-safe authentication and refresh-token decision.
- DTO cleanup and compatibility notes.
- Idempotency strategy for booking/payment mutations.

**Non-goals**

- Native mobile application.
- Real payment gateway.
- Redesigning public or dashboard UI.

**Key deliverables**

- Versioned controllers or compatibility routing.
- OpenAPI document.
- Error-code catalog.
- Mobile integration guide.
- Contract regression tests for auth, public marketplace, booking, voucher, and reviews.

### Sprint 13 — Payment Gateway Integration

**Goal**

Replace the dummy-only payment confirmation path with a production-capable provider integration.

**Scope**

- Provider abstraction implementation.
- Payment intent/session creation.
- Secure webhook processing.
- Idempotent status transitions.
- Payment expiry/failure handling.
- Checkout provider handoff and result UI.
- Keep dummy provider for local/test environments.

**Non-goals**

- Partner payout transfer.
- Full refund automation.
- Finance reconciliation ledger.

**Key deliverables**

- Real provider adapter.
- Webhook endpoint and signature verification.
- Payment status audit trail.
- Successful, failed, expired, and replay test cases.

### Sprint 14 — Partner Payout and Revenue

**Goal**

Give partners and admins a trustworthy view of earned revenue and manual payout operations.

**Scope**

- Revenue eligibility rules.
- Partner earnings summaries.
- Payout batch/record creation.
- Admin payout review and status transitions.
- Partner payout history.
- Booking-to-payout traceability.

**Non-goals**

- Automated bank transfer.
- Tax filing.
- Multi-currency settlement.

**Key deliverables**

- Revenue calculation service.
- Partner revenue and payout pages.
- Admin payout operations.
- Audit records and exportable summaries.

### Sprint 15 — Notifications and Email

**Goal**

Deliver transactional communication for account, booking, payment, voucher, activity, and review events.

**Scope**

- Email provider abstraction.
- Templates for booking confirmation, voucher, cancellation, partner booking notice, review moderation, and account flows.
- Queue/retry strategy using Redis-backed jobs.
- Notification preferences where appropriate.
- Development log provider retained.

**Non-goals**

- Marketing campaign automation.
- SMS/WhatsApp delivery.
- Full customer support inbox.

**Key deliverables**

- Email module and provider.
- Template set.
- Queue workers and retry policy.
- Delivery logging.

### Sprint 16 — Finance Reconciliation

**Goal**

Reconcile booking, payment, fee, refund, and payout values with an auditable operational view.

**Scope**

- Payment-versus-booking consistency checks.
- Fee/payout reconciliation.
- Refund record foundation.
- Admin finance filters and exports.
- Exception reporting.

**Non-goals**

- General-purpose accounting software.
- Automated tax calculations.
- Cross-border settlement.

**Key deliverables**

- Reconciliation service.
- Exception dashboard.
- CSV export.
- Finance runbook.

### Sprint 17 — Mobile API Stabilization

**Goal**

Freeze the API behavior required for mobile client development.

**Scope**

- Validate mobile authentication lifecycle.
- Compact mobile DTOs.
- Media URL and caching rules.
- Offline-tolerant read patterns.
- Contract fixtures and SDK/type generation if useful.
- Performance testing for public discovery and booking.

**Non-goals**

- Shipping the native mobile UI.
- Replacing the web frontend.

**Key deliverables**

- Mobile API contract release.
- Generated types or client.
- Performance baselines.
- Compatibility policy.

### Sprint 18 — Production Hardening

**Goal**

Prepare Alpii for controlled production deployment.

**Scope**

- Production Docker/runtime configuration.
- TLS and domain routing.
- Secrets management.
- Database backup and restore verification.
- Object storage policy and CDN decision.
- Rate limiting and security headers.
- Observability, structured logs, metrics, and alerts.
- Deployment and rollback runbooks.

**Non-goals**

- New marketplace features.
- Native mobile release.
- AI itinerary products.

**Key deliverables**

- Production deployment pipeline.
- Environment checklist.
- Monitoring dashboards and alerts.
- Backup/restore evidence.
- Security and launch readiness report.

## Future, Not Yet Scheduled

- Native iOS and Android applications.
- AI or semi-custom itinerary products.
- Live FX and booking exchange-rate snapshots.
- Promo-code redemption and campaign management.
- Automated refunds.
- Affiliate and loyalty systems.
- Multi-vendor bundled checkout.
- Advanced support tooling.
