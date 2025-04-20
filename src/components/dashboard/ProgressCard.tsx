
import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
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
  const percentage = Math.round((value / target) * 100);
  
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
          <span>${value.toLocaleString()}</span>
          <span className="text-muted-foreground">
            ${target.toLocaleString()} ({percentage}%)
          </span>
        </div>
        <Progress value={percentage} className={cn("h-2", progressColor)} />
      </div>
    </div>
  );
}
