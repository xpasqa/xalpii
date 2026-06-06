import type { CurrencyCode, LocaleCode } from "../types/common";

const defaultLocaleByCurrency: Record<string, LocaleCode> = {
  IDR: "id-ID",
  USD: "en-US"
};

export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode = "USD",
  locale: LocaleCode = defaultLocaleByCurrency[currency] ?? "en-US"
) {
  const isZeroDecimal = currency === "IDR";
  const amount = isZeroDecimal ? amountMinor : amountMinor / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
    minimumFractionDigits: isZeroDecimal ? 0 : 2
  }).format(amount);
}
