import type { CurrencyCode, LocaleCode } from "../types/common";

export const supportedCurrencies = ["USD", "IDR", "EUR", "CHF"] as const;
export const defaultCurrency: CurrencyCode = "USD";

export const staticFxRates: Record<CurrencyCode, number> = {
  USD: 1,
  IDR: 16000,
  EUR: 0.92,
  CHF: 0.89
};

const defaultLocaleByCurrency: Record<CurrencyCode, LocaleCode> = {
  IDR: "id-ID",
  USD: "en-US",
  EUR: "en-IE",
  CHF: "de-CH"
};

export function isSupportedCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && supportedCurrencies.includes(value as CurrencyCode);
}

export function convertMoney(amountMinorUsd: number, targetCurrency: CurrencyCode) {
  return (amountMinorUsd / 100) * staticFxRates[targetCurrency];
}

export function formatMoney(
  amountMinorUsd: number,
  targetCurrency: CurrencyCode = defaultCurrency,
  locale: LocaleCode = defaultLocaleByCurrency[targetCurrency]
) {
  const isZeroDecimal = targetCurrency === "IDR";
  const amount = convertMoney(amountMinorUsd, targetCurrency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: targetCurrency,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
    minimumFractionDigits: isZeroDecimal ? 0 : 2
  }).format(amount);
}

export function formatBaseUsd(amountMinorUsd: number) {
  return formatMoney(amountMinorUsd, "USD");
}

export function parseUsdInputToMinor(input: string | number) {
  const amount = typeof input === "number" ? input : Number(input.trim());
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

export function usdMinorToInput(amountMinorUsd: number) {
  return (amountMinorUsd / 100).toFixed(2);
}
