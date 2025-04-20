
import { createContext, useContext, useState, ReactNode } from "react";

type CurrencyContextType = {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
};

type CurrencyProviderProps = {
  children: ReactNode;
};

type CurrencySymbols = {
  [key: string]: string;
};

// Map of currency codes to symbols
const currencySymbols: CurrencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  BRL: "R$",
  RUB: "₽",
  ZAR: "R",
  NGN: "₦",
  MXN: "Mex$",
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState("USD");

  const updateCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const value = {
    currency,
    currencySymbol: currencySymbols[currency] || "$",
    setCurrency: updateCurrency,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Utility function to format money based on selected currency
export const formatMoney = (amount: number, currency: string): string => {
  const symbol = currencySymbols[currency] || "$";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
