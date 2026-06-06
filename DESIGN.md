# Alpii Design System

## 1. Design Direction

Alpii should feel like a clean, modern, trustworthy travel marketplace.

The product should look simple, premium, and easy to use. It should not feel like an overloaded admin system or a generic template.

Visual direction:

- Clean white background
- Soft borders
- Rounded cards
- Large travel imagery
- Clear call-to-action buttons
- Spacious layout
- Mobile responsive first
- Simple dashboard interface
- Calm and professional marketplace feel
- Easy scanning for users, partners, and admins

Public pages should feel inspiring and conversion-focused.

Dashboard pages should feel operational, clear, and efficient.

---

## 2. Frontend Tech

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Custom reusable components
- lucide-react for icons if needed

Do not use random inline styles unless absolutely necessary.

Do not create duplicate components if a reusable component already exists.

Do not create new visual patterns unless the existing system cannot support the use case.

---

## 3. Design Principles

### Consistency First

Every page should follow the same layout and component patterns.

Use shared components for:

- Page wrapper
- Section spacing
- Buttons
- Inputs
- Cards
- Tables
- Badges
- Empty states
- Loading states
- Error states

### Page Should Focus on Flow

A page file should focus on data and flow, not repeated layout code.

Bad pattern:

```tsx
<div className="mx-auto max-w-7xl px-6 py-8">
  <div className="mb-8">
    <h1>Activities</h1>
    <p>Manage your activities</p>
  </div>
</div>
```

Good pattern:

```tsx
<PageShell
  title="Activities"
  description="Manage your activity products."
  actions={<Button>Add Activity</Button>}
>
  <ActivityTable />
</PageShell>
```

### Domain Logic Should Stay Out of Generic UI

Generic UI components must not know about Alpii business logic.

For example:

- `Button` should not know about booking
- `Card` should not know about activity
- `Badge` should not know about partner status

Business-specific logic belongs in domain components.

---

## 4. Frontend Folder Structure

Use this structure:

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
  types/
```

---

## 5. Component Categories

### UI Components

Generic components with no Alpii business logic.

Location:

```txt
frontend/src/components/ui/
```

Components:

```txt
Button
Input
Textarea
Select
Badge
Card
Modal
Tabs
DataTable
Dropdown
EmptyState
LoadingState
ErrorState
Avatar
Separator
FormField
FormSection
```

Rules:

- Must be reusable
- Must not import domain types like Activity, Booking, Partner, City
- Must not call API directly
- Must not contain business logic

### Layout Components

Components for page structure.

Location:

```txt
frontend/src/components/layout/
```

Components:

```txt
PageShell
PublicShell
AuthShell
DashboardShell
Section
PageHeader
PageToolbar
DashboardSidebar
DashboardTopbar
```

Rules:

- May use UI components
- Should control layout consistency
- Should not duplicate dashboard navigation logic across pages

### Domain Components

Business-specific components.

Location:

```txt
frontend/src/components/domain/
```

Recommended subfolders:

```txt
domain/
  activity/
  booking/
  city/
  partner/
  admin/
  payment/
  voucher/
```

Examples:

```txt
ActivityCard
ActivityGrid
ActivityGallery
ActivityBookingBox
ActivityStatusBadge
ActivityForm
CityCard
CityHero
CityForm
BookingCard
BookingSummary
BookingStatusBadge
PaymentStatusBadge
VoucherQR
PartnerStatusBadge
PartnerProfileForm
AdminReviewPanel
PayoutStatusBadge
```

Rules:

- May import Alpii domain types
- May compose UI and layout components
- Should avoid raw repeated styling if a UI component exists

---

## 6. Layout Shells

Alpii uses four main shell components:

```txt
PageShell
PublicShell
AuthShell
DashboardShell
```

---

## 7. PageShell

`PageShell` is the base wrapper for page content.

Use it for consistent:

- Max width
- Page padding
- Vertical spacing
- Page title
- Page description
- Page actions
- Optional toolbar

Location:

```txt
frontend/src/components/layout/PageShell.tsx
```

Props:

```tsx
type PageShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};
```

Size behavior:

```txt
sm   -> max-w-2xl
md   -> max-w-4xl
lg   -> max-w-6xl
xl   -> max-w-7xl
full -> max-w-none
```

Dashboard page usage:

```tsx
<PageShell
  title="Activities"
  description="Manage your activity products and submissions."
  actions={<Button>Add Activity</Button>}
>
  <ActivityTable />
</PageShell>
```

Public page usage:

```tsx
<PublicShell>
  <PageShell size="xl">
    <ActivityGrid activities={activities} />
  </PageShell>
