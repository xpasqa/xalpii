export type ID = string;

export type CurrencyCode = "USD" | "IDR" | "EUR" | "CHF";

export type LocaleCode = "en-US" | "id-ID" | string;

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<TData> = {
  success?: boolean;
  data?: TData;
  error?: ApiError;
  meta?: {
    path?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
};
