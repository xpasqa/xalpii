# Alpii Product Specification

## 1. Product Summary

Alpii is a curated activity and experience marketplace for travelers.

Users can discover local activities by city, read activity details, book an activity, complete a dummy payment, receive a QR voucher, attend the activity, and leave a review.

Partners can register, create activity products, upload images and details, submit activities for admin review, receive bookings, validate customer QR vouchers, and track revenue and payouts.

Admins can manage cities, categories, partners, activities, bookings, dummy payments, platform fees, payouts, reviews, and content quality.

The MVP should focus on building a clean, reliable marketplace foundation before adding advanced itinerary or AI features.

---

## 2. Product Vision

Alpii aims to connect travelers with curated local activities, tours, cultural experiences, and community-based tourism products across multiple destinations.

The long-term goal is to become a flexible travel experience platform where users can discover, customize, and book local experiences across Asia, Europe, America, Africa, and the Middle East.

Phase 1 focuses on a GetYourGuide-style activity marketplace.

Phase 2 will introduce semi-custom itinerary building based on selected city, region, and activities.

---

## 3. MVP Scope

The MVP is a city-based activity marketplace.

### Must Have

- Public homepage
- City activity listing
- Activity detail page
- User registration and login
- Partner registration and login
- Role-based dashboard
- Partner profile
- Partner activity submission
- Activity image upload
- Admin city management
- Admin category management
- Admin activity review
- Admin approve/reject activity
- Public activity publishing
- Booking flow
- Dummy payment
- Payment abstraction ready for Stripe
- QR voucher generation
- User booking dashboard
- Partner booking dashboard
- Admin booking dashboard
- MinIO file storage
- Currency field in pricing and booking
- English-only content for MVP

### Prepared But Not Fully Executed Yet

- Stripe payment integration
- Stripe webhook
- Real email sending
- Multi-language content
- Multi-currency conversion
- Partner payout automation
- Advanced search
- Review moderation
- Full refund automation

### Out of Scope for MVP

- Native mobile app
- AI itinerary generation
- Semi-custom itinerary builder
- Real-time guide assignment
- Automated partner payout
- Affiliate system
- Complex refund engine
- Dynamic route optimization
- Multi-vendor bundled checkout
- Loyalty program

---

## 4. User Roles

### USER

A traveler or customer who books activities.

Permissions:

- Browse cities and activities
- View activity details
- Register/login
- Create booking
- Complete dummy payment
- View booking dashboard
- Access QR voucher
- Leave review after activity

### PARTNER

A supplier, operator, guide, or local activity provider.

Permissions:

- Register/login
- Create partner profile
- Create activity draft
- Upload activity images
- Add pricing and availability
- Submit activity for admin review
- View own activities
- View bookings for own activities
- Validate QR voucher
- Track revenue and payout status

### ADMIN

A platform operator who manages marketplace operations.

Permissions:

- Manage cities
- Manage categories
- Review partner activity submissions
- Approve/reject activities
- View users
- View partners
- View bookings
- View dummy payments
- Manage platform fees
- Manage manual payout tracking
- Manage reviews

### SUPER_ADMIN

A platform owner with full permissions.

Additional permissions:

- Manage admin users
- Manage global platform settings
- Manage platform fee configuration
- Access all operational data

---

## 5. Main User Journey

```txt
User visits homepage
→ selects city
→ browses activity list
→ selects activity
→ reads activity details
→ chooses date and participants
→ starts booking
→ signs up or logs in
→ confirms booking
→ completes dummy payment
→ receives QR voucher
→ attends activity
→ leaves review
```

---

## 6. Partner Journey

```txt
Partner signs up
→ creates partner profile
→ adds activity
→ adds activity details
→ uploads images
→ adds price and currency
→ adds availability
→ submits activity for review
→ admin reviews activity
→ activity is approved and published
→ users book the activity
→ partner views booking
→ partner validates QR voucher
→ partner completes the activity
→ partner revenue is recorded
→ admin manually marks payout as paid
```