</PublicShell>
```

Rules:

- Do not manually recreate page headers in pages
- Use PageShell for dashboard and public content sections
- Page title and action layout should come from PageShell

---

## 8. PublicShell

`PublicShell` is used for public marketplace pages.

Pages:

- Homepage
- City listing page
- Activity detail page
- Checkout page

Location:

```txt
frontend/src/components/layout/PublicShell.tsx
```

Includes:

- Public navbar
- Logo
- Main navigation
- Login/register links
- Currency selector placeholder
- Language selector placeholder
- Footer

Usage:

```tsx
<PublicShell>
  <PageShell size="xl">
    {/* Public content */}
  </PageShell>
</PublicShell>
```

Public navigation should include:

```txt
Alpii logo
Explore
Cities
Become a Partner
Login
Sign up
```

Rules:

- PublicShell should not be used for dashboard pages
- PublicShell should keep the public experience simple and conversion-focused

---

## 9. AuthShell

`AuthShell` is used for authentication pages.

Pages:

- Login
- Register
- Forgot password later
- Reset password later

Location:

```txt
frontend/src/components/layout/AuthShell.tsx
```

Includes:

- Centered layout
- Logo
- Auth card
- Title
- Description optional
- Simple footer link

Props:

```tsx
type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};
```

Usage:

```tsx
<AuthShell
  title="Log in to Alpii"
  description="Access your bookings, activities, and dashboard."
>
  <LoginForm />
</AuthShell>
```

Rules:

- Auth pages should not manually create centered card layouts
- Auth form styling should be consistent

---

## 10. DashboardShell

`DashboardShell` is used for all authenticated dashboards.

Pages:

- User dashboard
- Partner dashboard
- Admin dashboard

Location:

```txt
frontend/src/components/layout/DashboardShell.tsx
```

Includes:

- Sidebar
- Topbar
- User menu
- Role-based navigation
- Main content area

Dashboard navigation must be generated from config, not hardcoded in every page.

Navigation config location:

```txt
frontend/src/lib/dashboard-nav.ts
```

Example structure:

```ts
export const dashboardNav = {
  USER: [
    { label: "Overview", href: "/dashboard" },
    { label: "My Bookings", href: "/dashboard/bookings" },
    { label: "Profile", href: "/dashboard/profile" },
  ],
  PARTNER: [
    { label: "Partner Overview", href: "/dashboard/partner" },
    { label: "Activities", href: "/dashboard/partner/activities" },
    { label: "Bookings", href: "/dashboard/partner/bookings" },
    { label: "Payouts", href: "/dashboard/partner/payouts" },
    { label: "QR Scan", href: "/dashboard/partner/scan" },
  ],
  ADMIN: [
    { label: "Admin Overview", href: "/dashboard/admin" },
    { label: "Cities", href: "/dashboard/admin/cities" },
    { label: "Categories", href: "/dashboard/admin/categories" },
    { label: "Activities", href: "/dashboard/admin/activities" },
    { label: "Partners", href: "/dashboard/admin/partners" },
    { label: "Bookings", href: "/dashboard/admin/bookings" },
    { label: "Payments", href: "/dashboard/admin/payments" },
    { label: "Payouts", href: "/dashboard/admin/payouts" },
    { label: "Reviews", href: "/dashboard/admin/reviews" },
    { label: "Settings", href: "/dashboard/admin/settings" },
  ],
};
```

Rules:

- Do not duplicate dashboard sidebars
- Do not hardcode navigation inside individual dashboard pages
- Role-based navigation should come from one config
- Backend remains the source of truth for permissions

---

## 11. Page Patterns

### Dashboard Page Pattern

All dashboard pages should follow this pattern:

```tsx
export default function PartnerActivitiesPage() {
  return (
    <PageShell
      title="Activities"
      description="Manage your activity products and submissions."
      actions={<Button>Add Activity</Button>}
    >
      {/* Page content */}
    </PageShell>
  );
}
```

### Public Page Pattern

Public pages should follow this pattern:

```tsx
export default function CityPage() {
  return (
    <PublicShell>
      <CityHero city={city} />
      <PageShell size="xl">
        <ActivityGrid activities={activities} />
      </PageShell>
    </PublicShell>
  );
}
```

### Auth Page Pattern

Auth pages should follow this pattern:

```tsx
export default function LoginPage() {
  return (
    <AuthShell title="Log in to Alpii">
      <LoginForm />
    </AuthShell>
  );
}
```

---

## 12. UI Components

### Button

Location:

```txt
frontend/src/components/ui/Button.tsx
```

Variants:

```txt
primary
secondary
outline
ghost
danger
```

Sizes:

```txt
sm
md
lg
```

Usage:

```tsx
<Button variant="primary" size="lg">
  Book Now
