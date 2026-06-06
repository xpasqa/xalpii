import type { LocaleCode } from "../types/common";

export function formatDate(
  value: Date | string | number,
  locale: LocaleCode = "en-US",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric"
  }
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