---

## 7. Admin Journey

```txt
Admin logs in
→ creates cities
→ creates categories
→ reviews partner submissions
→ approves or rejects activities
→ manages published activities
→ monitors bookings
→ monitors dummy payments
→ tracks partner revenue
→ manages manual payouts
→ reviews platform performance
```

---

## 8. Public Pages

### Homepage

Purpose: introduce Alpii and direct users to city/activity discovery.

Content:

- Hero section
- Search input placeholder
- Featured cities
- Popular categories
- Featured activities
- Why book with Alpii
- Login/register links
- Footer

Primary CTA:

```txt
Explore Activities
```

### City Listing Page

Route example:

```txt
/things-to-do/[citySlug]
```

Purpose: show activities available in one city.

Content:

- City hero image
- City name
- Short city description
- Category filters
- Activity grid
- Activity cards
- Empty state if no activity exists

### Activity Detail Page

Route example:

```txt
/activities/[activitySlug]
```

Purpose: convert users from browsing to booking.

Content:

- Activity gallery
- Activity title
- City and category
- Rating placeholder
- Duration
- Price
- Description
- Included
- Excluded
- Meeting point
- Important information
- Availability
- Booking box
- Partner/operator information
- Review section placeholder

Primary CTA:

```txt
Book Now
```

### Checkout Page

Route example:

```txt
/checkout/[activitySlug]
```

Purpose: allow user to create booking and complete dummy payment.

Content:

- Activity summary
- Selected date
- Participant quantity
- Price breakdown
- Login/register requirement if unauthenticated
- Dummy payment button

---

## 9. Dashboard Pages

### User Dashboard

Routes:

```txt
/dashboard
/dashboard/bookings
/dashboard/profile
/dashboard/settings
```

Features:

- Overview
- Upcoming bookings
- Past bookings
- QR voucher access
- Booking status
- Payment status
- Review action
- Profile management

### Partner Dashboard

Routes:

```txt
/dashboard/partner
/dashboard/partner/activities
/dashboard/partner/activities/new
/dashboard/partner/activities/[activityId]
/dashboard/partner/bookings
/dashboard/partner/payouts
/dashboard/partner/scan
```

Features:

- Partner overview
- Activity list
- Create activity
- Edit draft activity
- Submit activity for review
- View activity status
- View bookings
- Validate QR voucher
- Revenue overview
- Payout status

### Admin Dashboard

Routes:

```txt
/dashboard/admin
/dashboard/admin/cities
/dashboard/admin/categories
/dashboard/admin/activities
/dashboard/admin/partners
/dashboard/admin/bookings
/dashboard/admin/payments
/dashboard/admin/payouts
/dashboard/admin/reviews
/dashboard/admin/settings
```

Features:

- Admin overview
- City management
- Category management
- Activity review
- Partner management
- Booking monitoring
- Dummy payment monitoring
- Platform fee management
- Manual payout tracking
- Review management

---

## 10. Activity Product Model

An activity is a bookable travel experience.

Examples:

- Guided tour
- Cooking class
- Water activity
- Cultural experience
- Workshop
- Adventure activity
- Attraction ticket
- Day trip
- Local experience

### Activity Required Data

- Title
- Slug
- City
- Category
- Partner
- Description
- Images
- Duration
- Meeting point
- Price
- Currency
- Minimum participants
- Maximum participants
- Availability
- Included items
- Excluded items
- Important information
- Cancellation policy
- Status

### Activity Status

```txt
DRAFT
PENDING_REVIEW
APPROVED
PUBLISHED
REJECTED
ARCHIVED
```

Status meaning:

- `DRAFT`: partner is still editing
- `PENDING_REVIEW`: submitted to admin
- `APPROVED`: approved by admin but not necessarily public
- `PUBLISHED`: visible to public users
- `REJECTED`: rejected by admin
- `ARCHIVED`: removed from active listing

Public users should only see `PUBLISHED` activities.

---

## 11. Booking Model