</Button>
```

Rules:

- Use Button for all clickable actions that look like buttons
- Do not create custom button classes in each page

---

### Card

Location:

```txt
frontend/src/components/ui/Card.tsx
```

Recommended compound components:

```txt
Card
CardHeader
CardTitle
CardDescription
CardContent
CardFooter
```

Usage:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Booking Summary</CardTitle>
    <CardDescription>Review your booking before payment.</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

Rules:

- Use Card for dashboard panels, forms, and summaries
- Use ActivityCard and CityCard for public marketplace cards

---

### Badge

Location:

```txt
frontend/src/components/ui/Badge.tsx
```

Generic variants:

```txt
default
success
warning
danger
neutral
outline
```

Rules:

- Use generic Badge only for simple labels
- Use domain status badge components for business statuses

---

### DataTable

Location:

```txt
frontend/src/components/ui/DataTable.tsx
```

Purpose:

- Reusable table for admin and partner dashboards

Basic props:

```tsx
type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
};
```

Usage:

```tsx
<DataTable
  data={activities}
  columns={columns}
  emptyTitle="No activities yet"
  emptyDescription="Create your first activity to start selling."
/>
```

Rules:

- Do not manually recreate table structure in every page
- Use EmptyState inside DataTable when data is empty

---

### EmptyState

Location:

```txt
frontend/src/components/ui/EmptyState.tsx
```

Props:

```tsx
type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};
```

Usage:

```tsx
<EmptyState
  title="No bookings yet"
  description="Your upcoming bookings will appear here."
/>
```

Rules:

- Do not write custom empty states on each page

---

### LoadingState

Location:

```txt
frontend/src/components/ui/LoadingState.tsx
```

Use when loading dashboard data, lists, or forms.

Rules:

- Loading UI should be consistent
- Avoid random loading text styles across pages

---

### ErrorState

Location:

```txt
frontend/src/components/ui/ErrorState.tsx
```

Use for failed API loading, failed form submission, or unavailable content.

Rules:

- Error messages should be clear and human-friendly
- Do not expose raw backend stack traces

---

## 13. Form Pattern

Use reusable components:

```txt
Input
Textarea
Select
FormField
FormSection
Button
Card
```

`FormSection` should group related fields.

Example:

```tsx
<FormSection
  title="Basic information"
  description="This information will be shown to customers."
>
  <Input label="Activity title" />
  <Textarea label="Description" />
