# Alpii Design System

## Design Direction

Alpii should feel like a premium, clean, confident travel marketplace. It is image-first and conversion-focused without copying GetYourGuide, Klook, Viator, or another marketplace directly.

Core qualities:

- mature and trustworthy
- clear hierarchy
- compact, readable typography
- restrained borders and shadows
- practical interactions
- strong travel imagery
- consistent desktop and mobile behavior

Primary brand color:

```txt
#B92216
```

The primary color is reserved for selected states, primary actions, important badges, and focused interaction feedback. Do not substitute unrelated green brand treatments.

## Typography

- Headings: Plus Jakarta Sans.
- Body: Onest.
- Section titles use a consistent compact scale.
- Body copy uses one readable size and line-height token within a surface.
- Avoid oversized dashboard headings and inconsistent line height between lists, descriptions, and metadata.
- Prefer dark neutral text for primary content and muted gray only for secondary information.

## Surface Rules

- Avoid cards nested inside cards.
- Use cards only for repeated items, booking tools, dialogs, and clearly framed operational modules.
- Keep border radius modest and consistent.
- Use subtle borders; strengthen borders only when selection or grouping needs clarity.
- Avoid decorative gradients, orbs, oversized empty areas, and generic SaaS hero composition.
- Do not expose raw JSON or developer-oriented controls to partners or admins.
- Do not display native file inputs; trigger hidden inputs from styled upload actions.

## Public Marketplace Patterns

### Activity Cards

- Image-first with stable aspect ratio.
- Small category/destination metadata.
- Compact activity title.
- Rating and review count.
- Clear “From” price in selected display currency.
- Subtle hover zoom without changing layout dimensions.

### Destination Cards

- Image with a legible dark overlay.
- Forced white destination name near the lower edge.
- Activity count.
- Mobile horizontal exploration uses compact cards rather than full-width oversized cards.

### Activity Detail

- Title, rating, destination, and category metadata above the gallery.
- Large gallery with supporting images and a “View all” gallery dialog.
- Desktop booking card in the right column.
- Mobile fixed booking action.
- Content sections use consistent label/content alignment:
  - About this activity
  - Itinerary
  - Highlights
  - Description
  - Includes / not included
  - Reviews
- Includes use clear green checks; exclusions use red X icons.
- Review summary may remain sticky within the review section while review cards scroll.

### Package Options

- Initial booking card contains date, travelers, and “Check availability”.
- Available package options render as a simple list above “About this activity”.
- Collapsed rows show title and calculated total.
- Expanded rows show description, duration, meeting time choices, capacity, cancellation information, and booking actions.
- Meeting time buttons display the exact local-time strings configured by the partner.

### Currency Selector

- Supported display currencies: USD, IDR, EUR, CHF.
- Selection is stored client-side.
- Price displays update consistently across cards, detail, checkout, and user booking presentation.
- Admin finance views remain USD-based.

### Reviews

- Reviews are explicitly labeled as verified Alpii bookings.
- Summary includes average, distribution, and approved review count.
- Public review media appears only after moderation approval.

## Checkout Pattern

Checkout uses a clean two-column desktop layout:

- Main column: stacked editable stages.
- Right column: pinned booking summary that remains within the content boundary and stops before the footer.
- Mobile: single-column layout without sticky obstruction.

Stages:

1. Account and contact details.
2. Traveler and activity details.
3. Payment details.

Rules:

- Do not show all form sections as competing panels.
- Completed stages remain visible and editable.
- Active stage number uses Alpii red; inactive stages use a pale red background.
- New users register inside checkout.
- Authenticated users see a compact contact summary.
- Traveler name fields are explicit per adult/child.
- Pickup search is presented cleanly; real Places integration is not implemented yet.
- Payment is clearly an MVP dummy flow.
- “Book Now” is the full-width final primary action.

The booking summary contains:

- hold timer
- compact activity image and title
- traveler/date/cancellation summary
- participant calculation
- expandable promo-code placeholder
- total in the selected display currency

## Dashboard Patterns

### Shell

- Full-width operational layout.
- Collapsed icon rail that expands on hover.
- Every navigation item has a Lucide icon.
- Active state is clear.
- Disabled future items are visibly muted and are not broken links.
- Account/role and logout live at the sidebar footer.

### Tables and Lists

- Table-first CRUD for admin master data.
- Full available content width without excessive nested containers.
- Compact filters and actions.
- Clear loading, error, and empty states.
- Destructive actions belong in edit dialogs when that reduces row noise.

### Partner Activity Builder

- Guided sections instead of one giant form.
- Visible labels; placeholders are examples only.
- Repeatable content uses dialogs and lists:
  - highlights
  - included/not included
  - itinerary
  - availability
  - media
  - package pricing
- Submission readiness is a compact sticky right-side navigator.
- Section navigation links directly to builder sections.
- Package options own pricing and availability for new activity flows.

### Admin Curation

- Admin review defaults to read mode.
- Admin edit uses the same activity structure and visual language as the partner builder.
- Admins can inspect and edit packages, pricing, availability, media, content, and policies.
- Rejection/revision actions use labeled dialogs, not browser prompts.

### Status and Moderation

- Use shared status badges.
- Moderation dialogs require a reason when rejecting.
- Review media and public-text moderation remain visually separate from account/source data.

## Responsive Rules

- No sticky booking/sidebar modules on mobile unless explicitly implemented as a bottom action.
- Grids collapse without cramped cards.
- Dialogs become full-width or bottom-sheet-like where appropriate.
- Text must not overflow controls or overlap neighboring content.
- Fixed-format controls use stable dimensions to avoid layout shifts.

## Implementation Rules

- Next.js App Router, TypeScript, and Tailwind CSS.
- Reuse existing `ui`, `layout`, and `domain` component layers.
- Use Lucide icons rather than custom inline SVG when an icon exists.
- Generic UI components must not own Alpii business logic.
- Do not introduce a new visual pattern when an established component already solves it.
