
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div className={cn("category-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trend === "up" && "text-finance-green",
                trend === "down" && "text-finance-red",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && "↑"} 
              {trend === "down" && "↓"} 
              {trendValue}
            </p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