</FormSection>
```

Activity form should be split into sections:

```txt
BasicInfoSection
MediaSection
PricingSection
AvailabilitySection
MeetingPointSection
PolicySection
```

Rules:

- Do not create one giant ActivityForm file if it becomes too large
- Group related fields into smaller components
- Form labels should be clear and user-friendly
- Required fields should be visually clear

---

## 14. Status Badge Pattern

Status badge components should be domain-specific.

Components:

```txt
ActivityStatusBadge
BookingStatusBadge
PaymentStatusBadge
PartnerStatusBadge
PayoutStatusBadge
VoucherStatusBadge
ReviewStatusBadge
```

Rules:

- Do not manually style status badges inside pages
- Do not repeat status-to-label mapping in multiple files
- Each status badge component should own its label and visual mapping

Example:

```tsx
<ActivityStatusBadge status="PENDING_REVIEW" />
```

Activity statuses:

```txt
DRAFT
PENDING_REVIEW
APPROVED
PUBLISHED
REJECTED
ARCHIVED
```

Booking statuses:

```txt
PENDING_PAYMENT
CONFIRMED
CANCELLED
COMPLETED
REFUNDED
```

Payment statuses:

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

Payout statuses:

```txt
PENDING
PROCESSING
PAID
FAILED
CANCELLED
```

Voucher statuses:

```txt
ACTIVE
USED
CANCELLED
EXPIRED
```

Review statuses:

```txt
PENDING
PUBLISHED
HIDDEN
```

---

## 15. Public Marketplace Components

Use these components for public discovery pages:

```txt
HeroSearch
CityCard
CityHero
CategoryPill
ActivityCard
ActivityGrid
ActivityGallery
ActivityDetailHeader
ActivityBookingBox
ReviewSummary
```

### ActivityCard

Activity cards should include:

- Image
- Title
- City
- Category
- Duration
- Rating placeholder
- Price from
- CTA or clickable card behavior

Rules:

- Always use a consistent image ratio
- Use object-cover for images
- Keep text readable and scannable

### CityCard

City cards should include:

- City image
- City name
- Country
- Activity count if available

### ActivityBookingBox

Should include:

- Price
- Date selector placeholder
- Participant selector
- Total price
- Book Now button

Rules:

- ActivityBookingBox should be visually prominent on desktop
- On mobile, it should be easy to access and not break layout

---

## 16. Dashboard Components

Use these components for operational dashboards:

```txt
DashboardMetricCard
RecentBookingsList
ActivitySubmissionList
PartnerRevenueCard
AdminReviewPanel
BookingSummary
PayoutSummary
```

Dashboard pages should prioritize:

- Clear data
- Quick action
- Status visibility
- Empty states
- Easy navigation

Do not over-design dashboard pages.

---

## 17. Route Constants

Create one route helper file.

Location:

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

Rules:

- Do not hardcode route strings repeatedly across components
- Use route helpers for links when possible

---

## 18. API Client Rule

Frontend should use one API utility.

Location:

```txt
frontend/src/lib/api.ts
```

Pattern:

```ts
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
```

Rules:

- Do not scatter raw fetch calls across components
- API error handling should be centralized over time

---

## 19. Formatting Utilities

Create shared formatting utilities.

Location:

```txt
frontend/src/lib/money.ts
frontend/src/lib/dates.ts
frontend/src/lib/format.ts
```

Functions:

```txt
formatMoney
formatDate
formatDateTime
formatDuration
formatParticipantCount
```

Rules:

- Do not manually format money/date in every component
- Always show currency with price

Example:

```tsx
{formatMoney(activity.price, activity.currency)}
```

---

## 20. Naming Convention

### Components

Use PascalCase.

```txt
ActivityCard.tsx
PageShell.tsx
BookingStatusBadge.tsx
```

### Utility Files

Use camelCase or simple nouns.

```txt
api.ts
routes.ts
money.ts
dates.ts
dashboardNav.ts
```

### Route Segments

Use kebab-case.

```txt
things-to-do
activity-detail should not be used
```

Preferred routes:

```txt
/things-to-do/[citySlug]
/activities/[activitySlug]
/checkout/[activitySlug]
```

### Types

Use domain files:

```txt
activity.ts
booking.ts
city.ts
partner.ts
user.ts
payment.ts
```

---

## 21. Copywriting Tone

Use English only for MVP.

Tone:

- Clear
- Friendly
- Professional
- Travel-focused
- Business casual
- Not too technical for public users

Examples:

Good:

```txt
Explore curated activities in Bali.
```

Good:

```txt
Create your first activity to start receiving bookings.
```

Avoid:

```txt
No data found.
```

Better:

```txt
No activities yet. Create your first activity to start selling on Alpii.
```

---

## 22. Image Rules

Images are important for a travel marketplace.

Rules:

- Use large images on public pages
- Use consistent aspect ratios
- Use object-cover
- Always provide fallback image or placeholder
- Activity cards must not collapse if image is missing
- City images should feel aspirational

Recommended ratios:

```txt
Activity card: 4:3 or 16:10
City card: 16:9
Hero: wide full-width ratio
Gallery: mixed grid but visually balanced
```

---

## 23. Responsive Rules

All pages should be mobile responsive.

Public pages:

- Cards stack cleanly on mobile
- Booking box should remain easy to access
- Navbar should collapse or simplify

Dashboard pages:

- Sidebar should collapse on smaller screens
- Tables should be horizontally scrollable if needed
- Primary actions should remain visible

Rules:

- Do not design desktop-only pages
- Mobile layout should not feel broken or cramped

---

## 24. Accessibility Rules

Minimum requirements:

- Buttons must use button elements where appropriate
- Inputs must have labels
- Images should have meaningful alt text
- Links should be clear
- Focus states should be visible
- Do not rely on color only to communicate status

---

## 25. Initial Component Build Order

Build components in this order before creating many pages:

```txt
1. Button
2. Input
3. Textarea
4. Select
5. Badge
6. Card
7. EmptyState
8. LoadingState
9. ErrorState
10. PageHeader
11. PageShell
12. PublicShell
13. AuthShell
14. DashboardShell
15. DataTable
16. Status badge components
17. ActivityCard
18. CityCard
19. BookingCard
20. ActivityForm sections
```

This order prevents repeated layout and styling work.

---

## 26. Codex Instructions

When generating frontend code, Codex should follow these rules:

```txt
Read PRODUCT.md, DESIGN.md, ENGINEERING.md, and SPRINTS.md first when available.
Follow the existing component patterns.
Do not duplicate components.
Do not create one-off page wrappers.
Use PageShell for page structure.
Use PublicShell for public pages.
Use AuthShell for auth pages.
Use DashboardShell for dashboard pages.
Use shared UI components for buttons, cards, inputs, tables, and states.
Keep generic UI components free from business logic.
Put business-specific UI inside domain components.
Use route constants instead of repeated hardcoded route strings.
Use formatting utilities for money and date.
Use English copy only for MVP.
Keep the interface clean, modern, and travel-marketplace focused.
```
