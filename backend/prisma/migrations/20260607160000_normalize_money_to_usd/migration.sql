-- Sprint 9.7: normalize all existing marketplace pricing and booking snapshots
-- to USD minor units. Static MVP rates: IDR 16000, EUR 0.92, CHF 0.89.

UPDATE "activity_pricing"
SET
  "price_cents" = CASE
    WHEN "currency" = 'IDR' THEN ROUND(("price_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("price_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("price_cents"::numeric / 0.89)::integer
    ELSE "price_cents"
  END,
  "currency" = 'USD'
WHERE "currency" IN ('IDR', 'EUR', 'CHF');

UPDATE "activity_pricing_tiers"
SET
  "adult_price_cents" = CASE
    WHEN "currency" = 'IDR' THEN ROUND(("adult_price_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("adult_price_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("adult_price_cents"::numeric / 0.89)::integer
    ELSE "adult_price_cents"
  END,
  "child_price_cents" = CASE
    WHEN "child_price_cents" IS NULL THEN NULL
    WHEN "currency" = 'IDR' THEN ROUND(("child_price_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("child_price_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("child_price_cents"::numeric / 0.89)::integer
    ELSE "child_price_cents"
  END,
  "currency" = 'USD'
WHERE "currency" IN ('IDR', 'EUR', 'CHF');

UPDATE "booking_participants" AS participant
SET "price_cents" = CASE
  WHEN booking."currency" = 'IDR' THEN ROUND((participant."price_cents"::numeric / 16000) * 100)::integer
  WHEN booking."currency" = 'EUR' THEN ROUND(participant."price_cents"::numeric / 0.92)::integer
  WHEN booking."currency" = 'CHF' THEN ROUND(participant."price_cents"::numeric / 0.89)::integer
  ELSE participant."price_cents"
END
FROM "bookings" AS booking
WHERE participant."booking_id" = booking."id"
  AND booking."currency" IN ('IDR', 'EUR', 'CHF');

UPDATE "bookings"
SET
  "total_amount_cents" = CASE
    WHEN "currency" = 'IDR' THEN ROUND(("total_amount_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("total_amount_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("total_amount_cents"::numeric / 0.89)::integer
    ELSE "total_amount_cents"
  END,
  "platform_fee_cents" = CASE
    WHEN "currency" = 'IDR' THEN ROUND(("platform_fee_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("platform_fee_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("platform_fee_cents"::numeric / 0.89)::integer
    ELSE "platform_fee_cents"
  END,
  "partner_payout_cents" = CASE
    WHEN "currency" = 'IDR' THEN ROUND(("partner_payout_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("partner_payout_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("partner_payout_cents"::numeric / 0.89)::integer
    ELSE "partner_payout_cents"
  END,
  "currency" = 'USD'
WHERE "currency" IN ('IDR', 'EUR', 'CHF');

UPDATE "payments"
SET
  "amount_cents" = CASE
    WHEN "currency" = 'IDR' THEN ROUND(("amount_cents"::numeric / 16000) * 100)::integer
    WHEN "currency" = 'EUR' THEN ROUND("amount_cents"::numeric / 0.92)::integer
    WHEN "currency" = 'CHF' THEN ROUND("amount_cents"::numeric / 0.89)::integer
    ELSE "amount_cents"
  END,
  "currency" = 'USD'
WHERE "currency" IN ('IDR', 'EUR', 'CHF');