A booking represents a user's reservation for an activity.

### Booking Flow

```txt
Create booking
→ create dummy payment
→ payment pending
→ confirm dummy payment
→ payment paid
→ booking confirmed
→ QR voucher generated
```

### Booking Status

```txt
PENDING_PAYMENT
CONFIRMED
CANCELLED
COMPLETED
REFUNDED
```

Status meaning:

- `PENDING_PAYMENT`: booking created but payment not completed
- `CONFIRMED`: payment completed and voucher issued
- `CANCELLED`: booking cancelled
- `COMPLETED`: activity has been completed
- `REFUNDED`: booking has been refunded

### Booking Data

- User
- Activity
- Partner
- Selected date
- Participant quantity
- Currency
- Unit price
- Subtotal amount
- Platform fee amount
- Total amount
- Partner net amount
- Booking status
- Payment status
- Voucher code
- QR code

Booking must always store a price snapshot. Do not rely only on current activity price after booking is created.

---

## 12. Payment Model

The MVP uses dummy payment.

Stripe should be prepared structurally but not executed in the first implementation.

### Payment Providers

```txt
DUMMY
STRIPE
```

### Payment Status

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

### Dummy Payment Flow

```txt
User creates booking
→ system creates payment with provider DUMMY
→ payment status is PENDING
→ user clicks Confirm Dummy Payment
→ backend marks payment as PAID
→ backend marks booking as CONFIRMED
→ backend generates QR voucher
```

### Stripe-Ready Requirement

The system should be designed so Stripe can be added later without changing the booking flow.

Future Stripe endpoints:

```txt
POST /payments/stripe/create-checkout-session
POST /payments/stripe/webhook
```

Important:

- Do not mark booking confirmed without a payment record.
- Do not depend only on frontend success page for payment confirmation.
- Future Stripe implementation must use webhook verification.

---

## 13. Currency Strategy

MVP may operate with one default currency, but currency fields must exist from the beginning.

Default currency:

```txt
USD
```

Currency should be stored in:

- Activity pricing
- Booking
- Payment
- Payout

Booking price snapshot must include:

- Currency
- Unit price
- Quantity
- Subtotal amount
- Platform fee amount
- Total amount
- Partner net amount

Do not implement real-time exchange rate conversion in MVP.

Future multi-currency support should allow:

- Partner original currency
- User display currency
- Exchange rate snapshot
- Converted checkout amount
- Partner payout currency

---

## 14. Language Strategy

MVP is English only.

Default locale:

```txt
en
```

The system may prepare optional translation tables, but full multi-language routing is not required in MVP.

Future language support should allow translation for:

- City name and description
- Category name
- Activity title
- Activity description
- Included/excluded information
- Important information
- Cancellation policy
- Static frontend text

Do not build full translation management UI in MVP.

---

## 15. File Storage Strategy

Use MinIO for file storage.

Production file domain:

```txt
files.alpii.my.id
```

Local file URL:

```txt
http://localhost:9000
```

Buckets:

```txt
public
private
```

### Public Files

Examples:

- City images
- Category icons
- Activity gallery images

Public files can be served directly.

### Private Files

Examples:

- Partner documents
- Internal files
- Private voucher assets if needed

Private files require signed URL access.

### File Metadata

Every uploaded file must have metadata in the database:

- ID
- Bucket
- Object key
- Visibility
- MIME type
- Size
- Original filename
- Uploaded by
- Created at

---

## 16. Email Strategy

MVP should prepare notification structure but does not need to send real emails.

Email provider for MVP:

```txt
LOG
```

Future providers:

```txt
RESEND
SENDGRID
POSTMARK
```

Business logic should call notification/email service, not a provider directly.

Future email events:

- User registered
- Password reset
- Booking confirmed
- Payment success
- Activity approved
- Activity rejected
- Payout paid

For MVP, email actions can be logged only.

---

## 17. Partner Payout Strategy

MVP payout is manual but tracked.

Flow:

