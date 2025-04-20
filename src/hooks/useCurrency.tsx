
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CurrencyContextType = {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
  availableCurrencies: Array<{code: string, name: string, symbol: string}>;
};

type CurrencyProviderProps = {
  children: ReactNode;
};

// Currency definitions with symbols and names
const currencyDefinitions = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
];

// Map of currency codes to symbols for quick lookup
const currencySymbols: Record<string, string> = currencyDefinitions.reduce((acc, curr) => {
  acc[curr.code] = curr.symbol;
  return acc;
}, {} as Record<string, string>);

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
    
    // Create notification when currency is changed
    const notification = {
      id: crypto.randomUUID(),
      type: "success",
      title: "Currency Updated",
      description: `Your currency has been set to ${newCurrency}. All financial values will now be displayed in this currency.`,
      date: new Date().toISOString(),
      read: false
    };
    
    const savedNotifications = localStorage.getItem("userNotifications") || "[]";
    const notifications = JSON.parse(savedNotifications);
    notifications.push(notification);
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
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
    availableCurrencies: currencyDefinitions
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
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback to a basic format
    const symbol = currencySymbols[currency] || "$";
    return `${symbol}${amount.toFixed(2)}`;
  }
};
