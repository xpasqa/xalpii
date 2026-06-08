"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  defaultCurrency,
  isSupportedCurrency,
  supportedCurrencies
} from "../../lib/money";
import type { CurrencyCode } from "../../types/common";

const storageKey = "alpii.display-currency.v1";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  supportedCurrencies: readonly CurrencyCode[];
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(defaultCurrency);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (isSupportedCurrency(stored)) setCurrencyState(stored);
  }, []);

  function setCurrency(nextCurrency: CurrencyCode) {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem(storageKey, nextCurrency);
  }

  const value = useMemo(
    () => ({ currency, setCurrency, supportedCurrencies }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