```txt
User completes dummy payment
→ booking is confirmed
→ partner net revenue is recorded
→ admin sees payable amount
→ admin transfers manually outside the system
→ admin marks payout as paid
```

Payout status:

```txt
PENDING
PROCESSING
PAID
FAILED
CANCELLED
```

Do not implement automated payout in MVP.

Future payout options:

- Stripe Connect
- Wise
- Manual bank transfer
- Local payment rails

---

## 18. Platform Fee Strategy

The platform earns a fee from each booking.

MVP should support simple percentage-based platform fee.

Example:

```txt
Platform fee: 15%
```

Booking calculation:

```txt
subtotal_amount = unit_price * quantity
platform_fee_amount = subtotal_amount * platform_fee_percentage
partner_net_amount = subtotal_amount - platform_fee_amount
total_amount = subtotal_amount
```

For MVP, user pays total activity price. Platform fee is deducted from partner revenue.

Future fee models:

- Percentage fee
- Fixed fee
- Category-based fee
- Partner-specific fee
- City/country-specific fee

---

## 19. Review Strategy

Users can leave a review after a confirmed or completed booking.

MVP review fields:

- Booking
- User
- Activity
- Rating
- Comment
- Status

Review status:

```txt
PENDING
PUBLISHED
HIDDEN
```

For MVP, review moderation can be simple.

---

## 20. Search and Filter Strategy

MVP search/filter should be basic.

Public listing should support:

- City
- Category
- Price range optional
- Activity status = published

Future search/filter:

- Date availability
- Rating
- Duration
- Language
- Region
- Tags
- Popularity
- Recommendation engine

---

## 21. QR Voucher Strategy

When booking is confirmed, the system generates a voucher.

Voucher contains:

- Voucher code
- Booking ID
- Activity title
- User name
- Activity date
- Participant quantity
- QR code

Partner can validate QR code from partner dashboard.

Voucher status:

```txt
ACTIVE
USED
CANCELLED
EXPIRED
```

Validation flow:

```txt
Partner opens QR validation page
→ enters or scans voucher code
→ system checks voucher
→ system shows booking details
→ partner marks voucher as used
→ booking can be marked completed
```

---

## 22. Admin Curation Rules

Partner activities must not be publicly visible until approved.

Admin can:

- Approve activity
- Reject activity with reason
- Archive activity
- View partner details
- View activity details
- View activity images
- View pricing and availability

Activity approval flow:

```txt
DRAFT
→ PENDING_REVIEW
→ APPROVED
→ PUBLISHED
```

Reject flow:

```txt
PENDING_REVIEW
→ REJECTED
```

Rejected activities can be edited and resubmitted by partner.

---

## 23. Phase 2 Direction

Phase 2 introduces semi-custom itinerary building.

Example journey:

```txt
User selects city
→ chooses region/area
→ selects multiple activities
→ system helps organize experience package
→ user books selected activities
```

Phase 2 concept:

- User can select region within city
- User can add/remove activities
- System provides warnings if too packed or too far
- Guide/operator can still decide final route based on real field conditions
- Focus is on selected places, not rigid time-by-time itinerary

Do not build this in MVP.

---

## 24. Success Criteria for MVP

MVP is considered successful when:

- Admin can create cities and categories
- Partner can register and submit an activity
- Admin can approve and publish an activity
- Public user can browse city and activity pages
- User can book an activity
- Dummy payment can confirm a booking
- QR voucher is generated
- User can see booking in dashboard
- Partner can see booking in dashboard
- Partner can validate voucher
- Admin can monitor bookings and payments
- Currency is stored in pricing and booking
- File uploads work through MinIO
- Code structure is ready for Stripe and email later

---

## 25. Product Principle

Build the marketplace foundation first.

Do not overbuild advanced itinerary features before the core booking marketplace is stable.

Every feature should support one of these core flows:

```txt
Discover activity
Submit activity
Approve activity
Book activity
Pay for booking
Receive voucher
Validate voucher
Track revenue
```
