
import { ReactNode, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";

interface ProgressCardProps {
  title: string;
  value: number | ((data: any[]) => number);
  target: number;
  icon?: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning";
}

export function ProgressCard({
  title,
  value,
  target,
  icon,
  className,
  variant = "default",
}: ProgressCardProps) {
  const { currency } = useCurrency();
  const [calculatedValue, setCalculatedValue] = useState(0);
  
  useEffect(() => {
    if (typeof value === 'function') {
      // If value is a function, fetch data and calculate
      const expenses = JSON.parse(localStorage.getItem("userExpenses") || "[]");
      setCalculatedValue(value(expenses));
    } else {
      // If value is a number, use it directly
      setCalculatedValue(value);
    }
  }, [value]);
  
  const percentage = Math.round((calculatedValue / target) * 100);
  
  const progressColor = 
    variant === "success" 
      ? "bg-finance-green" 
      : variant === "warning" 
        ? "bg-finance-red" 
        : "bg-primary";
  
  return (
    <div className={cn("category-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1 text-sm">
          <span>{formatMoney(calculatedValue, currency)}</span>
          <span className="text-muted-foreground">
            {formatMoney(target, currency)} ({percentage}%)
          </span>
        </div>
        <Progress value={percentage} className={cn("h-2", progressColor)} />
      </div>
    </div>
  );
}
