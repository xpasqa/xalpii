import type { CurrencyCode, LocaleCode } from "../types/common";

export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode = "USD",
  locale: LocaleCode = "en-US"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(amountMinor / 100);
}
