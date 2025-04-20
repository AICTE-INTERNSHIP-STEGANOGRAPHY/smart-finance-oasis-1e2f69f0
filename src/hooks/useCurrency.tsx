
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [currency, setCurrencyState] = useState(() => {
    // Try to get the currency from localStorage
    const savedCurrency = localStorage.getItem("userCurrency");
    return savedCurrency || "USD";
  });

  const updateCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    // Save to localStorage
    localStorage.setItem("userCurrency", newCurrency);
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("userCurrency");
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

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
